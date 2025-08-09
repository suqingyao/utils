/**
 * 事件发布订阅器
 * @description 实现观察者模式，支持事件的发布、订阅、取消订阅
 */

type EventCallback<T = any> = (data: T) => void;
type EventMap = Record<string, EventCallback[]>;

export class EventEmitter {
  private events: EventMap = {};

  /**
   * 订阅事件
   * @param event 事件名称
   * @param callback 回调函数
   * @returns 取消订阅的函数
   */
  on<T = any>(event: string, callback: EventCallback<T>): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);

    // 返回取消订阅函数
    return () => this.off(event, callback);
  }

  /**
   * 订阅一次性事件
   * @param event 事件名称
   * @param callback 回调函数
   * @returns 取消订阅的函数
   */
  once<T = any>(event: string, callback: EventCallback<T>): () => void {
    const onceCallback = (data: T) => {
      callback(data);
      this.off(event, onceCallback);
    };
    return this.on(event, onceCallback);
  }

  /**
   * 取消订阅事件
   * @param event 事件名称
   * @param callback 要取消的回调函数，如果不传则取消该事件的所有订阅
   */
  off<T = any>(event: string, callback?: EventCallback<T>): void {
    if (!this.events[event]) return;

    if (!callback) {
      // 取消该事件的所有订阅
      delete this.events[event];
      return;
    }

    const index = this.events[event].indexOf(callback);
    if (index > -1) {
      this.events[event].splice(index, 1);
    }

    // 如果该事件没有订阅者了，删除该事件
    if (this.events[event].length === 0) {
      delete this.events[event];
    }
  }

  /**
   * 发布事件
   * @param event 事件名称
   * @param data 传递给回调函数的数据
   */
  emit<T = any>(event: string, data?: T): void {
    if (!this.events[event]) return;

    // 复制数组避免在回调中修改原数组导致的问题
    const callbacks = [...this.events[event]];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event callback for '${event}':`, error);
      }
    });
  }

  /**
   * 获取事件的订阅者数量
   * @param event 事件名称
   * @returns 订阅者数量
   */
  listenerCount(event: string): number {
    return this.events[event]?.length || 0;
  }

  /**
   * 获取所有事件名称
   * @returns 事件名称数组
   */
  eventNames(): string[] {
    return Object.keys(this.events);
  }

  /**
   * 清除所有事件订阅
   */
  clear(): void {
    this.events = {};
  }
}

/**
 * 创建一个新的事件发布订阅器实例
 * @returns EventEmitter实例
 */
export function createEventEmitter(): EventEmitter {
  return new EventEmitter();
}