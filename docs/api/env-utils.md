# 环境工具 (Environment Utils)

提供判断运行环境、设备类型、操作系统、浏览器等信息的工具函数，帮助编写跨平台兼容的代码。

## 导入

```typescript
import { 
  isBrowser, isNode, isWebWorker, isServer, isClient,
  isDevelopment, isProduction, isTest,
  getEnvironment, getUserAgent,
  isMobile, isDesktop, isTouchDevice,
  getOS, getBrowser, getNodeVersion, getEnvVar
} from 'outils';
```

## 运行环境检测

### isBrowser()

判断是否在浏览器环境中运行。

**返回值：**
- `boolean` - 是否为浏览器环境

**示例：**

```typescript
import { isBrowser } from 'outils';

if (isBrowser()) {
  console.log('运行在浏览器中');
  // 可以安全使用 window、document 等浏览器 API
  document.title = '我的应用';
  window.localStorage.setItem('key', 'value');
}
```

### isNode()

判断是否在 Node.js 环境中运行。

**返回值：**
- `boolean` - 是否为 Node.js 环境

**示例：**

```typescript
import { isNode } from 'outils';

if (isNode()) {
  console.log('运行在 Node.js 中');
  // 可以安全使用 process、require 等 Node.js API
  console.log('Node.js 版本:', process.version);
  const fs = require('fs');
}
```

### isWebWorker()

判断是否在 Web Worker 环境中运行。

**返回值：**
- `boolean` - 是否为 Web Worker 环境

**示例：**

```typescript
import { isWebWorker } from 'outils';

if (isWebWorker()) {
  console.log('运行在 Web Worker 中');
  // 可以使用 self、importScripts 等 Worker API
  self.postMessage({ type: 'ready' });
}
```

### isServer()

判断是否在服务端环境中运行（Node.js 或其他服务端运行时）。

**返回值：**
- `boolean` - 是否为服务端环境

**示例：**

```typescript
import { isServer } from 'outils';

if (isServer()) {
  console.log('运行在服务端');
  // 服务端特有的逻辑
  // 例如：数据库连接、文件系统操作等
}
```

### isClient()

判断是否在客户端环境中运行（浏览器或 Web Worker）。

**返回值：**
- `boolean` - 是否为客户端环境

**示例：**

```typescript
import { isClient } from 'outils';

if (isClient()) {
  console.log('运行在客户端');
  // 客户端特有的逻辑
  // 例如：DOM 操作、用户交互等
}
```

### getEnvironment()

获取当前运行环境的类型。

**返回值：**
- `'browser' | 'node' | 'webworker' | 'unknown'` - 环境类型字符串

**示例：**

```typescript
import { getEnvironment } from 'outils';

const env = getEnvironment();
console.log('当前环境:', env);

switch (env) {
  case 'browser':
    console.log('浏览器环境');
    break;
  case 'node':
    console.log('Node.js 环境');
    break;
  case 'webworker':
    console.log('Web Worker 环境');
    break;
  default:
    console.log('未知环境');
}
```

## 环境模式检测

### isDevelopment()

判断是否在开发环境中运行。

**检测规则：**
- **浏览器环境：** 检查 hostname 是否为 localhost、127.0.0.1、包含 'dev' 或有端口号
- **Node.js 环境：** 检查 `NODE_ENV` 是否为 'development'、'dev' 或未设置

**返回值：**
- `boolean` - 是否为开发环境

**示例：**

```typescript
import { isDevelopment } from 'outils';

if (isDevelopment()) {
  console.log('开发环境');
  // 开发环境特有的逻辑
  console.log('启用调试模式');
  window.DEBUG = true;
}
```

### isProduction()

判断是否在生产环境中运行。

**检测规则：**
- **浏览器环境：** 检查 hostname 不是本地地址且没有端口号
- **Node.js 环境：** 检查 `NODE_ENV` 是否为 'production' 或 'prod'

