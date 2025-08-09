/**
 * 类型工具函数单元测试
 * @description 测试 type.ts 中的所有类型判断和转换函数
 */

import { describe, expect, it } from 'vitest';
import {
  getType,
  isArray,
  isBigInt,
  isBoolean,
  isDate,
  isEmpty,
  isError,
  isFunction,
  isNil,
  isNull,
  isNumber,
  isObject,
  isPromise,
  isRegExp,
  isString,
  isSymbol,
  isUndefined,
  safeJsonParse,
  safeJsonStringify,
  toBoolean,
  toNumber,
  toString,
} from '../type';

describe('类型工具函数', () => {
  describe('getType', () => {
    it('应该正确返回各种类型的字符串表示', () => {
      expect(getType('hello')).toBe('string');
      expect(getType(123)).toBe('number');
      expect(getType(true)).toBe('boolean');
      expect(getType([])).toBe('array');
      expect(getType({})).toBe('object');
      expect(getType(null)).toBe('null');
      expect(getType(undefined)).toBe('undefined');
      expect(
        getType(() => {
          /* 空函数用于测试 */
        }),
      ).toBe('function');
      expect(getType(new Date())).toBe('date');
      expect(getType(/test/)).toBe('regexp');
      expect(getType(Symbol('test'))).toBe('symbol');
      expect(getType(BigInt(123))).toBe('bigint');
    });
  });

  describe('isString', () => {
    it('应该正确判断字符串类型', () => {
      expect(isString('hello')).toBe(true);
      expect(isString('')).toBe(true);
      expect(isString(String('test'))).toBe(true);
      expect(isString(123)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
      expect(isString([])).toBe(false);
      expect(isString({})).toBe(false);
    });
  });

  describe('isNumber', () => {
    it('应该正确判断数字类型', () => {
      expect(isNumber(123)).toBe(true);
      expect(isNumber(0)).toBe(true);
      expect(isNumber(-123)).toBe(true);
      expect(isNumber(3.14)).toBe(true);
      expect(isNumber(Number.MAX_VALUE)).toBe(true);
      expect(isNumber(Number.MIN_VALUE)).toBe(true);
      expect(isNumber(Infinity)).toBe(true);
      expect(isNumber(-Infinity)).toBe(true);
      expect(isNumber(Number.NaN)).toBe(false); // NaN 不被认为是有效数字
      expect(isNumber('123')).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
    });
  });

  describe('isBoolean', () => {
    it('应该正确判断布尔类型', () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
      expect(isBoolean(Boolean(1))).toBe(true);
      expect(isBoolean(1)).toBe(false);
      expect(isBoolean(0)).toBe(false);
      expect(isBoolean('true')).toBe(false);
      expect(isBoolean(null)).toBe(false);
      expect(isBoolean(undefined)).toBe(false);
    });
  });

  describe('isFunction', () => {
    it('应该正确判断函数类型', () => {
      expect(
        isFunction(() => {
          /* 空函数用于测试 */
        }),
      ).toBe(true);
      expect(
        isFunction(() => {
          /* 空函数用于测试 */
        }),
      ).toBe(true);
      expect(
        isFunction(async () => {
          /* 空异步函数用于测试 */
        }),
      ).toBe(true);
      expect(
        isFunction(function* () {
          /* 空生成器函数用于测试 */
        }),
      ).toBe(true);
      expect(isFunction(Array.prototype.push)).toBe(true);
      expect(isFunction(Date)).toBe(true);
      expect(isFunction('function')).toBe(false);
      expect(isFunction({})).toBe(false);
      expect(isFunction(null)).toBe(false);
    });
  });

  describe('isObject', () => {
    it('应该正确判断对象类型（不包括null和数组）', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ a: 1 })).toBe(true);
      expect(isObject(new Date())).toBe(true);
      expect(isObject(/test/)).toBe(true);
      expect(isObject(new Error('test error'))).toBe(true);
      expect(isObject(null)).toBe(false);
      expect(isObject([])).toBe(false);
      expect(isObject('object')).toBe(false);
      expect(isObject(123)).toBe(false);
      expect(isObject(undefined)).toBe(false);
    });
  });

  describe('isArray', () => {
    it('应该正确判断数组类型', () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray(Array.from({ length: 5 }))).toBe(true);
      expect(isArray(Array.from('hello'))).toBe(true);
      expect(isArray({})).toBe(false);
      expect(isArray('array')).toBe(false);
      expect(isArray(null)).toBe(false);
      expect(isArray(undefined)).toBe(false);
    });
  });

  describe('isNull', () => {
    it('应该正确判断null值', () => {
      expect(isNull(null)).toBe(true);
      expect(isNull(undefined)).toBe(false);
      expect(isNull(0)).toBe(false);
      expect(isNull('')).toBe(false);
      expect(isNull(false)).toBe(false);
      expect(isNull({})).toBe(false);
      expect(isNull([])).toBe(false);
    });
  });

  describe('isUndefined', () => {
    it('应该正确判断undefined值', () => {
      expect(isUndefined(undefined)).toBe(true);
      expect(isUndefined(void 0)).toBe(true);
      expect(isUndefined(null)).toBe(false);
      expect(isUndefined(0)).toBe(false);
      expect(isUndefined('')).toBe(false);
      expect(isUndefined(false)).toBe(false);
    });
  });

  describe('isNil', () => {
    it('应该正确判断null或undefined值', () => {
      expect(isNil(null)).toBe(true);
      expect(isNil(undefined)).toBe(true);
      expect(isNil(void 0)).toBe(true);
      expect(isNil(0)).toBe(false);
      expect(isNil('')).toBe(false);
      expect(isNil(false)).toBe(false);
      expect(isNil({})).toBe(false);
      expect(isNil([])).toBe(false);
    });
  });

  describe('isEmpty', () => {
    it('应该正确判断空值', () => {
      // null 和 undefined
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);

      // 空字符串
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty(' ')).toBe(false); // 空格不算空

      // 空数组
      expect(isEmpty([])).toBe(true);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty([undefined])).toBe(false); // 包含元素就不算空

      // 空对象
      expect(isEmpty({})).toBe(true);
      expect(isEmpty({ a: 1 })).toBe(false);
      expect(isEmpty({ a: undefined })).toBe(false); // 有属性就不算空

      // 其他类型
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(false)).toBe(false);
      expect(isEmpty(new Date())).toBe(true); // Date 对象被认为是空对象
    });
  });

  describe('isDate', () => {
    it('应该正确判断Date对象', () => {
      expect(isDate(new Date())).toBe(true);
      expect(isDate(new Date('2023-01-01'))).toBe(true);
      expect(isDate(new Date(0))).toBe(true);
      expect(isDate(new Date('invalid'))).toBe(false); // 无效日期
      expect(isDate('2023-01-01')).toBe(false);
      expect(isDate(1672531200000)).toBe(false); // 时间戳
      expect(isDate({})).toBe(false);
      expect(isDate(null)).toBe(false);
    });
  });

  describe('isRegExp', () => {
    it('应该正确判断正则表达式', () => {
      expect(isRegExp(/test/)).toBe(true);
      expect(isRegExp(/test/)).toBe(true);
      expect(isRegExp(/test/gi)).toBe(true);
      expect(isRegExp('test')).toBe(false);
      expect(isRegExp('/test/')).toBe(false);
      expect(isRegExp({})).toBe(false);
      expect(isRegExp(null)).toBe(false);
    });
  });

  describe('isPromise', () => {
    it('应该正确判断Promise对象', () => {
      expect(isPromise(Promise.resolve())).toBe(true);
      expect(
        isPromise(
          Promise.reject(new Error('test')).catch(() => {
            /* 空函数用于测试 */
          }),
        ),
      ).toBe(true);
      expect(
        isPromise(
          new Promise(() => {
            /* 空函数用于测试 */
          }),
        ),
      ).toBe(true);

      // thenable 对象
      expect(
        isPromise({
          then: () => {
            /* 空函数用于测试 */
          },
        }),
      ).toBe(true);
      expect(isPromise({ then: 'not a function' })).toBe(false);

      expect(isPromise('promise')).toBe(false);
      expect(isPromise({})).toBe(false);
      expect(isPromise(null)).toBe(false);
    });
  });

  describe('isError', () => {
    it('应该正确判断Error对象', () => {
      expect(isError(new Error('test error'))).toBe(true);
      expect(isError(new Error('test'))).toBe(true);
      expect(isError(new TypeError('type error'))).toBe(true);
      expect(isError(new ReferenceError('reference error'))).toBe(true);
      expect(isError(new SyntaxError('syntax error'))).toBe(true);
      expect(isError('error')).toBe(false);
      expect(isError({ message: 'error' })).toBe(false);
      expect(isError({})).toBe(false);
      expect(isError(null)).toBe(false);
    });
  });

  describe('isSymbol', () => {
    it('应该正确判断Symbol类型', () => {
      expect(isSymbol(Symbol('test symbol'))).toBe(true);
      expect(isSymbol(Symbol('test'))).toBe(true);
      expect(isSymbol(Symbol.for('test'))).toBe(true);
      expect(isSymbol(Symbol.iterator)).toBe(true);
      expect(isSymbol('symbol')).toBe(false);
      expect(isSymbol({})).toBe(false);
      expect(isSymbol(null)).toBe(false);
    });
  });

  describe('isBigInt', () => {
    it('应该正确判断BigInt类型', () => {
      expect(isBigInt(BigInt(123))).toBe(true);
      expect(isBigInt(123n)).toBe(true);
      expect(isBigInt(BigInt('123'))).toBe(true);
      expect(isBigInt(123)).toBe(false);
      expect(isBigInt('123')).toBe(false);
      expect(isBigInt({})).toBe(false);
      expect(isBigInt(null)).toBe(false);
    });
  });

  describe('safeJsonParse', () => {
    it('应该安全解析JSON字符串', () => {
      expect(safeJsonParse('{"a":1}', {})).toEqual({ a: 1 });
      expect(safeJsonParse('[1,2,3]', [])).toEqual([1, 2, 3]);
      expect(safeJsonParse('"hello"', '')).toBe('hello');
      expect(safeJsonParse('123', 0)).toBe(123);
      expect(safeJsonParse('true', false)).toBe(true);
      expect(safeJsonParse('null', 'default')).toBe(null);

      // 解析失败的情况
      expect(safeJsonParse('invalid json', 'default')).toBe('default');
      expect(safeJsonParse('{invalid}', {})).toEqual({});
      expect(safeJsonParse('undefined', 'default')).toBe('default');
    });
  });

  describe('safeJsonStringify', () => {
    it('应该安全序列化为JSON字符串', () => {
      expect(safeJsonStringify({ a: 1 })).toBe('{"a":1}');
      expect(safeJsonStringify([1, 2, 3])).toBe('[1,2,3]');
      expect(safeJsonStringify('hello')).toBe('"hello"');
      expect(safeJsonStringify(123)).toBe('123');
      expect(safeJsonStringify(true)).toBe('true');
      expect(safeJsonStringify(null)).toBe('null');

      // 序列化失败的情况（循环引用）
      const circular: Record<string, unknown> = {};
      circular.self = circular;
      expect(safeJsonStringify(circular)).toBe('{}');
      expect(safeJsonStringify(circular, 'error')).toBe('error');

      // 包含函数的对象
      expect(
        safeJsonStringify({
          a: 1,
          b: () => {
            /* 空函数用于测试 */
          },
        }),
      ).toBe('{"a":1}');
    });
  });

  describe('toString', () => {
    it('应该正确转换为字符串', () => {
      expect(toString('hello')).toBe('hello');
      expect(toString(123)).toBe('123');
      expect(toString(true)).toBe('true');
      expect(toString(false)).toBe('false');
      expect(toString(null)).toBe('');
      expect(toString(undefined)).toBe('');
      expect(toString({ a: 1 })).toBe('{"a":1}');
      expect(toString([1, 2, 3])).toBe('[1,2,3]');
      expect(toString(Symbol('test'))).toBe('Symbol(test)');
      expect(toString(BigInt(123))).toBe('123');

      // 特殊情况
      const circular: Record<string, unknown> = {};
      circular.self = circular;
      expect(toString(circular)).toBe(''); // 循环引用返回空字符串
    });
  });

  describe('toNumber', () => {
    it('应该正确转换为数字', () => {
      expect(toNumber(123)).toBe(123);
      expect(toNumber('123')).toBe(123);
      expect(toNumber('123.45')).toBe(123.45);
      expect(toNumber('-123')).toBe(-123);
      expect(toNumber('0')).toBe(0);
      expect(toNumber('')).toBe(0); // 默认值
      expect(toNumber('abc')).toBe(0); // 默认值
      expect(toNumber('abc', 999)).toBe(999); // 自定义默认值
      expect(toNumber(null)).toBe(0);
      expect(toNumber(undefined)).toBe(0);
      expect(toNumber(true)).toBe(0); // 非字符串非数字返回默认值
      expect(toNumber([])).toBe(0);
      expect(toNumber({})).toBe(0);
    });
  });

  describe('toBoolean', () => {
    it('应该正确转换为布尔值', () => {
      // 布尔值直接返回
      expect(toBoolean(true)).toBe(true);
      expect(toBoolean(false)).toBe(false);

      // 字符串转换
      expect(toBoolean('true')).toBe(true);
      expect(toBoolean('TRUE')).toBe(true);
      expect(toBoolean('True')).toBe(true);
      expect(toBoolean('1')).toBe(true);
      expect(toBoolean('yes')).toBe(true);
      expect(toBoolean('YES')).toBe(true);
      expect(toBoolean('false')).toBe(false);
      expect(toBoolean('0')).toBe(false);
      expect(toBoolean('no')).toBe(false);
      expect(toBoolean('abc')).toBe(false);
      expect(toBoolean('')).toBe(false);

      // 数字转换
      expect(toBoolean(1)).toBe(true);
      expect(toBoolean(-1)).toBe(true);
      expect(toBoolean(123)).toBe(true);
      expect(toBoolean(0)).toBe(false);
      expect(toBoolean(0.0)).toBe(false);

      // 其他类型基于isEmpty判断
      expect(toBoolean({})).toBe(false); // 空对象
      expect(toBoolean({ a: 1 })).toBe(true); // 非空对象
      expect(toBoolean([])).toBe(false); // 空数组
      expect(toBoolean([1])).toBe(true); // 非空数组
      expect(toBoolean(null)).toBe(false);
      expect(toBoolean(undefined)).toBe(false);
      expect(toBoolean(new Date())).toBe(false); // Date 对象被 isEmpty 认为是空的
      expect(
        toBoolean(() => {
          /* 空函数用于测试 */
        }),
      ).toBe(true); // 函数对象不被 isEmpty 认为是空的
    });
  });
});
