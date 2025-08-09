# 类型工具 (Type Utils)

提供类型判断、转换和校验的工具函数，帮助在 JavaScript/TypeScript 中进行安全的类型操作。

## 导入

```typescript
import { 
  getType,
  isString, isNumber, isBoolean, isFunction, isObject, isArray,
  isNull, isUndefined, isNil, isEmpty,
  isDate, isRegExp, isPromise, isError, isSymbol, isBigInt,
  safeJsonParse, safeJsonStringify,
  toString, toNumber, toBoolean
} from 'outils';
```

## 类型判断

### getType(value)

获取值的精确类型。

**参数：**
- `value: unknown` - 要检查的值

**返回值：**
- `string` - 类型字符串

**示例：**

```typescript
import { getType } from 'outils';

console.log(getType(42));           // "number"
console.log(getType("hello"));      // "string"
console.log(getType([]));           // "array"
console.log(getType({}));           // "object"
console.log(getType(null));         // "null"
console.log(getType(undefined));    // "undefined"
console.log(getType(new Date()));   // "date"
console.log(getType(/regex/));      // "regexp"
console.log(getType(Symbol()));     // "symbol"
console.log(getType(BigInt(123)));  // "bigint"
```

### 基础类型判断

#### isString(value)

判断是否为字符串。

**参数：**
- `value: unknown` - 要检查的值

**返回值：**
- `value is string` - 类型守卫，如果为 `true`，TypeScript 会将 `value` 推断为 `string` 类型

**示例：**

```typescript
import { isString } from 'outils';

const value: unknown = "hello";

if (isString(value)) {
  // TypeScript 知道 value 是 string 类型
  console.log(value.toUpperCase()); // "HELLO"
}

console.log(isString("hello"));  // true
console.log(isString(123));      // false
console.log(isString(null));     // false
```

#### isNumber(value)

判断是否为数字（排除 NaN）。

**参数：**
- `value: unknown` - 要检查的值

**返回值：**
- `value is number` - 类型守卫

**示例：**

```typescript
import { isNumber } from 'outils';

console.log(isNumber(42));       // true
console.log(isNumber(3.14));     // true
console.log(isNumber(NaN));      // false
console.log(isNumber("123"));    // false
console.log(isNumber(Infinity)); // true

const value: unknown = 42;
if (isNumber(value)) {
  console.log(value.toFixed(2)); // "42.00"
}
```

#### isBoolean(value)

判断是否为布尔值。

**参数：**
- `value: unknown` - 要检查的值

**返回值：**
- `value is boolean` - 类型守卫

**示例：**

```typescript
import { isBoolean } from 'outils';

console.log(isBoolean(true));    // true
console.log(isBoolean(false));   // true
console.log(isBoolean(1));       // false
console.log(isBoolean("true"));  // false
```

#### isFunction(value)

判断是否为函数。

**参数：**
- `value: unknown` - 要检查的值

**返回值：**
- `value is Function` - 类型守卫

**示例：**

```typescript
import { isFunction } from 'outils';

const fn = () => {};
const asyncFn = async () => {};
const arrowFn = (x: number) => x * 2;

console.log(isFunction(fn));       // true
console.log(isFunction(asyncFn));  // true
console.log(isFunction(arrowFn));  // true
console.log(isFunction("hello"));  // false

if (isFunction(fn)) {
  fn(); // TypeScript 知道 fn 是函数
}
```

#### isObject(value)

判断是否为对象（不包括 null 和数组）。

**参数：**
- `value: unknown` - 要检查的值

**返回值：**
- `value is Record<string, unknown>` - 类型守卫

**示例：**

```typescript
import { isObject } from 'outils';

console.log(isObject({}));           // true
console.log(isObject({ a: 1 }));     // true
console.log(isObject([]));           // false
console.log(isObject(null));         // false
console.log(isObject(new Date()));   // true

const value: unknown = { name: "John" };
if (isObject(value)) {
  console.log(Object.keys(value)); // ["name"]
}
```

#### isArray(value)

判断是否为数组。

**参数：**
- `value: unknown` - 要检查的值

**返回值：**
- `value is unknown[]` - 类型守卫

**示例：**

