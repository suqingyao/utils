# 随机工具 (Random Utils)

提供各种随机数据生成功能，包括随机数字、字符串、颜色、日期、地址等，适用于测试数据生成、模拟数据等场景。

## 导入

```typescript
import { 
  randomInt, randomFloat, randomBoolean,
  randomString, randomAlpha, randomNumeric, randomAlphaNumeric,
  randomColor, randomRGB, randomHSL,
  randomDate, randomTimestamp,
  randomIP, randomMAC, randomUUID,
  randomPhoneNumber, randomIDCard, randomAddress, randomCoordinate,
  randomChoice, randomChoices, shuffle
} from 'outils';
```

## 基础随机数

### randomInt(min, max)

生成指定范围内的随机整数。

**参数：**
- `min: number` - 最小值（包含）
- `max: number` - 最大值（包含）

**返回值：**
- `number` - 随机整数

**示例：**

```typescript
import { randomInt } from 'outils';

// 生成 1-10 之间的随机整数
const num = randomInt(1, 10);
console.log(num); // 例如：7

// 生成骰子点数
const dice = randomInt(1, 6);
console.log('骰子点数:', dice);

// 生成随机年龄
const age = randomInt(18, 65);
console.log('随机年龄:', age);
```

### randomFloat(min, max)

生成指定范围内的随机浮点数。

**参数：**
- `min: number` - 最小值（包含）
- `max: number` - 最大值（不包含）

**返回值：**
- `number` - 随机浮点数

**示例：**

```typescript
import { randomFloat } from 'outils';

// 生成 0-1 之间的随机浮点数
const num = randomFloat(0, 1);
console.log(num); // 例如：0.7234567

// 生成随机价格
const price = randomFloat(10.0, 100.0);
console.log('随机价格:', price.toFixed(2));

// 生成随机温度
const temperature = randomFloat(-10.0, 40.0);
console.log('随机温度:', temperature.toFixed(1) + '°C');
```

### randomBoolean(probability?)

生成随机布尔值。

**参数：**
- `probability?: number` - 为 `true` 的概率（0-1之间），默认为 0.5

**返回值：**
- `boolean` - 随机布尔值

**示例：**

```typescript
import { randomBoolean } from 'outils';

// 50% 概率为 true
const coin = randomBoolean();
console.log('硬币:', coin ? '正面' : '反面');

// 30% 概率为 true
const isVip = randomBoolean(0.3);
console.log('是否VIP:', isVip);

// 80% 概率为 true
const isOnline = randomBoolean(0.8);
console.log('是否在线:', isOnline);
```

## 随机字符串

### randomString(length, charset?)

生成指定长度的随机字符串。

**参数：**
- `length: number` - 字符串长度
- `charset?: string` - 字符集，默认为字母数字组合

**返回值：**
- `string` - 随机字符串

**示例：**

```typescript
import { randomString } from 'outils';

// 生成 10 位随机字符串
const id = randomString(10);
console.log('随机ID:', id); // 例如："aBc123XyZ9"

// 使用自定义字符集
const code = randomString(6, '0123456789');
console.log('验证码:', code); // 例如："123456"

// 生成密码
const password = randomString(12, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*');
console.log('随机密码:', password);
```

### randomAlpha(length, uppercase?, lowercase?)

生成随机字母字符串。

**参数：**
- `length: number` - 字符串长度
- `uppercase?: boolean` - 是否包含大写字母，默认为 `true`
- `lowercase?: boolean` - 是否包含小写字母，默认为 `true`

**返回值：**
- `string` - 随机字母字符串

**示例：**

```typescript
import { randomAlpha } from 'outils';

// 生成混合大小写字母
const name = randomAlpha(8);
console.log('随机名称:', name); // 例如："AbCdEfGh"

// 只生成大写字母
const upperCode = randomAlpha(5, true, false);
console.log('大写代码:', upperCode); // 例如："ABCDE"

// 只生成小写字母
const lowerName = randomAlpha(6, false, true);
console.log('小写名称:', lowerName); // 例如："abcdef"
```

### randomNumeric(length)

生成随机数字字符串。

**参数：**
- `length: number` - 字符串长度

**返回值：**
- `string` - 随机数字字符串

**示例：**

