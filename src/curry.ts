/**
 * 柯里化函数
 * @description 将多参数函数转换为一系列单参数函数的技术
 */

/**
 * 柯里化函数实现
 * @param func 要柯里化的函数
 * @returns 柯里化后的函数
 */
type CurriedFunction<T extends (...args: any[]) => any> = T extends (
  ...args: infer P
) => infer R
  ? P extends [infer First, ...infer Rest]
    ? Rest extends []
      ? (arg: First) => R
      : (arg: First) => CurriedFunction<(...args: Rest) => R>
    : () => R
  : never;

export function curry<T extends (...args: any[]) => any>(
  func: T,
): CurriedFunction<T> {
  return function curried(this: any, ...args: any[]): any {
    if (args.length >= func.length) {
      return func.call(this, ...args);
    }
    return function (this: any, ...nextArgs: any[]) {
      return curried.call(this, ...args, ...nextArgs);
    };
  } as any;
}

/**
 * 部分应用函数
 * @description 固定函数的一些参数，返回一个新函数
 * @param func 原函数
 * @param args 要固定的参数
 * @returns 部分应用后的函数
 */
export function partial<T extends (...args: any[]) => any>(
  func: T,
  ...args: any[]
): (...remainingArgs: any[]) => ReturnType<T> {
  return function (this: any, ...remainingArgs: any[]) {
    return func.call(this, ...args, ...remainingArgs);
  };
}

/**
 * 占位符柯里化
 * @description 支持占位符的柯里化实现
 */
export const _: symbol = Symbol('placeholder');

/**
 * 支持占位符的柯里化函数
 * @param func 要柯里化的函数
 * @returns 支持占位符的柯里化函数
 */
export function curryWithPlaceholder<T extends (...args: any[]) => any>(
  func: T,
): (...args: any[]) => any {
  return function curried(this: any, ...args: any[]): any {
    const placeholderCount = args.filter(arg => arg === _).length;
    const realArgsCount = args.length - placeholderCount;

    if (realArgsCount >= func.length) {
      // 过滤掉占位符，只保留真实参数
      const finalArgs = args.filter(arg => arg !== _);

      return func.call(this, ...finalArgs.slice(0, func.length));
    }

    return function (this: any, ...nextArgs: any[]) {
      const newArgs = args.slice();
      let nextArgIndex = 0;

      // 填充占位符
      for (
        let i = 0;
        i < newArgs.length && nextArgIndex < nextArgs.length;
        i++
      ) {
        if (newArgs[i] === _) {
          newArgs[i] = nextArgs[nextArgIndex++];
        }
      }

      // 添加剩余参数
      while (nextArgIndex < nextArgs.length) {
        newArgs.push(nextArgs[nextArgIndex++]);
      }

      return curried.call(this, ...newArgs);
    };
  };
}
