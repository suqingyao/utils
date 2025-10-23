import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, CreateAxiosDefaults } from 'axios';
import axios from 'axios';

// 扩展：支持重试配置（客户端默认与每次请求覆盖）
type RequestClientOptionsEx = CreateAxiosDefaults & {
  retry?: number;
};

type RequestClientConfigEx<T = any> = AxiosRequestConfig<T> & {
  retry?: number;
};

// 稳定序列化，避免不同键顺序导致的请求键不一致
function stableStringify(input: any): string {
  if (input === null)
    return 'null';
  const t = typeof input;
  if (t === 'string')
    return JSON.stringify(input);
  if (t === 'number' || t === 'boolean')
    return String(input);
  if (t === 'undefined')
    return 'undefined';
  if (Array.isArray(input))
    return `[${input.map(v => stableStringify(v)).join(',')}]`;
  if (t === 'object') {
    const keys = Object.keys(input).sort();
    const entries = keys.map(k => `${JSON.stringify(k)}:${stableStringify(input[k])}`);
    return `{${entries.join(',')}}`;
  }
  // function/symbol
  return JSON.stringify(String(input));
}

function stringifyDataForKey(data: unknown): string {
  if (data == null)
    return 'null';
  const hasFile = typeof File !== 'undefined';
  const hasBlob = typeof Blob !== 'undefined';
  const hasFormData = typeof FormData !== 'undefined';

  if (hasFormData && data instanceof FormData) {
    const parts: string[] = [];
    const entries = (data as FormData).entries() as IterableIterator<[string, FormDataEntryValue]>;
    for (const [name, value] of entries) {
      if (hasFile && value instanceof File) {
        const f = value as File;
        parts.push(`${name}=<file:${f.name}:${f.size}:${f.type}:${f.lastModified}>`);
      }
      else if (hasBlob && value instanceof Blob) {
        const b = value as Blob;
        parts.push(`${name}=<blob:${b.size}:${b.type}>`);
      }
      else {
        parts.push(`${name}=${String(value)}`);
      }
    }
    return `FormData(${parts.join('&')})`;
  }
  if (hasFile && (data as any) instanceof File) {
    const f = data as File;
    return `File(${f.name}:${f.size}:${f.type}:${(f as any).lastModified ?? ''})`;
  }
  if (hasBlob && (data as any) instanceof Blob) {
    const b = data as Blob;
    return `Blob(${b.size}:${b.type})`;
  }
  return stableStringify(data);
}

function buildKey(config: AxiosRequestConfig): string {
  const { method = 'GET', url = '', params, data } = config;
  return `${method}:${url}:${stableStringify(params)}:${stringifyDataForKey(data)}`;
}

export class RequestClient {
  private instance: AxiosInstance;
  private options: RequestClientOptionsEx;
  private cancelMap = new Map<string, AbortController>();
  private pendingMap = new Map<string, Promise<AxiosResponse>>();

  constructor(options?: RequestClientOptionsEx) {
    this.options = options || {} as RequestClientOptionsEx;
    this.instance = axios.create({ ...(options || {}) });
  }

  cancelRequestByConfig(config: AxiosRequestConfig): void {
    const key = buildKey(config);
    const controller = this.cancelMap.get(key);
    if (controller) {
      controller.abort();
      this.cancelMap.delete(key);
      this.pendingMap.delete(key);
    }
  }

  cancelAll(): void {
    for (const [, controller] of this.cancelMap) controller.abort();
    this.cancelMap.clear();
    this.pendingMap.clear();
  }

