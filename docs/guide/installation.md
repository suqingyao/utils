# 安装

## 包管理器安装

### npm

```bash
npm install outils
```

### yarn

```bash
yarn add outils
```

### pnpm

```bash
pnpm add outils
```

## CDN 引入

### ESM

```html
<script type="module">
  import { debounce, EventEmitter } from 'https://unpkg.com/outils@latest/dist/index.js';
  
  // 使用函数
  const debouncedFn = debounce(() => {
    console.log('Hello from CDN!');
  }, 300);
</script>
```

### UMD

```html
<script src="https://unpkg.com/outils@latest/dist/index.umd.js"></script>
<script>
  // 全局变量 outils
  const { debounce, EventEmitter } = outils;
  
  const debouncedFn = debounce(() => {
    console.log('Hello from UMD!');
  }, 300);
</script>
```

## 验证安装

安装完成后，可以通过以下方式验证是否安装成功：

```typescript
import { version } from 'outils';

console.log('outils version:', version);
```

或者运行一个简单的示例：

```typescript
import { debounce } from 'outils';

const debouncedFn = debounce(() => {
  console.log('安装成功！');
}, 300);

debouncedFn();
```

## TypeScript 支持

outils 完全使用 TypeScript 编写，内置类型定义文件。无需额外安装 `@types` 包。

```typescript
// 自动获得完整的类型提示
import { EventEmitter } from 'outils';

const emitter = new EventEmitter<{
  message: string;
  count: number;
}>();

// TypeScript 会自动推断事件类型
emitter.on('message', (data) => {
  console.log(data); // data 类型为 string
});

emitter.on('count', (data) => {
  console.log(data); // data 类型为 number
});
```

## 开发环境

如果你想参与 outils 的开发或查看源码：

```bash
# 克隆仓库
git clone https://github.com/suqingyao/outils.git

# 进入目录
cd outils

# 安装依赖
pnpm install

# 运行测试
pnpm test

# 构建项目
pnpm build

# 启动文档开发服务器
pnpm docs:dev
```

## 故障排除

### 模块解析问题

如果遇到模块解析问题，请确保你的 `tsconfig.json` 包含以下配置：

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

### 版本兼容性

如果你使用的是较老版本的 Node.js 或 TypeScript，可能需要升级到支持的版本：

- Node.js >= 16.0.0
- TypeScript >= 4.5.0

### 打包工具配置

#### Webpack

```javascript
module.exports = {
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};
```

#### Vite

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  // Vite 默认支持 TypeScript，无需额外配置
});
```