```typescript
import { randomNumeric } from 'outils';

// 生成 6 位数字验证码
const verifyCode = randomNumeric(6);
console.log('验证码:', verifyCode); // 例如："123456"

// 生成订单号后缀
const orderSuffix = randomNumeric(8);
console.log('订单号后缀:', orderSuffix);

// 生成随机PIN码
const pin = randomNumeric(4);
console.log('PIN码:', pin);
```

### randomAlphaNumeric(length)

生成随机字母数字字符串。

**参数：**
- `length: number` - 字符串长度

**返回值：**
- `string` - 随机字母数字字符串

**示例：**

```typescript
import { randomAlphaNumeric } from 'outils';

// 生成用户ID
const userId = randomAlphaNumeric(10);
console.log('用户ID:', userId); // 例如："A1b2C3d4E5"

// 生成会话令牌
const token = randomAlphaNumeric(32);
console.log('令牌:', token);

// 生成邀请码
const inviteCode = randomAlphaNumeric(8);
console.log('邀请码:', inviteCode);
```

## 随机颜色

### randomColor()

生成随机颜色（十六进制格式）。

**返回值：**
- `string` - 十六进制颜色字符串

**示例：**

```typescript
import { randomColor } from 'outils';

// 生成随机颜色
const color = randomColor();
console.log('随机颜色:', color); // 例如："#FF5733"

// 为元素设置随机背景色
const element = document.getElementById('box');
if (element) {
  element.style.backgroundColor = randomColor();
}

// 生成调色板
const palette = Array.from({ length: 5 }, () => randomColor());
console.log('调色板:', palette);
```

### randomRGB()

生成随机RGB颜色。

**返回值：**
- `{ r: number; g: number; b: number }` - RGB颜色对象

**示例：**

```typescript
import { randomRGB } from 'outils';

// 生成随机RGB颜色
const rgb = randomRGB();
console.log('RGB颜色:', rgb); // 例如：{ r: 255, g: 87, b: 51 }

// 转换为CSS格式
const cssColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
console.log('CSS颜色:', cssColor);

// 计算亮度
const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
console.log('亮度:', brightness);
```

### randomHSL()

生成随机HSL颜色。

**返回值：**
- `{ h: number; s: number; l: number }` - HSL颜色对象

**示例：**

```typescript
import { randomHSL } from 'outils';

// 生成随机HSL颜色
const hsl = randomHSL();
console.log('HSL颜色:', hsl); // 例如：{ h: 210, s: 75, l: 60 }

// 转换为CSS格式
const cssColor = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
console.log('CSS颜色:', cssColor);

// 生成同色系颜色
const similarColors = Array.from({ length: 3 }, () => {
  const base = randomHSL();
  return {
    h: base.h,
    s: randomInt(base.s - 20, base.s + 20),
    l: randomInt(base.l - 30, base.l + 30)
  };
});
```

## 随机日期时间

### randomDate(start, end)

生成指定范围内的随机日期。

**参数：**
- `start: Date` - 开始日期
- `end: Date` - 结束日期

**返回值：**
- `Date` - 随机日期

**示例：**

```typescript
import { randomDate } from 'outils';

// 生成今年内的随机日期
const startOfYear = new Date('2024-01-01');
const endOfYear = new Date('2024-12-31');
const randomDay = randomDate(startOfYear, endOfYear);
console.log('随机日期:', randomDay.toLocaleDateString());

// 生成过去30天内的随机日期
const now = new Date();
const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
const recentDate = randomDate(thirtyDaysAgo, now);
console.log('最近日期:', recentDate.toLocaleDateString());

// 生成生日
const birthStart = new Date('1980-01-01');
const birthEnd = new Date('2000-12-31');
const birthday = randomDate(birthStart, birthEnd);
console.log('随机生日:', birthday.toLocaleDateString());
```

### randomTimestamp(start, end)

生成指定范围内的随机时间戳。

**参数：**
- `start: number` - 开始时间戳
- `end: number` - 结束时间戳

**返回值：**
- `number` - 随机时间戳

**示例：**

```typescript
import { randomTimestamp } from 'outils';

// 生成过去一周内的随机时间戳
const now = Date.now();
const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
const randomTime = randomTimestamp(weekAgo, now);
console.log('随机时间:', new Date(randomTime).toLocaleString());

// 生成未来一个月内的随机时间戳
const monthLater = now + 30 * 24 * 60 * 60 * 1000;
const futureTime = randomTimestamp(now, monthLater);
console.log('未来时间:', new Date(futureTime).toLocaleString());
```

