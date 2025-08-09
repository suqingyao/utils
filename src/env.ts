import process from 'node:process';

/**
 * 环境工具函数
 * @description 判断运行环境的工具函数
 */

/**
 * 判断是否在浏览器环境中
 * @returns 是否为浏览器环境
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * 判断是否在Node.js环境中
 * @returns 是否为Node.js环境
 */
export function isNode(): boolean {
  return (
    typeof process !== 'undefined'
    && process.versions != null
    && process.versions.node != null
  );
}

/**
 * 判断是否在Web Worker环境中
 * @returns 是否为Web Worker环境
 */
export function isWebWorker(): boolean {
  return (
    typeof globalThis !== 'undefined'
    && typeof (globalThis as any).importScripts === 'function'
    && typeof navigator !== 'undefined'
  );
}

/**
 * 判断是否在服务端环境中（Node.js或其他服务端运行时）
 * @returns 是否为服务端环境
 */
export function isServer(): boolean {
  return !isBrowser() && !isWebWorker();
}

/**
 * 判断是否在客户端环境中（浏览器或Web Worker）
 * @returns 是否为客户端环境
 */
export function isClient(): boolean {
  return isBrowser() || isWebWorker();
}

/**
 * 判断是否在开发环境中
 * @returns 是否为开发环境
 */
export function isDevelopment(): boolean {
  if (isBrowser()) {
    return (
      window.location.hostname === 'localhost'
      || window.location.hostname === '127.0.0.1'
      || window.location.hostname.includes('dev')
      || window.location.port !== ''
    );
  }

  if (isNode()) {
    return (
      process.env.NODE_ENV === 'development'
      || process.env.NODE_ENV === 'dev'
      || !process.env.NODE_ENV
    );
  }

  return false;
}

/**
 * 判断是否在生产环境中
 * @returns 是否为生产环境
 */
export function isProduction(): boolean {
  if (isBrowser()) {
    return (
      window.location.hostname !== 'localhost'
      && window.location.hostname !== '127.0.0.1'
      && !window.location.hostname.includes('dev')
      && window.location.port === ''
    );
  }

  if (isNode()) {
    return (
      process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod'
    );
  }

  return false;
}

/**
 * 获取当前环境类型
 * @returns 环境类型字符串
 */
export function getEnvironment(): 'browser' | 'node' | 'webworker' | 'unknown' {
  if (isBrowser())
    return 'browser';
  if (isNode())
    return 'node';
  if (isWebWorker())
    return 'webworker';
  return 'unknown';
}

/**
 * 获取用户代理字符串（仅浏览器环境）
 * @returns 用户代理字符串
 */
export function getUserAgent(): string {
  if (isBrowser()) {
    return navigator.userAgent;
  }
  return '';
}

/**
 * 判断是否为移动设备（仅浏览器环境）
 * @returns 是否为移动设备
 */
export function isMobile(): boolean {
  if (!isBrowser())
    return false;

  const userAgent = getUserAgent().toLowerCase();
  const mobileKeywords = [
    'mobile',
    'android',
    'iphone',
    'ipad',
    'ipod',
    'blackberry',
    'windows phone',
    'opera mini',
  ];

  return mobileKeywords.some(keyword => userAgent.includes(keyword));
}

/**
 * 判断是否为桌面设备（仅浏览器环境）
 * @returns 是否为桌面设备
 */
export function isDesktop(): boolean {
  return isBrowser() && !isMobile();
}

/**
 * 判断是否支持触摸（仅浏览器环境）
 * @returns 是否支持触摸
 */
export function isTouchDevice(): boolean {
  if (!isBrowser())
    return false;

  return (
    'ontouchstart' in window
    || navigator.maxTouchPoints > 0
    || (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * 获取操作系统信息（仅浏览器环境）
 * @returns 操作系统类型
 */
export function getOS():
  | 'windows'
  | 'macos'
  | 'linux'
  | 'ios'
  | 'android'
  | 'unknown' {
  if (!isBrowser())
    return 'unknown';

  const userAgent = getUserAgent().toLowerCase();

  if (userAgent.includes('windows'))
    return 'windows';
  if (userAgent.includes('mac os') || userAgent.includes('macos'))
    return 'macos';
  if (userAgent.includes('linux'))
    return 'linux';
  if (userAgent.includes('iphone') || userAgent.includes('ipad'))
    return 'ios';
  if (userAgent.includes('android'))
    return 'android';

  return 'unknown';
}

/**
 * 获取浏览器信息（仅浏览器环境）
 * @returns 浏览器类型
 */
export function getBrowser():
  | 'chrome'
  | 'firefox'
  | 'safari'
  | 'edge'
  | 'ie'
  | 'opera'
  | 'unknown' {
  if (!isBrowser())
    return 'unknown';

  const userAgent = getUserAgent().toLowerCase();

  if (userAgent.includes('chrome') && !userAgent.includes('edge'))
    return 'chrome';
  if (userAgent.includes('firefox'))
    return 'firefox';
  if (userAgent.includes('safari') && !userAgent.includes('chrome'))
    return 'safari';
  if (userAgent.includes('edge'))
    return 'edge';
  if (userAgent.includes('trident') || userAgent.includes('msie'))
    return 'ie';
  if (userAgent.includes('opera') || userAgent.includes('opr'))
    return 'opera';

  return 'unknown';
}

/**
 * 获取Node.js版本（仅Node.js环境）
 * @returns Node.js版本字符串
 */
export function getNodeVersion(): string {
  if (isNode()) {
    return process.version;
  }
  return '';
}

/**
 * 获取环境变量（仅Node.js环境）
 * @param key 环境变量名
 * @param defaultValue 默认值
 * @returns 环境变量值
 */
export function getEnvVar(key: string, defaultValue: string = ''): string {
  if (isNode()) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
}
