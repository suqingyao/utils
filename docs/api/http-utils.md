# HTTP 工具 (HTTP Utils)

基于 Fetch API 实现的 HTTP 客户端，提供请求重试、超时、拦截器、缓存等高级功能，适用于现代 Web 应用的网络请求需求。

## 导入

```typescript
import { HttpClient, http, createHttpClient } from 'outils';
import type { RequestConfig, Response, RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from 'outils';
```

## 类型定义

### RequestConfig

请求配置接口。

```typescript
interface RequestConfig {
  url: string;                    // 请求URL
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; // HTTP方法
  headers?: Record<string, string>; // 请求头
  body?: any;                     // 请求体
  timeout?: number;               // 超时时间（毫秒）
  retries?: number;               // 重试次数
  retryDelay?: number;            // 重试延迟（毫秒）
  cache?: boolean;                // 是否启用缓存
  cacheTime?: number;             // 缓存时间（毫秒）
}
```

### Response

响应接口。

```typescript
interface Response<T = any> {
  data: T;                        // 响应数据
  status: number;                 // HTTP状态码
  statusText: string;             // 状态文本
  headers: Headers;               // 响应头
}
```

### 拦截器类型

```typescript
type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
type ResponseInterceptor<T = any> = (response: Response<T>) => Response<T> | Promise<Response<T>>;
type ErrorInterceptor = (error: Error) => Error | Promise<Error>;
```

## HttpClient 类

### 构造函数

```typescript
const client = new HttpClient();
```

### 添加拦截器

#### addRequestInterceptor(interceptor)

添加请求拦截器。

**参数：**
- `interceptor: RequestInterceptor` - 请求拦截器函数

**示例：**

```typescript
import { HttpClient } from 'outils';

const client = new HttpClient();

// 添加认证头
client.addRequestInterceptor((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  return config;
});

// 添加请求日志
client.addRequestInterceptor(async (config) => {
  console.log('发送请求:', config.method, config.url);
  return config;
});

// 添加API版本
client.addRequestInterceptor((config) => {
  config.headers = {
    ...config.headers,
    'API-Version': 'v1'
  };
  return config;
});
```

#### addResponseInterceptor(interceptor)

添加响应拦截器。

**参数：**
- `interceptor: ResponseInterceptor` - 响应拦截器函数

**示例：**

```typescript
import { HttpClient } from 'outils';

const client = new HttpClient();

// 统一处理响应格式
client.addResponseInterceptor((response) => {
  // 假设API返回格式为 { code, data, message }
  if (response.data.code === 0) {
    return {
      ...response,
      data: response.data.data
    };
  } else {
    throw new Error(response.data.message || '请求失败');
  }
});

// 响应时间统计
client.addResponseInterceptor((response) => {
  console.log('响应状态:', response.status, response.statusText);
  return response;
});

// 数据转换
client.addResponseInterceptor((response) => {
  // 转换日期字符串为Date对象
  if (response.data && typeof response.data === 'object') {
    const dateFields = ['createdAt', 'updatedAt', 'publishedAt'];
    dateFields.forEach(field => {
      if (response.data[field] && typeof response.data[field] === 'string') {
        response.data[field] = new Date(response.data[field]);
      }
    });
  }
  return response;
});
```

#### addErrorInterceptor(interceptor)

添加错误拦截器。

**参数：**
- `interceptor: ErrorInterceptor` - 错误拦截器函数

**示例：**

```typescript
import { HttpClient } from 'outils';

const client = new HttpClient();

// 统一错误处理
client.addErrorInterceptor((error) => {
  console.error('请求错误:', error.message);
  
  // 根据错误类型进行不同处理
  if (error.message.includes('401')) {
    // 未授权，跳转到登录页
    window.location.href = '/login';
  } else if (error.message.includes('403')) {
    // 权限不足
    alert('权限不足');
  } else if (error.message.includes('500')) {
    // 服务器错误
    alert('服务器错误，请稍后重试');
  }
  
  return error;
});

// 错误上报
client.addErrorInterceptor(async (error) => {
  // 上报错误到监控系统
  try {
    await fetch('/api/error-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      })
    });
  } catch (reportError) {
    console.error('错误上报失败:', reportError);
  }
  
  return error;
});

// 错误重试逻辑
client.addErrorInterceptor((error) => {
  // 对于网络错误，提供重试选项
  if (error.message.includes('fetch')) {
    const retry = confirm('网络请求失败，是否重试？');
    if (retry) {
      // 这里可以实现重试逻辑
      console.log('用户选择重试');
    }
  }
  
  return error;
});
```

