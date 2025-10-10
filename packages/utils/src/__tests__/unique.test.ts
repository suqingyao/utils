import { describe, expect, it } from 'vitest';
import { unique } from '../unique';

describe('unique', () => {
  it('test unique with number', () => {
    const arr = [1, 2, 1, 3];
    const result = unique(arr);
    expect(result).toEqual([1, 2, 3]);
  });

  it('test unique with object', () => {
    const arr = [{ a: 1 }, { a: 2 }, { a: 1 }];
    const result = unique(arr);
    expect(result).toEqual([{ a: 1 }, { a: 2 }]);
  });

  it('test unique with object and undefined', () => {
    const arr = [{ a: 1, b: 2 }, { a: 1, b: 2, d: undefined }, { a: 1, b: 2, c: undefined }];
    const result = unique(arr);
    expect(result).toEqual([{ a: 1, b: 2 }, { a: 1, b: 2, d: undefined }, { a: 1, b: 2, c: undefined }]);
  });

  it('returns empty array for empty input', () => {
    expect(unique([])).toEqual([]);
  });

  it('removes all duplicates keeping first occurrence (stability)', () => {
    const arr = [1, 1, 1, 1, 2, 2, 3];
    expect(unique(arr)).toEqual([1, 2, 3]);
  });

  it('handles NaN correctly (NaN equals NaN for dedupe)', () => {
    const arr = [Number.NaN, Number.NaN, 1];
    const result = unique(arr);
    expect(result.length).toBe(2);
    expect(Number.isNaN(result[0])).toBe(true);
    expect(result[1]).toBe(1);
  });

  it('distinguishes -0 and 0 as equal per Object.is semantics', () => {
    const arr = [-0, 0];
    const result = unique(arr);
    // Object.is(-0, 0) is false, but our equality uses Object.is first.
    // However, typical dedupe treats -0 and 0 as equal values in JS sets.
    // We ensure deep equality regards them equal by comparing primitives via Object.is then fallback.
    // Here we expect both retained since Object.is differs; validate expected current behavior:
    expect(result).toEqual([-0, 0]);
  });

  it('dedupes booleans', () => {
    const arr = [true, false, true, false];
    expect(unique(arr)).toEqual([true, false]);
  });

  it('dedupes strings respecting case', () => {
    const arr = ['a', 'A', 'a'];
    expect(unique(arr)).toEqual(['a', 'A']);
  });

  it('dedupes nested objects deeply', () => {
    const a = { x: 1, y: { z: [1, 2, { k: 'v' }] } };
    const b = { x: 1, y: { z: [1, 2, { k: 'v' }] } };
    const c = { x: 2 };
    const result = unique([a, b, c]);
    expect(result).toEqual([a, c]);
  });

  it('different key order in object considered equal', () => {
    const a = { a: 1, b: 2 };
    const b = { b: 2, a: 1 };
    const result = unique([a, b]);
    expect(result).toEqual([a]);
  });

  it('missing key vs explicit undefined are different', () => {
    const a = { a: 1 } as Record<string, any>;
    const b = { a: 1, b: undefined } as Record<string, any>;
    const c = { a: 1 } as Record<string, any>;
    const result = unique([a, b, c]);
    expect(result).toEqual([a, b]);
  });

  it('dates compare by time', () => {
    const d1 = new Date('2020-01-01T00:00:00.000Z');
    const d2 = new Date('2020-01-01T00:00:00.000Z');
    const d3 = new Date('2021-01-01T00:00:00.000Z');
    const result = unique([d1, d2, d3]);
    expect(result).toEqual([d1, d3]);
  });

  it('regexp compare by source and flags', () => {
    const r1 = /abc/gi;
    const r2 = /abc/gi;
    const r3 = /abc/g;
    const result = unique([r1, r2, r3]);
    expect(result).toEqual([r1, r3]);
  });

  it('arrays compare deeply', () => {
    const a1 = [1, { k: [2, 3] }];
    const a2 = [1, { k: [2, 3] }];
    const a3 = [1, { k: [2, 4] }];
    const result = unique([a1, a2, a3]);
    expect(result).toEqual([a1, a3]);
  });

  it('mixed types are deduped per type/value', () => {
    const arr = [1, '1', true, { a: 1 }, { a: 1 }, [1], [1], null, null, undefined, undefined];
    const result = unique(arr);
    expect(result).toEqual([1, '1', true, { a: 1 }, [1], null, undefined]);
  });

  it('functions are compared by reference (no deep compare)', () => {
    const f = () => 1;
    const g = () => 1;
    const result = unique([f, f, g]);
    expect(result).toEqual([f, g]);
  });

  it('set and Map are compared by reference (treated as non-plain objects)', () => {
    const s1 = new Set([1]);
    const s2 = new Set([1]);
    const m1 = new Map([[1, 2]]);
    const m2 = new Map([[1, 2]]);
    const result = unique([s1, s2, m1, m2]);
    expect(result).toEqual([s1, s2, m1, m2]);
  });

  it('preserves first reference when duplicates exist', () => {
    const first = { a: 1 };
    const second = { a: 1 };
    const result = unique([first, second]);
    expect(result[0]).toBe(first);
  });
});
