/**
 * 函数组合工具
 * @description 将多个函数组合成一个函数，从右到左执行
 */

/**
 * 函数组合 - 从右到左执行
 * @param fns 要组合的函数数组
 * @returns 组合后的函数
 */
export function compose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  if (fns.length === 0) {
    return (arg: T) => arg;
  }

  if (fns.length === 1) {
    return fns[0];
  }

  return fns.reduce((a, b) => (arg: T) => a(b(arg)));
}

/**
 * 管道函数 - 从左到右执行
 * @param fns 要组合的函数数组
 * @returns 组合后的函数
 */
export function pipe<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  if (fns.length === 0) {
    return (arg: T) => arg;
  }

  if (fns.length === 1) {
    return fns[0];
  }

  return fns.reduce((a, b) => (arg: T) => b(a(arg)));
}

/**
 * 异步函数组合 - 从右到左执行
 * @param fns 要组合的异步函数数组
 * @returns 组合后的异步函数
 */
export function composeAsync<T>(
  ...fns: Array<(arg: T) => Promise<T> | T>
): (arg: T) => Promise<T> {
  if (fns.length === 0) {
    return async (arg: T) => arg;
  }

  if (fns.length === 1) {
    return async (arg: T) => await fns[0](arg);
  }

  return async (arg: T) => {
    let result = arg;
    for (let i = fns.length - 1; i >= 0; i--) {
      result = await fns[i](result);
    }
    return result;
  };
}

/**
 * 异步管道函数 - 从左到右执行
 * @param fns 要组合的异步函数数组
 * @returns 组合后的异步函数
 */
export function pipeAsync<T>(
  ...fns: Array<(arg: T) => Promise<T> | T>
): (arg: T) => Promise<T> {
  if (fns.length === 0) {
    return async (arg: T) => arg;
  }

  if (fns.length === 1) {
    return async (arg: T) => await fns[0](arg);
  }

  return async (arg: T) => {
    let result = arg;
    for (const fn of fns) {
      result = await fn(result);
    }
    return result;
  };
}

/**
 * 条件组合函数
 * @description 根据条件选择不同的函数进行组合
 * @param condition 条件函数
 * @param trueFn 条件为真时执行的函数
 * @param falseFn 条件为假时执行的函数
 * @returns 条件组合后的函数
 */
export function when<T, R>(
  condition: (arg: T) => boolean,
  trueFn: (arg: T) => R,
  falseFn?: (arg: T) => R,
): (arg: T) => R | T {
  return (arg: T) => {
    if (condition(arg)) {
      return trueFn(arg);
    }
    return falseFn ? falseFn(arg) : arg;
  };
}

/**
 * 分支组合函数
 * @description 根据不同条件执行不同的函数
 * @param branches 分支配置数组
 * @param defaultFn 默认函数
 * @returns 分支组合后的函数
 */
export function branch<T, R>(
  branches: Array<{
    condition: (arg: T) => boolean;
    fn: (arg: T) => R;
  }>,
  defaultFn?: (arg: T) => R,
): (arg: T) => R | T {
  return (arg: T) => {
    for (const { condition, fn } of branches) {
      if (condition(arg)) {
        return fn(arg);
      }
    }
    return defaultFn ? defaultFn(arg) : arg;
  };
}
