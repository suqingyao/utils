---
layout: home

hero:
  name: "outils"
  text: "个人常用工具函数库"
  tagline: "基于 TypeScript 实现的工具函数集合，无关业务和框架"
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看 API
      link: /api/

features:
  - title: 🚀 TypeScript 优先
    details: 完全使用 TypeScript 编写，提供完整的类型定义和智能提示
  - title: 📦 模块化设计
    details: 每个功能都是独立的模块，支持按需导入，减少打包体积
  - title: 🧪 完整测试
    details: 每个函数都有对应的测试用例，确保代码质量和稳定性
  - title: 📚 详细文档
    details: 提供完整的 API 文档和使用示例，方便快速上手
  - title: 🔧 开箱即用
    details: 无需复杂配置，安装即可使用，支持 ESM 和 CJS 两种格式
  - title: 🎯 无框架依赖
    details: 不依赖任何特定框架，可在任何 JavaScript/TypeScript 项目中使用
---

## 快速开始

### 安装

```bash
npm install outils
# 或
yarn add outils
# 或
pnpm add outils
```

### 使用示例

```typescript
import { debounce, EventEmitter, randomString } from 'outils';

// 防抖函数
const debouncedFn = debounce(() => {
  console.log('执行防抖函数');
}, 300);

// 发布订阅
const emitter = new EventEmitter();
emitter.on('test', (data) => {
  console.log('接收到数据:', data);
});
emitter.emit('test', 'Hello World');

// 随机字符串
const id = randomString(10);
console.log('随机ID:', id);
```

## 主要功能

- **发布订阅模式** - 实现观察者模式，支持事件的发布、订阅、取消订阅
- **防抖节流** - 提供防抖和节流函数，优化性能
- **函数式编程** - 柯里化、组合、管道等函数式编程工具
- **并发控制** - 控制异步任务的并发数量，支持重试和超时
- **类型工具** - 类型判断、转换和校验工具
- **环境工具** - 判断运行环境（浏览器、Node.js等）
- **随机工具** - 生成各种随机数据（字符串、颜色、日期等）
- **样式工具** - 基于 clsx 和 tailwind-merge 的类名合并工具

## 为什么选择 outils？

- **轻量级**: 每个工具函数都经过精心设计，保持最小的体积
- **高性能**: 注重性能优化，避免不必要的计算和内存占用
- **类型安全**: 完整的 TypeScript 类型定义，编译时发现错误
- **测试覆盖**: 高测试覆盖率，确保代码质量
- **持续维护**: 定期更新和维护，修复问题和添加新功能