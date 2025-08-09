/**
 * HTTP 工具函数单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  http,
  request,
  get,
  post,
  put,
  del,
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
  type RequestConfig,
  type HttpResponse,
  type HttpError,
  type GlobalConfig,
} from '../http';

// Mock fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock DOM APIs for download tests
const mockWindow = {
  URL: {
    createObjectURL: vi.fn(() => 'blob:mock-url'),
    revokeObjectURL: vi.fn(),
  },
};

const mockDocument = {
  createElement: vi.fn(() => ({
    href: '',
    download: '',
    click: vi.fn(),
  })),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
};

// 模拟全局对象
global.window = mockWindow as any;
global.document = mockDocument as any;

/**
 * 创建模拟响应
 */
function createMockResponse<T>(data: T, status = 200, statusText = 'OK'): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
    blob: vi.fn().mockResolvedValue(new Blob([JSON.stringify(data)])),
  } as any;
}

/**
 * 创建模拟错误响应
 */
function createMockErrorResponse(status = 500, statusText = 'Internal Server Error'): Response {
  return {
    ok: false,
    status,
    statusText,
    headers: new Headers(),
    json: vi.fn().mockRejectedValue(new Error('Failed to parse JSON')),
    text: vi.fn().mockResolvedValue('Error'),
    blob: vi.fn().mockResolvedValue(new Blob(['Error'])),
  } as any;
}