**返回值：**
- `boolean` - 是否为生产环境

**示例：**

```typescript
import { isProduction } from 'outils';

if (isProduction()) {
  console.log('生产环境');
  // 生产环境特有的逻辑
  // 例如：错误上报、性能监控等
}
```

### isTest()

判断是否在测试环境中运行。

**检测规则：**
- **Node.js 环境：** 检查 `NODE_ENV` 是否为 'test'、'testing' 或全局对象中是否有测试框架标识

**返回值：**
- `boolean` - 是否为测试环境

**示例：**

```typescript
import { isTest } from 'outils';

if (isTest()) {
  console.log('测试环境');
  // 测试环境特有的逻辑
  // 例如：模拟数据、测试配置等
}
```

## 浏览器信息检测

### getUserAgent()

获取用户代理字符串（仅浏览器环境）。

**返回值：**
- `string` - 用户代理字符串，非浏览器环境返回空字符串

**示例：**

```typescript
import { getUserAgent } from 'outils';

const userAgent = getUserAgent();
console.log('User Agent:', userAgent);

// 示例输出：
// "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36..."
```

### getBrowser()

获取浏览器类型（仅浏览器环境）。

**返回值：**
- `'chrome' | 'firefox' | 'safari' | 'edge' | 'ie' | 'opera' | 'unknown'` - 浏览器类型

**示例：**

```typescript
import { getBrowser } from 'outils';

const browser = getBrowser();
console.log('浏览器:', browser);

switch (browser) {
  case 'chrome':
    console.log('Chrome 浏览器');
    break;
  case 'firefox':
    console.log('Firefox 浏览器');
    break;
  case 'safari':
    console.log('Safari 浏览器');
    break;
  case 'edge':
    console.log('Edge 浏览器');
    break;
  case 'ie':
    console.log('Internet Explorer');
    break;
  case 'opera':
    console.log('Opera 浏览器');
    break;
  default:
    console.log('未知浏览器');
}
```

## 设备类型检测

### isMobile()

判断是否为移动设备（仅浏览器环境）。

**检测规则：** 通过 User Agent 检测是否包含移动设备关键词

**返回值：**
- `boolean` - 是否为移动设备

**示例：**

```typescript
import { isMobile } from 'outils';

if (isMobile()) {
  console.log('移动设备');
  // 移动设备特有的逻辑
  document.body.classList.add('mobile');
  // 启用触摸手势
} else {
  console.log('非移动设备');
  document.body.classList.add('desktop');
}
```

### isDesktop()

判断是否为桌面设备（仅浏览器环境）。

**返回值：**
- `boolean` - 是否为桌面设备

**示例：**

```typescript
import { isDesktop } from 'outils';

if (isDesktop()) {
  console.log('桌面设备');
  // 桌面设备特有的逻辑
  // 例如：键盘快捷键、右键菜单等
}
```

### isTouchDevice()

判断是否支持触摸操作（仅浏览器环境）。

**检测规则：** 检查是否支持触摸事件和触摸点

**返回值：**
- `boolean` - 是否支持触摸

**示例：**

```typescript
import { isTouchDevice } from 'outils';

if (isTouchDevice()) {
  console.log('支持触摸');
  // 启用触摸相关功能
  document.addEventListener('touchstart', handleTouch);
} else {
  console.log('不支持触摸');
  // 使用鼠标事件
  document.addEventListener('mousedown', handleMouse);
}
```

### getOS()

获取操作系统信息（仅浏览器环境）。

**返回值：**
- `'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'unknown'` - 操作系统类型

**示例：**

```typescript
import { getOS } from 'outils';

const os = getOS();
console.log('操作系统:', os);

switch (os) {
  case 'windows':
    console.log('Windows 系统');
    break;
  case 'macos':
    console.log('macOS 系统');
    break;
  case 'linux':
    console.log('Linux 系统');
    break;
  case 'ios':
    console.log('iOS 系统');
    break;
  case 'android':
    console.log('Android 系统');
    break;
  default:
    console.log('未知系统');
}
```