### 发送请求

#### request(config)

发送 HTTP 请求。

**参数：**
- `config: RequestConfig` - 请求配置

**返回值：**
- `Promise<Response<T>>` - 响应对象

**示例：**

```typescript
import { HttpClient } from 'outils';

const client = new HttpClient();

// 基础请求
const response = await client.request({
  url: '/api/users',
  method: 'GET'
});
console.log('用户列表:', response.data);

// 带参数的POST请求
const createResponse = await client.request({
  url: '/api/users',
  method: 'POST',
  body: {
    name: 'John Doe',
    email: 'john@example.com'
  },
  headers: {
    'Content-Type': 'application/json'
  }
});
console.log('创建用户:', createResponse.data);

// 带重试的请求
const retryResponse = await client.request({
  url: '/api/unstable-endpoint',
  method: 'GET',
  retries: 3,
  retryDelay: 1000,
  timeout: 5000
});

// 带缓存的请求
const cachedResponse = await client.request({
  url: '/api/config',
  method: 'GET',
  cache: true,
  cacheTime: 300000 // 5分钟
});

// 类型安全的请求
interface User {
  id: number;
  name: string;
  email: string;
}

const userResponse = await client.request<User[]>({
  url: '/api/users',
  method: 'GET'
});
// userResponse.data 的类型为 User[]
```

### 请求管理

#### cancelRequest(requestId)

取消指定请求。

**参数：**
- `requestId: string` - 请求ID

**示例：**

```typescript
import { HttpClient } from 'outils';

const client = new HttpClient();

// 注意：实际使用中需要获取请求ID
// 这里仅为示例
const requestId = 'some-request-id';
client.cancelRequest(requestId);
```

#### cancelAllRequests()

取消所有进行中的请求。

**示例：**

```typescript
import { HttpClient } from 'outils';

const client = new HttpClient();

// 页面卸载时取消所有请求
window.addEventListener('beforeunload', () => {
  client.cancelAllRequests();
});

// 路由切换时取消请求
function onRouteChange() {
  client.cancelAllRequests();
}
```

#### clearCache()

清除所有缓存。

**示例：**

```typescript
import { HttpClient } from 'outils';

const client = new HttpClient();

// 用户登出时清除缓存
function logout() {
  client.clearCache();
  localStorage.removeItem('token');
  window.location.href = '/login';
}

// 定期清理缓存
setInterval(() => {
  client.clearCache();
}, 30 * 60 * 1000); // 每30分钟清理一次
```

## 便捷方法 (http)

提供简化的 HTTP 方法调用。

### http.get(url, config?)

发送 GET 请求。

**参数：**
- `url: string` - 请求URL
- `config?: Omit<RequestConfig, 'url' | 'method'>` - 可选配置

**返回值：**
- `Promise<Response<T>>` - 响应对象

**示例：**

```typescript
import { http } from 'outils';

// 简单GET请求
const users = await http.get('/api/users');
console.log('用户列表:', users.data);

// 带配置的GET请求
const config = await http.get('/api/config', {
  timeout: 5000,
  cache: true,
  headers: {
    'Accept': 'application/json'
  }
});

// 带查询参数的GET请求
const searchResults = await http.get('/api/search?q=javascript&page=1');

// 类型安全的GET请求
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

const response = await http.get<ApiResponse<User[]>>('/api/users');
if (response.data.code === 0) {
  console.log('用户数据:', response.data.data);
}
```

### http.post(url, body?, config?)

发送 POST 请求。

**参数：**
- `url: string` - 请求URL
- `body?: any` - 请求体
- `config?: Omit<RequestConfig, 'url' | 'method' | 'body'>` - 可选配置