```typescript
import { isArray } from 'outils';

console.log(isArray([]));           // true
console.log(isArray([1, 2, 3]));    // true
console.log(isArray("hello"));      // false
console.log(isArray({ 0: 'a' }));   // false

const value: unknown = [1, 2, 3];
if (isArray(value)) {
  console.log(value.length); // 3
  value.forEach(item => console.log(item));
}
```

### 空值判断

#### isNull(value)

判断是否为 null。

**参数：**
- `value: unknown` - 要检查的值

**返回值：**
- `value is null` - 类型守卫

**示例：**

```typescript
import { isNull } from 'outils';

console.log(isNull(null));       // true
console.log(isNull(undefined));  // false
console.log(isNull(0));          // false
console.log(isNull(""));         // false
```

#### isUndefined(value)

判断是否为 undefined。

**参数：**
- `value: unknown` - 要检查的值

**返回值：**
- `value is undefined` - 类型守卫

**示例：**

```typescript
import { isUndefined } from 'outils';

console.log(isUndefined(undefined)); // true
console.log(isUndefined(null));      // false
console.log(isUndefined(0));         // false

let value: string | undefined;
console.log(isUndefined(value));     // true
```

#### isNil(value)

判断是否为 null 或 undefined。

**参数：**
- `value: unknown` - 要检查的值

**返回值：**
- `value is null | undefined` - 类型守卫

**示例：**

```typescript
import { isNil } from 'outils';

console.log(isNil(null));       // true
console.log(isNil(undefined));  // true
console.log(isNil(0));          // false
console.log(isNil(""));         // false
console.log(isNil(false));      // false

// 常用于可选值检查
function processValue(value: string | null | undefined) {
  if (isNil(value)) {
    console.log("值为空");
    return;
  }
  
  // TypeScript 知道 value 是 string 类型
  console.log(value.toUpperCase());
}
```

#### isEmpty(value)

判断是否为空值（null、undefined、空字符串、空数组、空对象）。

**参数：**
- `value: unknown` - 要检查的值

**返回值：**
- `boolean` - 是否为空值

**示例：**

```typescript
import { isEmpty } from 'outils';

console.log(isEmpty(null));        // true
console.log(isEmpty(undefined));   // true
console.log(isEmpty(""));          // true
console.log(isEmpty([]));          // true
console.log(isEmpty({}));          // true
console.log(isEmpty(0));           // false
console.log(isEmpty(false));       // false
console.log(isEmpty("hello"));     // false
console.log(isEmpty([1, 2]));      // false
console.log(isEmpty({ a: 1 }));    // false

// 实际应用
function validateInput(input: unknown) {
  if (isEmpty(input)) {
    throw new Error("输入不能为空");
  }
  return input;
}
```

### 复杂类型判断

#### isDate(value)

判断是否为有效的 Date 对象。

**参数：**
- `value: unknown` - 要检查的值

**返回值：**
- `value is Date` - 类型守卫

**示例：**

```typescript
import { isDate } from 'outils';

console.log(isDate(new Date()));           // true
console.log(isDate(new Date("2023-01-01"))); // true
console.log(isDate(new Date("invalid")));   // false (无效日期)
console.log(isDate("2023-01-01"));         // false
console.log(isDate(1640995200000));        // false

const value: unknown = new Date();
if (isDate(value)) {
  console.log(value.getFullYear()); // 当前年份
}
```

#### isRegExp(value)

判断是否为正则表达式。

**参数：**
- `value: unknown` - 要检查的值

**返回值：**
- `value is RegExp` - 类型守卫

**示例：**

```typescript
import { isRegExp } from 'outils';

console.log(isRegExp(/abc/));           // true
console.log(isRegExp(new RegExp("abc"))); // true
console.log(isRegExp("/abc/"));          // false
console.log(isRegExp("abc"));            // false

const pattern: unknown = /\d+/;
if (isRegExp(pattern)) {
  console.log(pattern.test("123")); // true
}
```

#### isPromise(value)

判断是否为 Promise 对象。

**参数：**
- `value: unknown` - 要检查的值

**返回值：**
- `value is Promise<unknown>` - 类型守卫

**示例：**

```typescript
import { isPromise } from 'outils';

const promise1 = Promise.resolve(42);
const promise2 = new Promise(resolve => resolve("hello"));
const thenable = { then: (callback: Function) => callback("result") };

console.log(isPromise(promise1));  // true
console.log(isPromise(promise2));  // true
console.log(isPromise(thenable));  // true (thenable 对象)
console.log(isPromise("hello"));   // false

const value: unknown = Promise.resolve(42);
if (isPromise(value)) {
  value.then(result => console.log(result)); // 42
}
```

