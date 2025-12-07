export type EventType = string | symbol;
export type Handler<T = unknown> = (event: T) => void;

export type EventHandlerList<T = unknown> = Array<Handler<T>>;

export type EventHandlerMap<Events extends object> = Map<
  keyof Events,
  EventHandlerList<Events[keyof Events]>
>;

export class EventEmitter<Events extends object> {
  private handlersMap: EventHandlerMap<Events> = new Map();
  private bufferMap: Map<keyof Events, Array<unknown>> = new Map();

  // on overloads, returns an unsubscribe function for convenience
  on<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): () => void {
    const handlers = this.handlersMap.get(type) as Array<Handler<any>> | undefined;
    if (handlers) {
      handlers.push(handler as Handler<any>);
    }
    else {
      this.handlersMap.set(type, [handler] as unknown as EventHandlerList<Events[keyof Events]>);
    }

    // Check if there are buffered events to emit
    const bufferedEvents = this.bufferMap.get(type as keyof Events);
    if (bufferedEvents && bufferedEvents.length > 0) {
      // Emit all buffered events
      bufferedEvents.forEach((evt) => {
        (handler as Handler<Events[keyof Events]>)(evt as Events[keyof Events]);
      });
      // Clear the buffer for this event type
      this.bufferMap.delete(type as keyof Events);
    }

    return () => this.off(type, handler as any);
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
  off<Key extends keyof Events>(type: Key, handler?: Handler<Events[Key]>): void {
    const handlers = this.handlersMap.get(type) as Array<Handler<any>> | undefined;
    if (handlers) {
      if (handler) {
        handlers.splice(handlers.indexOf(handler as Handler<any>) >>> 0, 1);
      }
      else {
        this.handlersMap.set(type, [] as unknown as EventHandlerList<Events[keyof Events]>);
      }
    }
  }

  // emit overloads
  emit<Key extends keyof Events>(type: Key, evt?: Events[Key]): void {
    const handlers = this.handlersMap.get(type);
    if (handlers && handlers.length > 0) {
      (handlers as EventHandlerList<Events[keyof Events]>)
        .slice()
        .forEach((handler) => {
          (handler as Handler<Events[keyof Events]>)(evt as Events[keyof Events]);
        });
    }
    else {
      const buffer = this.bufferMap.get(type as keyof Events) || [];
      buffer.push(evt as Events[keyof Events]);
      this.bufferMap.set(type as keyof Events, buffer);
    }
  }

  listenerCount(type: keyof Events): number {
    return (this.handlersMap.get(type)?.length) || 0;
  }

  eventNames(): Array<keyof Events> {
    return Array.from(this.handlersMap.keys());
  }

  clear(): void {
    this.handlersMap.clear();
  }

  clearBuffer(): void {
    this.bufferMap.clear();
  }

  getBufferedEvents(type: keyof Events): unknown[] {
    return this.bufferMap.get(type) || [];
  }
}