**返回值：**
- `Promise<Response<T>>` - 响应对象

**示例：**

```typescript
import { http } from 'outils';

// 创建用户
const newUser = await http.post('/api/users', {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
});
console.log('创建的用户:', newUser.data);

// 登录请求
const loginResponse = await http.post('/api/auth/login', {
  username: 'john@example.com',
  password: 'password123'
}, {
  timeout: 10000,
  retries: 2
});

if (loginResponse.status === 200) {
  localStorage.setItem('token', loginResponse.data.token);
}

// 上传JSON数据
const updateResponse = await http.post('/api/users/123', {
  name: 'Jane Doe',
  email: 'jane@example.com'
}, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});

// 表单数据提交
const formData = new FormData();
formData.append('file', file);
formData.append('description', 'Profile picture');

const uploadResponse = await http.post('/api/upload', formData, {
  headers: {
    // 不设置 Content-Type，让浏览器自动设置
  },
  timeout: 30000
});
```

### http.put(url, body?, config?)

发送 PUT 请求。

**参数：**
- `url: string` - 请求URL
- `body?: any` - 请求体
- `config?: Omit<RequestConfig, 'url' | 'method' | 'body'>` - 可选配置

**返回值：**
- `Promise<Response<T>>` - 响应对象

**示例：**

```typescript
import { http } from 'outils';

// 更新用户信息
const updatedUser = await http.put('/api/users/123', {
  name: 'John Smith',
  email: 'john.smith@example.com',
  age: 31
});
console.log('更新后的用户:', updatedUser.data);

// 替换整个资源
const replacedConfig = await http.put('/api/config', {
  theme: 'dark',
  language: 'zh-CN',
  notifications: true
}, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// 批量更新
const batchUpdate = await http.put('/api/users/batch', {
  ids: [1, 2, 3],
  updates: {
    status: 'active',
    lastLogin: new Date().toISOString()
  }
});
```

### http.delete(url, config?)

发送 DELETE 请求。

**参数：**
- `url: string` - 请求URL
- `config?: Omit<RequestConfig, 'url' | 'method'>` - 可选配置

**返回值：**
- `Promise<Response<T>>` - 响应对象

**示例：**

```typescript
import { http } from 'outils';

// 删除用户
const deleteResponse = await http.delete('/api/users/123');
if (deleteResponse.status === 204) {
  console.log('用户删除成功');
}

// 批量删除
const batchDelete = await http.delete('/api/users/batch?ids=1,2,3', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// 软删除
const softDelete = await http.delete('/api/posts/456?soft=true');

// 带确认的删除
const confirmDelete = async (userId: number) => {
  const confirmed = confirm('确定要删除这个用户吗？');
  if (confirmed) {
    try {
      await http.delete(`/api/users/${userId}`);
      alert('删除成功');
    } catch (error) {
      alert('删除失败');
    }
  }
};
```

### http.patch(url, body?, config?)

发送 PATCH 请求。

**参数：**
- `url: string` - 请求URL
- `body?: any` - 请求体
- `config?: Omit<RequestConfig, 'url' | 'method' | 'body'>` - 可选配置

**返回值：**
- `Promise<Response<T>>` - 响应对象

**示例：**

```typescript
import { http } from 'outils';

// 部分更新用户信息
const patchedUser = await http.patch('/api/users/123', {
  email: 'newemail@example.com'
});
console.log('更新后的用户:', patchedUser.data);

// 更新用户状态
const statusUpdate = await http.patch('/api/users/123/status', {
  status: 'inactive',
  reason: 'User requested deactivation'
});

// JSON Patch 格式
const jsonPatch = await http.patch('/api/documents/456', [
  { op: 'replace', path: '/title', value: 'New Title' },
  { op: 'add', path: '/tags/-', value: 'important' }
], {
  headers: {
    'Content-Type': 'application/json-patch+json'
  }
});

// 增量更新
const incrementalUpdate = await http.patch('/api/counters/views', {
  increment: 1
});
```

## 工厂函数

### createHttpClient()

创建新的 HttpClient 实例。