## 网络相关

### randomIP()

生成随机IP地址。

**返回值：**
- `string` - 随机IP地址字符串

**示例：**

```typescript
import { randomIP } from 'outils';

// 生成随机IP地址
const ip = randomIP();
console.log('随机IP:', ip); // 例如："192.168.1.100"

// 生成多个IP地址
const ips = Array.from({ length: 5 }, () => randomIP());
console.log('IP列表:', ips);

// 模拟访问日志
const accessLog = {
  ip: randomIP(),
  timestamp: new Date().toISOString(),
  userAgent: 'Mozilla/5.0...',
  path: '/api/users'
};
console.log('访问日志:', accessLog);
```

### randomMAC()

生成随机MAC地址。

**返回值：**
- `string` - 随机MAC地址字符串

**示例：**

```typescript
import { randomMAC } from 'outils';

// 生成随机MAC地址
const mac = randomMAC();
console.log('随机MAC:', mac); // 例如："A1:B2:C3:D4:E5:F6"

// 生成设备信息
const device = {
  id: randomUUID(),
  mac: randomMAC(),
  ip: randomIP(),
  name: `Device-${randomAlphaNumeric(6)}`
};
console.log('设备信息:', device);
```

### randomUUID()

生成随机UUID（v4）。

**返回值：**
- `string` - 随机UUID字符串

**示例：**

```typescript
import { randomUUID } from 'outils';

// 生成随机UUID
const uuid = randomUUID();
console.log('随机UUID:', uuid); // 例如："f47ac10b-58cc-4372-a567-0e02b2c3d479"

// 生成用户记录
const user = {
  id: randomUUID(),
  name: randomAlpha(8),
  email: `${randomAlpha(6).toLowerCase()}@example.com`,
  createdAt: new Date().toISOString()
};
console.log('用户记录:', user);

// 生成文件名
const fileName = `file_${randomUUID()}.txt`;
console.log('文件名:', fileName);
```

## 中国大陆数据

### randomPhoneNumber()

生成随机手机号（中国大陆）。

**返回值：**
- `string` - 随机手机号字符串

**示例：**

```typescript
import { randomPhoneNumber } from 'outils';

// 生成随机手机号
const phone = randomPhoneNumber();
console.log('随机手机号:', phone); // 例如："13812345678"

// 生成联系人信息
const contact = {
  name: randomAlpha(3),
  phone: randomPhoneNumber(),
  address: randomAddress()
};
console.log('联系人:', contact);

// 格式化手机号
function formatPhone(phone: string): string {
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
}

const formattedPhone = formatPhone(randomPhoneNumber());
console.log('格式化手机号:', formattedPhone);
```

### randomIDCard()

生成随机身份证号（中国大陆）。

**返回值：**
- `string` - 随机身份证号字符串

**示例：**

```typescript
import { randomIDCard } from 'outils';

// 生成随机身份证号
const idCard = randomIDCard();
console.log('随机身份证号:', idCard); // 例如："11000019801201001X"

// 解析身份证信息
function parseIDCard(idCard: string) {
  const year = idCard.substring(6, 10);
  const month = idCard.substring(10, 12);
  const day = idCard.substring(12, 14);
  const gender = parseInt(idCard.substring(16, 17)) % 2 === 0 ? '女' : '男';
  
  return {
    birthday: `${year}-${month}-${day}`,
    gender,
    age: new Date().getFullYear() - parseInt(year)
  };
}

const info = parseIDCard(randomIDCard());
console.log('身份证信息:', info);
```

### randomAddress()

生成随机地址。

**返回值：**
- `string` - 随机地址字符串

**示例：**

```typescript
import { randomAddress } from 'outils';

// 生成随机地址
const address = randomAddress();
console.log('随机地址:', address); // 例如："北京市朝阳区三里屯街道123号"

// 生成收货地址
const shippingAddress = {
  recipient: randomAlpha(3),
  phone: randomPhoneNumber(),
  address: randomAddress(),
  zipCode: randomNumeric(6)
};
console.log('收货地址:', shippingAddress);

// 生成多个地址
const addresses = Array.from({ length: 3 }, () => randomAddress());
console.log('地址列表:', addresses);
```

### randomCoordinate()

生成随机经纬度。

**返回值：**
- `{ latitude: number; longitude: number }` - 随机经纬度对象

