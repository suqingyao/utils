import { describe, expect, it } from 'vitest';
import { getNestedValue } from '../util';

describe('getNestedValue', () => {
  it('should return the nested value', () => {
    const obj = { a: { b: { c: 123 } } };
    expect(getNestedValue(obj, 'a.b.c')).toBe(123);
  });

  it('should return undefined for non-existent path', () => {
    const obj = { a: { b: { c: 123 } } };
    expect(getNestedValue(obj, 'a.b.d')).toBeUndefined();
  });

  it('should return the array element', () => {
    const obj = { a: { b: { c: [{ d: 123 }] } } };
    expect(getNestedValue(obj, 'a.b.c[0].d')).toBe(123);
  });
});