**返回值：**
- `HttpClient` - 新的客户端实例

**示例：**

```typescript
import { createHttpClient } from 'outils';

// 为不同的API创建不同的客户端
const apiV1Client = createHttpClient();
apiV1Client.addRequestInterceptor((config) => {
  config.url = `https://api.example.com/v1${config.url}`;
  return config;
});

const apiV2Client = createHttpClient();
apiV2Client.addRequestInterceptor((config) => {
  config.url = `https://api.example.com/v2${config.url}`;
  return config;
});

// 为不同环境创建客户端
const developmentClient = createHttpClient();
developmentClient.addRequestInterceptor((config) => {
  config.url = `http://localhost:3000${config.url}`;
  return config;
});

const productionClient = createHttpClient();
productionClient.addRequestInterceptor((config) => {
  config.url = `https://api.production.com${config.url}`;
  return config;
});

// 使用不同的客户端
const v1Users = await apiV1Client.request({ url: '/users', method: 'GET' });
const v2Users = await apiV2Client.request({ url: '/users', method: 'GET' });
```

## 实际应用场景

### 1. API 客户端封装

```typescript
import { createHttpClient, type RequestConfig } from 'outils';

// 创建API客户端类
class ApiClient {
  private client = createHttpClient();
  private baseURL = 'https://api.example.com';
  
