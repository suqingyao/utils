# 并发控制 (Concurrency Control)

提供异步任务的并发控制、批量执行、重试机制和超时控制等功能，帮助优化异步操作的性能和可靠性。

## 导入

```typescript
import { 
  ConcurrencyController, 
  concurrency, 
  concurrentMap, 
  batchExecute, 
  retry, 
  withTimeout 
} from 'outils';
```

## 类型定义

```typescript
type Task<T> = () => Promise<T>;

type TaskResult<T> = {
  status: 'fulfilled' | 'rejected';
  value?: T;
  reason?: any;
  index: number;
};
```

## 并发控制器

### ConcurrencyController

控制异步任务的并发数量，避免同时执行过多任务导致的资源耗尽。

#### 构造函数

```typescript
const controller = new ConcurrencyController(limit: number);
```

**参数：**
- `limit: number` - 最大并发数量

#### 方法

##### execute(task)

执行一个异步任务。

**参数：**
- `task: Task<T>` - 要执行的任务函数

**返回值：**
- `Promise<T>` - 任务执行结果

**示例：**

```typescript
import { ConcurrencyController } from 'outils';

// 创建并发控制器，最多同时执行3个任务
const controller = new ConcurrencyController(3);

// 模拟异步任务
const createTask = (id: number, delay: number) => async () => {
  console.log(`任务 ${id} 开始`);
  await new Promise(resolve => setTimeout(resolve, delay));
  console.log(`任务 ${id} 完成`);
  return `结果 ${id}`;
};

// 执行多个任务
const tasks = [
  controller.execute(createTask(1, 1000)),
  controller.execute(createTask(2, 2000)),
  controller.execute(createTask(3, 1500)),
  controller.execute(createTask(4, 800)),  // 这个会等待
  controller.execute(createTask(5, 1200)), // 这个也会等待
];

Promise.all(tasks).then(results => {
  console.log('所有任务完成:', results);
});
```

##### 属性

- `runningCount: number` - 当前正在运行的任务数量
- `queueCount: number` - 队列中等待的任务数量

```typescript
const controller = new ConcurrencyController(2);

console.log(controller.runningCount); // 0
console.log(controller.queueCount);   // 0

// 执行任务后
controller.execute(someTask);
console.log(controller.runningCount); // 1
console.log(controller.queueCount);   // 0
```

### concurrency(limit)

创建并发控制器的工厂函数。

**参数：**
- `limit: number` - 最大并发数量

**返回值：**
- `ConcurrencyController` - 并发控制器实例

**示例：**

```typescript
import { concurrency } from 'outils';

const controller = concurrency(5);

// 等同于
const controller2 = new ConcurrencyController(5);
```

## 并发映射

### concurrentMap(tasks, limit)

并发执行任务数组，限制同时执行的任务数量。

**参数：**
- `tasks: Array<Task<T>>` - 任务数组
- `limit: number` - 并发限制数量

**返回值：**
- `Promise<Array<TaskResult<T>>>` - 所有任务的结果数组

**示例：**

```typescript
import { concurrentMap } from 'outils';

// 模拟API请求任务
const createFetchTask = (url: string) => async () => {
  const response = await fetch(url);
  return response.json();
};

const urls = [
  'https://api.example.com/users/1',
  'https://api.example.com/users/2',
  'https://api.example.com/users/3',
  'https://api.example.com/users/4',
  'https://api.example.com/users/5',
];

const tasks = urls.map(createFetchTask);

// 最多同时执行2个请求
concurrentMap(tasks, 2).then(results => {
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`任务 ${index} 成功:`, result.value);
    } else {
      console.log(`任务 ${index} 失败:`, result.reason);
    }
  });
});
```

**处理结果：**

```typescript
const results = await concurrentMap(tasks, 3);

// 分离成功和失败的结果
const successful = results
  .filter(result => result.status === 'fulfilled')
  .map(result => result.value);

const failed = results
  .filter(result => result.status === 'rejected')
  .map(result => ({ index: result.index, error: result.reason }));

console.log('成功的任务:', successful);
console.log('失败的任务:', failed);
```