#### isError(value)

判断是否为 Error 对象。

**参数：**
- `value: unknown` - 要检查的值

**返回值：**
- `value is Error` - 类型守卫

**示例：**

```typescript
import { isError } from 'outils';

console.log(isError(new Error("test")));     // true
console.log(isError(new TypeError("test")));  // true
console.log(isError(new RangeError("test"))); // true
console.log(isError("Error message"));       // false
console.log(isError({ message: "error" }));  // false

// 错误处理
function handleError(error: unknown) {
  if (isError(error)) {
    console.log(`错误: ${error.message}`);
    console.log(`堆栈: ${error.stack}`);
  } else {
    console.log(`未知错误: ${error}`);
  }
}
```

#### isSymbol(value)

判断是否为 Symbol。

**参数：**
- `value: unknown` - 要检查的值

**返回值：**
- `value is symbol` - 类型守卫

**示例：**

```typescript
import { isSymbol } from 'outils';

const sym1 = Symbol();
const sym2 = Symbol("description");
const sym3 = Symbol.for("global");

console.log(isSymbol(sym1));        // true
console.log(isSymbol(sym2));        // true
console.log(isSymbol(sym3));        // true
console.log(isSymbol("symbol"));    // false

const value: unknown = Symbol("key");
if (isSymbol(value)) {
  console.log(value.toString()); // "Symbol(key)"
}
```

#### isBigInt(value)

判断是否为 BigInt。

**参数：**
- `value: unknown` - 要检查的值

**返回值：**
- `value is bigint` - 类型守卫

**示例：**

```typescript
import { isBigInt } from 'outils';

console.log(isBigInt(BigInt(123)));     // true
console.log(isBigInt(123n));            // true
console.log(isBigInt(123));             // false
console.log(isBigInt("123"));           // false

const value: unknown = BigInt("9007199254740991");
if (isBigInt(value)) {
  console.log(value.toString()); // "9007199254740991"
}
```

## JSON 操作

### safeJsonParse(str, defaultValue)

安全的 JSON 解析，解析失败时返回默认值。

**参数：**
- `str: string` - 要解析的 JSON 字符串
- `defaultValue: T` - 解析失败时的默认值

**返回值：**
- `T` - 解析结果或默认值

**示例：**

```typescript
import { safeJsonParse } from 'outils';

// 正常解析
const data1 = safeJsonParse('{"name": "John"}', {});
console.log(data1); // { name: "John" }

// 解析失败，返回默认值
const data2 = safeJsonParse('invalid json', { error: true });
console.log(data2); // { error: true }

// 带类型的解析
interface User {
  name: string;
  age: number;
}

const defaultUser: User = { name: "Unknown", age: 0 };
const user = safeJsonParse<User>(
  '{"name": "Alice", "age": 25}',
  defaultUser
);
console.log(user); // { name: "Alice", age: 25 }

// 解析数组
const numbers = safeJsonParse<number[]>('[1, 2, 3]', []);
console.log(numbers); // [1, 2, 3]

const invalidNumbers = safeJsonParse<number[]>('[1, 2,]', []);
console.log(invalidNumbers); // []
```

### safeJsonStringify(value, defaultValue?)

安全的 JSON 字符串化，序列化失败时返回默认值。

**参数：**
- `value: unknown` - 要序列化的值
- `defaultValue?: string` - 序列化失败时的默认值，默认为 `'{}'

**返回值：**
- `string` - 序列化结果或默认值

**示例：**

```typescript
import { safeJsonStringify } from 'outils';

// 正常序列化
const json1 = safeJsonStringify({ name: "John", age: 30 });
console.log(json1); // '{"name":"John","age":30}'

// 序列化数组
const json2 = safeJsonStringify([1, 2, 3]);
console.log(json2); // '[1,2,3]'

// 处理循环引用（会失败）
const obj: any = { name: "test" };
obj.self = obj; // 创建循环引用

const json3 = safeJsonStringify(obj, '"error"');
console.log(json3); // "error"

// 处理不可序列化的值
const json4 = safeJsonStringify(function() {}, '"function"');
console.log(json4); // "function"

