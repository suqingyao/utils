import { describe, expect, it } from 'vitest';
import { ConcurrencyController } from '../concurrency';

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

  it('并发为 1 时应顺序执行任务（串行）', async () => {
    const controller = new ConcurrencyController(1);
    const start = Date.now();
    const tasks = [
      () => delay(20).then(() => 1),
      () => delay(20).then(() => 2),
      () => delay(20).then(() => 3),
    ];

    const results = await Promise.all(tasks.map(t => controller.execute(t)));
    const duration = Date.now() - start;

    expect(results).toEqual([1, 2, 3]);
    // 串行至少 ~60ms（给环境抖动预留容错）
    expect(duration).toBeGreaterThanOrEqual(55);
    expect(controller.runningCount).toBe(0);
    expect(controller.queueCount).toBe(0);
  });

  it('应在并发槽位释放后一次性填满队列（多任务回填）', async () => {
    const controller = new ConcurrencyController(3);
    const longTasks = Array.from({ length: 3 }).map((_, i) => () => delay(30).then(() => `L${i}`));
    const shortTasks = Array.from({ length: 3 }).map((_, i) => () => delay(10).then(() => `S${i}`));
    const start = Date.now();

    const promises = [...longTasks, ...shortTasks].map(t => controller.execute(t));
    const results = await Promise.all(promises);
    const duration = Date.now() - start;

    expect(results.sort()).toEqual(['L0', 'L1', 'L2', 'S0', 'S1', 'S2']);
    // 如果不是一次性填满，短任务会依次串行，总时长 ~60ms；一次性填满应 ~40ms 左右
    expect(duration).toBeLessThan(55);
    expect(controller.runningCount).toBe(0);
    expect(controller.queueCount).toBe(0);
  });

  it('每个任务应使用独立重试计数且不超出并发上限', async () => {
    const controller = new ConcurrencyController(2, 3);
    let attemptA = 0;
    const runningSnapshots: number[] = [];

    const taskA = async () => {
      attemptA++;
      runningSnapshots.push(controller.runningCount);
      if (attemptA < 3) {
        throw new Error('temp');
      }
      await delay(5);
      return 'A';
    };

    let attemptB = 0;
    const taskB = async () => {
      attemptB++;
      await delay(10);
      return 'B';
    };

    const [ra, rb] = await Promise.all([controller.execute(taskA), controller.execute(taskB)]);
    expect(ra).toBe('A');
    expect(rb).toBe('B');
    expect(attemptA).toBe(3); // 失败2次后成功
    expect(attemptB).toBe(1);
    // 尝试过程中的并发数不应超过限制
    expect(Math.max(...runningSnapshots)).toBeLessThanOrEqual(2);
  });

  it('超过最大重试次数的任务应最终拒绝，且不影响其他任务完成', async () => {
    const controller = new ConcurrencyController(2, 2);
    let attemptFail = 0;
    const alwaysFail = async () => {
      attemptFail++;
      await delay(5);
      throw new Error('always');
    };

    const okTask = async () => {
      await delay(10);
      return 'OK';
    };

    const p1 = controller.execute(alwaysFail);
    const p2 = controller.execute(okTask);
    await expect(p1).rejects.toThrow('always');
    await expect(p2).resolves.toBe('OK');
    expect(attemptFail).toBe(3); // 初次 + 2 次重试
    expect(controller.runningCount).toBe(0);
    expect(controller.queueCount).toBe(0);
  });

  it('应正确处理同步抛错的任务并按重试逻辑继续', async () => {
    const controller = new ConcurrencyController(1, 1);
    let attempt = 0;
    const syncThrow = () => {
      attempt++;
      if (attempt === 1) {
        throw new Error('sync');
      }
      return Promise.resolve('OK');
    };

    const res = await controller.execute(syncThrow);
    expect(res).toBe('OK');
    expect(attempt).toBe(2);
  });

  it('立即完成的任务也应遵守并发限制并正确返回', async () => {
    const controller = new ConcurrencyController(3);
    const tasks = Array.from({ length: 5 }).map((_, i) => () => Promise.resolve(i));
    const results = await Promise.all(tasks.map(t => controller.execute(t)));
    expect(results).toEqual([0, 1, 2, 3, 4]);
    expect(controller.runningCount).toBe(0);
    expect(controller.queueCount).toBe(0);
  });
});
