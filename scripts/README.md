# 发布脚本使用指南

本目录包含了用于自动化构建、测试和发布流程的脚本。

## 脚本说明

### 1. release.js (推荐)

**Node.js 版本的完整发布脚本**，提供最佳的跨平台兼容性。

**功能特性：**
- ✅ 检查工作目录状态
- ✅ 检查当前分支
- ✅ 交互式版本选择
- ✅ 自动运行测试和构建
- ✅ 自动提交和打标签
- ✅ 可选的 npm 发布
- ✅ 详细的日志输出

**使用方法：**
```bash
# 使用 npm script (推荐)
pnpm run release

# 或直接运行
node scripts/release.js
```

### 2. release.sh

**Bash 版本的发布脚本**，适用于 Unix/Linux/macOS 系统。

**使用方法：**
```bash
# 使用 npm script
pnpm run release:sh

# 或直接运行
./scripts/release.sh
```

### 3. quick-release.js

**快速发布脚本**，用于快速发布补丁版本，减少交互步骤。

**功能特性：**
- ✅ 自动发布补丁版本 (patch)
- ✅ 跳过版本选择交互
- ✅ 跳过 npm 发布确认
- ✅ 适合日常小修复发布

**使用方法：**
```bash
# 使用 npm script (推荐)
pnpm run release:quick

# 或直接运行
node scripts/quick-release.js
```

## 发布流程

### 完整发布流程 (release.js/release.sh)

1. **环境检查**
   - 检查是否在项目根目录
   - 检查工作目录是否干净
   - 检查当前分支

2. **版本选择**
   - patch: 修复版本 (1.0.0 → 1.0.1)
   - minor: 功能版本 (1.0.0 → 1.1.0)
   - major: 重大版本 (1.0.0 → 2.0.0)
   - custom: 自定义版本号

3. **构建和测试**
   - 安装依赖 (`pnpm install`)
   - 运行代码检查 (`pnpm run lint`)
   - 运行测试 (`pnpm run test`)
   - 构建项目 (`pnpm run build`)
   - 验证构建产物

4. **版本发布**
   - 更新 package.json 版本号
   - 提交更改
   - 创建 Git 标签
   - 推送到远程仓库
   - 可选发布到 npm

### 快速发布流程 (quick-release.js)

1. **环境检查**
   - 检查工作目录状态

2. **自动构建**
   - 运行测试
   - 构建项目
   - 自动更新补丁版本

3. **自动发布**
   - 提交更改
   - 创建标签
   - 推送到远程仓库

## 使用建议

### 日常开发

```bash
# 修复 bug 后快速发布
pnpm run release:quick
```

### 功能发布

```bash
# 新功能发布，需要选择版本类型
pnpm run release
```

### 重大版本发布

```bash
# 重大更新，建议使用完整流程
pnpm run release
```

## 注意事项

1. **发布前准备**
   - 确保所有更改已提交
   - 确保测试通过
   - 确保在正确的分支上

2. **版本号规范**
   - 遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范
   - patch: 向下兼容的问题修正
   - minor: 向下兼容的功能性新增
   - major: 不兼容的 API 修改

3. **npm 发布**
   - 确保已登录 npm (`npm login`)
   - 确保有发布权限
   - 首次发布可能需要设置包的可见性

4. **回滚操作**
   ```bash
   # 如果发布出错，可以删除标签
   git tag -d v1.0.1
   git push origin :refs/tags/v1.0.1
   
   # 回退版本号
   git reset --hard HEAD~1
   ```

## 自定义配置

如需修改发布流程，可以编辑对应的脚本文件：

- `release.js` - Node.js 版本发布脚本
- `release.sh` - Bash 版本发布脚本
- `quick-release.js` - 快速发布脚本

## 故障排除

### 常见问题

1. **权限错误**
   ```bash
   chmod +x scripts/*.js scripts/*.sh
   ```

2. **Git 推送失败**
   - 检查远程仓库权限
   - 检查网络连接
   - 确保分支存在

3. **npm 发布失败**
   - 检查 npm 登录状态
   - 检查包名是否已存在
   - 检查版本号是否重复

4. **测试失败**
   - 修复测试问题后重新运行
   - 或使用 `--no-verify` 跳过 git hooks