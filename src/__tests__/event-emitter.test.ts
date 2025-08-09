/**
 * 发布订阅模块测试用例
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter, createEventEmitter } from '../event-emitter';

describe('EventEmitter', () => {
  let emitter: EventEmitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  describe('on', () => {
    it('should subscribe to events', () => {
      const callback = vi.fn();
      emitter.on('test', callback);
      
      emitter.emit('test', 'data');
      
      expect(callback).toHaveBeenCalledWith('data');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should return unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = emitter.on('test', callback);
      
      emitter.emit('test', 'data1');
      expect(callback).toHaveBeenCalledTimes(1);
      
      unsubscribe();
      emitter.emit('test', 'data2');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should support multiple subscribers', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      emitter.on('test', callback1);
      emitter.on('test', callback2);
      
      emitter.emit('test', 'data');
      
      expect(callback1).toHaveBeenCalledWith('data');
      expect(callback2).toHaveBeenCalledWith('data');
    });
  });

  describe('once', () => {
    it('should subscribe to event only once', () => {
      const callback = vi.fn();
      emitter.once('test', callback);
      
      emitter.emit('test', 'data1');
      emitter.emit('test', 'data2');
      
      expect(callback).toHaveBeenCalledWith('data1');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should return unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = emitter.once('test', callback);
      
      unsubscribe();
      emitter.emit('test', 'data');
      
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('off', () => {
    it('should unsubscribe specific callback', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      emitter.on('test', callback1);
      emitter.on('test', callback2);
      
      emitter.off('test', callback1);
      emitter.emit('test', 'data');
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith('data');
    });

    it('should unsubscribe all callbacks when no callback specified', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      emitter.on('test', callback1);
      emitter.on('test', callback2);
      
      emitter.off('test');
      emitter.emit('test', 'data');
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });

    it('should handle non-existent events gracefully', () => {
      expect(() => emitter.off('nonexistent')).not.toThrow();
    });
  });

  describe('emit', () => {
    it('should emit events with data', () => {
      const callback = vi.fn();
      emitter.on('test', callback);
      
      emitter.emit('test', { key: 'value' });
      
      expect(callback).toHaveBeenCalledWith({ key: 'value' });
    });

    it('should emit events without data', () => {
      const callback = vi.fn();
      emitter.on('test', callback);
      
      emitter.emit('test');
      
      expect(callback).toHaveBeenCalledWith(undefined);
    });

    it('should handle errors in callbacks', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      const normalCallback = vi.fn();
      
      emitter.on('test', errorCallback);
      emitter.on('test', normalCallback);
      
      emitter.emit('test', 'data');
      
      expect(errorCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle non-existent events gracefully', () => {
      expect(() => emitter.emit('nonexistent', 'data')).not.toThrow();
    });
  });

  describe('listenerCount', () => {
    it('should return correct listener count', () => {
      expect(emitter.listenerCount('test')).toBe(0);
      
      emitter.on('test', vi.fn());
      expect(emitter.listenerCount('test')).toBe(1);
      
      emitter.on('test', vi.fn());
      expect(emitter.listenerCount('test')).toBe(2);
    });
  });

  describe('eventNames', () => {
    it('should return array of event names', () => {
      expect(emitter.eventNames()).toEqual([]);
      
      emitter.on('event1', vi.fn());
      emitter.on('event2', vi.fn());
      
      expect(emitter.eventNames()).toEqual(['event1', 'event2']);
    });
  });

  describe('clear', () => {
    it('should clear all events', () => {
      emitter.on('event1', vi.fn());
      emitter.on('event2', vi.fn());
      
      expect(emitter.eventNames()).toHaveLength(2);
      
      emitter.clear();
      
      expect(emitter.eventNames()).toHaveLength(0);
    });
  });
});

describe('createEventEmitter', () => {
  it('should create new EventEmitter instance', () => {
    const emitter = createEventEmitter();
    expect(emitter).toBeInstanceOf(EventEmitter);
  });
});