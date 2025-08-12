/**
 * HTTP 工具函数
 * 基于 fetch API 实现，提供请求重试、超时、拦截器、缓存等功能
 * 要求：
 * 1. 支持 GET、POST、PUT、DELETE、PATCH 等 HTTP 方法
 * 2. 支持自定义请求头（如 Authorization、Content-Type 等）
 * 3. 支持请求体（JSON、FormData 等）
 * 4. 支持超时设置（可配置超时时间）
 * 5. 支持重试机制（可配置重试次数、重试延迟）
 * 6. 支持拦截器（请求前、响应后、错误处理）
 * 7. 支持缓存（GET 请求）
 * 8. 支持取消请求（AbortController）
 * 9. 支持并发请求（可配置并发数）
 * 10. 支持进度事件（如上传、下载进度）
 * 11. 支持文件上传（FormData）
 * 12. 支持文件下载（Response 类型）
 * 13. 统一GET、POST请求参数处理（如查询参数、请求体）
 * 14. 支持全局配置（如基础 URL、超时时间等）
 * 15. 支持取消所有请求
 * 16. 支持批量请求
 * 17. 支持返回hook 函数 isLoading, data, error, run 等 参考 tanstack-query
 * 18. 支持导出 类似createAxios（axios是这个 可以换成合理的名字）这种函数，用于创建 API 客户端实例
 * 19. 用函数实现 不要用类实现
 */

// 基础类型定义
export interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheTime?: number;
  signal?: AbortSignal;
  onUploadProgress?: (progress: ProgressEvent) => void;
  onDownloadProgress?: (progress: ProgressEvent) => void;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  config: RequestConfig;
}

export interface HttpError extends Error {
  config?: RequestConfig;
  response?: HttpResponse;
  status?: number;
}

// 拦截器类型
export type RequestInterceptor = (
  config: RequestConfig
) => RequestConfig | Promise<RequestConfig>;

export type ResponseInterceptor<T = any> = (
  response: HttpResponse<T>
) => HttpResponse<T> | Promise<HttpResponse<T>>;

export type ErrorInterceptor = (
  error: HttpError
) => HttpError | Promise<HttpError>;

// 全局配置
export interface GlobalConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheTime?: number;
  maxConcurrent?: number;
}

// Hook 状态
export interface UseRequestState<T> {
  data: T | null;
  error: HttpError | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

export interface UseRequestResult<T> extends UseRequestState<T> {
  run: (config?: Partial<RequestConfig>) => Promise<HttpResponse<T>>;
  cancel: () => void;
  refresh: () => Promise<HttpResponse<T>>;
}

// 缓存存储
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// 全局状态
let globalConfig: GlobalConfig = {
  timeout: 10000,
  retries: 0,
  retryDelay: 1000,
  cache: false,
  cacheTime: 300000, // 5分钟
  maxConcurrent: 6,
};

const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];
const errorInterceptors: ErrorInterceptor[] = [];

const activeRequests = new Map<string, AbortController>();
const requestQueue: Array<() => Promise<any>> = [];
const runningRequests = 0;

/**
 * 设置全局配置
 * @param config 全局配置对象
 */
export function setGlobalConfig(config: Partial<GlobalConfig>): void {
  globalConfig = { ...globalConfig, ...config };
}

/**
 * 获取全局配置
 * @returns 当前全局配置
 */
export function getGlobalConfig(): GlobalConfig {
  return { ...globalConfig };
}

/**
 * 添加请求拦截器
 * @param interceptor 请求拦截器函数
 */
export function addRequestInterceptor(interceptor: RequestInterceptor): void {
  requestInterceptors.push(interceptor);
}

/**
 * 添加响应拦截器
 * @param interceptor 响应拦截器函数
 */
export function addResponseInterceptor(interceptor: ResponseInterceptor): void {
  responseInterceptors.push(interceptor);
}

/**
 * 添加错误拦截器
 * @param interceptor 错误拦截器函数
 */
export function addErrorInterceptor(interceptor: ErrorInterceptor): void {
  errorInterceptors.push(interceptor);
}

/**
 * 清除所有拦截器
 */
export function clearInterceptors(): void {
  requestInterceptors.length = 0;
  responseInterceptors.length = 0;
  errorInterceptors.length = 0;
}

/**
 * 生成缓存键
 * @param config 请求配置
 * @returns 缓存键
 */