**示例：**

```typescript
import { randomCoordinate } from 'outils';

// 生成随机经纬度
const coord = randomCoordinate();
console.log('随机坐标:', coord); // 例如：{ latitude: 39.9042, longitude: 116.4074 }

// 生成地点信息
const location = {
  name: randomAlpha(6),
  address: randomAddress(),
  coordinate: randomCoordinate()
};
console.log('地点信息:', location);

// 计算两点距离（简化版）
function calculateDistance(coord1: any, coord2: any): number {
  const R = 6371; // 地球半径（公里）
  const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const coord1 = randomCoordinate();
const coord2 = randomCoordinate();
const distance = calculateDistance(coord1, coord2);
console.log('两点距离:', distance.toFixed(2) + 'km');
```

## 数组操作

### randomChoice(array)

从数组中随机选择一个元素。

**参数：**
- `array: T[]` - 源数组

**返回值：**
- `T` - 随机选择的元素

**示例：**

```typescript
import { randomChoice } from 'outils';

// 从数组中随机选择
const colors = ['red', 'green', 'blue', 'yellow', 'purple'];
const randomColor = randomChoice(colors);
console.log('随机颜色:', randomColor);

// 随机选择用户
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' }
];
const randomUser = randomChoice(users);
console.log('随机用户:', randomUser);

// 随机选择配置
const configs = ['development', 'staging', 'production'];
const env = randomChoice(configs);
console.log('随机环境:', env);
```

### randomChoices(array, count, unique?)

从数组中随机选择多个元素。

**参数：**
- `array: T[]` - 源数组
- `count: number` - 选择的数量
- `unique?: boolean` - 是否去重，默认为 `true`

**返回值：**
- `T[]` - 随机选择的元素数组

**示例：**

```typescript
import { randomChoices } from 'outils';

// 随机选择多个不重复元素
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const lottery = randomChoices(numbers, 3, true);
console.log('彩票号码:', lottery); // 例如：[3, 7, 9]

// 随机选择可重复元素
const dice = randomChoices([1, 2, 3, 4, 5, 6], 3, false);
console.log('骰子结果:', dice); // 例如：[2, 2, 5]

// 随机选择标签
const allTags = ['javascript', 'typescript', 'react', 'vue', 'angular', 'node'];
const selectedTags = randomChoices(allTags, 3);
console.log('选中标签:', selectedTags);

// 随机分组
const students = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank'];
const team1 = randomChoices(students, 3);
const team2 = students.filter(s => !team1.includes(s));
console.log('团队1:', team1);
console.log('团队2:', team2);
```

### shuffle(array)

打乱数组顺序。

**参数：**
- `array: T[]` - 要打乱的数组

**返回值：**
- `T[]` - 打乱后的新数组

**示例：**

```typescript
import { shuffle } from 'outils';

// 打乱数组
const cards = ['A', 'K', 'Q', 'J', '10', '9', '8', '7'];
const shuffledCards = shuffle(cards);
console.log('原数组:', cards);
console.log('打乱后:', shuffledCards);

// 随机排序播放列表
const playlist = [
  { title: 'Song 1', artist: 'Artist A' },
  { title: 'Song 2', artist: 'Artist B' },
  { title: 'Song 3', artist: 'Artist C' },
  { title: 'Song 4', artist: 'Artist D' }
];
const randomPlaylist = shuffle(playlist);
console.log('随机播放列表:', randomPlaylist);

// 随机排序问题
const questions = [
  'What is 2+2?',
  'What is the capital of France?',
  'What is the largest planet?',
  'What is H2O?'
];
const randomQuestions = shuffle(questions);
console.log('随机问题顺序:', randomQuestions);
```

## 实际应用场景

### 1. 测试数据生成

```typescript
import { 
  randomString, randomInt, randomEmail, randomPhoneNumber,
  randomDate, randomChoice, randomUUID 
} from 'outils';

// 生成用户测试数据
function generateTestUser() {
  const genders = ['male', 'female'];
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];
  
  return {
    id: randomUUID(),
    username: randomAlphaNumeric(8).toLowerCase(),
    email: `${randomAlpha(6).toLowerCase()}@example.com`,
    phone: randomPhoneNumber(),
    age: randomInt(22, 65),
    gender: randomChoice(genders),
    department: randomChoice(departments),
    salary: randomInt(50000, 200000),
    joinDate: randomDate(
      new Date('2020-01-01'),
      new Date()
    ),
    isActive: randomBoolean(0.9)
  };
}

// 生成测试用户列表
const testUsers = Array.from({ length: 100 }, generateTestUser);
console.log('测试用户数据:', testUsers.slice(0, 5));
```

