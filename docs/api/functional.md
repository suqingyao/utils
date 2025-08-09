# 函数式编程 (Functional Programming)

提供柯里化、函数组合、管道等函数式编程工具，帮助编写更优雅和可复用的代码。

## 导入

```typescript
import { 
  curry, 
  partial, 
  curryWithPlaceholder, 
  _, 
  compose, 
  pipe, 
  composeAsync, 
  pipeAsync, 
  when, 
  branch 
} from 'outils';
```

## 柯里化 (Currying)

### curry(func)

将多参数函数转换为一系列单参数函数。

**参数：**
- `func: T` - 要柯里化的函数

**返回值：**
- 柯里化后的函数

**基本用法：**

```typescript
import { curry } from 'outils';

// 原始函数
function add(a: number, b: number, c: number): number {
  return a + b + c;
}

// 柯里化
const curriedAdd = curry(add);

// 使用方式1：逐个传参
const result1 = curriedAdd(1)(2)(3); // 6

// 使用方式2：部分传参
const addOne = curriedAdd(1);
const addOneAndTwo = addOne(2);
const result2 = addOneAndTwo(3); // 6

// 使用方式3：一次性传参
const result3 = curriedAdd(1, 2, 3); // 6
```

**实际应用场景：**

```typescript
// 数据处理管道
const multiply = curry((a: number, b: number) => a * b);
const add = curry((a: number, b: number) => a + b);

const double = multiply(2);
const addTen = add(10);

const numbers = [1, 2, 3, 4, 5];
const result = numbers
  .map(double)     // [2, 4, 6, 8, 10]
  .map(addTen);    // [12, 14, 16, 18, 20]

// 配置函数
const createValidator = curry((rules: any[], data: any) => {
  return rules.every(rule => rule(data));
});

const userValidator = createValidator([
  (user: any) => user.name && user.name.length > 0,
  (user: any) => user.email && user.email.includes('@'),
  (user: any) => user.age && user.age >= 18
]);

const isValidUser = userValidator({ name: 'John', email: 'john@example.com', age: 25 }); // true
```

### partial(func, ...args)

部分应用函数，固定函数的一些参数。

**参数：**
- `func: T` - 原函数
- `...args: any[]` - 要固定的参数

**返回值：**
- 部分应用后的函数

**示例：**

```typescript
import { partial } from 'outils';

function greet(greeting: string, name: string, punctuation: string): string {
  return `${greeting}, ${name}${punctuation}`;
}

// 固定前两个参数
const sayHelloTo = partial(greet, 'Hello', 'World');
const result1 = sayHelloTo('!'); // "Hello, World!"

// 固定第一个参数
const greetWith = partial(greet, 'Hi');
const result2 = greetWith('Alice', '~'); // "Hi, Alice~"

// 实际应用：事件处理
function handleClick(eventType: string, element: string, event: Event) {
  console.log(`${eventType} on ${element}:`, event);
}

const handleButtonClick = partial(handleClick, 'click', 'button');
document.querySelector('button')?.addEventListener('click', handleButtonClick);
```

### curryWithPlaceholder(func) 和占位符 _

支持占位符的柯里化，允许跳过某些参数。

**参数：**
- `func: T` - 要柯里化的函数

**返回值：**
- 支持占位符的柯里化函数

**示例：**

```typescript
import { curryWithPlaceholder, _ } from 'outils';

function divide(a: number, b: number, c: number): number {
  return a / b / c;
}

const curriedDivide = curryWithPlaceholder(divide);

// 使用占位符跳过参数
const divideBy2 = curriedDivide(_, 2); // 第二个参数固定为2
const result1 = divideBy2(10, 1); // 10 / 2 / 1 = 5

// 更复杂的占位符使用
const divideByAndThen = curriedDivide(_, 2, _);
const result2 = divideByAndThen(20, 2); // 20 / 2 / 2 = 5

// 实际应用：模板函数
function createUrl(protocol: string, domain: string, path: string, query?: string): string {
  const base = `${protocol}://${domain}${path}`;
  return query ? `${base}?${query}` : base;
}

const curriedCreateUrl = curryWithPlaceholder(createUrl);

// 创建HTTPS URL模板
const createHttpsUrl = curriedCreateUrl('https');

// 创建API URL模板
const createApiUrl = curriedCreateUrl('https', 'api.example.com');

// 创建特定路径的URL模板
const createUserUrl = curriedCreateUrl(_, _, '/users');
const userUrl = createUserUrl('https', 'api.example.com'); // "https://api.example.com/users"
```

## 函数组合 (Function Composition)

### compose(...fns)

从右到左组合函数。

**参数：**
- `...fns: Array<(arg: any) => any>` - 要组合的函数数组

**返回值：**
- 组合后的函数

**示例：**

```typescript
import { compose } from 'outils';

