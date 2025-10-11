import { describe, expect, it } from 'vitest';
import {
  batchExecute,
  concurrency,
  ConcurrencyController,
  concurrentMap,
  retry,
  withTimeout,
} from '../concurrency';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('concurrency controller', () => {
  it('应该限制同时运行的任务数量，并维护队列', async () => {
    const controller = new ConcurrencyController(2);
    const tasks = Array.from({ length: 5 }).map(
      (_, i) => () => delay(30).then(() => i),
    );

    const promises = tasks.map(t => controller.execute(t));

    // 立即检查运行与队列数量
    expect(controller.runningCount).toBe(2);
    expect(controller.queueCount).toBe(3);

    const results = await Promise.all(promises);
    expect(results).toEqual([0, 1, 2, 3, 4]);
    expect(controller.runningCount).toBe(0);
    expect(controller.queueCount).toBe(0);
  });

  it('工厂函数 concurrency 应该返回控制器实例', () => {
    const c = concurrency(3);
    expect(c).toBeInstanceOf(ConcurrencyController);
  });
});

describe('concurrent map', () => {
  it('应该在并发限制下执行任务并返回状态与索引', async () => {
    const tasks = [
      async () => {
        await delay(20);
        return 'a';
      },
      async () => {
        await delay(10);
        throw new Error('fail');
      },
      async () => {
        await delay(5);
        return 'c';
      },
    ];

    const results = await concurrentMap(tasks, 2);

    expect(results).toHaveLength(3);
    expect(results[0]).toMatchObject({ status: 'fulfilled', value: 'a', index: 0 });
    expect(results[1].status).toBe('rejected');
    expect(results[1].index).toBe(1);
    expect(results[1].reason).toBeInstanceOf(Error);
    expect(results[2]).toMatchObject({ status: 'fulfilled', value: 'c', index: 2 });
  });
});

describe('batch execute', () => {
  it('应该按批次执行并在批次间应用延迟', async () => {
    const tasks = Array.from({ length: 7 }).map(
      (_, i) => async () => {
        await delay(10);
        return i;
      },
    );
    const batchSize = 3;
    const batchDelay = 50; // 两次延迟，总延迟 ~100ms

    const start = Date.now();
    const results = await batchExecute(tasks, batchSize, batchDelay);
    const duration = Date.now() - start;

    expect(results).toHaveLength(7);
    expect(results.every(r => r.status === 'fulfilled')).toBe(true);
    expect(results.map(r => r.value)).toEqual([0, 1, 2, 3, 4, 5, 6]);

    // 任务执行时间+延迟，宽松阈值避免环境抖动
    expect(duration).toBeGreaterThanOrEqual(90);
  });
});

describe('retry', () => {
  it('应该在失败后重试并最终成功', async () => {
    let attempt = 0;
    const task = async () => {
      attempt++;
      if (attempt < 3) {
        throw new Error('temporary');
      }
      return 'ok';
    };

    const result = await retry(task, 5, 10);
    expect(result).toBe('ok');
    expect(attempt).toBe(3);
  });

  it('达到最大重试后应该抛出错误', async () => {
    let count = 0;
    const alwaysFail = async () => {
      count++;
      throw new Error('always');
    };

    await expect(retry(alwaysFail, 2, 5)).rejects.toThrow('always');
    expect(count).toBe(3); // 初次 + 2 次重试
  });
});

describe('with timeout', () => {
  it('超时应当抛出错误', async () => {
    const slowTask = async () => {
      await delay(50);
      return 'late';
    };

    await expect(withTimeout(slowTask, 20)).rejects.toThrow(/Task timeout/);
  });

  it('在超时时间内完成应返回结果', async () => {
    const fastTask = async () => {
      await delay(20);
      return 'fast';
    };

    await expect(withTimeout(fastTask, 50)).resolves.toBe('fast');
  });
});
