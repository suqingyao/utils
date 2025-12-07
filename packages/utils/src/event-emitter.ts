export type EventType = string | symbol;
export type Handler<T = unknown> = (event: T) => void;
export type WildcardHandler<T = Record<string, unknown>> = (
  type: keyof T,
  event: T[keyof T]
) => void;

export type EventHandlerList<T = unknown> = Array<Handler<T>>;
export type WildCardEventHandlerList<T = Record<string, unknown>> = Array<
  WildcardHandler<T>
>;

export type EventHandlerMap<Events extends Record<EventType, unknown>> = Map<
  keyof Events | '*',
  EventHandlerList<Events[keyof Events]> | WildCardEventHandlerList<Events>
>;

export class EventEmitter<Events extends Record<EventType, unknown>> {
  private handlersMap: EventHandlerMap<Events> = new Map();

  // on overloads, returns an unsubscribe function for convenience
  on<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): () => void;
  on(type: '*', handler: WildcardHandler<Events>): () => void;
  on(type: EventType | '*', handler: Handler<Events[keyof Events]> | WildcardHandler<Events>): () => void {
    const handlers = this.handlersMap.get(type) as Array<Handler<Events[keyof Events]> | WildcardHandler<Events>> | undefined;
    if (handlers) {
      handlers.push(handler);
    }
    else {
      this.handlersMap.set(type as keyof Events | '*', [handler] as unknown as EventHandlerList<Events[keyof Events]>);
    }
    return () => this.off(type as any, handler as any);
  }

  // once overloads for specific event types
  once<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): () => void {
    const onceHandler: Handler<Events[Key]> = (evt) => {
      this.off(type, onceHandler);
      handler(evt);
    };
    return this.on(type, onceHandler);
  }

  // off overloads
  off<Key extends keyof Events>(type: Key, handler?: Handler<Events[Key]>): void;
  off(type: '*', handler: WildcardHandler<Events>): void;
  off(type: EventType | '*', handler?: Handler<Events[keyof Events]> | WildcardHandler<Events>): void {
    const handlers = this.handlersMap.get(type) as Array<Handler<Events[keyof Events]> | WildcardHandler<Events>> | undefined;
    if (handlers) {
      if (handler) {
        handlers.splice(handlers.indexOf(handler) >>> 0, 1);
      }
      else {
        this.handlersMap.set(type as keyof Events | '*', [] as unknown as EventHandlerList<Events[keyof Events]>);
      }
    }
  }

  // emit overloads
  emit<Key extends keyof Events>(type: Key, event: Events[Key]): void;
  emit<Key extends keyof Events>(type: undefined extends Events[Key] ? Key : never): void;
  emit(type: EventType, evt?: unknown): void {
    let handlers = this.handlersMap.get(type);
    if (handlers) {
      (handlers as EventHandlerList<Events[keyof Events]>)
        .slice()
        .forEach((handler) => {
          (handler as Handler<Events[keyof Events]>)(evt as Events[keyof Events]);
        });
    }

    handlers = this.handlersMap.get('*');
    if (handlers) {
      (handlers as WildCardEventHandlerList<Events>)
        .slice()
        .forEach((handler) => {
          (handler as WildcardHandler<Events>)(type as keyof Events, evt as Events[keyof Events]);
        });
    }
  }

  listenerCount(type: keyof Events | '*'): number {
    return (this.handlersMap.get(type)?.length) || 0;
  }

  eventNames(): Array<keyof Events | '*'> {
    return Array.from(this.handlersMap.keys()) as Array<keyof Events | '*'>;
  }

  clear(): void {
    this.handlersMap.clear();
  }
}
