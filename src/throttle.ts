/**
 * 节流函数
 * @description 规定在一个单位时间内，只能触发一次函数。如果这个单位时间内触发多次函数，只有一次生效
 */

type ThrottleOptions = {
  /** 是否在开始时立即执行 */
  leading?: boolean;
  /** 是否在结束时执行 */
  trailing?: boolean;
};

/**
 * 创建节流函数
 * @param func 要节流的函数
 * @param delay 节流时间间隔（毫秒）
 * @param options 配置选项
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: ThrottleOptions = {}
): T & { cancel: () => void; flush: () => void } {
  const { leading = true, trailing = true } = options;
  let lastCallTime = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;
  let result: ReturnType<T>;

  const throttled = function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const currentThis = this;

    lastArgs = args;
    lastThis = currentThis;

    const shouldCallNow = leading && timeSinceLastCall >= delay;
    const shouldScheduleCall = trailing && !timeoutId;

    if (shouldCallNow) {
      lastCallTime = now;
      result = func.apply(currentThis, args);
    } else if (shouldScheduleCall) {
      timeoutId = setTimeout(() => {
        timeoutId = null;
        if (trailing && lastArgs) {
          lastCallTime = Date.now();
          result = func.apply(lastThis, lastArgs);
        }
      }, delay - timeSinceLastCall);
    }

    return result;
  } as T & { cancel: () => void; flush: () => void };

  /**
   * 取消节流
   */
  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastCallTime = 0;
    lastArgs = null;
    lastThis = null;
  };

  /**
   * 立即执行
   */
  throttled.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastCallTime = Date.now();
      result = func.apply(lastThis, lastArgs);
      lastArgs = null;
      lastThis = null;
    }
  };

  return throttled;
}