## Node.js 环境工具

### getNodeVersion()

获取 Node.js 版本（仅 Node.js 环境）。

**返回值：**
- `string` - Node.js 版本字符串，非 Node.js 环境返回空字符串

**示例：**

```typescript
import { getNodeVersion } from 'outils';

const nodeVersion = getNodeVersion();
if (nodeVersion) {
  console.log('Node.js 版本:', nodeVersion); // 例如："v18.17.0"
  
  // 版本比较
  const majorVersion = parseInt(nodeVersion.slice(1));
  if (majorVersion >= 18) {
    console.log('支持最新特性');
  }
}
```

### getEnvVar(key, defaultValue?)

获取环境变量（仅 Node.js 环境）。

**参数：**
- `key: string` - 环境变量名
- `defaultValue?: string` - 默认值，默认为空字符串

**返回值：**
- `string` - 环境变量值或默认值

**示例：**

```typescript
import { getEnvVar } from 'outils';

// 获取环境变量
const port = getEnvVar('PORT', '3000');
const dbUrl = getEnvVar('DATABASE_URL', 'localhost:5432');
const apiKey = getEnvVar('API_KEY');

console.log('端口:', port);
console.log('数据库URL:', dbUrl);
console.log('API密钥:', apiKey || '未设置');

// 实际应用
const config = {
  port: parseInt(getEnvVar('PORT', '3000')),
  env: getEnvVar('NODE_ENV', 'development'),
  debug: getEnvVar('DEBUG', 'false') === 'true',
  dbUrl: getEnvVar('DATABASE_URL', 'sqlite://./dev.db')
};
```

## 实际应用场景

### 1. 跨平台代码适配

```typescript
import { isBrowser, isNode, isWebWorker } from 'outils';

// 统一的存储接口
class Storage {
  static set(key: string, value: string): void {
    if (isBrowser()) {
      localStorage.setItem(key, value);
    } else if (isNode()) {
      // Node.js 环境使用文件系统
      const fs = require('fs');
      const path = require('path');
      const storageFile = path.join(process.cwd(), '.storage.json');
      
      let data = {};
      try {
        data = JSON.parse(fs.readFileSync(storageFile, 'utf8'));
      } catch {}
      
      data[key] = value;
      fs.writeFileSync(storageFile, JSON.stringify(data, null, 2));
    } else if (isWebWorker()) {
      // Web Worker 环境使用内存存储
      (self as any).storage = (self as any).storage || {};
      (self as any).storage[key] = value;
    }
  }
  
  static get(key: string): string | null {
    if (isBrowser()) {
      return localStorage.getItem(key);
    } else if (isNode()) {
      const fs = require('fs');
      const path = require('path');
      const storageFile = path.join(process.cwd(), '.storage.json');
      
      try {
        const data = JSON.parse(fs.readFileSync(storageFile, 'utf8'));
        return data[key] || null;
      } catch {
        return null;
      }
    } else if (isWebWorker()) {
      const storage = (self as any).storage || {};
      return storage[key] || null;
    }
    
    return null;
  }
}

// 使用统一接口
Storage.set('user', 'John');
const user = Storage.get('user');
```

### 2. 响应式设计适配

