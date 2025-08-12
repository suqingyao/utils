/**
 * 防抖函数
 * @description 在事件被触发n秒后再执行回调，如果在这n秒内又被触发，则重新计时
 */

interface DebounceOptions {
  /** 是否立即执行 */
  immediate?: boolean;
  /** 只执行一次 */
  once?: boolean;
}

/**
 * 创建防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @param options 配置选项
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: (...args: Parameters<T>) => ReturnType<T>,
  delay: number,
  options: DebounceOptions = {},
): T & { cancel: () => void; flush: () => void } {
  const { immediate = false } = options;
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  let result: ReturnType<T>;

  const debounced = function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    // 使用箭头函数捕获当前的 this 上下文
    const callNow = immediate && !timeoutId;
    lastArgs = args;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // 使用箭头函数自动绑定 this
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!immediate && lastArgs) {
        // 使用箭头函数中捕获的 this
        result = func.apply(this, lastArgs);
      }
    }, delay);

    if (callNow) {
      // 立即执行时也使用当前的 this
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
  };

  /**
   * 立即执行
   */
  debounced.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      timeoutId = null;
      // 使用函数本身的上下文
      result = func(...lastArgs);
      lastArgs = null;
    }
  };

  return debounced;
}