// 基本使用
const addOne = (x: number) => x + 1;
const double = (x: number) => x * 2;
const square = (x: number) => x * x;

// 从右到左执行：square -> double -> addOne
const transform = compose(addOne, double, square);
const result = transform(3); // square(3) -> double(9) -> addOne(18) = 19

// 数据处理管道
const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: 35 }
];

const getNames = (users: any[]) => users.map(user => user.name);
const toUpperCase = (names: string[]) => names.map(name => name.toUpperCase());
const joinWithComma = (names: string[]) => names.join(', ');

const processUsers = compose(joinWithComma, toUpperCase, getNames);
const result2 = processUsers(users); // "ALICE, BOB, CHARLIE"
```

### pipe(...fns)

从左到右组合函数。

**参数：**
- `...fns: Array<(arg: any) => any>` - 要组合的函数数组

**返回值：**
- 组合后的函数

**示例：**

```typescript
import { pipe } from 'outils';

// 基本使用
const addOne = (x: number) => x + 1;
const double = (x: number) => x * 2;
const square = (x: number) => x * x;

// 从左到右执行：addOne -> double -> square
const transform = pipe(addOne, double, square);
const result = transform(3); // addOne(3) -> double(4) -> square(8) = 64

// 字符串处理管道
const trim = (str: string) => str.trim();
const toLowerCase = (str: string) => str.toLowerCase();
const removeSpaces = (str: string) => str.replace(/\s+/g, '-');
const addPrefix = (str: string) => `slug-${str}`;

const createSlug = pipe(trim, toLowerCase, removeSpaces, addPrefix);
const slug = createSlug('  Hello World  '); // "slug-hello-world"
```

### composeAsync(...fns)

异步函数组合，从右到左执行。

**参数：**
- `...fns: Array<(arg: any) => Promise<any> | any>` - 要组合的异步函数数组

**返回值：**
- 组合后的异步函数

**示例：**

```typescript
import { composeAsync } from 'outils';

// 异步函数
const fetchUser = async (id: string) => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
};

const validateUser = async (user: any) => {
  if (!user.email) throw new Error('Invalid user');
  return user;
};

const formatUser = (user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email.toLowerCase()
});

// 从右到左执行：fetchUser -> validateUser -> formatUser
const processUser = composeAsync(formatUser, validateUser, fetchUser);

// 使用
processUser('123').then(user => {
  console.log('处理后的用户:', user);
}).catch(error => {
  console.error('处理失败:', error);
});
```

### pipeAsync(...fns)

异步函数管道，从左到右执行。

**参数：**
- `...fns: Array<(arg: any) => Promise<any> | any>` - 要组合的异步函数数组

**返回值：**
- 组合后的异步函数

**示例：**

```typescript
import { pipeAsync } from 'outils';

// 数据处理管道
const fetchData = async (url: string) => {
  const response = await fetch(url);
  return response.json();
};

const transformData = (data: any) => {
  return data.map((item: any) => ({
    id: item.id,
    title: item.title,
    createdAt: new Date(item.created_at)
  }));
};

const saveToCache = async (data: any) => {
  await localStorage.setItem('cached-data', JSON.stringify(data));
  return data;
};

const logResult = (data: any) => {
  console.log(`处理了 ${data.length} 条数据`);
  return data;
};

// 从左到右执行
const processApiData = pipeAsync(
  fetchData,
  transformData,
  saveToCache,
  logResult
);

// 使用
processApiData('/api/posts').then(data => {
  console.log('最终数据:', data);
});
```

## 条件组合

### when(condition, trueFn, falseFn?)

根据条件选择不同的函数执行。

**参数：**
- `condition: (arg: T) => boolean` - 条件函数
- `trueFn: (arg: T) => R` - 条件为真时执行的函数
- `falseFn?: (arg: T) => R` - 条件为假时执行的函数（可选）

**返回值：**
- 条件组合后的函数

**示例：**

```typescript
import { when } from 'outils';

// 基本使用
const isEven = (n: number) => n % 2 === 0;
const double = (n: number) => n * 2;
const triple = (n: number) => n * 3;

const processNumber = when(isEven, double, triple);

console.log(processNumber(4)); // 8 (偶数，执行double)
console.log(processNumber(5)); // 15 (奇数，执行triple)

// 数据验证
const isValidEmail = (email: string) => email.includes('@');
const formatEmail = (email: string) => email.toLowerCase().trim();
const throwError = (email: string) => { throw new Error(`Invalid email: ${email}`); };

const processEmail = when(isValidEmail, formatEmail, throwError);