```typescript
import { isMobile, isDesktop, isTouchDevice, getOS } from 'outils';

// 响应式组件
class ResponsiveComponent {
  constructor() {
    this.setupDevice();
    this.setupInteraction();
  }
  
  private setupDevice(): void {
    const deviceClass = isMobile() ? 'mobile' : 'desktop';
    document.body.classList.add(deviceClass);
    
    // 根据操作系统添加特定样式
    const os = getOS();
    document.body.classList.add(`os-${os}`);
    
    // 移动设备特殊处理
    if (isMobile()) {
      // 禁用缩放
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, user-scalable=no'
        );
      }
      
      // 隐藏地址栏
      window.addEventListener('load', () => {
        setTimeout(() => window.scrollTo(0, 1), 100);
      });
    }
  }
  
  private setupInteraction(): void {
    if (isTouchDevice()) {
      // 触摸设备：使用触摸事件
      document.addEventListener('touchstart', this.handleTouchStart);
      document.addEventListener('touchmove', this.handleTouchMove);
      document.addEventListener('touchend', this.handleTouchEnd);
    } else {
      // 非触摸设备：使用鼠标事件
      document.addEventListener('mousedown', this.handleMouseDown);
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);
    }
  }
  
  private handleTouchStart = (e: TouchEvent) => {
    // 触摸开始处理
  };
  
  private handleTouchMove = (e: TouchEvent) => {
    // 触摸移动处理
  };
  
  private handleTouchEnd = (e: TouchEvent) => {
    // 触摸结束处理
  };
  
  private handleMouseDown = (e: MouseEvent) => {
    // 鼠标按下处理
  };
  
  private handleMouseMove = (e: MouseEvent) => {
    // 鼠标移动处理
  };
  
  private handleMouseUp = (e: MouseEvent) => {
    // 鼠标释放处理
  };
}
```

### 3. 环境配置管理

```typescript
import { 
  isDevelopment, isProduction, isTest,
  getEnvVar, isNode, isBrowser 
} from 'outils';

// 配置管理器
class ConfigManager {
  private static config: any = null;
  
  static getConfig() {
    if (this.config) return this.config;
    
    if (isDevelopment()) {
      this.config = this.getDevelopmentConfig();
    } else if (isTest()) {
      this.config = this.getTestConfig();
    } else if (isProduction()) {
      this.config = this.getProductionConfig();
    } else {
      this.config = this.getDefaultConfig();
    }
    
    return this.config;
  }
  
  private static getDevelopmentConfig() {
    return {
      apiUrl: isBrowser() 
        ? 'http://localhost:3001/api'
        : getEnvVar('API_URL', 'http://localhost:3001/api'),
      debug: true,
      logLevel: 'debug',
      enableMocking: true,
      hotReload: true
    };
  }
  
  private static getTestConfig() {
    return {
      apiUrl: getEnvVar('TEST_API_URL', 'http://localhost:3002/api'),
      debug: false,
      logLevel: 'error',
      enableMocking: true,
      timeout: 5000
    };
  }
  
  private static getProductionConfig() {
    return {
      apiUrl: isBrowser()
        ? '/api'
        : getEnvVar('API_URL', 'https://api.example.com'),
      debug: false,
      logLevel: 'error',
      enableMocking: false,
      timeout: 10000,
      enableAnalytics: true
    };
  }
  
  private static getDefaultConfig() {
    return {
      apiUrl: '/api',
      debug: false,
      logLevel: 'warn',
      enableMocking: false,
      timeout: 8000
    };
  }
}

// 使用配置
const config = ConfigManager.getConfig();
console.log('API URL:', config.apiUrl);
console.log('调试模式:', config.debug);
```

### 4. 浏览器兼容性处理