### 2. 模拟数据服务

```typescript
import { 
  randomInt, randomFloat, randomChoice, randomDate,
  randomColor, randomCoordinate 
} from 'outils';

// 模拟商品数据
class MockProductService {
  private categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'];
  private brands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony'];
  
  generateProduct() {
    return {
      id: randomUUID(),
      name: `Product ${randomAlphaNumeric(6)}`,
      category: randomChoice(this.categories),
      brand: randomChoice(this.brands),
      price: parseFloat(randomFloat(10, 1000).toFixed(2)),
      discount: randomInt(0, 50),
      rating: parseFloat(randomFloat(1, 5).toFixed(1)),
      reviews: randomInt(0, 1000),
      inStock: randomBoolean(0.8),
      color: randomColor(),
      createdAt: randomDate(
        new Date('2023-01-01'),
        new Date()
      )
    };
  }
  
  generateProducts(count: number) {
    return Array.from({ length: count }, () => this.generateProduct());
  }
}

const productService = new MockProductService();
const products = productService.generateProducts(20);
console.log('模拟商品:', products.slice(0, 3));
```

### 3. 游戏开发

```typescript
import { 
  randomInt, randomFloat, randomChoice, randomBoolean,
  shuffle, randomChoices 
} from 'outils';

// 游戏角色生成器
class CharacterGenerator {
  private names = ['Warrior', 'Mage', 'Archer', 'Rogue', 'Paladin'];
  private weapons = ['Sword', 'Staff', 'Bow', 'Dagger', 'Hammer'];
  private skills = ['Fireball', 'Heal', 'Stealth', 'Shield', 'Lightning'];
  
  generateCharacter() {
    return {
      name: randomChoice(this.names),
      level: randomInt(1, 100),
      health: randomInt(100, 1000),
      mana: randomInt(50, 500),
      strength: randomInt(10, 100),
      agility: randomInt(10, 100),
      intelligence: randomInt(10, 100),
      weapon: randomChoice(this.weapons),
      skills: randomChoices(this.skills, 3),
      criticalChance: randomFloat(0.05, 0.25),
      isElite: randomBoolean(0.1)
    };
  }
  
  // 生成战斗结果
  simulateBattle(char1: any, char2: any) {
    const char1Power = char1.strength + char1.agility + char1.intelligence;
    const char2Power = char2.strength + char2.agility + char2.intelligence;
    
    // 添加随机因素
    const char1Final = char1Power * randomFloat(0.8, 1.2);
    const char2Final = char2Power * randomFloat(0.8, 1.2);
    
    return {
      winner: char1Final > char2Final ? char1.name : char2.name,
      damage: randomInt(50, 200),
      criticalHit: randomBoolean(0.15),
      battleDuration: randomInt(30, 300) // 秒
    };
  }
}

const generator = new CharacterGenerator();
const hero = generator.generateCharacter();
const enemy = generator.generateCharacter();
const battle = generator.simulateBattle(hero, enemy);

console.log('英雄:', hero);
console.log('敌人:', enemy);
console.log('战斗结果:', battle);
```

### 4. A/B 测试

```typescript
import { randomBoolean, randomChoice, randomInt } from 'outils';

// A/B 测试分组
class ABTestManager {
  private experiments = new Map<string, any>();
  
  // 创建实验
  createExperiment(name: string, variants: string[], weights?: number[]) {
    this.experiments.set(name, {
      variants,
      weights: weights || variants.map(() => 1 / variants.length)
    });
  }
  
  // 获取用户分组
  getVariant(experimentName: string, userId: string): string {
    const experiment = this.experiments.get(experimentName);
    if (!experiment) {
      throw new Error(`Experiment ${experimentName} not found`);
    }
    
    // 基于用户ID的确定性分组（实际应用中）
    // 这里为演示使用随机分组
    return randomChoice(experiment.variants);
  }
  
  // 模拟实验结果
  simulateResults(experimentName: string, userCount: number) {
    const results = new Map<string, number>();
    
    for (let i = 0; i < userCount; i++) {
      const variant = this.getVariant(experimentName, `user_${i}`);
      results.set(variant, (results.get(variant) || 0) + 1);
    }
    
    return Object.fromEntries(results);
  }
}

// 使用示例
const abTest = new ABTestManager();

// 创建按钮颜色实验
abTest.createExperiment('button_color', ['red', 'blue', 'green']);

// 创建页面布局实验
abTest.createExperiment('page_layout', ['layout_a', 'layout_b'], [0.7, 0.3]);

// 模拟1000个用户的分组结果
const colorResults = abTest.simulateResults('button_color', 1000);
const layoutResults = abTest.simulateResults('page_layout', 1000);

console.log('按钮颜色实验结果:', colorResults);
console.log('页面布局实验结果:', layoutResults);
```

