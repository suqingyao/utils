/**
 * 防抖函数
 * @description 在事件被触发n秒后再执行回调，如果在这n秒内又被触发，则重新计时
 */

type DebounceOptions = {
  /** 是否立即执行 */
  immediate?: boolean;
};

/**
 * 创建防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @param options 配置选项
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: DebounceOptions = {}
): T & { cancel: () => void; flush: () => void } {
  const { immediate = false } = options;
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;
  let result: ReturnType<T>;

  const debounced = function (this: any, ...args: Parameters<T>) {
    lastArgs = args;
    lastThis = this;

    const callNow = immediate && !timeoutId;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!immediate && lastArgs) {
        result = func.apply(lastThis, lastArgs);
      }
    }, delay);

    if (callNow) {
      result = func.apply(this, args);
    }

    return result;
  } as T & { cancel: () => void; flush: () => void };

  /**
   * 取消防抖
   */
  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
    lastThis = null;
  };

  /**
   * 立即执行
   */
  debounced.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      timeoutId = null;
      result = func.apply(lastThis, lastArgs);
      lastArgs = null;
      lastThis = null;
    }
  };

  return debounced;
}