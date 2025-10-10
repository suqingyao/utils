import { describe, expect, it } from 'vitest';
import { capitalizeFirstLetter, kebabToCamelCase, toCamelCase, toLowerCaseFirstLetter } from '../letter';

describe('letter', () => {
  it('capitalizeFirstLetter', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello');
  });

  it('toLowerCaseFirstLetter', () => {
    expect(toLowerCaseFirstLetter('Hello')).toBe('hello');
  });

  it('toCamelCase', () => {
    expect(toCamelCase('hello', 'parent')).toBe('parentHello');
  });

  it('kebabToCamelCase', () => {
    expect(kebabToCamelCase('hello-world')).toBe('helloWorld');
  });
});
