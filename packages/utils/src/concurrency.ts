/**
 * 并发控制工具
 * @description 控制异步任务的并发数量
 */

type Task<T> = () => Promise<T>;
/**
 * 并发控制器
 */
export class ConcurrencyController {
  private limit: number;
  private maxRetry: number = 2;
  private running: number = 0;
  private queue: Array<() => void> = [];

  constructor(limit: number = 3, retry: number = 2) {
    this.limit = limit;
    this.maxRetry = retry;
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
        let remaining = this.maxRetry;
        try {
          while (true) {
            try {
              const result = await task();
              resolve(result);
              break;
            }
            catch (error) {
              if (remaining > 0) {
                remaining--;
                // 继续在同一并发槽位内重试，避免额外占用并发
                continue;
              }
              else {
                reject(error);
                break;
              }
            }
          }
        }
        finally {
          this.running--;
          this.processQueue();
        }
      };

      if (this.running < this.limit) {
        run();
      }
      else {
        this.queue.push(run);
      }
    });
  }

  /**
   * 处理队列
   */
  private processQueue(): void {
    while (this.queue.length > 0 && this.running < this.limit) {
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