## 批量执行

### batchExecute(tasks, batchSize, delay?)

按批次执行任务，每批次之间可以设置延迟。

**参数：**
- `tasks: Array<Task<T>>` - 任务数组
- `batchSize: number` - 每批次的大小
- `delay?: number` - 批次间的延迟时间（毫秒），默认为 0

**返回值：**
- `Promise<Array<TaskResult<T>>>` - 所有任务的结果数组

**示例：**

```typescript
import { batchExecute } from 'outils';

// 模拟数据处理任务
const createProcessTask = (data: any) => async () => {
  console.log('处理数据:', data.id);
  // 模拟处理时间
  await new Promise(resolve => setTimeout(resolve, 500));
  return { ...data, processed: true };
};

const dataList = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, value: `data-${i + 1}` }));
const tasks = dataList.map(createProcessTask);

// 每批处理3个任务，批次间延迟1秒
batchExecute(tasks, 3, 1000).then(results => {
  console.log('批量处理完成:', results.length);
  
  const processedData = results
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value);
    
  console.log('处理成功的数据:', processedData);
});
```

**实际应用场景：**

```typescript
// API 限流场景
const sendEmails = async (emailList: string[]) => {
  const emailTasks = emailList.map(email => async () => {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: email })
    });
    return response.json();
  });
  
  // 每批发送5封邮件，间隔2秒（避免触发API限流）
  const results = await batchExecute(emailTasks, 5, 2000);
  
  const sentCount = results.filter(r => r.status === 'fulfilled').length;
  const failedCount = results.filter(r => r.status === 'rejected').length;
  
  console.log(`邮件发送完成: 成功 ${sentCount}, 失败 ${failedCount}`);
  return results;
};
```

## 重试机制

### retry(task, maxRetries?, retryDelay?)

重试执行失败的任务。

**参数：**
- `task: Task<T>` - 要执行的任务
- `maxRetries?: number` - 最大重试次数，默认为 3
- `retryDelay?: number` - 重试延迟时间（毫秒），默认为 1000

**返回值：**
- `Promise<T>` - 任务执行结果

**示例：**

```typescript
import { retry } from 'outils';

// 不稳定的API请求
const unstableApiCall = async () => {
  const response = await fetch('https://unstable-api.example.com/data');
  
  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status}`);
  }
  
  return response.json();
};

// 重试最多3次，每次间隔2秒
retry(unstableApiCall, 3, 2000)
  .then(data => {
    console.log('API请求成功:', data);
  })
  .catch(error => {
    console.error('重试后仍然失败:', error.message);
  });
