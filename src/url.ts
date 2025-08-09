export function stringifyQueryParams(params: Record<string, string>) {
  return new URLSearchParams(params).toString();
}

export function parseQueryParams(url: string) {
  const query = new URL(url).search;
  const params = new URLSearchParams(query);
  return Object.fromEntries(params);
}