// 处理 Symbol
const json5 = safeJsonStringify({ key: Symbol("test") }, '"symbol"');
console.log(json5); // '{}' (Symbol 会被忽略)
```

## 类型转换

### toString(value)

将任意值转换为字符串。

**参数：**
- `value: unknown` - 要转换的值

**返回值：**
- `string` - 转换后的字符串

**示例：**

```typescript
import { toString } from 'outils';

console.log(toString("hello"));        // "hello"
console.log(toString(123));            // "123"
console.log(toString(true));           // "true"
console.log(toString(null));           // ""
console.log(toString(undefined));      // ""
console.log(toString([1, 2, 3]));      // "[1,2,3]"
console.log(toString({ a: 1 }));       // '{"a":1}'
console.log(toString(new Date()));     // ISO 日期字符串

// 实际应用
function logValue(value: unknown) {
  console.log(`值: ${toString(value)}`);
}

logValue(42);           // "值: 42"
logValue([1, 2, 3]);    // "值: [1,2,3]"
logValue({ name: "John" }); // "值: {\"name\":\"John\"}"
```

### toNumber(value, defaultValue?)

将值转换为数字。

**参数：**
- `value: unknown` - 要转换的值
- `defaultValue?: number` - 转换失败时的默认值，默认为 0

**返回值：**
- `number` - 转换后的数字

**示例：**

```typescript
import { toNumber } from 'outils';

console.log(toNumber(42));           // 42
console.log(toNumber("123"));        // 123
console.log(toNumber("3.14"));       // 3.14
console.log(toNumber("hello"));      // 0 (默认值)
console.log(toNumber("hello", -1));  // -1 (自定义默认值)
console.log(toNumber(true));         // 0 (默认值)
console.log(toNumber(null));         // 0 (默认值)
console.log(toNumber(undefined));    // 0 (默认值)

// 实际应用
function parseUserInput(input: string): number {
  return toNumber(input, 0);
}

console.log(parseUserInput("25"));     // 25
console.log(parseUserInput("abc"));    // 0
console.log(parseUserInput("12.5"));   // 12.5

// 处理表单数据
function processFormData(formData: Record<string, string>) {
  return {
    age: toNumber(formData.age, 18),
    score: toNumber(formData.score, 0),
    price: toNumber(formData.price, 0.0)
  };
}
```

### toBoolean(value)

将值转换为布尔值。

**参数：**
- `value: unknown` - 要转换的值

**返回值：**
- `boolean` - 转换后的布尔值

**转换规则：**
- 如果已经是布尔值，直接返回
- 字符串：`"true"`、`"1"`、`"yes"` (不区分大小写) 返回 `true`，其他返回 `false`
- 数字：非零返回 `true`，零返回 `false`
- 其他值：非空返回 `true`，空值返回 `false`

**示例：**

```typescript
import { toBoolean } from 'outils';

// 布尔值
console.log(toBoolean(true));        // true
console.log(toBoolean(false));       // false

// 字符串
console.log(toBoolean("true"));      // true
console.log(toBoolean("TRUE"));      // true
console.log(toBoolean("1"));         // true
console.log(toBoolean("yes"));       // true
console.log(toBoolean("YES"));       // true
console.log(toBoolean("false"));     // false
console.log(toBoolean("0"));         // false
console.log(toBoolean("no"));        // false
console.log(toBoolean("hello"));     // false

// 数字
console.log(toBoolean(1));           // true
console.log(toBoolean(-1));          // true
console.log(toBoolean(0));           // false

// 其他值
console.log(toBoolean([]));          // false (空数组)
console.log(toBoolean([1]));         // true (非空数组)
console.log(toBoolean({}));          // false (空对象)
console.log(toBoolean({ a: 1 }));    // true (非空对象)
console.log(toBoolean(null));        // false
console.log(toBoolean(undefined));   // false

// 实际应用
function parseConfig(config: Record<string, string>) {
  return {
    enabled: toBoolean(config.enabled),
    debug: toBoolean(config.debug),
    autoSave: toBoolean(config.autoSave)
  };
}

const config = parseConfig({
  enabled: "true",
  debug: "1",
  autoSave: "false"
});
console.log(config); // { enabled: true, debug: true, autoSave: false }
```

## 高级用法

### 类型守卫组合

```typescript
import { isString, isNumber, isArray, isObject } from 'outils';