```typescript
import { getBrowser, getOS, isBrowser } from 'outils';

// 兼容性检查器
class CompatibilityChecker {
  static checkSupport(): CompatibilityResult {
    if (!isBrowser()) {
      return { supported: true, warnings: [], errors: [] };
    }
    
    const browser = getBrowser();
    const os = getOS();
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // 检查浏览器支持
    if (browser === 'ie') {
      errors.push('不支持 Internet Explorer，请使用现代浏览器');
    }
    
    // 检查 API 支持
    if (!window.fetch) {
      warnings.push('浏览器不支持 Fetch API，将使用 polyfill');
    }
    
    if (!window.Promise) {
      errors.push('浏览器不支持 Promise，请升级浏览器');
    }
    
    if (!window.localStorage) {
      warnings.push('浏览器不支持 localStorage，数据将不会持久化');
    }
    
    // 检查 CSS 特性
    if (!CSS.supports('display', 'grid')) {
      warnings.push('浏览器不支持 CSS Grid，布局可能异常');
    }
    
    if (!CSS.supports('display', 'flex')) {
      warnings.push('浏览器不支持 Flexbox，布局可能异常');
    }
    
    return {
      supported: errors.length === 0,
      warnings,
      errors,
      browser,
      os
    };
  }
  
  static showCompatibilityMessage(result: CompatibilityResult): void {
    if (!result.supported) {
      const message = [
        '您的浏览器不受支持：',
        ...result.errors,
        '',
        '建议使用以下浏览器：',
        '• Chrome 70+',
        '• Firefox 65+',
        '• Safari 12+',
        '• Edge 79+'
      ].join('\n');
      
      alert(message);
    } else if (result.warnings.length > 0) {
      console.warn('浏览器兼容性警告:', result.warnings);
    }
  }
}

interface CompatibilityResult {
  supported: boolean;
  warnings: string[];
  errors: string[];
  browser?: string;
  os?: string;
}

// 应用启动时检查兼容性
const compatibility = CompatibilityChecker.checkSupport();
CompatibilityChecker.showCompatibilityMessage(compatibility);
```

### 5. 性能优化

```typescript
import { isMobile, isDesktop, getBrowser, isDevelopment } from 'outils';

// 性能优化管理器
class PerformanceManager {
  static optimizeForDevice(): void {
    if (isMobile()) {
      this.optimizeForMobile();
    } else if (isDesktop()) {
      this.optimizeForDesktop();
    }
  }
  
  private static optimizeForMobile(): void {
    // 移动设备优化
    console.log('应用移动设备优化');
    
    // 减少动画
    document.body.classList.add('reduce-motion');
    
    // 延迟加载图片
    this.enableLazyLoading();
    
    // 减少网络请求
    this.enableRequestBatching();
    
    // 启用触摸优化
    this.enableTouchOptimization();
  }
  
  private static optimizeForDesktop(): void {
    // 桌面设备优化
    console.log('应用桌面设备优化');
    
    // 启用预加载
    this.enablePreloading();
    
    // 启用键盘快捷键
    this.enableKeyboardShortcuts();
    
    // 启用右键菜单
    this.enableContextMenu();
  }
  
  static setupBrowserSpecificOptimizations(): void {
    const browser = getBrowser();
    
    switch (browser) {
      case 'chrome':
        // Chrome 特定优化
        this.enableChromeOptimizations();
        break;
      case 'firefox':
        // Firefox 特定优化
        this.enableFirefoxOptimizations();
        break;
      case 'safari':
        // Safari 特定优化
        this.enableSafariOptimizations();
        break;
    }
  }
  
  private static enableLazyLoading(): void {
    // 实现懒加载
  }
  
  private static enableRequestBatching(): void {
    // 实现请求批处理
  }
  
  private static enableTouchOptimization(): void {
    // 实现触摸优化
  }
  
  private static enablePreloading(): void {
    // 实现预加载
  }
  
  private static enableKeyboardShortcuts(): void {
    // 实现键盘快捷键
  }
  
  private static enableContextMenu(): void {
    // 实现右键菜单
  }
  
  private static enableChromeOptimizations(): void {
    // Chrome 特定优化
  }
  
  private static enableFirefoxOptimizations(): void {
    // Firefox 特定优化
  }
  
  private static enableSafariOptimizations(): void {
    // Safari 特定优化
  }
}

// 应用启动时进行优化
PerformanceManager.optimizeForDevice();
PerformanceManager.setupBrowserSpecificOptimizations();
```

## 最佳实践

### 1. 环境检测缓存