### 5. 性能测试数据

```typescript
import { 
  randomInt, randomFloat, randomString, randomDate,
  randomIP, randomChoice 
} from 'outils';

// 性能测试数据生成器
class PerformanceDataGenerator {
  // 生成HTTP请求日志
  generateRequestLog() {
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    const statusCodes = [200, 201, 400, 401, 403, 404, 500];
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
    ];
    
    return {
      timestamp: randomDate(
        new Date(Date.now() - 24 * 60 * 60 * 1000),
        new Date()
      ).toISOString(),
      method: randomChoice(methods),
      url: `/api/${randomString(8)}`,
      statusCode: randomChoice(statusCodes),
      responseTime: randomInt(10, 2000), // ms
      bodySize: randomInt(100, 10000), // bytes
      ip: randomIP(),
      userAgent: randomChoice(userAgents),
      userId: randomString(10)
    };
  }
  
  // 生成系统指标
  generateSystemMetrics() {
    return {
      timestamp: new Date().toISOString(),
      cpu: {
        usage: randomFloat(0, 100),
        cores: randomInt(2, 16)
      },
      memory: {
        used: randomFloat(0, 16), // GB
        total: randomChoice([8, 16, 32, 64]),
        usage: randomFloat(0, 90) // %
      },
      disk: {
        used: randomFloat(0, 500), // GB
        total: randomChoice([256, 512, 1024]),
        iops: randomInt(100, 10000)
      },
      network: {
        inbound: randomFloat(0, 1000), // Mbps
        outbound: randomFloat(0, 1000),
        connections: randomInt(10, 1000)
      }
    };
  }
  
  // 生成负载测试场景
  generateLoadTestScenario(duration: number, rps: number) {
    const requests = [];
    const intervalMs = 1000 / rps;
    
    for (let i = 0; i < duration * rps; i++) {
      requests.push({
        id: i + 1,
        timestamp: new Date(Date.now() + i * intervalMs).toISOString(),
        ...this.generateRequestLog()
      });
    }
    
    return requests;
  }
}

const generator = new PerformanceDataGenerator();

// 生成请求日志
const requestLogs = Array.from({ length: 100 }, () => 
  generator.generateRequestLog()
);
console.log('请求日志样本:', requestLogs.slice(0, 3));

// 生成系统指标
const systemMetrics = generator.generateSystemMetrics();
console.log('系统指标:', systemMetrics);

// 生成负载测试场景（10秒，每秒50个请求）
const loadTest = generator.generateLoadTestScenario(10, 50);
console.log('负载测试请求数:', loadTest.length);
```

## 性能优化建议

### 1. 缓存随机种子

```typescript
// ✅ 好：缓存计算结果
class OptimizedRandomGenerator {
  private static stringCache = new Map<string, string[]>();
  
  static getRandomStrings(length: number, count: number): string[] {
    const key = `${length}_${count}`;
    
    if (!this.stringCache.has(key)) {
      const strings = Array.from({ length: count }, () => 
        randomString(length)
      );
      this.stringCache.set(key, strings);
    }
    
    return this.stringCache.get(key)!;
  }
}

// ❌ 不好：重复计算
function generateManyStrings() {
  return Array.from({ length: 1000 }, () => randomString(10));
}
```

### 2. 批量生成

```typescript
// ✅ 好：批量生成
function generateBatchData(count: number) {
  const users = [];
  const colors = Array.from({ length: 10 }, () => randomColor());
  const names = Array.from({ length: 20 }, () => randomAlpha(6));
  
  for (let i = 0; i < count; i++) {
    users.push({
      id: i,
      name: randomChoice(names),
      color: randomChoice(colors),
      age: randomInt(18, 65)
    });
  }
  
  return users;
}

// ❌ 不好：单个生成
function generateSingleData(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: randomAlpha(6),
    color: randomColor(),
    age: randomInt(18, 65)
  }));
}
```