// 组合类型守卫
function isStringOrNumber(value: unknown): value is string | number {
  return isString(value) || isNumber(value);
}

function isArrayOfStrings(value: unknown): value is string[] {
  return isArray(value) && value.every(isString);
}

function isValidUser(value: unknown): value is { name: string; age: number } {
  return isObject(value) && 
         isString((value as any).name) && 
         isNumber((value as any).age);
}

// 使用组合类型守卫
const data: unknown = { name: "Alice", age: 25 };

if (isValidUser(data)) {
  // TypeScript 知道 data 是 { name: string; age: number }
  console.log(`用户: ${data.name}, 年龄: ${data.age}`);
}
```

### 运行时类型验证

```typescript
import { isObject, isString, isNumber, isArray } from 'outils';

// 创建类型验证器
class TypeValidator {
  static validateUser(data: unknown): { name: string; age: number; email: string } {
    if (!isObject(data)) {
      throw new Error("数据必须是对象");
    }
    
    const { name, age, email } = data as any;
    
    if (!isString(name)) {
      throw new Error("name 必须是字符串");
    }
    
    if (!isNumber(age) || age < 0) {
      throw new Error("age 必须是非负数");
    }
    
    if (!isString(email) || !email.includes('@')) {
      throw new Error("email 必须是有效的邮箱地址");
    }
    
    return { name, age, email };
  }
  
  static validateStringArray(data: unknown): string[] {
    if (!isArray(data)) {
      throw new Error("数据必须是数组");
    }
    
    if (!data.every(isString)) {
      throw new Error("数组中所有元素必须是字符串");
    }
    
    return data as string[];
  }
}

// 使用验证器
try {
  const user = TypeValidator.validateUser({
    name: "John",
    age: 30,
    email: "john@example.com"
  });
  console.log("用户验证成功:", user);
} catch (error) {
  console.error("用户验证失败:", error.message);
}
```

### API 响应处理

```typescript
import { 
  isObject, isArray, isString, isNumber, 
  safeJsonParse, isEmpty 
} from 'outils';

// API 响应处理器
class ApiResponseHandler {
  static parseResponse<T>(response: string, validator: (data: unknown) => T): T {
    // 安全解析 JSON
    const data = safeJsonParse(response, null);
    
    if (isEmpty(data)) {
      throw new Error("响应数据为空");
    }
    
    // 验证数据结构
    return validator(data);
  }
  
  static validateUserList(data: unknown): Array<{ id: number; name: string }> {
    if (!isArray(data)) {
      throw new Error("用户列表必须是数组");
    }
    
    return data.map((item, index) => {
      if (!isObject(item)) {
        throw new Error(`用户 ${index} 必须是对象`);
      }
      
      const { id, name } = item as any;
      
      if (!isNumber(id)) {
        throw new Error(`用户 ${index} 的 id 必须是数字`);
      }
      
      if (!isString(name)) {
        throw new Error(`用户 ${index} 的 name 必须是字符串`);
      }
      
      return { id, name };
    });
  }
}

// 使用示例
const responseJson = '[{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]';

try {
  const users = ApiResponseHandler.parseResponse(
    responseJson,
    ApiResponseHandler.validateUserList
  );
  console.log("用户列表:", users);
} catch (error) {
  console.error("解析失败:", error.message);
}
```

### 配置文件处理

```typescript
import { 
  isObject, isString, isNumber, isBoolean,
  toNumber, toBoolean, toString
} from 'outils';

// 配置处理器
class ConfigProcessor {
  static processConfig(rawConfig: unknown): AppConfig {
    if (!isObject(rawConfig)) {
      throw new Error("配置必须是对象");
    }
    
    const config = rawConfig as Record<string, unknown>;
    
    return {
      appName: toString(config.appName || "MyApp"),
      port: toNumber(config.port, 3000),
      debug: toBoolean(config.debug),
      maxConnections: toNumber(config.maxConnections, 100),
      timeout: toNumber(config.timeout, 5000),
      features: this.processFeatures(config.features)
    };
  }
  
  private static processFeatures(features: unknown): string[] {
    if (!isArray(features)) {
      return [];
    }
    
    return features
      .map(toString)
      .filter(feature => feature.length > 0);
  }
}

interface AppConfig {
  appName: string;
  port: number;
  debug: boolean;
  maxConnections: number;
  timeout: number;
  features: string[];
}

