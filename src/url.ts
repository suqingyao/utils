/**
 * 将查询参数对象转换为查询字符串
 * @param params 查询参数对象
 * @returns 查询字符串
 */
export function stringifyQueryParams(params: Record<string, string>): string {
  return new URLSearchParams(params).toString();
}

/**
 * 从 URL 中解析查询参数
 * @param url 完整的 URL 字符串
 * @returns 查询参数对象
 */
export function parseQueryParams(url: string): Record<string, string> {
  const query = new URL(url).search;
  const params = new URLSearchParams(query);
  return Object.fromEntries(params);
}