```

**指数退避重试：**

```typescript
// 自定义指数退避重试
const retryWithBackoff = async <T>(
  task: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt); // 指数退避
        console.log(`重试 ${attempt + 1}/${maxRetries}，延迟 ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// 使用指数退避重试
retryWithBackoff(unstableApiCall, 4, 500)
  .then(data => console.log('成功:', data))
  .catch(error => console.error('最终失败:', error));
```

## 超时控制

### withTimeout(task, timeout)

为任务添加超时控制。

**参数：**
- `task: Task<T>` - 要执行的任务
- `timeout: number` - 超时时间（毫秒）

**返回值：**
- `Promise<T>` - 任务执行结果

**示例：**

```typescript
import { withTimeout } from 'outils';

// 可能很慢的任务
const slowTask = async () => {
  // 模拟耗时操作
  await new Promise(resolve => setTimeout(resolve, 5000));
  return '任务完成';
};

// 设置3秒超时
withTimeout(slowTask, 3000)
  .then(result => {
    console.log('任务成功:', result);
  })
  .catch(error => {
    console.error('任务超时:', error.message); // "Task timeout after 3000ms"
  });
```

**与重试结合使用：**

```typescript
// 带超时的重试
const taskWithTimeoutAndRetry = async () => {
  const timeoutTask = () => withTimeout(slowApiCall, 5000);
  return retry(timeoutTask, 3, 1000);
};

taskWithTimeoutAndRetry()
  .then(result => console.log('成功:', result))
  .catch(error => console.error('失败:', error));
```

## 高级用法

### 组合使用

```typescript
import { concurrency, retry, withTimeout, batchExecute } from 'outils';

// 创建健壮的数据处理管道
class DataProcessor {
  private controller = concurrency(5); // 最多5个并发
  
  async processUrls(urls: string[]) {
    // 创建带重试和超时的任务
    const tasks = urls.map(url => async () => {
      const fetchTask = async () => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      };
      
      // 5秒超时，最多重试2次
      return retry(() => withTimeout(fetchTask, 5000), 2, 1000);
    });
    
    // 批量执行，每批3个，间隔500ms
    return batchExecute(tasks, 3, 500);
  }
  
  async processWithConcurrency(urls: string[]) {
    const tasks = urls.map(url => () => this.controller.execute(async () => {
      const response = await fetch(url);
      return response.json();
    }));
    
    const results = await Promise.all(tasks.map(task => task()));
    return results;
  }
}

const processor = new DataProcessor();
processor.processUrls(urlList).then(results => {
  console.log('处理完成:', results);
});
```

### 进度监控

```typescript
// 带进度监控的并发执行
class ProgressConcurrency {
  private controller: ConcurrencyController;
  private onProgress?: (completed: number, total: number) => void;
  
  constructor(limit: number, onProgress?: (completed: number, total: number) => void) {
    this.controller = concurrency(limit);
    this.onProgress = onProgress;
  }
  
  async executeWithProgress<T>(tasks: Array<() => Promise<T>>): Promise<T[]> {
    let completed = 0;
    const total = tasks.length;
    
    const wrappedTasks = tasks.map(task => async () => {
      try {
        const result = await this.controller.execute(task);
        completed++;
        this.onProgress?.(completed, total);
        return result;
      } catch (error) {
        completed++;
        this.onProgress?.(completed, total);
        throw error;
      }
    });
    
    return Promise.all(wrappedTasks.map(task => task()));
  }
}

// 使用进度监控
const progressConcurrency = new ProgressConcurrency(3, (completed, total) => {
  const percentage = Math.round((completed / total) * 100);
  console.log(`进度: ${completed}/${total} (${percentage}%)`);
});

progressConcurrency.executeWithProgress(tasks).then(results => {
  console.log('所有任务完成');
});
```

### 动态并发控制

```typescript
// 根据系统负载动态调整并发数
class AdaptiveConcurrency {
  private controller: ConcurrencyController;
  private baseLimit: number;
  private currentLimit: number;
  
  constructor(baseLimit: number) {
    this.baseLimit = baseLimit;
    this.currentLimit = baseLimit;
    this.controller = concurrency(baseLimit);
    this.startMonitoring();
  }
  
  private startMonitoring() {
    setInterval(() => {
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
      
      // 根据内存使用情况调整并发数
      if (heapUsedMB > 500) {
        this.currentLimit = Math.max(1, Math.floor(this.baseLimit * 0.5));
      } else if (heapUsedMB < 200) {
        this.currentLimit = this.baseLimit;
      }
      
      // 重新创建控制器（简化示例）
      this.controller = concurrency(this.currentLimit);
    }, 5000);
  }
  
  async execute<T>(task: () => Promise<T>): Promise<T> {
    return this.controller.execute(task);
  }
}
```

## 性能优化建议

### 1. 合理设置并发数

```typescript
// ✅ 好：根据资源类型设置合理的并发数
const cpuIntensiveTasks = concurrency(navigator.hardwareConcurrency || 4);
const networkTasks = concurrency(10); // 网络任务可以更高并发
const databaseTasks = concurrency(5); // 数据库连接池限制

// ❌ 不好：盲目设置过高的并发数
const tooManyTasks = concurrency(1000); // 可能导致资源耗尽
```

### 2. 避免创建过多控制器实例

```typescript
// ✅ 好：复用控制器实例
const globalController = concurrency(5);

class ApiService {
  async fetchUser(id: string) {
    return globalController.execute(async () => {
      const response = await fetch(`/api/users/${id}`);
      return response.json();
    });
  }
}

// ❌ 不好：每次都创建新的控制器
class BadApiService {
  async fetchUser(id: string) {
    const controller = concurrency(5); // 每次都创建新实例
    return controller.execute(async () => {
      const response = await fetch(`/api/users/${id}`);
      return response.json();
    });
  }
}
```

### 3. 合理使用批量执行

```typescript
// ✅ 好：根据API限制设置批量大小
const apiLimitedBatch = (tasks: any[]) => batchExecute(tasks, 10, 1000);

// ✅ 好：根据内存限制设置批量大小
const memoryLimitedBatch = (tasks: any[]) => batchExecute(tasks, 100, 0);

// ❌ 不好：批量大小过小，效率低下
const inefficientBatch = (tasks: any[]) => batchExecute(tasks, 1, 100);
```

## 错误处理最佳实践

### 1. 分类处理错误

```typescript
const handleTaskResults = <T>(results: TaskResult<T>[]) => {
  const successful: T[] = [];
  const networkErrors: any[] = [];
  const timeoutErrors: any[] = [];
  const otherErrors: any[] = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successful.push(result.value!);
    } else {
      const error = result.reason;
      if (error.message.includes('timeout')) {
        timeoutErrors.push({ index, error });
      } else if (error.message.includes('fetch')) {
        networkErrors.push({ index, error });
      } else {
        otherErrors.push({ index, error });
      }
    }
  });
  
  return { successful, networkErrors, timeoutErrors, otherErrors };
};
```

### 2. 优雅降级

```typescript
const robustDataFetch = async (urls: string[]) => {
  try {
    // 尝试并发执行
    const results = await concurrentMap(
      urls.map(url => () => withTimeout(fetch(url).then(r => r.json()), 5000)),
      5
    );
    
    const successful = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);
    
    if (successful.length === 0) {
      throw new Error('所有请求都失败了');
    }
    
    return successful;
  } catch (error) {
    console.warn('并发请求失败，尝试串行执行');
    
    // 降级到串行执行
    const results = [];
    for (const url of urls) {
      try {
        const response = await fetch(url);
        const data = await response.json();
        results.push(data);
      } catch (err) {
        console.warn(`请求 ${url} 失败:`, err);
      }
    }
    
    return results;
  }
};
```

## 常见问题

### Q: 并发控制器的队列会无限增长吗？

A: 不会。队列只存储等待执行的任务，当任务开始执行后就会从队列中移除。但在极端情况下，如果任务提交速度远超执行速度，队列可能会变得很大。

### Q: 如何处理任务执行时间差异很大的情况？

A: 可以根据任务类型使用不同的并发控制器，或者使用优先级队列：

```typescript
class PriorityController {
  private fastController = concurrency(10);  // 快速任务
  private slowController = concurrency(2);   // 慢速任务
  
  async execute<T>(task: () => Promise<T>, isFast: boolean = true): Promise<T> {
    const controller = isFast ? this.fastController : this.slowController;
    return controller.execute(task);
  }
}
```

### Q: 重试机制如何避免雪崩效应？

A: 使用指数退避和抖动：

```typescript
const retryWithJitter = async <T>(
  task: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const exponentialDelay = baseDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 1000; // 添加随机抖动
        const delay = exponentialDelay + jitter;
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};
```

## 浏览器兼容性

支持所有现代浏览器和 Node.js 环境：
- Chrome 32+ (Promise 支持)
- Firefox 29+ (Promise 支持)
- Safari 8+ (Promise 支持)
- Edge 12+ (Promise 支持)
- IE 不支持 (需要 Promise polyfill)
- Node.js 0.12+ (原生 Promise 支持)

依赖的 API：
- `Promise`
- `setTimeout`
- `Array.prototype.map`
- `Array.prototype.filter`