```typescript
// ✅ 好：缓存环境检测结果
class EnvironmentCache {
  private static cache = new Map<string, any>();
  
  static get<T>(key: string, factory: () => T): T {
    if (!this.cache.has(key)) {
      this.cache.set(key, factory());
    }
    return this.cache.get(key);
  }
}

const isMobileDevice = EnvironmentCache.get('isMobile', () => isMobile());
const currentBrowser = EnvironmentCache.get('browser', () => getBrowser());

// ❌ 不好：重复检测
function someFunction() {
  if (isMobile()) { /* ... */ } // 每次都重新检测
  if (isMobile()) { /* ... */ } // 重复检测
}
```

### 2. 优雅降级

```typescript
// ✅ 好：提供降级方案
function setupFeatures() {
  if (isBrowser()) {
    if (isTouchDevice()) {
      setupTouchFeatures();
    } else {
      setupMouseFeatures();
    }
    
    if (getBrowser() === 'chrome') {
      setupChromeFeatures();
    } else {
      setupFallbackFeatures();
    }
  } else {
    setupServerFeatures();
  }
}

// ❌ 不好：没有降级方案
function badSetup() {
  // 假设总是在浏览器中
  window.addEventListener('click', handler);
}
```

### 3. 条件加载

```typescript
// ✅ 好：根据环境条件加载
async function loadFeatures() {
  if (isDevelopment()) {
    // 开发环境加载调试工具
    const { setupDevTools } = await import('./dev-tools');
    setupDevTools();
  }
  
  if (isMobile()) {
    // 移动设备加载触摸库
    const { TouchHandler } = await import('./touch-handler');
    new TouchHandler();
  }
  
  if (isProduction()) {
    // 生产环境加载分析工具
    const { Analytics } = await import('./analytics');
    Analytics.init();
  }
}

// ❌ 不好：无条件加载所有功能
import './dev-tools';     // 总是加载
import './touch-handler'; // 总是加载
import './analytics';     // 总是加载
```

## 常见问题

### Q: 为什么在某些环境中检测结果不准确？

A: 环境检测主要依赖全局对象和 User Agent，某些环境可能会修改这些信息：

```typescript
// 一些框架可能会模拟浏览器环境
if (typeof window !== 'undefined' && !window.document) {
  console.log('模拟的浏览器环境');
}

// 使用更严格的检测
function isRealBrowser(): boolean {
  return typeof window !== 'undefined' && 
         typeof document !== 'undefined' &&
         typeof navigator !== 'undefined' &&
         window.document === document;
}
```

### Q: 如何检测特定的浏览器版本？

A: 可以解析 User Agent 字符串：

```typescript
function getBrowserVersion(): { name: string; version: string } {
  const userAgent = getUserAgent();
  
  // Chrome
  const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
  if (chromeMatch) {
    return { name: 'chrome', version: chromeMatch[1] };
  }
  
  // Firefox
  const firefoxMatch = userAgent.match(/Firefox\/(\d+)/);
  if (firefoxMatch) {
    return { name: 'firefox', version: firefoxMatch[1] };
  }
  
  return { name: 'unknown', version: '0' };
}
```

### Q: 如何检测是否在 iframe 中运行？

A: 可以检查 window 对象：

```typescript
function isInIframe(): boolean {
  if (!isBrowser()) return false;
  
  try {
    return window.self !== window.top;
  } catch {
    // 跨域 iframe 会抛出异常
    return true;
  }
}
```

### Q: 如何检测是否支持某个 Web API？

A: 可以检查 API 是否存在：

```typescript
function checkWebAPISupport() {
  return {
    fetch: typeof fetch !== 'undefined',
    webGL: !!window.WebGLRenderingContext,
    webRTC: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    serviceWorker: 'serviceWorker' in navigator,
    webAssembly: typeof WebAssembly !== 'undefined',
    intersectionObserver: 'IntersectionObserver' in window,
    resizeObserver: 'ResizeObserver' in window
  };
}
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
- `typeof` 操作符
- `window`、`document`、`navigator` 对象（浏览器环境）
- `process` 对象（Node.js 环境）
- `self`、`importScripts`（Web Worker 环境）