  async request<T = any>(cfg: RequestClientConfigEx<T>): Promise<AxiosResponse<T>> {
    const key = buildKey(cfg);

    // 并发去重：已有同键请求时直接复用 Promise
    if (this.pendingMap.has(key)) {
      return this.pendingMap.get(key) as Promise<AxiosResponse<T>>;
    }

    // 合并 AbortSignal：外部取消同步到内部
    const controller = new AbortController();
    const external = cfg.signal as AbortSignal | undefined;
    let onAbort: (() => void) | undefined;
    if (external) {
      if (external.aborted) {
        controller.abort();
      }
      else {
        onAbort = () => controller.abort();
        external.addEventListener?.('abort', onAbort as any);
      }
    }

    const mergedCfg: AxiosRequestConfig<T> = { ...cfg, signal: controller.signal };

    // 统一解析重试选项（仅保留最大次数）
    const max = cfg.retry ?? this.options.retry ?? 0;

    const defaultShouldRetry = (error: any, attempt: number): boolean => {
      if (controller.signal.aborted || attempt >= max)
        return false;
      const method = String(mergedCfg.method || 'GET').toUpperCase();
      if (method !== 'GET')
        return false;
      const axiosErr = error as AxiosError;
      const status = axiosErr?.response?.status;
      const isNetworkErr = !axiosErr?.response;
      const code = (axiosErr as any)?.code;
      const isTimeout = code === 'ECONNABORTED';
      if (isNetworkErr || isTimeout)
        return true;
      if (typeof status === 'number' && status === 503)
        return true;
      return false;
    };

    const exec = async (attempt = 0): Promise<AxiosResponse<T>> => {
      try {
        const res = await this.instance.request<T>(mergedCfg);
        return res as AxiosResponse<T>;
      }
      catch (error) {
        const should = defaultShouldRetry(error, attempt);
        if (should) {
          // 简化策略：不引入额外延迟，立即重试（下一个事件循环）
          await new Promise<void>(resolve => setTimeout(resolve, 0));
          return exec(attempt + 1);
        }
        throw error;
      }
    };

    const promise = exec(0) as Promise<AxiosResponse<T>>;
    this.cancelMap.set(key, controller);
    this.pendingMap.set(key, promise as Promise<AxiosResponse>);

    // 仅在最终完成后清理，避免重试中断并发去重
    promise.finally(() => {
      if (external && onAbort)
        external.removeEventListener?.('abort', onAbort as any);
      this.cancelMap.delete(key);
      this.pendingMap.delete(key);
    });

    return promise;
  }

  get<T = any>(url: string, config?: RequestClientConfigEx): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...(config || {}), url, method: 'GET' });
  }

  post<T = any>(url: string, data?: any, config?: RequestClientConfigEx): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...(config || {}), url, data, method: 'POST' });
  }

  put<T = any>(url: string, data?: any, config?: RequestClientConfigEx): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...(config || {}), url, data, method: 'PUT' });
  }

  delete<T = any>(url: string, config?: RequestClientConfigEx): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...(config || {}), url, method: 'DELETE' });
  }

  patch<T = any>(url: string, data?: any, config?: RequestClientConfigEx): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...(config || {}), url, data, method: 'PATCH' });
  }

  upload<T = any>(url: string, fileOrForm: File | Blob | FormData, config?: RequestClientConfigEx): Promise<AxiosResponse<T>> {
    const g: any = globalThis as any;
    let form: FormData;
    if (typeof g.FormData !== 'undefined') {
      if (fileOrForm instanceof g.FormData) {
        form = fileOrForm as FormData;
      }
      else {
        form = new g.FormData();
        form.append('file', fileOrForm as any);
      }
    }
    else {
      // 环境不支持 FormData，直接作为 data 传递（可能由自定义适配器处理）
      return this.request<T>({ ...(config || {}), url, method: 'POST', data: fileOrForm as any });
    }
    const cfg: RequestClientConfigEx = { ...(config || {}), url, method: 'POST', data: form };
    // 不显式设置 Content-Type 以便 axios 按边界自动设置
    return this.request<T>(cfg);
  }

  async download(url: string, filename?: string, config?: RequestClientConfigEx): Promise<void> {
    const res = await this.request<Blob>({
      ...(config || {}),
      url,
      method: config?.method ?? 'GET',
      responseType: 'blob',
    });
    const blob = res.data;
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const name = filename ?? extractFilenameFromHeaders(res.headers, 'download');
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = name;
      a.click();
      window.URL.revokeObjectURL(objectUrl);
    }
  }

  batch(configs: RequestClientConfigEx[]): Promise<AxiosResponse[]> {
    return Promise.all(configs.map(c => this.request(c)));
  }

  with(options?: RequestClientOptionsEx): RequestClient {
    return new RequestClient({ ...(this.options || {}), ...(options || {}) });
  }
}

export function createRequestClient(options?: RequestClientOptionsEx) {
  return new RequestClient(options);
}

function extractFilenameFromHeaders(headers: any, defaultName = 'download'): string {
  const cd = headers?.['content-disposition'] || headers?.['Content-Disposition'];
  if (typeof cd === 'string') {
    const starMatch = cd.match(/filename\*=(?:UTF-8'')?([^;\n]+)/i);
    const normMatch = cd.match(/filename=?"?([^";\n]+)"?/i);
    const name = (starMatch?.[1] || normMatch?.[1])?.trim();
    if (name)
      return decodeURIComponent(name.replace(/"/g, ''));
  }
  return defaultName;
}