try {
  const email = processEmail('USER@EXAMPLE.COM'); // "user@example.com"
  console.log('处理后的邮箱:', email);
} catch (error) {
  console.error(error.message);
}

// 只有真值分支
const processPositive = when(
  (n: number) => n > 0,
  (n: number) => n * 2
  // 没有falseFn，负数或零会原样返回
);

console.log(processPositive(5));  // 10
console.log(processPositive(-3)); // -3
```

### branch(branches, defaultFn?)

根据多个条件执行不同的函数。

**参数：**
- `branches: Array<{ condition: (arg: T) => boolean; fn: (arg: T) => R }>` - 分支配置数组
- `defaultFn?: (arg: T) => R` - 默认函数（可选）

**返回值：**
- 分支组合后的函数

**示例：**

```typescript
import { branch } from 'outils';

// 成绩等级判断
const getGrade = branch([
  { condition: (score: number) => score >= 90, fn: () => 'A' },
  { condition: (score: number) => score >= 80, fn: () => 'B' },
  { condition: (score: number) => score >= 70, fn: () => 'C' },
  { condition: (score: number) => score >= 60, fn: () => 'D' }
], () => 'F');

console.log(getGrade(95)); // 'A'
console.log(getGrade(75)); // 'C'
console.log(getGrade(45)); // 'F'

// 用户权限处理
interface User {
  role: 'admin' | 'user' | 'guest';
  isActive: boolean;
}

const processUserAction = branch<User, string>([
  {
    condition: (user) => user.role === 'admin',
    fn: (user) => 'Admin access granted'
  },
  {
    condition: (user) => user.role === 'user' && user.isActive,
    fn: (user) => 'User access granted'
  },
  {
    condition: (user) => user.role === 'user' && !user.isActive,
    fn: (user) => 'Account suspended'
  }
], (user) => 'Guest access only');

const admin = { role: 'admin' as const, isActive: true };
const activeUser = { role: 'user' as const, isActive: true };
const inactiveUser = { role: 'user' as const, isActive: false };
const guest = { role: 'guest' as const, isActive: true };

console.log(processUserAction(admin));        // 'Admin access granted'
console.log(processUserAction(activeUser));   // 'User access granted'
console.log(processUserAction(inactiveUser)); // 'Account suspended'
console.log(processUserAction(guest));        // 'Guest access only'
```

## 高级用法

### 函数式数据处理管道

```typescript
import { pipe, curry, when } from 'outils';

// 定义基础函数
const filter = curry((predicate: (item: any) => boolean, array: any[]) => 
  array.filter(predicate)
);

const map = curry((transform: (item: any) => any, array: any[]) => 
  array.map(transform)
);

const sort = curry((compareFn: (a: any, b: any) => number, array: any[]) => 
  [...array].sort(compareFn)
);

const take = curry((count: number, array: any[]) => 
  array.slice(0, count)
);

// 创建处理管道
const processUsers = pipe(
  filter((user: any) => user.isActive),
  map((user: any) => ({ ...user, name: user.name.toUpperCase() })),
  sort((a: any, b: any) => b.score - a.score),
  take(5)
);

const users = [
  { name: 'alice', score: 85, isActive: true },
  { name: 'bob', score: 92, isActive: false },
  { name: 'charlie', score: 78, isActive: true },
  // ... more users
];

const topActiveUsers = processUsers(users);
```

### 异步数据处理

```typescript
import { pipeAsync, curry } from 'outils';

// 异步处理函数
const fetchUserData = async (userId: string) => {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
};

const enrichWithPosts = async (user: any) => {
  const posts = await fetch(`/api/users/${user.id}/posts`).then(r => r.json());
  return { ...user, posts };
};

const enrichWithFollowers = async (user: any) => {
  const followers = await fetch(`/api/users/${user.id}/followers`).then(r => r.json());
  return { ...user, followersCount: followers.length };
};

const cacheUser = async (user: any) => {
  await localStorage.setItem(`user-${user.id}`, JSON.stringify(user));
  return user;
};

// 创建异步处理管道
const getEnrichedUser = pipeAsync(
  fetchUserData,
  enrichWithPosts,
  enrichWithFollowers,
  cacheUser
);

// 使用
getEnrichedUser('123').then(user => {
  console.log('完整用户数据:', user);
});
```

### 条件式数据转换

```typescript
import { when, branch, pipe } from 'outils';

// 数据清洗管道
interface RawData {
  value: string;
  type: 'number' | 'string' | 'boolean';
}

const parseNumber = (data: RawData) => ({
  ...data,
  parsedValue: parseFloat(data.value)
});

const parseBoolean = (data: RawData) => ({
  ...data,
  parsedValue: data.value.toLowerCase() === 'true'
});