describe('HTTP 工具函数', () => {
  beforeEach(() => {
    // 重置所有 mock
    vi.clearAllMocks();
    vi.resetAllMocks();
    
    // 重置全局配置
    setGlobalConfig({
      timeout: 10000,
      retries: 0,
      retryDelay: 1000,
      cache: false,
      cacheTime: 300000,
      maxConcurrent: 6,
    });
    
    // 清空缓存
    clearCache();
    
    // 清理拦截器
    clearInterceptors();
    
    // 重置 fetch mock
    mockFetch.mockClear();
  });

  afterEach(() => {
    cancelAllRequests();
  });

  describe('基本请求方法', () => {
    it('应该发送 GET 请求', async () => {
      const mockData = { id: 1, name: 'test' };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      const response = await get<typeof mockData>('/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'GET',
          headers: {},
        })
      );
      expect(response.data).toEqual(mockData);
      expect(response.status).toBe(200);
    });

    it('应该发送 POST 请求', async () => {
      const mockData = { success: true };
      const postData = { name: 'test' };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      const response = await post<typeof mockData>('/api/test', postData);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData),
        })
      );
      expect(response.data).toEqual(mockData);
    });

    it('应该发送 PUT 请求', async () => {
      const mockData = { updated: true };
      const putData = { name: 'updated' };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      const response = await put<typeof mockData>('/api/test/1', putData);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(putData),
        })
      );
      expect(response.data).toEqual(mockData);
    });

    it('应该发送 DELETE 请求', async () => {
      const mockData = { deleted: true };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      const response = await del<typeof mockData>('/api/test/1');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(response.data).toEqual(mockData);
    });

    it('应该发送 PATCH 请求', async () => {
      const mockData = { patched: true };
      const patchData = { status: 'active' };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      const response = await patch<typeof mockData>('/api/test/1', patchData);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(patchData),
        })
      );
      expect(response.data).toEqual(mockData);
    });
  });

  describe('查询参数处理', () => {
    it('应该正确处理查询参数', async () => {
      const mockData = { results: [] };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      await get('/api/search', {
        params: { q: 'test', page: 1, active: true },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/search?q=test&page=1&active=true',
        expect.any(Object)
      );
    });

    it('应该忽略 null 和 undefined 参数', async () => {
      const mockData = { results: [] };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      await get('/api/search', {
        params: { q: 'test', page: null, limit: undefined },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/search?q=test',
        expect.any(Object)
      );
    });
  });

  describe('请求头处理', () => {
    it('应该设置自定义请求头', async () => {
      const mockData = { authorized: true };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      await get('/api/protected', {
        headers: {
          Authorization: 'Bearer token123',
          'X-Custom-Header': 'custom-value',
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/protected',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token123',
            'X-Custom-Header': 'custom-value',
          }),
        })
      );
    });

    it('应该合并全局和局部请求头', async () => {
      setGlobalConfig({
        headers: { 'X-Global': 'global-value' },
      });

      const mockData = { success: true };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      await get('/api/test', {
        headers: { 'X-Local': 'local-value' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Global': 'global-value',
            'X-Local': 'local-value',
          }),
        })
      );
    });
  });

  describe('错误处理', () => {
    it('应该处理 HTTP 错误状态', async () => {
      mockFetch.mockResolvedValueOnce(createMockErrorResponse(404, 'Not Found'));

      await expect(get('/api/notfound')).rejects.toThrow('HTTP Error: 404 Not Found');
    });

    it('应该处理网络错误', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'));

      await expect(get('/api/test')).rejects.toThrow('Network Error');
    });
  });

  describe('重试机制', () => {
    it('应该在失败时重试请求', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValueOnce(createMockResponse({ success: true }));

      const response = await get('/api/test', {
        retries: 2,
        retryDelay: 10,
      });

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(response.data).toEqual({ success: true });
    });

    it('应该在达到最大重试次数后抛出错误', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockRejectedValueOnce(new Error('Network Error'));

      await expect(
        get('/api/test', {
          retries: 1,
          retryDelay: 10,
        })
      ).rejects.toThrow('Network Error');

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('拦截器', () => {
    it('应该执行请求拦截器', async () => {
      const requestInterceptor = vi.fn((config) => ({
        ...config,
        headers: { ...config.headers, 'X-Intercepted': 'true' },
      }));

      addRequestInterceptor(requestInterceptor);

      const mockData = { success: true };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      await get('/api/test');

      expect(requestInterceptor).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Intercepted': 'true',
          }),
        })
      );
    });

    it('应该执行响应拦截器', async () => {
      const responseInterceptor = vi.fn((response) => ({
        ...response,
        data: { ...response.data, intercepted: true },
      }));

      addResponseInterceptor(responseInterceptor);

      const mockData = { success: true };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      const response = await get('/api/test');

      expect(responseInterceptor).toHaveBeenCalled();
      expect(response.data).toEqual({ success: true, intercepted: true });
    });

    it('应该执行错误拦截器', async () => {
      const errorInterceptor = vi.fn((error) => {
        error.message = 'Intercepted: ' + error.message;
        return error;
      });

      addErrorInterceptor(errorInterceptor);

      mockFetch.mockRejectedValueOnce(new Error('Original Error'));

      await expect(get('/api/test')).rejects.toThrow('Intercepted: Original Error');
      expect(errorInterceptor).toHaveBeenCalled();
    });
  });

  describe('缓存功能', () => {
    it('应该缓存 GET 请求的响应', async () => {
      const mockData = { cached: true };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      // 第一次请求
      const response1 = await get('/api/cached', { cache: true });
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(response1.data).toEqual(mockData);

      // 第二次请求应该从缓存返回
      const response2 = await get('/api/cached', { cache: true });
      expect(mockFetch).toHaveBeenCalledTimes(1); // 仍然是 1 次
      expect(response2.data).toEqual(mockData);
    });

    it('应该清除缓存', async () => {
      const mockData = { cached: true };
      mockFetch.mockResolvedValue(createMockResponse(mockData));

      // 第一次请求
      await get('/api/cached', { cache: true });
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // 清除缓存
      clearCache();

      // 第二次请求应该重新发送
      await get('/api/cached', { cache: true });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('应该根据模式清除特定缓存', async () => {
      const mockData = { cached: true };
      mockFetch.mockResolvedValue(createMockResponse(mockData));

      // 缓存多个请求
      await get('/api/users', { cache: true });
      await get('/api/posts', { cache: true });
      expect(mockFetch).toHaveBeenCalledTimes(2);

      // 清除特定模式的缓存
      clearCache('users');

      // users 请求应该重新发送，posts 请求应该从缓存返回
      await get('/api/users', { cache: true });
      await get('/api/posts', { cache: true });
      expect(mockFetch).toHaveBeenCalledTimes(3); // users 重新请求
    });
  });

  describe('批量请求', () => {
    it('应该并行执行多个请求', async () => {
      const mockData1 = { id: 1 };
      const mockData2 = { id: 2 };
      const mockData3 = { id: 3 };

      mockFetch
        .mockResolvedValueOnce(createMockResponse(mockData1))
        .mockResolvedValueOnce(createMockResponse(mockData2))
        .mockResolvedValueOnce(createMockResponse(mockData3));

      const configs: RequestConfig[] = [
        { url: '/api/test/1', method: 'GET' },
        { url: '/api/test/2', method: 'GET' },
        { url: '/api/test/3', method: 'GET' },
      ];

      const responses = await batchRequest(configs);

      expect(responses).toHaveLength(3);
      expect(responses[0].data).toEqual(mockData1);
      expect(responses[1].data).toEqual(mockData2);
      expect(responses[2].data).toEqual(mockData3);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('文件上传', () => {
    it('应该上传文件', async () => {
      const mockData = { uploaded: true };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const response = await upload('/api/upload', file);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/upload',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
      expect(response.data).toEqual(mockData);
    });

    it('应该上传 FormData', async () => {
      const mockData = { uploaded: true };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      const formData = new FormData();
      formData.append('field', 'value');
      const response = await upload('/api/upload', formData);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/upload',
        expect.objectContaining({
          method: 'POST',
          body: formData,
        })
      );
      expect(response.data).toEqual(mockData);
    });
  });

  describe('文件下载', () => {
    it('应该下载文件', async () => {
      const mockBlob = new Blob(['file content'], { type: 'text/plain' });
      
      // 创建一个 mock 响应，没有 Content-Type 头部，这样会默认解析为 blob
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(), // 没有 Content-Type，会默认解析为 blob
        blob: vi.fn().mockResolvedValue(mockBlob),
        json: vi.fn(),
        text: vi.fn(),
      };
      
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      mockDocument.createElement.mockReturnValue(mockLink as any);

      await download('/api/download/file.txt', 'downloaded.txt');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/download/file.txt',
        expect.objectContaining({ method: 'GET' })
      );
      expect(mockDocument.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.download).toBe('downloaded.txt');
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockWindow.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockWindow.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('全局配置', () => {
    it('应该设置和获取全局配置', () => {
      const config: Partial<GlobalConfig> = {
        baseURL: 'https://api.example.com',
        timeout: 5000,
        headers: { 'X-API-Key': 'key123' },
      };

      setGlobalConfig(config);
      const globalConfig = getGlobalConfig();

      expect(globalConfig.baseURL).toBe('https://api.example.com');
      expect(globalConfig.timeout).toBe(5000);
      expect(globalConfig.headers).toEqual({ 'X-API-Key': 'key123' });
    });

    it('应该使用基础 URL', async () => {
      setGlobalConfig({ baseURL: 'https://api.example.com' });

      const mockData = { success: true };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      await get('/users');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.any(Object)
      );
    });
  });

  describe('HTTP 客户端实例', () => {
    it('应该创建独立的客户端实例', async () => {
      const client = createHttpClient({
        baseURL: 'https://api.example.com',
        headers: { 'X-Client': 'test' },
      });

      const mockData = { client: true };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      const response = await client.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Client': 'test',
          }),
        })
      );
      expect(response.data).toEqual(mockData);
    });

    it('客户端应该有独立的拦截器', async () => {
      const client = createHttpClient();
      const clientInterceptor = vi.fn((config) => ({
        ...config,
        headers: { ...config.headers, 'X-Client-Interceptor': 'true' },
      }));

      client.addRequestInterceptor(clientInterceptor);

      const mockData = { success: true };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      await client.get('/test');

      expect(clientInterceptor).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Client-Interceptor': 'true',
            'X-API-Key': 'key123',
          }),
        })
      );
    });
  });

  describe('useRequest Hook', () => {
    it('应该自动执行请求', async () => {
      const mockData = { hook: true };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      const hookResult = useRequest({ url: '/api/hook-auto', method: 'GET' });

      // 等待异步请求完成
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(hookResult.data).toEqual(mockData);
      expect(hookResult.isLoading).toBe(false);
      expect(hookResult.isSuccess).toBe(true);
      expect(hookResult.isError).toBe(false);
    });

    it('应该支持手动执行', async () => {
      const mockData = { manual: true };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      const hookResult = useRequest(
        { url: '/api/hook-manual', method: 'GET' },
        { manual: true }
      );

      expect(hookResult.data).toBeNull();
      expect(hookResult.isLoading).toBe(false);

      const response = await hookResult.run();

      expect(response.data).toEqual(mockData);
      expect(hookResult.data).toEqual(mockData);
      expect(hookResult.isSuccess).toBe(true);
    });

    it('应该处理错误状态', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Request failed'));

      const onError = vi.fn();
      const hookResult = useRequest(
        { url: '/api/hook-error', method: 'GET' },
        { onError }
      );

      // 等待异步请求完成
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(hookResult.isError).toBe(true);
      expect(hookResult.error).toBeInstanceOf(Error);
      expect(hookResult.error?.message).toBe('Request failed');
      expect(onError).toHaveBeenCalled();
    });

    it('应该支持取消请求', async () => {
      // 创建一个永远不会 resolve 的 Promise 来模拟长时间运行的请求
      mockFetch.mockImplementationOnce(
        () => new Promise(() => {}) // 永远不会 resolve
      );

      const hookResult = useRequest({ url: '/api/hook-cancel', method: 'GET' });

      expect(hookResult.isLoading).toBe(true);

      hookResult.cancel();

      expect(hookResult.isLoading).toBe(false);
    });

    it('应该支持刷新请求', async () => {
      const mockData1 = { version: 1 };
      const mockData2 = { version: 2 };
      
      mockFetch
        .mockResolvedValueOnce(createMockResponse(mockData1))
        .mockResolvedValueOnce(createMockResponse(mockData2));

      const hookResult = useRequest({ url: '/api/refresh-test', method: 'GET' });

      // 等待第一次请求完成
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(hookResult.data).toEqual(mockData1);

      // 刷新请求
      await hookResult.refresh();
      expect(hookResult.data).toEqual(mockData2);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('http 对象', () => {
    it('应该包含所有导出的方法', () => {
      expect(http).toHaveProperty('request');
      expect(http).toHaveProperty('get');
      expect(http).toHaveProperty('post');
      expect(http).toHaveProperty('put');
      expect(http).toHaveProperty('delete');
      expect(http).toHaveProperty('patch');
      expect(http).toHaveProperty('upload');
      expect(http).toHaveProperty('download');
      expect(http).toHaveProperty('batchRequest');
      expect(http).toHaveProperty('cancelRequest');
      expect(http).toHaveProperty('cancelAllRequests');
      expect(http).toHaveProperty('clearCache');
      expect(http).toHaveProperty('setGlobalConfig');
      expect(http).toHaveProperty('getGlobalConfig');
      expect(http).toHaveProperty('addRequestInterceptor');
      expect(http).toHaveProperty('addResponseInterceptor');
      expect(http).toHaveProperty('addErrorInterceptor');
      expect(http).toHaveProperty('clearInterceptors');
      expect(http).toHaveProperty('useRequest');
      expect(http).toHaveProperty('createHttpClient');
    });

    it('http 对象的方法应该正常工作', async () => {
      const mockData = { http: true };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      const response = await http.get('/api/http-test');

      expect(response.data).toEqual(mockData);
    });
  });
});