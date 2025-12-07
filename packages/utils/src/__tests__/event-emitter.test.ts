import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventEmitter } from '../event-emitter';

interface Events {
  test: string;
  ready: void;
  event1: number;
  event2: number;
}

describe('eventEmitter', () => {
  let emitter: EventEmitter<Events>;

  beforeEach(() => {
    emitter = new EventEmitter<Events>();
  });

  describe('on', () => {
    it('subscribes and receives payload', () => {
      const callback = vi.fn();
      emitter.on('test', callback);

      emitter.emit('test', 'data');
      expect(callback).toHaveBeenCalledWith('data');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('returns unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = emitter.on('test', callback);

      emitter.emit('test', 'data1');
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
      emitter.emit('test', 'data2');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('supports multiple subscribers', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      emitter.on('test', callback1);
      emitter.on('test', callback2);

      emitter.emit('test', 'data');
      expect(callback1).toHaveBeenCalledWith('data');
      expect(callback2).toHaveBeenCalledWith('data');
    });

    it('replays buffered events to future subscriber', () => {
      const received: string[] = [];
      emitter.emit('test', 'early1');
      emitter.emit('test', 'early2');
      emitter.on('test', v => received.push(v));
      expect(received).toEqual(['early1', 'early2']);
    });
  });

  describe('once', () => {
    it('subscribes only once', () => {
      const callback = vi.fn();
      emitter.once('test', callback);

      emitter.emit('test', 'data1');
      emitter.emit('test', 'data2');
      expect(callback).toHaveBeenCalledWith('data1');
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('off', () => {
    it('unsubscribes specific callback', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      emitter.on('test', callback1);
      emitter.on('test', callback2);

      emitter.off('test', callback1);
      emitter.emit('test', 'data');
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith('data');
    });

    it('unsubscribes all when callback omitted', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      emitter.on('test', callback1);
      emitter.on('test', callback2);

      emitter.off('test');
      emitter.emit('test', 'data');
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe('emit', () => {
    it('emits with payload', () => {
      const callback = vi.fn();
      emitter.on('test', callback);
      emitter.emit('test', { key: 'value' } as unknown as string);
      expect(callback).toHaveBeenCalledWith({ key: 'value' } as unknown as string);
    });

    it('emits without payload for void event', () => {
      const callback = vi.fn();
      emitter.on('ready', callback);
      emitter.emit('ready');
      expect(callback).toHaveBeenCalledWith(undefined);
    });

    it('non-existent event buffers without throwing', () => {
      expect(() => emitter.emit('event1' as any, 123 as any)).not.toThrow();
    });
  });

  describe('listenerCount', () => {
    it('returns correct listener count', () => {
      expect(emitter.listenerCount('test')).toBe(0);
      emitter.on('test', vi.fn());
      expect(emitter.listenerCount('test')).toBe(1);
      emitter.on('test', vi.fn());
      expect(emitter.listenerCount('test')).toBe(2);
    });
  });

  describe('eventNames', () => {
    it('returns array of event names', () => {
      expect(emitter.eventNames()).toEqual([]);
      emitter.on('event1', vi.fn());
      emitter.on('event2', vi.fn());
      expect(emitter.eventNames()).toEqual(['event1', 'event2']);
    });
  });

  describe('clear', () => {
    it('clears all events', () => {
      emitter.on('event1', vi.fn());
      emitter.on('event2', vi.fn());
      expect(emitter.eventNames()).toHaveLength(2);
      emitter.clear();
      expect(emitter.eventNames()).toHaveLength(0);
    });
  });

  describe('buffer controls', () => {
    it('clears buffer manually', () => {
      emitter.emit('test', 'x');
      emitter.clearBuffer();
      let count = 0;
      emitter.on('test', () => count++);
      expect(count).toBe(0);
    });
  });
});