// 使用示例
const rawConfig = {
  appName: "MyWebApp",
  port: "8080",
  debug: "true",
  maxConnections: "200",
  timeout: 10000,
  features: ["auth", "logging", 123, null, "monitoring"]
};

const config = ConfigProcessor.processConfig(rawConfig);
console.log(config);
// {
//   appName: "MyWebApp",
//   port: 8080,
//   debug: true,
//   maxConnections: 200,
//   timeout: 10000,
//   features: ["auth", "logging", "123", "monitoring"]
// }
```

## 性能优化建议

### 1. 缓存类型检查结果

```typescript
// ✅ 好：缓存复杂的类型检查
const typeCache = new WeakMap();

function isComplexType(value: unknown): boolean {
  if (typeCache.has(value)) {
    return typeCache.get(value);
  }
  
  const result = isObject(value) && 
                 isString((value as any).type) && 
                 isArray((value as any).items);
  
  typeCache.set(value, result);
  return result;
}

// ❌ 不好：重复进行相同的类型检查
function processItems(items: unknown[]) {
  return items.filter(item => {
    // 每次都重新检查
    return isObject(item) && 
           isString((item as any).type) && 
           isArray((item as any).items);
  });
}
```

### 2. 早期返回

```typescript
// ✅ 好：早期返回，避免不必要的检查
function validateComplexData(data: unknown): boolean {
  if (!isObject(data)) return false;
  if (!isString((data as any).name)) return false;
  if (!isNumber((data as any).age)) return false;
  if (!isArray((data as any).tags)) return false;
  
  return true;
}

// ❌ 不好：所有条件都检查
function validateComplexDataBad(data: unknown): boolean {
  return isObject(data) &&
         isString((data as any).name) &&
         isNumber((data as any).age) &&
         isArray((data as any).tags);
}
```

### 3. 批量类型检查

```typescript
// ✅ 好：批量检查相同类型
function areAllStrings(values: unknown[]): values is string[] {
  return values.every(isString);
}

function areAllNumbers(values: unknown[]): values is number[] {
  return values.every(isNumber);
}

// 使用批量检查
if (areAllStrings(userInputs)) {
  // 所有输入都是字符串
  userInputs.forEach(input => console.log(input.toUpperCase()));
}
```

## 常见问题

### Q: `getType()` 和 `typeof` 有什么区别？

A: `getType()` 提供更精确的类型信息：

```typescript
console.log(typeof []);           // "object"
console.log(getType([]));         // "array"

console.log(typeof null);         // "object"
console.log(getType(null));       // "null"

console.log(typeof new Date());   // "object"
console.log(getType(new Date())); // "date"
```

### Q: 为什么 `isNumber(NaN)` 返回 `false`？

A: 因为 `NaN` 在实际使用中通常表示无效的数字，`isNumber()` 只认为有效的数字才返回 `true`。如果需要检查 `NaN`，可以使用：

```typescript
function isNaN(value: unknown): boolean {
  return typeof value === 'number' && Number.isNaN(value);
}
```

### Q: `isEmpty()` 对于数字 0 和布尔值 `false` 返回什么？

A: 返回 `false`，因为它们是有效值：

```typescript
console.log(isEmpty(0));     // false
console.log(isEmpty(false)); // false
console.log(isEmpty(""));    // true
console.log(isEmpty([]));    // true
```

### Q: 如何检查一个值是否为纯对象（plain object）？

A: 可以组合使用现有函数：

```typescript
function isPlainObject(value: unknown): boolean {
  return isObject(value) && 
         Object.getPrototypeOf(value) === Object.prototype;
}

console.log(isPlainObject({}));           // true
console.log(isPlainObject(new Date()));   // false
console.log(isPlainObject([]));           // false
```

## 浏览器兼容性

支持所有现代浏览器和 Node.js 环境：
- Chrome 1+ (基础 JavaScript 支持)
- Firefox 1+ (基础 JavaScript 支持)
- Safari 1+ (基础 JavaScript 支持)
- Edge 12+ (基础 JavaScript 支持)
- IE 9+ (基础 JavaScript 支持)
- Node.js 0.10+ (基础 JavaScript 支持)

依赖的 API：
- `Object.prototype.toString`
- `Array.isArray`
- `JSON.parse` / `JSON.stringify`
- `typeof` 操作符
- `instanceof` 操作符