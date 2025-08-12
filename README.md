# @suqingyao/monorepo

苏青瑶的工具库 monorepo，包含多个实用工具包。

## 📦 包列表

- [`@suqingyao/utils`](./packages/utils) - 个人常用工具函数库

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 安装 turbo

```bash
pnpm add -g turbo
```

### 开发

```bash
# 启动所有包的开发模式
pnpm dev

# 启动特定包的开发模式
pnpm --filter @suqingyao/utils dev
```

### 构建

```bash
# 构建所有包
pnpm build

# 构建特定包
pnpm --filter @suqingyao/utils build
```

### 测试

```bash
# 运行所有包的测试
pnpm test

# 运行特定包的测试
pnpm --filter @suqingyao/utils test
```

## 📝 提交规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式化
- `refactor`: 代码重构
- `test`: 测试代码
- `chore`: 其他变更
- `perf`: 性能优化
- `ci`: 持续集成
- `build`: 构建
- `revert`: 回滚

## 📄 许可证

MIT License