  constructor(baseURL?: string) {
    if (baseURL) {
      this.baseURL = baseURL;
    }
    
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    // 请求拦截器：添加基础URL和认证
    this.client.addRequestInterceptor((config) => {
      config.url = `${this.baseURL}${config.url}`;
      
      const token = this.getToken();
      if (token) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${token}`
        };
      }
      
      return config;
    });
    
    // 响应拦截器：统一处理响应格式
    this.client.addResponseInterceptor((response) => {
      if (response.data.success) {
        return {
          ...response,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.message || '请求失败');
      }
    });
    
    // 错误拦截器：处理认证错误
    this.client.addErrorInterceptor((error) => {
      if (error.message.includes('401')) {
        this.clearToken();
        window.location.href = '/login';
      }
      return error;
    });
  }
  
  private getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  private clearToken(): void {
    localStorage.removeItem('token');
  }
  
  // 用户相关API
  async getUsers(page = 1, limit = 10) {
    return this.client.request({
      url: `/users?page=${page}&limit=${limit}`,
      method: 'GET',
      cache: true,
      cacheTime: 60000 // 1分钟缓存
    });
  }
  
  async getUserById(id: number) {
    return this.client.request({
      url: `/users/${id}`,
      method: 'GET',
      cache: true,
      cacheTime: 300000 // 5分钟缓存
    });
  }
  
  async createUser(userData: any) {
    return this.client.request({
      url: '/users',
      method: 'POST',
      body: userData
    });
  }
  
  async updateUser(id: number, userData: any) {
    return this.client.request({
      url: `/users/${id}`,
      method: 'PUT',
      body: userData
    });
  }
  
  async deleteUser(id: number) {
    return this.client.request({
      url: `/users/${id}`,
      method: 'DELETE'
    });
  }
  
  // 文件上传
  async uploadFile(file: File, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.client.request({
      url: '/upload',
      method: 'POST',
      body: formData,
      timeout: 60000, // 1分钟超时
      headers: {
        // 不设置 Content-Type，让浏览器自动设置
      }
    });
  }
}

// 使用API客户端
const api = new ApiClient();

// 获取用户列表
const users = await api.getUsers(1, 20);
console.log('用户列表:', users.data);

// 创建用户
const newUser = await api.createUser({
  name: 'John Doe',
  email: 'john@example.com'
});
console.log('新用户:', newUser.data);
```

### 2. 请求重试和错误处理

```typescript
import { createHttpClient } from 'outils';

// 创建具有智能重试的客户端
class RobustHttpClient {
  private client = createHttpClient();
  
  constructor() {
    this.setupRetryLogic();
  }
  
  private setupRetryLogic() {
    // 错误拦截器：智能重试
    this.client.addErrorInterceptor(async (error) => {
      const isRetryableError = this.isRetryableError(error);
      
      if (isRetryableError) {
        console.log('检测到可重试错误，准备重试:', error.message);
      }
      
      return error;
    });
  }
  
  private isRetryableError(error: Error): boolean {
    // 网络错误
    if (error.message.includes('fetch')) return true;
    
    // 服务器错误 (5xx)
    if (error.message.includes('500') || 
        error.message.includes('502') || 
        error.message.includes('503') || 
        error.message.includes('504')) {
      return true;
    }
    
    // 超时错误
    if (error.message.includes('timeout')) return true;
    
    return false;
  }
  
  // 带智能重试的请求方法
  async requestWithRetry<T>(config: RequestConfig): Promise<T> {
    const maxRetries = config.retries || 3;
    const baseDelay = config.retryDelay || 1000;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.client.request<T>({
          ...config,
          retries: 0 // 禁用内置重试，使用自定义重试逻辑
        });
        return response.data;
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        const isRetryable = this.isRetryableError(error as Error);
        
        if (isLastAttempt || !isRetryable) {
          throw error;
        }
        
        // 指数退避延迟
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.log(`请求失败，${delay}ms后进行第${attempt + 1}次重试`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // 批量请求处理
  async batchRequest<T>(requests: RequestConfig[]): Promise<T[]> {
    const results = await Promise.allSettled(
      requests.map(config => this.requestWithRetry<T>(config))
    );
    
    const successResults: T[] = [];
    const errors: Error[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successResults.push(result.value);
      } else {
        errors.push(new Error(`请求 ${index} 失败: ${result.reason.message}`));
      }
    });
    
    if (errors.length > 0) {
      console.warn('批量请求中有失败的请求:', errors);
    }
    
    return successResults;
  }
}

// 使用示例
const robustClient = new RobustHttpClient();

// 单个请求
try {
  const userData = await robustClient.requestWithRetry({
    url: '/api/users/123',
    method: 'GET',
    retries: 5,
    retryDelay: 2000
  });
  console.log('用户数据:', userData);
} catch (error) {
  console.error('请求最终失败:', error);
}

// 批量请求
const batchRequests = [
  { url: '/api/users/1', method: 'GET' as const },
  { url: '/api/users/2', method: 'GET' as const },
  { url: '/api/users/3', method: 'GET' as const }
];

const batchResults = await robustClient.batchRequest(batchRequests);
console.log('批量请求结果:', batchResults);
```

### 3. 请求缓存和性能优化

```typescript
import { createHttpClient } from 'outils';

// 高性能缓存客户端
class CachedHttpClient {
  private client = createHttpClient();
  private requestCache = new Map<string, Promise<any>>();
  
  constructor() {
    this.setupCaching();
  }
  
  private setupCaching() {
    // 请求拦截器：防止重复请求
    this.client.addRequestInterceptor((config) => {
      const cacheKey = this.getCacheKey(config);
      
      // 如果是GET请求且正在进行中，返回相同的Promise
      if (config.method === 'GET' && this.requestCache.has(cacheKey)) {
        throw new Error('DUPLICATE_REQUEST'); // 特殊错误，用于标识重复请求
      }
      
      return config;
    });
  }
  
  private getCacheKey(config: RequestConfig): string {
    return `${config.method}:${config.url}:${JSON.stringify(config.body || {})}`;
  }
  
  // 防重复请求的GET方法
  async get<T>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<T> {
    const fullConfig = { ...config, url, method: 'GET' as const };
    const cacheKey = this.getCacheKey(fullConfig);
    
    // 如果请求正在进行中，返回相同的Promise
    if (this.requestCache.has(cacheKey)) {
      return this.requestCache.get(cacheKey)!;
    }
    
    // 创建新的请求Promise
    const requestPromise = this.client.request<T>(fullConfig)
      .then(response => response.data)
      .finally(() => {
        // 请求完成后清除缓存
        this.requestCache.delete(cacheKey);
      });
    
    // 缓存Promise
    this.requestCache.set(cacheKey, requestPromise);
    
    return requestPromise;
  }
  
  // 预加载数据
  async preload(urls: string[]): Promise<void> {
    const preloadPromises = urls.map(url => 
      this.get(url).catch(error => {
        console.warn(`预加载失败: ${url}`, error);
        return null;
      })
    );
    
    await Promise.all(preloadPromises);
    console.log('预加载完成');
  }
  
  // 清除所有进行中的请求
  clearPendingRequests(): void {
    this.requestCache.clear();
    this.client.cancelAllRequests();
  }
}

// 使用示例
const cachedClient = new CachedHttpClient();

// 防重复请求
const promise1 = cachedClient.get('/api/users'); // 发送请求
const promise2 = cachedClient.get('/api/users'); // 返回相同的Promise
const promise3 = cachedClient.get('/api/users'); // 返回相同的Promise

// 三个Promise实际上是同一个
console.log(promise1 === promise2); // true
console.log(promise2 === promise3); // true

// 预加载关键数据
await cachedClient.preload([
  '/api/user/profile',
  '/api/config',
  '/api/menu'
]);

// 页面切换时清除请求
function onPageChange() {
  cachedClient.clearPendingRequests();
}
```

### 4. 文件上传和下载

```typescript
import { createHttpClient } from 'outils';

// 文件处理客户端
class FileHttpClient {
  private client = createHttpClient();
  
  constructor() {
    this.setupFileHandling();
  }
  
  private setupFileHandling() {
    // 为文件上传添加特殊处理
    this.client.addRequestInterceptor((config) => {
      // 如果是FormData，不设置Content-Type
      if (config.body instanceof FormData) {
        const { 'Content-Type': contentType, ...otherHeaders } = config.headers || {};
        config.headers = otherHeaders;
      }
      
      return config;
    });
  }
  
  // 单文件上传
  async uploadFile(
    file: File, 
    url: string = '/api/upload',
    onProgress?: (progress: number) => void
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    // 模拟进度（实际项目中可能需要使用XMLHttpRequest）
    if (onProgress) {
      const progressInterval = setInterval(() => {
        // 这里只是模拟，实际需要从上传事件中获取进度
        const progress = Math.random() * 100;
        onProgress(progress);
      }, 100);
      
      setTimeout(() => clearInterval(progressInterval), 2000);
    }
    
    const response = await this.client.request({
      url,
      method: 'POST',
      body: formData,
      timeout: 60000 // 1分钟超时
    });
    
    return response.data;
  }
  
  // 多文件上传
  async uploadMultipleFiles(
    files: File[],
    url: string = '/api/upload/multiple',
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<any[]> {
    const uploadPromises = files.map(async (file, index) => {
      try {
        const result = await this.uploadFile(
          file, 
          url,
          onProgress ? (progress) => onProgress(index, progress) : undefined
        );
        return { success: true, data: result, file: file.name };
      } catch (error) {
        return { success: false, error: error.message, file: file.name };
      }
    });
    
    return Promise.all(uploadPromises);
  }
  
  // 分片上传大文件
  async uploadLargeFile(
    file: File,
    chunkSize: number = 1024 * 1024, // 1MB
    onProgress?: (progress: number) => void
  ): Promise<any> {
    const totalChunks = Math.ceil(file.size / chunkSize);
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const uploadedChunks: string[] = [];
    
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      
      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('chunkIndex', i.toString());
      formData.append('totalChunks', totalChunks.toString());
      formData.append('uploadId', uploadId);
      formData.append('fileName', file.name);
      
      const response = await this.client.request({
        url: '/api/upload/chunk',
        method: 'POST',
        body: formData,
        retries: 3
      });
      
      uploadedChunks.push(response.data.chunkId);
      
      if (onProgress) {
        const progress = ((i + 1) / totalChunks) * 100;
        onProgress(progress);
      }
    }
    
    // 合并分片
    const mergeResponse = await this.client.request({
      url: '/api/upload/merge',
      method: 'POST',
      body: {
        uploadId,
        fileName: file.name,
        chunks: uploadedChunks
      }
    });
    
    return mergeResponse.data;
  }
  
  // 文件下载
  async downloadFile(
    url: string,
    fileName?: string,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    // 注意：这里使用原生fetch以便处理流
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status} ${response.statusText}`);
    }
    
    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }
    