const parseString = (data: RawData) => ({
  ...data,
  parsedValue: data.value.trim()
});

const parseData = branch([
  { condition: (data: RawData) => data.type === 'number', fn: parseNumber },
  { condition: (data: RawData) => data.type === 'boolean', fn: parseBoolean },
  { condition: (data: RawData) => data.type === 'string', fn: parseString }
]);

const validateParsedData = when(
  (data: any) => data.parsedValue !== undefined && data.parsedValue !== null,
  (data: any) => ({ ...data, isValid: true }),
  (data: any) => ({ ...data, isValid: false, error: 'Parse failed' })
);

const processRawData = pipe(parseData, validateParsedData);

// 使用
const rawData = [
  { value: '123.45', type: 'number' as const },
  { value: 'true', type: 'boolean' as const },
  { value: '  hello  ', type: 'string' as const }
];

const processedData = rawData.map(processRawData);
console.log(processedData);
```

## 性能优化

### 1. 避免过度柯里化

```typescript
// ❌ 不好：过度柯里化简单函数
const add = curry((a: number, b: number) => a + b);
const result = add(1)(2); // 不必要的复杂性

// ✅ 好：直接使用简单函数
const add = (a: number, b: number) => a + b;
const result = add(1, 2);

// ✅ 好：柯里化复杂的配置函数
const createValidator = curry((rules: any[], options: any, data: any) => {
  // 复杂的验证逻辑
});

const userValidator = createValidator(userRules, validationOptions);
```

### 2. 合理使用函数组合

```typescript
// ❌ 不好：过长的组合链
const overComplicated = pipe(
  fn1, fn2, fn3, fn4, fn5, fn6, fn7, fn8, fn9, fn10
);

// ✅ 好：分段组合
const preProcess = pipe(fn1, fn2, fn3);
const mainProcess = pipe(fn4, fn5, fn6);
const postProcess = pipe(fn7, fn8, fn9);

const fullProcess = pipe(preProcess, mainProcess, postProcess);
```

### 3. 缓存柯里化函数

```typescript
// ✅ 好：缓存常用的柯里化函数
const memoizedCurry = (() => {
  const cache = new Map();
  
  return <T extends (...args: any[]) => any>(func: T) => {
    if (cache.has(func)) {
      return cache.get(func);
    }
    
    const curried = curry(func);
    cache.set(func, curried);
    return curried;
  };
})();
```

## 最佳实践

### 1. 函数命名

```typescript
// ✅ 好：清晰的函数命名
const isValidEmail = (email: string) => email.includes('@');
const formatUserName = (name: string) => name.trim().toLowerCase();
const calculateTotalPrice = (items: any[]) => items.reduce((sum, item) => sum + item.price, 0);

// ❌ 不好：模糊的函数命名
const check = (email: string) => email.includes('@');
const format = (name: string) => name.trim().toLowerCase();
const calc = (items: any[]) => items.reduce((sum, item) => sum + item.price, 0);
```

### 2. 类型安全

```typescript
// ✅ 好：明确的类型定义
interface User {
  id: string;
  name: string;
  email: string;
}

const processUser = pipe(
  (user: User) => ({ ...user, name: user.name.toUpperCase() }),
  (user: User) => ({ ...user, email: user.email.toLowerCase() })
);

// ✅ 好：泛型函数
const createMapper = <T, R>(transform: (item: T) => R) => 
  (array: T[]): R[] => array.map(transform);
```

### 3. 错误处理

```typescript
// ✅ 好：在管道中处理错误
const safeParseJSON = (str: string) => {
  try {
    return { success: true, data: JSON.parse(str) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const processJSONString = pipe(
  safeParseJSON,
  when(
    (result: any) => result.success,
    (result: any) => result.data,
    (result: any) => { throw new Error(result.error); }
  )
);
```

## 常见问题

### Q: 柯里化函数的性能如何？

A: 柯里化会带来一定的性能开销，但在大多数情况下可以忽略。对于性能敏感的代码，建议进行基准测试。

### Q: 何时使用 compose 而不是 pipe？

A: 这主要是个人偏好问题。`pipe` 更符合从左到右的阅读习惯，而 `compose` 更符合数学上的函数组合概念。

### Q: 占位符柯里化的性能如何？

A: 占位符柯里化比普通柯里化有更多的开销，建议只在确实需要跳过参数的场景中使用。

## 浏览器兼容性

支持所有现代浏览器和 Node.js 环境：
- Chrome 1+
- Firefox 1+
- Safari 1+
- Edge 12+
- IE 9+
- Node.js 0.10+

依赖的 API：
- `Function.prototype.apply`
- `Array.prototype.reduce`
- `Symbol` (仅占位符功能)