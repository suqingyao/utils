/**
 * 解析路径字符串为键数组（支持点号与中括号）
 * Parse path string into key tokens (supports dot and bracket notation)
 * @param path 路径字符串，例如：`a.b.c[0].d` 或 `a['b']["c"]`
 * @returns 键数组 key tokens 数组
 */
function tokenizePath(path: string): Array<string | number> {
  // 基础校验 Basic validation
  if (typeof path !== 'string' || path.length === 0)
    throw new Error('Path must be a non-empty string');

  // 将中括号形式统一转换为点号形式
  // Normalize bracket notation to dot notation
  // 1) 数字索引 Numeric index: [0] -> .0
  // 2) 字符串键 String key: ['k'] / ["k"] -> .k
  const normalized = path
    .replace(/\[(\d+)\]/g, '.$1')
    .replace(/\[['"]([^'"\]]+)['"]\]/g, '.$1');

  // 分割为 token 并去除空项
  // Split into tokens and remove empty segments
  const rawTokens = normalized.split('.').filter(Boolean);

  // 将纯数字字符串转换为数字索引
  // Convert numeric strings to numbers for array indexing
  return rawTokens.map(token => (/^\d+$/.test(token) ? Number.parseInt(token, 10) : token));
}

/**
 * 获取对象的嵌套值（支持 a.b.c、a.b.c[0].d 等路径）
 * Get nested value from object (supports a.b.c and a.b.c[0].d)
 * @param obj 目标对象 Target object
 * @param path 路径字符串 Path string
 * @returns 嵌套值或 undefined Nested value or undefined
 */
export function getNestedValue<T>(obj: T, path: string): unknown {
  // 解析路径为键数组 Parse path into tokens
  const keys = tokenizePath(path);

  // 当前游标 Current cursor value
  let current: any = obj;

  // 逐级深入 Traverse step by step
  for (const key of keys) {
    // 若为空则提前返回 Early return if nullish
    if (current === undefined || current === null) {
      return undefined;
    }
    // 使用键访问 Use key to access next level
    current = current[key as keyof typeof current];
  }

  // 返回最终结果 Return final result
  return current;
}
