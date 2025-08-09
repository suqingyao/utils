# 介绍

欢迎使用 **outils**！这是一个基于 TypeScript 实现的个人常用工具函数库，旨在提供高质量、无框架依赖的工具函数集合。

## 设计理念

### 🎯 专注核心功能

outils 专注于提供最常用的工具函数，避免功能冗余。每个函数都经过精心设计，确保 API 简洁易用。

### 📦 模块化设计

采用模块化设计，支持按需导入。你可以只导入需要的函数，减少最终打包体积。

```typescript
// 按需导入
import { debounce, throttle } from 'outils';

// 或者导入特定模块
import { EventEmitter } from 'outils/event-emitter';
```

### 🔒 类型安全

完全使用 TypeScript 编写，提供完整的类型定义。在编译时就能发现类型错误，提高开发效率。

### 🧪 测试驱动

每个函数都有对应的测试用例，确保代码质量和稳定性。测试覆盖率达到 100%。

### 🚀 性能优先

注重性能优化，避免不必要的计算和内存占用。所有函数都经过性能测试和优化。

## 功能概览

### 核心功能

- **[发布订阅](/api/event-emitter)** - 实现观察者模式
- **[防抖节流](/api/debounce-throttle)** - 性能优化工具
- **[函数式编程](/api/functional)** - 柯里化、组合等
- **[并发控制](/api/concurrency)** - 异步任务管理

### 工具函数

- **[类型工具](/api/type-utils)** - 类型判断和转换
- **[环境工具](/api/env-utils)** - 运行环境检测
- **[随机工具](/api/random-utils)** - 随机数据生成
- **[样式工具](/api/class-names)** - CSS 类名处理

## 兼容性

- **Node.js**: >= 16.0.0
- **浏览器**: 支持 ES2020+ 的现代浏览器
- **TypeScript**: >= 4.5.0

## 许可证

MIT License - 详见 [LICENSE](https://github.com/suqingyao/outils/blob/main/LICENSE) 文件。