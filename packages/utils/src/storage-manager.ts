export interface StorageManagerOptions {
  prefix?: string;
  storageType?: 'localStorage' | 'sessionStorage';
}

export interface StorageItem<T> {
  value: T;
  expired?: number;
}

class StorageManager {
  private prefix: string;
  private storage: Storage;

  constructor({
    prefix = '',
    storageType = 'localStorage',
  }: StorageManagerOptions = {}) {
    this.prefix = prefix;
    this.storage = storageType === 'localStorage' ? window.localStorage : window.sessionStorage;
  }

  private getFullKey(key: string) {
    return `${this.prefix}__${key}`.toUpperCase();
  }

  clear() {
    const keysToRemove: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => this.storage.removeItem(key));
  }

  clearExpiredItems() {
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key?.startsWith(this.prefix)) {
        const shortKey = key.replace(this.prefix, '');
        // call getItem to check if expired
        this.getItem(shortKey);
      }
    }
  }

  getItem<T>(key: string, defaultValue: null | T = null): null | T {
    const fullKey = this.getFullKey(key);
    const itemStr = this.storage.getItem(fullKey);
    if (!itemStr) {
      return defaultValue;
    }
    try {
      const item = JSON.parse(itemStr);
      if (item.expired && item.expired < Date.now()) {
        this.storage.removeItem(fullKey);
        return defaultValue;
      }
      return item.value;
    }
    catch (error) {
      console.error(`Error parsing item with key "${fullKey}":`, error);
      // if parse failed, remove the item
      this.storage.removeItem(fullKey);
      return defaultValue;
    }
  }

  removeItem(key: string) {
    this.storage.removeItem(this.getFullKey(key));
  }

  setItem<T>(key: string, value: T, ttl?: number) {
    const fullKey = this.getFullKey(key);
    const expired = ttl ? Date.now() + ttl : undefined;
    const item: StorageItem<T> = { value, expired };
    try {
      this.storage.setItem(fullKey, JSON.stringify(item));
    }
    catch (error) {
      console.error(`Error setting item with key "${fullKey}":`, error);
    }
  }
}

export { StorageManager };
