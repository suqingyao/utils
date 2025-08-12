/**
 * 随机数工具函数
 * @description 提供各种随机数生成功能
 */

/**
 * 生成指定范围内的随机整数
 * @param min 最小值（包含）
 * @param max 最大值（包含）
 * @returns 随机整数
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成指定范围内的随机浮点数
 * @param min 最小值（包含）
 * @param max 最大值（不包含）
 * @returns 随机浮点数
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * 生成随机布尔值
 * @param probability 为true的概率（0-1之间）
 * @returns 随机布尔值
 */
export function randomBoolean(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

/**
 * 生成指定长度的随机字符串
 * @param length 字符串长度
 * @param charset 字符集
 * @returns 随机字符串
 */
export function randomString(
  length: number,
  charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

/**
 * 生成随机字母字符串
 * @param length 字符串长度
 * @param uppercase 是否包含大写字母
 * @param lowercase 是否包含小写字母
 * @returns 随机字母字符串
 */
export function randomAlpha(
  length: number,
  uppercase: boolean = true,
  lowercase: boolean = true,
): string {
  let charset = '';
  if (uppercase)
    charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lowercase)
    charset += 'abcdefghijklmnopqrstuvwxyz';
  return randomString(length, charset);
}

/**
 * 生成随机数字字符串
 * @param length 字符串长度
 * @returns 随机数字字符串
 */
export function randomNumeric(length: number): string {
  return randomString(length, '0123456789');
}

/**
 * 生成随机字母数字字符串
 * @param length 字符串长度
 * @returns 随机字母数字字符串
 */
export function randomAlphaNumeric(length: number): string {
  return randomString(length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');
}

/**
 * 生成随机颜色（十六进制）
 * @returns 随机颜色字符串
 */
export function randomColor(): string {
  return `#${randomString(6, '0123456789ABCDEF')}`;
}

/**
 * 生成随机RGB颜色
 * @returns RGB颜色对象
 */
export function randomRGB(): { r: number; g: number; b: number } {
  return {
    r: randomInt(0, 255),
    g: randomInt(0, 255),
    b: randomInt(0, 255),
  };
}

/**
 * 生成随机HSL颜色
 * @returns HSL颜色对象
 */
export function randomHSL(): { h: number; s: number; l: number } {
  return {
    h: randomInt(0, 360),
    s: randomInt(0, 100),
    l: randomInt(0, 100),
  };
}

/**
 * 生成随机日期
 * @param start 开始日期
 * @param end 结束日期
 * @returns 随机日期
 */
export function randomDate(start: Date, end: Date): Date {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = randomFloat(startTime, endTime);
  return new Date(randomTime);
}

/**
 * 生成随机时间戳
 * @param start 开始时间戳
 * @param end 结束时间戳
 * @returns 随机时间戳
 */
export function randomTimestamp(start: number, end: number): number {
  return randomInt(start, end);
}

/**
 * 生成随机IP地址
 * @returns 随机IP地址字符串
 */
export function randomIP(): string {
  return [
    randomInt(1, 255),
    randomInt(0, 255),
    randomInt(0, 255),
    randomInt(1, 255),
  ].join('.');
}

/**
 * 生成随机MAC地址
 * @returns 随机MAC地址字符串
 */
export function randomMAC(): string {
  const hexChars = '0123456789ABCDEF';
  const segments = [];
  for (let i = 0; i < 6; i++) {
    segments.push(randomString(2, hexChars));
  }
  return segments.join(':');
}

/**
 * 生成随机UUID（v4）
 * @returns 随机UUID字符串
 */
export function randomUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 生成随机手机号（中国大陆）
 * @returns 随机手机号字符串
 */
export function randomPhoneNumber(): string {
  const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189'];
  const prefix = prefixes[randomInt(0, prefixes.length - 1)];
  const suffix = randomNumeric(8);
  return prefix + suffix;
}

/**
 * 生成随机身份证号（中国大陆）
 * @returns 随机身份证号字符串
 */
export function randomIDCard(): string {
  // 地区代码（前6位）
  const areaCodes = ['110000', '120000', '130000', '140000', '150000', '210000', '220000', '230000'];
  const areaCode = areaCodes[randomInt(0, areaCodes.length - 1)];

  // 出生日期（8位）
  const year = randomInt(1950, 2005).toString();
  const month = randomInt(1, 12).toString().padStart(2, '0');
  const day = randomInt(1, 28).toString().padStart(2, '0');
  const birthDate = year + month + day;

  // 顺序码（3位）
  const sequence = randomNumeric(3);

  // 前17位
  const first17 = areaCode + birthDate + sequence;

  // 校验码计算
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += Number.parseInt(first17[i]) * weights[i];
  }

  const checkCode = checkCodes[sum % 11];

  return first17 + checkCode;
}

/**
 * 生成随机地址
 * @returns 随机地址字符串
 */
export function randomAddress(): string {
  const provinces = ['北京市', '上海市', '广东省', '浙江省', '江苏省', '山东省', '河南省', '四川省'];
  const cities = ['市', '县'];
  const districts = ['区', '镇', '街道'];
  const roads = ['路', '街', '大道', '巷'];

  const province = provinces[randomInt(0, provinces.length - 1)];
  const city = randomAlpha(2) + cities[randomInt(0, cities.length - 1)];
  const district = randomAlpha(2) + districts[randomInt(0, districts.length - 1)];
  const road = randomAlpha(3) + roads[randomInt(0, roads.length - 1)];
  const number = `${randomInt(1, 999)}号`;

  return province + city + district + road + number;
}

/**
 * 生成随机经纬度
 * @returns 随机经纬度对象
 */
export function randomCoordinate(): { latitude: number; longitude: number } {
  return {
    latitude: randomFloat(-90, 90),
    longitude: randomFloat(-180, 180),
  };
}

/**
 * 从数组中随机选择一个元素
 * @param array 数组
 * @returns 随机选择的元素
 */
export function randomChoice<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

/**
 * 从数组中随机选择多个元素
 * @param array 数组
 * @param count 选择的数量
 * @param unique 是否去重
 * @returns 随机选择的元素数组
 */
export function randomChoices<T>(array: T[], count: number, unique: boolean = true): T[] {
  if (unique && count > array.length) {
    throw new Error('Count cannot be greater than array length when unique is true');
  }

  const result: T[] = [];
  const availableIndices = Array.from({ length: array.length }, (_, i) => i);

  for (let i = 0; i < count; i++) {
    if (unique) {
      const randomIndex = randomInt(0, availableIndices.length - 1);
      const selectedIndex = availableIndices.splice(randomIndex, 1)[0];
      result.push(array[selectedIndex]);
    }
    else {
      result.push(randomChoice(array));
    }
  }

  return result;
}

/**
 * 打乱数组顺序
 * @param array 要打乱的数组
 * @returns 打乱后的新数组
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