### 3. 合理使用字符集

```typescript
// ✅ 好：预定义字符集
const CHARSETS = {
  NUMERIC: '0123456789',
  ALPHA_LOWER: 'abcdefghijklmnopqrstuvwxyz',
  ALPHA_UPPER: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  ALPHA: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  ALPHANUMERIC: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
};

function fastRandomString(length: number, type: keyof typeof CHARSETS) {
  return randomString(length, CHARSETS[type]);
}

// ❌ 不好：每次构建字符集
function slowRandomString(length: number) {
  const charset = 'ABCD...'; // 每次都重新定义
  return randomString(length, charset);
}
```

## 常见问题

### Q: 如何确保随机数的质量？

A: JavaScript 的 `Math.random()` 对大多数应用场景足够，但对于加密或高质量随机数需求，建议使用 `crypto.getRandomValues()`：

```typescript
// 高质量随机数（浏览器环境）
function cryptoRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const maxValue = Math.pow(256, bytesNeeded);
  const randomBytes = new Uint8Array(bytesNeeded);
  
  crypto.getRandomValues(randomBytes);
  
  let randomValue = 0;
  for (let i = 0; i < bytesNeeded; i++) {
    randomValue = randomValue * 256 + randomBytes[i];
  }
  
  return min + (randomValue % range);
}
```

### Q: 如何生成可重现的随机序列？

A: 可以使用种子随机数生成器：

```typescript
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  randomInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

const rng = new SeededRandom(12345);
console.log(rng.randomInt(1, 10)); // 总是相同的序列
```

### Q: 如何生成符合特定分布的随机数？

A: 可以使用变换方法：

```typescript
// 正态分布（Box-Muller变换）
function randomNormal(mean: number = 0, stdDev: number = 1): number {
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); // 避免 log(0)
  while(v === 0) v = Math.random();
  
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return z * stdDev + mean;
}

// 指数分布
function randomExponential(lambda: number): number {
  return -Math.log(1 - Math.random()) / lambda;
}

// 泊松分布
function randomPoisson(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  
  return k - 1;
}
```

### Q: 如何优化大量随机数据的生成性能？

A: 使用 Web Workers 进行并行生成：

```typescript
// 主线程
class ParallelRandomGenerator {
  private workers: Worker[] = [];
  
  constructor(workerCount: number = 4) {
    for (let i = 0; i < workerCount; i++) {
      const worker = new Worker('random-worker.js');
      this.workers.push(worker);
    }
  }
  
  async generateBatch(count: number): Promise<any[]> {
    const batchSize = Math.ceil(count / this.workers.length);
    const promises = this.workers.map((worker, index) => {
      return new Promise(resolve => {
        worker.postMessage({ 
          type: 'generate', 
          count: batchSize,
          seed: Date.now() + index 
        });
        worker.onmessage = (e) => resolve(e.data);
      });
    });
    
    const results = await Promise.all(promises);
    return results.flat().slice(0, count);
  }
}

// random-worker.js
self.onmessage = function(e) {
  const { count, seed } = e.data;
  const results = [];
  
  // 使用种子初始化随机数生成器
  Math.seedrandom(seed);
  
  for (let i = 0; i < count; i++) {
    results.push({
      id: Math.random().toString(36),
      value: Math.random() * 1000,
      timestamp: Date.now()
    });
  }
  
  self.postMessage(results);
};
```

## 浏览器兼容性

支持所有现代浏览器和 Node.js 环境：
- Chrome 1+ (基础 Math.random 支持)
- Firefox 1+ (基础 Math.random 支持)
- Safari 1+ (基础 Math.random 支持)
- Edge 12+ (基础 Math.random 支持)
- IE 9+ (基础 Math.random 支持)
- Node.js 0.10+ (基础 Math.random 支持)

依赖的 API：
- `Math.random()` - 基础随机数生成
- `Math.floor()`, `Math.ceil()` - 数学运算
- `Array.from()` - 数组生成（ES6+）
- `String.prototype.charAt()` - 字符串操作
- `Date` 构造函数 - 日期处理