/**
 * 类型工具函数
 * @description 提供类型判断、转换和校验的工具函数
 * 参考lodash-es 中的类型判断函数
 * 比如isString、isNumber、isBoolean、isFunction、isPlainObject、isObject、isArray、isNull、isUndefined、isNil
 * 比如isDate、isRegExp、isSymbol、isBigInt
 * 比如isNaN、isFinite、isInteger、isSafeInteger、isNaN、isFinite
 * 比如isEmpty、isLength、isObjectLike、isArrayLike、isStringLike、isNumberLike、isBooleanLike、isFunctionLike、isObjectLike、isArrayLike、isStringLike、isNumberLike、isBooleanLike、isFunctionLike
 * 比如isArguments、isArrayBuffer、isDataView、isFloat32Array、isFloat64Array、isInt8Array、isInt16Array、isInt32Array、isUint8Array、isUint8ClampedArray、isUint16Array、isUint32Array
 * 比如isMap、isSet、isWeakMap、isWeakSet
 */

/**
 * 获取值的精确类型
 * @param value 要检查的值
 * @returns 类型字符串
 */
export function getType(value: unknown): string {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

/**
 * 判断是否为字符串
 * @param value 要检查的值
 * @returns 是否为字符串
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * 判断是否为数字
 * @param value 要检查的值
 * @returns 是否为数字
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * 判断是否为布尔值
 * @param value 要检查的值
 * @returns 是否为布尔值
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * 判断是否为函数
 * @param value 要检查的值
 * @returns 是否为函数
 */
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

/**
 * 判断是否为普通对象（不包括null）
 * @param value 要检查的值
 * @returns 是否为普通对象
 */
export function isPlainObject(
  value: unknown
): value is Record<string, unknown> {
  return getType(value) === 'object' && value !== null;
}

/**
 * 判断是否为对象（不包括null）
 * @param value 要检查的值
 * @returns 是否为对象
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * 判断是否为数组
 * @param value 要检查的值
 * @returns 是否为数组
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * 判断是否为类数组对象
 * @param value 要检查的值
 * @returns 是否为类数组对象
 */
export function isArrayLike(value: unknown): value is ArrayLike<unknown> {
  return isArray(value) || (isObject(value) && 'length' in value);
}

/**
 * 判断是否为null
 * @param value 要检查的值
 * @returns 是否为null
 */
export function isNull(value: unknown): value is null {
  return value === null;
}

/**
 * 判断是否为undefined
 * @param value 要检查的值
 * @returns 是否为undefined
 */
export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

/**
 * 判断是否为null或undefined
 * @param value 要检查的值
 * @returns 是否为null或undefined
 */
export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * 判断是否为空值（null、undefined、空字符串、空数组、空对象）
 * @param value 要检查的值
 * @returns 是否为空值
 */
export function isEmpty(value: unknown): boolean {
  if (isNil(value)) return true;
  if (isString(value) || isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  if (isPlainObject(value)) return Object.keys(value).length === 0;
  if (isDate(value)) return isNaN(value.getTime());
  if (isRegExp(value)) return value.source === '';
  if (isSymbol(value)) return value.description === '';
  if (isBigInt(value)) return value.toString() === '0';
  return false;
}

/**
 * 判断是否为Date对象
 * @param value 要检查的值
 * @returns 是否为Date对象
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * 判断是否为正则表达式
 * @param value 要检查的值
 * @returns 是否为正则表达式
 */
export function isRegExp(value: unknown): value is RegExp {
  return value instanceof RegExp;
}

/**
 * 判断是否为Promise
 * @param value 要检查的值
 * @returns 是否为Promise
 */
export function isPromise(value: unknown): value is Promise<unknown> {
  return (
    value instanceof Promise ||
    (isObject(value) && isFunction((value as any).then))
  );
}

/**
 * 判断是否为Error对象
 * @param value 要检查的值
 * @returns 是否为Error对象
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * 判断是否为Symbol
 * @param value 要检查的值
 * @returns 是否为Symbol
 */
export function isSymbol(value: unknown): value is symbol {
  return typeof value === 'symbol';
}

/**
 * 判断是否为BigInt
 * @param value 要检查的值
 * @returns 是否为BigInt
 */
export function isBigInt(value: unknown): value is bigint {
  return typeof value === 'bigint';
}

/**
 * 安全的JSON解析
 * @param str 要解析的字符串
 * @param defaultValue 解析失败时的默认值
 * @returns 解析结果
 */
export function safeJsonParse<T = unknown>(str: string, defaultValue: T): T {
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}

/**
 * 安全的JSON字符串化
 * @param value 要字符串化的值
 * @param defaultValue 字符串化失败时的默认值
 * @returns 字符串化结果
 */
export function safeJsonStringify(
  value: unknown,
  defaultValue: string = '{}'
): string {
  try {
    return JSON.stringify(value);
  } catch {
    return defaultValue;
  }
}

/**
 * 类型转换为字符串
 * @param value 要转换的值
 * @returns 字符串
 */
export function toString(value: unknown): string {
  if (isString(value)) return value;
  if (isNil(value)) return '';
  if (isArray(value) || isObject(value)) return safeJsonStringify(value, '');
  return String(value);
}

/**
 * 类型转换为数字
 * @param value 要转换的值
 * @param defaultValue 转换失败时的默认值
 * @returns 数字
 */
export function toNumber(value: unknown, defaultValue: number = 0): number {
  if (isNumber(value)) return value;
  if (isString(value)) {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }
  return defaultValue;
}

/**
 * 类型转换为布尔值
 * @param value 要转换的值
 * @returns 布尔值
 */
export function toBoolean(value: unknown): boolean {
  if (isBoolean(value)) return value;
  if (isString(value)) {
    const lower = value.toLowerCase();
    return lower === 'true' || lower === '1' || lower === 'yes';
  }
  if (isNumber(value)) return value !== 0;
  return !isEmpty(value);
}
