#!/bin/bash

# 打包发布脚本
# 用于自动化构建、测试和发布流程

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    log_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    log_error "Working directory is not clean. Please commit or stash your changes."
    exit 1
fi

# 检查当前分支是否为 main
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    log_warning "Current branch is '$current_branch', not 'main'. Continue? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log_info "Release cancelled."
        exit 0
    fi
fi

# 获取当前版本
current_version=$(node -p "require('./package.json').version")
log_info "Current version: $current_version"

# 询问新版本类型
echo "Select version bump type:"
echo "1) patch (x.x.X)"
echo "2) minor (x.X.x)"
echo "3) major (X.x.x)"
echo "4) custom"
read -p "Enter choice (1-4): " version_choice

case $version_choice in
    1)
        version_type="patch"
        ;;
    2)
        version_type="minor"
        ;;
    3)
        version_type="major"
        ;;
    4)
        read -p "Enter custom version: " custom_version
        version_type="$custom_version"
        ;;
    *)
        log_error "Invalid choice"
        exit 1
        ;;
esac

log_info "Starting release process..."

# 1. 安装依赖
log_info "Installing dependencies..."
pnpm install

# 2. 运行 lint 检查
log_info "Running lint checks..."
pnpm run lint

# 3. 运行测试
log_info "Running tests..."
pnpm run test

# 4. 构建项目
log_info "Building project..."
pnpm run build

# 5. 检查构建产物
if [ ! -d "dist" ]; then
    log_error "Build failed: dist directory not found"
    exit 1
fi

if [ ! -f "dist/index.js" ] || [ ! -f "dist/index.cjs" ] || [ ! -f "dist/index.d.ts" ]; then
    log_error "Build failed: required files not found in dist directory"
    exit 1
fi

log_success "Build completed successfully"

# 6. 更新版本号
log_info "Updating version..."
if [ "$version_choice" = "4" ]; then
    npm version "$version_type" --no-git-tag-version
else
    npm version "$version_type" --no-git-tag-version
fi

new_version=$(node -p "require('./package.json').version")
log_success "Version updated to: $new_version"

# 7. 提交更改
log_info "Committing changes..."
git add .
git commit -m "chore: release v$new_version"

# 8. 创建标签
log_info "Creating git tag..."
git tag "v$new_version"

# 9. 推送到远程仓库
log_info "Pushing to remote repository..."
git push origin "$current_branch"
git push origin "v$new_version"

# 10. 发布到 npm (可选)
read -p "Publish to npm? (y/N): " publish_npm
if [[ "$publish_npm" =~ ^[Yy]$ ]]; then
    log_info "Publishing to npm..."
    npm publish
    log_success "Published to npm successfully"
else
    log_info "Skipping npm publish"
fi

log_success "Release v$new_version completed successfully!"
log_info "Summary:"
log_info "  - Version: $current_version → $new_version"
log_info "  - Git tag: v$new_version"
log_info "  - Branch: $current_branch"
if [[ "$publish_npm" =~ ^[Yy]$ ]]; then
    log_info "  - Published to npm: Yes"
else
    log_info "  - Published to npm: No"
fi