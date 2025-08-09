/**
 * 并发控制工具
 * @description 控制异步任务的并发数量
 */

type Task<T> = () => Promise<T>;
type TaskResult<T> = {
  status: 'fulfilled' | 'rejected';
  value?: T;
  reason?: any;
  index: number;
};

/**
 * 并发控制器
 */
export class ConcurrencyController {
  private limit: number;
  private running: number = 0;
  private queue: Array<() => void> = [];

  constructor(limit: number) {
    this.limit = Math.max(1, limit);
  }

  /**
   * 执行任务
   * @param task 要执行的任务
   * @returns Promise
   */
  async execute<T>(task: Task<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const run = async () => {
        this.running++;
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.running--;
          this.processQueue();
        }
      };

      if (this.running < this.limit) {
        run();
      } else {
        this.queue.push(run);
      }
    });
  }

  /**
   * 处理队列
   */
  private processQueue(): void {
    if (this.queue.length > 0 && this.running < this.limit) {
      const nextTask = this.queue.shift();
      if (nextTask) {
        nextTask();
      }
    }
  }

  /**
   * 获取当前运行的任务数
   */
  get runningCount(): number {
    return this.running;
  }

  /**
   * 获取队列中等待的任务数
   */
  get queueCount(): number {
    return this.queue.length;
  }
}

/**
 * 创建并发控制器
 * @param limit 并发限制数量
 * @returns 并发控制器实例
 */
export function concurrency(limit: number): ConcurrencyController {
  return new ConcurrencyController(limit);
}

/**
 * 并发执行任务数组，限制并发数量
 * @param tasks 任务数组
 * @param limit 并发限制
 * @returns 所有任务的结果
 */
export async function concurrentMap<T>(
  tasks: Array<Task<T>>,
  limit: number
): Promise<Array<TaskResult<T>>> {
  const controller = new ConcurrencyController(limit);
  const results: Array<TaskResult<T>> = [];

  const promises = tasks.map(async (task, index) => {
    try {
      const value = await controller.execute(task);
      results[index] = { status: 'fulfilled', value, index };
    } catch (reason) {
      results[index] = { status: 'rejected', reason, index };
    }
  });

  await Promise.all(promises);
  return results;
}

/**
 * 批量执行任务，按批次控制并发
 * @param tasks 任务数组
 * @param batchSize 每批次的大小
 * @param delay 批次间的延迟时间（毫秒）
 * @returns 所有任务的结果
 */
export async function batchExecute<T>(
  tasks: Array<Task<T>>,
  batchSize: number,
  delay: number = 0
): Promise<Array<TaskResult<T>>> {
  const results: Array<TaskResult<T>> = [];
  
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchPromises = batch.map(async (task, batchIndex) => {
      const globalIndex = i + batchIndex;
      try {
        const value = await task();
        results[globalIndex] = { status: 'fulfilled', value, index: globalIndex };
      } catch (reason) {
        results[globalIndex] = { status: 'rejected', reason, index: globalIndex };
      }
    });
    
    await Promise.all(batchPromises);
    
    // 批次间延迟
    if (delay > 0 && i + batchSize < tasks.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
}

/**
 * 重试执行任务
 * @param task 要执行的任务
 * @param maxRetries 最大重试次数
 * @param retryDelay 重试延迟时间（毫秒）
 * @returns 任务结果
 */
export async function retry<T>(
  task: Task<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  throw lastError;
}

/**
 * 超时控制
 * @param task 要执行的任务
 * @param timeout 超时时间（毫秒）
 * @returns 任务结果
 */
export async function withTimeout<T>(
  task: Task<T>,
  timeout: number
): Promise<T> {
  return Promise.race([
    task(),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Task timeout after ${timeout}ms`)), timeout);
    })
  ]);
}