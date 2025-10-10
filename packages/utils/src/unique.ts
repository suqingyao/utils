import { isPlainObject } from './type';

/**
 * 深度相等判断（包含数组与普通对象），区分 undefined 键存在性
 * Deep equality check (arrays and plain objects), distinguish undefined key presence
 * @param a 要比较的值 / value A
 * @param b 要比较的值 / value B
 * @returns 是否深度相等 / whether equal deeply
 */
export function isEqual(a: unknown, b: unknown): boolean {
  // 快速路径：引用或基本类型相等（含 NaN 处理）
  // Fast path: reference or primitive equality (with NaN handling)
  if (Object.is(a, b)) return true;

  // 数组比较 Array compare
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // Date 比较 Date compare
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // RegExp 比较 RegExp compare
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.source === b.source && a.flags === b.flags;
  }

  // 仅比较普通对象 Plain object compare only
  if (isPlainObject(a) && isPlainObject(b)) {
    const keysA = Object.keys(a as Record<string, unknown>);
    const keysB = Object.keys(b as Record<string, unknown>);
    if (keysA.length !== keysB.length) return false;
    // 键集合需完全一致 Keys set must be identical
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      // 递归比较 Recursively compare
      if (!isEqual((a as any)[key], (b as any)[key])) return false;
    }
    return true;
  }

  // 其他类型默认不相等 Other types not equal
  return false;
}

/**
 * 数组去重（支持基本类型与对象的深度比较）
 * Unique array values (supports primitives and deep object equality)
 * @param arr 输入数组 / input array
 * @returns 去重后的新数组 / new deduped array
 */
export function unique<T>(arr: T[]): T[] {
  // 结果数组 Result list
  const result: T[] = [];

  for (const item of arr) {
    // 若已存在等值项则跳过 Skip if duplicate found by deep equality
    const hasDuplicate = result.some(existing => isEqual(existing as unknown, item as unknown));
    if (!hasDuplicate) result.push(item);
  }

  return result;
}