    const chunks: Uint8Array[] = [];
    let received = 0;
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      received += value.length;
      
      if (onProgress && total > 0) {
        const progress = (received / total) * 100;
        onProgress(progress);
      }
    }
    
    // 创建Blob并下载
    const blob = new Blob(chunks);
    const downloadUrl = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(downloadUrl);
  }
}

// 使用示例
const fileClient = new FileHttpClient();

// 单文件上传
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
if (fileInput.files && fileInput.files[0]) {
  const file = fileInput.files[0];
  
  try {
    const result = await fileClient.uploadFile(file, '/api/upload', (progress) => {
      console.log(`上传进度: ${progress.toFixed(2)}%`);
    });
    console.log('上传成功:', result);
  } catch (error) {
    console.error('上传失败:', error);
  }
}

// 多文件上传
const multipleFiles = Array.from(fileInput.files || []);
if (multipleFiles.length > 0) {
  const results = await fileClient.uploadMultipleFiles(
    multipleFiles,
    '/api/upload/multiple',
    (fileIndex, progress) => {
      console.log(`文件 ${fileIndex} 上传进度: ${progress.toFixed(2)}%`);
    }
  );
  
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`文件 ${result.file} 上传成功:`, result.data);
    } else {
      console.error(`文件 ${result.file} 上传失败:`, result.error);
    }
  });
}