function getCacheKey(config: RequestConfig): string {
  const { url, method = 'GET', body, params } = config;
  return `${method}:${url}:${JSON.stringify({ body, params })}`;
}

/**
 * 从缓存获取数据
 * @param key 缓存键
 * @returns 缓存的响应数据或null
 */
function getFromCache<T>(key: string): HttpResponse<T> | null {
  const cached = cache.get(key);
  if (!cached)
    return null;

  const now = Date.now();
  if (now - cached.timestamp > cached.ttl) {
    cache.delete(key);
    return null;
  }

  return cached.data;
}

/**
 * 设置缓存
 * @param key 缓存键
 * @param data 响应数据
 * @param ttl 缓存时间（毫秒）
 */
function setCache<T>(key: string, data: HttpResponse<T>, ttl: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

/**
 * 清除缓存
 * @param pattern 可选的匹配模式
 */
export function clearCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }

  const regex = new RegExp(pattern);
  for (const [key] of Array.from(cache)) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
}

/**
 * 延迟函数
 * @param ms 延迟时间（毫秒）
 * @returns Promise
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 构建完整URL
 * @param url 请求URL
 * @param params 查询参数
 * @returns 完整URL
 */
function buildURL(url: string, params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return url;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
    }
  });

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${searchParams.toString()}`;
}

/**
 * 处理请求体
 * @param body 请求体
 * @param headers 请求头
 * @returns 处理后的请求体
 */
function processRequestBody(body: any, headers: Record<string, string>): any {
  if (!body)
    return undefined;

  if (body instanceof FormData) {
    // FormData 不需要设置 Content-Type，浏览器会自动设置
    delete headers['Content-Type'];
    return body;
  }

  if (typeof body === 'string') {
    return body;
  }

  // 默认JSON序列化
  if (!headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  return JSON.stringify(body);
}

/**
 * 执行单次请求
 * @param config 请求配置
 * @returns Promise<HttpResponse>
 */
async function performRequest<T = any>(
  config: RequestConfig,
): Promise<HttpResponse<T>> {
  const {
    url,
    method = 'GET',
    headers = {},
    body,
    params,
    timeout = globalConfig.timeout!,
    signal,
  } = config;

  // 构建完整URL
  const fullURL = globalConfig.baseURL
    ? new URL(url, globalConfig.baseURL).toString()
    : url;
  const finalURL = buildURL(fullURL, params);

  // 合并请求头
  const finalHeaders = {
    ...globalConfig.headers,
    ...headers,
  };

  // 处理请求体
  const processedBody = processRequestBody(body, finalHeaders);

  // 创建AbortController用于超时
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeout);

  // 合并信号
  const combinedSignal = signal
    ? (() => {
        const controller = new AbortController();
        const abortHandler = () => controller.abort();
        signal.addEventListener('abort', abortHandler);
        timeoutController.signal.addEventListener('abort', abortHandler);
        return controller.signal;
      })()
    : timeoutController.signal;

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: finalHeaders,
      body: processedBody,
      signal: combinedSignal,
    };

    const response = await fetch(finalURL, fetchOptions);

    if (!response.ok) {
      const error = new Error(
        `HTTP Error: ${response.status} ${response.statusText}`,
      ) as HttpError;
      error.status = response.status;
      error.config = config;
      throw error;
    }

    // 尝试解析响应数据
    let data: T;
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      data = await response.json();
    }
    else if (contentType?.includes('text/')) {
      data = (await response.text()) as unknown as T;
    }
    else {
      data = (await response.blob()) as unknown as T;
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config,
    };
  }
  finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 执行请求（包含重试逻辑）
 * @param config 请求配置
 * @returns Promise<HttpResponse>
 */
async function executeRequest<T = any>(
  config: RequestConfig,
): Promise<HttpResponse<T>> {
  const retries = config.retries ?? globalConfig.retries!;
  const retryDelay = config.retryDelay ?? globalConfig.retryDelay!;
  let lastError: HttpError | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await performRequest<T>(config);
    }
    catch (error) {
      lastError = error as HttpError;

      // 如果是最后一次尝试或者是取消请求，直接抛出错误
      if (attempt === retries || config.signal?.aborted) {
        throw error;
      }

      // 等待重试延迟（指数退避）
      await delay(retryDelay * 2 ** attempt);
    }
  }

  // 这行代码理论上不会执行到，因为循环中会 return 或 throw
  throw new Error(lastError?.message || 'Request failed after retries');
}

/**
 * 核心请求函数
 * @param config 请求配置
 * @returns Promise<HttpResponse>
 */
export async function request<T = any>(
  config: RequestConfig,
): Promise<HttpResponse<T>> {
  // 应用请求拦截器
  let processedConfig = { ...config };
  for (const interceptor of requestInterceptors) {
    processedConfig = await interceptor(processedConfig);
  }

  // 检查缓存
  const shouldCache = processedConfig.cache ?? globalConfig.cache;
  if (shouldCache && processedConfig.method === 'GET') {
    const cacheKey = getCacheKey(processedConfig);
    const cached = getFromCache<T>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // 创建请求执行函数
  const executeRequestWithInterceptors = async (): Promise<HttpResponse<T>> => {
    try {
      let response = await executeRequest<T>(processedConfig);

      // 应用响应拦截器
      for (const interceptor of responseInterceptors) {
        response = await interceptor(response);
      }

      // 缓存响应
      if (shouldCache && processedConfig.method === 'GET') {
        const cacheKey = getCacheKey(processedConfig);
        const cacheTime = processedConfig.cacheTime ?? globalConfig.cacheTime!;
        setCache(cacheKey, response, cacheTime);
      }

      return response;
    }
    catch (error) {
      // 应用错误拦截器
      let processedError = error as HttpError;
      for (const interceptor of errorInterceptors) {
        processedError = await interceptor(processedError);
      }
      throw processedError;
    }
  };

  // 并发控制
  if (runningRequests >= globalConfig.maxConcurrent!) {
    return new Promise((resolve, reject) => {
      requestQueue.push(() =>
        executeRequestWithInterceptors().then(resolve).catch(reject),
      );
    });
  }

  return executeRequestWithInterceptors();
}

/**
 * GET 请求
 * @param url 请求URL
 * @param config 请求配置
 * @returns Promise<HttpResponse>
 */
export function get<T = any>(
  url: string,
  config?: Omit<RequestConfig, 'url' | 'method'>,
): Promise<HttpResponse<T>> {
  return request<T>({ ...config, url, method: 'GET' });
}

/**
 * POST 请求
 * @param url 请求URL
 * @param body 请求体
 * @param config 请求配置
 * @returns Promise<HttpResponse>
 */
export function post<T = any>(
  url: string,
  body?: any,
  config?: Omit<RequestConfig, 'url' | 'method' | 'body'>,
): Promise<HttpResponse<T>> {
  return request<T>({ ...config, url, method: 'POST', body });
}

/**
 * PUT 请求
 * @param url 请求URL
 * @param body 请求体
 * @param config 请求配置
 * @returns Promise<HttpResponse>
 */
export function put<T = any>(
  url: string,
  body?: any,
  config?: Omit<RequestConfig, 'url' | 'method' | 'body'>,
): Promise<HttpResponse<T>> {
  return request<T>({ ...config, url, method: 'PUT', body });
}

/**
 * DELETE 请求
 * @param url 请求URL
 * @param config 请求配置
 * @returns Promise<HttpResponse>
 */
export function del<T = any>(
  url: string,
  config?: Omit<RequestConfig, 'url' | 'method'>,
): Promise<HttpResponse<T>> {
  return request<T>({ ...config, url, method: 'DELETE' });
}

/**
 * PATCH 请求
 * @param url 请求URL
 * @param body 请求体
 * @param config 请求配置
 * @returns Promise<HttpResponse>
 */
export function patch<T = any>(
  url: string,
  body?: any,
  config?: Omit<RequestConfig, 'url' | 'method' | 'body'>,
): Promise<HttpResponse<T>> {
  return request<T>({ ...config, url, method: 'PATCH', body });
}

/**
 * 批量请求
 * @param configs 请求配置数组
 * @returns Promise<HttpResponse[]>
 */
export async function batchRequest(
  configs: RequestConfig[],
): Promise<HttpResponse[]> {
  return Promise.all(configs.map(config => request(config)));
}

/**
 * 取消请求
 * @param requestId 请求ID
 */
export function cancelRequest(requestId: string): void {
  const controller = activeRequests.get(requestId);
  if (controller) {
    controller.abort();
    activeRequests.delete(requestId);
  }
}

/**
 * 取消所有请求
 */
export function cancelAllRequests(): void {
  for (const [, controller] of Array.from(activeRequests)) {
    controller.abort();
  }
  activeRequests.clear();
  requestQueue.length = 0;
}

/**
 * 文件上传
 * @param url 上传URL
 * @param file 文件或FormData
 * @param config 请求配置
 * @returns Promise<HttpResponse>
 */
export function upload<T = any>(
  url: string,
  file: File | FormData,
  config?: Omit<RequestConfig, 'url' | 'method' | 'body'>,
): Promise<HttpResponse<T>> {
  const formData = file instanceof FormData ? file : new FormData();
  if (file instanceof File) {
    formData.append('file', file);
  }

  return post<T>(url, formData, config);
}

/**
 * 文件下载
 * @param url 下载URL
 * @param filename 文件名
 * @param config 请求配置
 * @returns Promise<void>
 */
export async function download(
  url: string,
  filename?: string,
  config?: Omit<RequestConfig, 'url' | 'method'>,
): Promise<void> {
  // 直接使用 request 函数获取 blob 响应
  const response = await request<Blob>({
    ...config,
    url,
    method: 'GET',
  });
  const blob = response.data;

  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename || 'download';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

/**
 * Hook: 使用请求
 * @param config 请求配置
 * @param options Hook选项
 * @returns UseRequestResult
 */
export function useRequest<T = any>(
  config: RequestConfig,
  options: {
    manual?: boolean;
    onSuccess?: (data: T, response: HttpResponse<T>) => void;
    onError?: (error: HttpError) => void;
  } = {},
): UseRequestResult<T> {
  const { manual = false, onSuccess, onError } = options;

  const state: UseRequestState<T> = {
    data: null,
    error: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
  };

  let abortController: AbortController | null = null;
  let lastConfig = config;

  const setState = (newState: Partial<UseRequestState<T>>) => {
    Object.assign(state, newState);
  };

  const run = async (
    overrideConfig?: Partial<RequestConfig>,
  ): Promise<HttpResponse<T>> => {
    const finalConfig = { ...lastConfig, ...overrideConfig };
    lastConfig = finalConfig;

    // 取消之前的请求
    if (abortController) {
      abortController.abort();
    }

    abortController = new AbortController();
    finalConfig.signal = abortController.signal;

    setState({
      isLoading: true,
      isError: false,
      error: null,
    });

    try {
      const response = await request<T>(finalConfig);

      setState({
        data: response.data,
        isLoading: false,
        isSuccess: true,
      });

      onSuccess?.(response.data, response);
      return response;
    }
    catch (error) {
      const httpError = error as HttpError;

      setState({
        error: httpError,
        isLoading: false,
        isError: true,
        isSuccess: false,
      });

      onError?.(httpError);
      throw error;
    }
  };

  const cancel = () => {
    if (abortController) {
      abortController.abort();
      setState({ isLoading: false });
    }
  };

  const refresh = () => run();

  // 自动执行
  if (!manual) {
    run().catch(() => {});
  }

  const result: UseRequestResult<T> = {
    get data() { return state.data; },
    get error() { return state.error; },
    get isLoading() { return state.isLoading; },
    get isError() { return state.isError; },
    get isSuccess() { return state.isSuccess; },
    run,
    cancel,
    refresh,
  };

  return result;
}

/**
 * 创建HTTP客户端实例
 * @param config 客户端配置
 * @returns HTTP客户端实例
 */
export function createHttpClient(config?: Partial<GlobalConfig>) {
  // 创建独立的配置和拦截器
  const clientConfig: GlobalConfig = {
    ...globalConfig,
    ...config,
  };

  const clientRequestInterceptors: RequestInterceptor[] = [];
  const clientResponseInterceptors: ResponseInterceptor[] = [];
  const clientErrorInterceptors: ErrorInterceptor[] = [];
  const clientActiveRequests = new Map<string, AbortController>();

  // 客户端请求函数
  const clientRequest = async <T = any>(
    config: RequestConfig,
  ): Promise<HttpResponse<T>> => {
    // 应用客户端拦截器
    let processedConfig = { ...config };
    for (const interceptor of clientRequestInterceptors) {
      processedConfig = await interceptor(processedConfig);
    }

    // 使用客户端配置
    const finalConfig = {
      ...clientConfig,
      ...processedConfig,
      headers: {
        ...clientConfig.headers,
        ...processedConfig.headers,
      },
    };

    try {
      let response = await executeRequest<T>(finalConfig);

      // 应用客户端响应拦截器
      for (const interceptor of clientResponseInterceptors) {
        response = await interceptor(response);
      }

      return response;
    }
    catch (error) {
      // 应用客户端错误拦截器
      let processedError = error as HttpError;
      for (const interceptor of clientErrorInterceptors) {
        processedError = await interceptor(processedError);
      }
      throw processedError;
    }
  };

  return {
    // 配置方法
    setConfig: (newConfig: Partial<GlobalConfig>): void => {
      Object.assign(clientConfig, newConfig);
    },
    getConfig: (): GlobalConfig => ({ ...clientConfig }),

    // 拦截器方法
    addRequestInterceptor: (interceptor: RequestInterceptor): void => {
      clientRequestInterceptors.push(interceptor);
    },
    addResponseInterceptor: (interceptor: ResponseInterceptor): void => {
      clientResponseInterceptors.push(interceptor);
    },
    addErrorInterceptor: (interceptor: ErrorInterceptor): void => {
      clientErrorInterceptors.push(interceptor);
    },
    clearInterceptors: (): void => {
      clientRequestInterceptors.length = 0;
      clientResponseInterceptors.length = 0;
      clientErrorInterceptors.length = 0;
    },

    // 请求方法
    request: clientRequest as <T = any>(config: RequestConfig) => Promise<HttpResponse<T>>,
    get: <T = any>(
      url: string,
      config?: Omit<RequestConfig, 'url' | 'method'>,
    ): Promise<HttpResponse<T>> => clientRequest<T>({ ...config, url, method: 'GET' }),
    post: <T = any>(
      url: string,
      body?: any,
      config?: Omit<RequestConfig, 'url' | 'method' | 'body'>,
    ): Promise<HttpResponse<T>> => clientRequest<T>({ ...config, url, method: 'POST', body }),
    put: <T = any>(
      url: string,
      body?: any,
      config?: Omit<RequestConfig, 'url' | 'method' | 'body'>,
    ): Promise<HttpResponse<T>> => clientRequest<T>({ ...config, url, method: 'PUT', body }),
    delete: <T = any>(
      url: string,
      config?: Omit<RequestConfig, 'url' | 'method'>,
    ): Promise<HttpResponse<T>> => clientRequest<T>({ ...config, url, method: 'DELETE' }),
    patch: <T = any>(
      url: string,
      body?: any,
      config?: Omit<RequestConfig, 'url' | 'method' | 'body'>,
    ): Promise<HttpResponse<T>> => clientRequest<T>({ ...config, url, method: 'PATCH', body }),

    // 工具方法
    upload: <T = any>(
      url: string,
      file: File | FormData,
      config?: Omit<RequestConfig, 'url' | 'method' | 'body'>,
    ): Promise<HttpResponse<T>> => {
      const formData = file instanceof FormData ? file : new FormData();
      if (file instanceof File) {
        formData.append('file', file);
      }
      return clientRequest<T>({
        ...config,
        url,
        method: 'POST',
        body: formData,
      });
    },

    batchRequest: (configs: RequestConfig[]): Promise<HttpResponse[]> =>
      Promise.all(configs.map(config => clientRequest(config))),

    cancelAllRequests: (): void => {
      for (const [, controller] of Array.from(clientActiveRequests)) {
        controller.abort();
      }
      clientActiveRequests.clear();
    },
  };
}

// 默认导出便捷方法
export const http: {
  request: typeof request;
  get: typeof get;
  post: typeof post;
  put: typeof put;
  delete: typeof del;
  patch: typeof patch;
  upload: typeof upload;
  download: typeof download;
  batchRequest: typeof batchRequest;
  cancelRequest: typeof cancelRequest;
  cancelAllRequests: typeof cancelAllRequests;
  clearCache: typeof clearCache;
  setGlobalConfig: typeof setGlobalConfig;
  getGlobalConfig: typeof getGlobalConfig;
  addRequestInterceptor: typeof addRequestInterceptor;
  addResponseInterceptor: typeof addResponseInterceptor;
  addErrorInterceptor: typeof addErrorInterceptor;
  clearInterceptors: typeof clearInterceptors;
  useRequest: typeof useRequest;
  createHttpClient: typeof createHttpClient;
} = {
  request,
  get,
  post,
  put,
  delete: del,
  patch,
  upload,
  download,
  batchRequest,
  cancelRequest,
  cancelAllRequests,
  clearCache,
  setGlobalConfig,
  getGlobalConfig,
  addRequestInterceptor,
  addResponseInterceptor,
  addErrorInterceptor,
  clearInterceptors,
  useRequest,
  createHttpClient,
};
