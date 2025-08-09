const STORAGE_PREFIX = '__OUTILS__';

export interface StorageConfig<T> {
  /**
   * 命名空间，用于隔离不同模块的存储
   */
  namespace: string;
  /**
   * 前缀，用于隔离不同项目的存储
   */
  prefix?: string;
  /**
   * 是否使用会话存储，默认使用本地存储
   */
  session?: boolean;
  /**
   * 序列化函数，默认使用 JSON.stringify
   */
  serializer?: (value: T) => string;
  /**
   * 反序列化函数，默认使用 JSON.parse
   */
  deserializer?: (value: string) => T;
  /**
   * 键归一化函数，默认使用 toUpperCase
   */
  keyNormalizer?: (key: string) => string;
}

const defaultConfig = {
  prefix: STORAGE_PREFIX,
  session: false,
  serializer: JSON.stringify,
  deserializer: JSON.parse,
  keyNormalizer: normalizeKey,
};

/**
 * 验证键是否符合格式要求
 * @param str 要验证的字符串
 * @returns 是否符合格式
 */
function isValidateKey(str: string): boolean {
  return str.startsWith('__') && str.endsWith('__');
}

/**
 * 标准化键名
 * @param key 原始键名
 * @returns 标准化后的键名
 */
function normalizeKey(key: string): string {
  key = key.toLocaleUpperCase();
  if (!isValidateKey(key)) {
    return `__${key}__`;
  }
  return key;
}

/**
 * 安全解析 JSON 字符串
 * @param key 要解析的字符串
 * @returns 解析后的对象或原字符串
 */
export function safeParse<T>(key: string): T {
  try {
    return JSON.parse(key) as T;
  } catch (error) {
    return key as T;
  }
}

/**
 * 安全序列化对象为 JSON 字符串
 * @param key 要序列化的对象
 * @returns 序列化后的字符串
 */
export function safeStringify<T>(key: T): string {
  try {
    return JSON.stringify(key);
  } catch (error) {
    return key as string;
  }
}

/**
 * 创建本地存储工具
 * @description 提供本地存储的封装，支持命名空间、序列化和反序列化
 * @param namespace 命名空间，用于隔离不同模块的存储
 * @param prefix 前缀，用于隔离不同项目的存储
 * @param session 是否使用会话存储，默认使用本地存储
 * @param serializer 序列化函数，默认使用 JSON.stringify
 * @param deserializer 反序列化函数，默认使用 JSON.parse
 * @returns 本地存储工具对象
 */
export function createStorage<T>({
  namespace,
  prefix = defaultConfig.prefix,
  session = defaultConfig.session,
  serializer = defaultConfig.serializer,
  deserializer = defaultConfig.deserializer,
  keyNormalizer = defaultConfig.keyNormalizer,
}: StorageConfig<T>) {
  prefix = keyNormalizer(prefix);
  namespace = keyNormalizer(namespace);

  const storage = session ? sessionStorage : localStorage;

  return {
    setItem(key: string, value: T): void {
      key = keyNormalizer(key);
      let serializedValue: string;
      if (typeof value === 'object' && value !== null) {
        serializedValue = serializer(value);
      } else if (typeof value === 'string') {
        serializedValue = value;
      } else {
        serializedValue = String(value);
      }
      storage.setItem(`${prefix}-${namespace}-${key}`, serializedValue);
    },
    getItem(key: string, defaultValue?: T): T | undefined {
      key = keyNormalizer(key);
      const item = storage.getItem(`${prefix}-${namespace}-${key}`);
      if (item) {
        return deserializer(item);
      }
      return defaultValue;
    },
    removeItem(key: string): void {
      key = keyNormalizer(key);
      storage.removeItem(`${prefix}-${namespace}-${key}`);
    },
    clear(): void {
      storage.clear();
    },
  };
}