// 大文件分片上传
const largeFile = fileInput.files?.[0];
if (largeFile && largeFile.size > 10 * 1024 * 1024) { // 大于10MB
  try {
    const result = await fileClient.uploadLargeFile(
      largeFile,
      2 * 1024 * 1024, // 2MB分片
      (progress) => {
        console.log(`大文件上传进度: ${progress.toFixed(2)}%`);
      }
    );
    console.log('大文件上传成功:', result);
  } catch (error) {
    console.error('大文件上传失败:', error);
  }
}

// 文件下载
const downloadButton = document.getElementById('downloadButton');
downloadButton?.addEventListener('click', async () => {
  try {
    await fileClient.downloadFile(
      '/api/files/document.pdf',
      'my-document.pdf',
      (progress) => {
        console.log(`下载进度: ${progress.toFixed(2)}%`);
      }
    );
    console.log('下载完成');
  } catch (error) {
    console.error('下载失败:', error);
  }
});
```

## 性能优化建议

### 1. 请求合并

```typescript
// ✅ 好：合并多个请求
const [users, posts, comments] = await Promise.all([
  http.get('/api/users'),
  http.get('/api/posts'),
  http.get('/api/comments')
]);

// ❌ 不好：串行请求
const users = await http.get('/api/users');
const posts = await http.get('/api/posts');
const comments = await http.get('/api/comments');
```

### 2. 合理使用缓存

```typescript
// ✅ 好：为静态数据启用缓存
const config = await http.get('/api/config', {
  cache: true,
  cacheTime: 30 * 60 * 1000 // 30分钟
});

// ✅ 好：为用户数据使用短期缓存
const userProfile = await http.get('/api/user/profile', {
  cache: true,
  cacheTime: 5 * 60 * 1000 // 5分钟
});

// ❌ 不好：为实时数据启用长期缓存
const liveData = await http.get('/api/live-data', {
  cache: true,
  cacheTime: 60 * 60 * 1000 // 1小时 - 不合适
});
```

### 3. 请求取消

```typescript
// ✅ 好：在组件卸载时取消请求
class UserComponent {
  private client = createHttpClient();
  
  async loadData() {
    try {
      const data = await this.client.request({
        url: '/api/users',
        method: 'GET'
      });
      this.updateUI(data);
    } catch (error) {
      if (error.name !== 'AbortError') {
        this.handleError(error);
      }
    }
  }
  
  onUnmount() {
    this.client.cancelAllRequests();
  }
}
```

## 常见问题

### Q: 如何处理文件上传的进度显示？

A: 可以使用 XMLHttpRequest 替代 fetch 来获取真实的上传进度：

```typescript
function uploadWithProgress(
  file: File,
  url: string,
  onProgress: (progress: number) => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(progress);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });
    
    xhr.open('POST', url);
    xhr.send(formData);
  });
}
```

### Q: 如何实现请求的自动重试？

A: 可以在错误拦截器中实现智能重试逻辑：

```typescript
class RetryableHttpClient {
  private client = createHttpClient();
  private retryConfig = new Map<string, number>();
  
  constructor() {
    this.client.addErrorInterceptor(async (error) => {
      const config = (error as any).config;
      if (!config) return error;
      
      const retryKey = `${config.method}:${config.url}`;
      const currentRetries = this.retryConfig.get(retryKey) || 0;
      const maxRetries = config.retries || 3;
      
      if (currentRetries < maxRetries && this.shouldRetry(error)) {
        this.retryConfig.set(retryKey, currentRetries + 1);
        
        // 指数退避
        const delay = Math.pow(2, currentRetries) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // 重新发送请求
        return this.client.request(config);
      }
      
      this.retryConfig.delete(retryKey);
      return error;
    });
  }
  
  private shouldRetry(error: Error): boolean {
    // 只重试网络错误和5xx错误
    return error.message.includes('fetch') || 
           error.message.includes('5');
  }
}
```

### Q: 如何实现请求的防抖？

A: 可以使用防抖装饰器或者缓存正在进行的请求：

```typescript
class DebouncedHttpClient {
  private pendingRequests = new Map<string, Promise<any>>();
  
  async request<T>(config: RequestConfig): Promise<Response<T>> {
    const key = this.getRequestKey(config);
    
    // 如果相同请求正在进行，返回相同的Promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }
    
    // 创建新请求
    const promise = this.performRequest<T>(config)
      .finally(() => {
        this.pendingRequests.delete(key);
      });
    
    this.pendingRequests.set(key, promise);
    return promise;
  }
  
  private getRequestKey(config: RequestConfig): string {
    return `${config.method}:${config.url}:${JSON.stringify(config.body)}`;
  }
  
  private async performRequest<T>(config: RequestConfig): Promise<Response<T>> {
    // 实际的请求逻辑
    const response = await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.body ? JSON.stringify(config.body) : undefined
    });
    
    const data = await response.json();
    
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  }
}
```

### Q: 如何处理大量并发请求？

A: 可以实现请求队列和并发控制：

```typescript
class ConcurrentHttpClient {
  private client = createHttpClient();
  private requestQueue: Array<() => Promise<any>> = [];
  private activeRequests = 0;
  private maxConcurrent = 6; // 最大并发数
  
  async request<T>(config: RequestConfig): Promise<Response<T>> {
    return new Promise((resolve, reject) => {
      const requestTask = async () => {
        try {
          this.activeRequests++;
          const result = await this.client.request<T>(config);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.activeRequests--;
          this.processQueue();
        }
      };
      
      if (this.activeRequests < this.maxConcurrent) {
        requestTask();
      } else {
        this.requestQueue.push(requestTask);
      }
    });
  }
  
  private processQueue(): void {
    if (this.requestQueue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const nextRequest = this.requestQueue.shift()!;
      nextRequest();
    }
  }
}
```

## 浏览器兼容性

支持所有支持 Fetch API 的现代浏览器：
- Chrome 42+ (Fetch API 支持)
- Firefox 39+ (Fetch API 支持)
- Safari 10.1+ (Fetch API 支持)
- Edge 14+ (Fetch API 支持)

对于不支持 Fetch API 的浏览器，需要使用 polyfill：

```html
<!-- 在不支持的浏览器中加载 polyfill -->
<script>
  if (!window.fetch) {
    document.write('<script src="https://cdn.jsdelivr.net/npm/whatwg-fetch@3.6.2/dist/fetch.umd.js"><\/script>');
  }
</script>
```

依赖的 Web API：
- `fetch()` - 网络请求
- `AbortController` - 请求取消
- `FormData` - 表单数据
- `Headers` - HTTP 头处理
- `URL` - URL 处理
- `Promise` - 异步处理
- `Map` - 缓存存储
- `setTimeout/clearTimeout` - 定时器