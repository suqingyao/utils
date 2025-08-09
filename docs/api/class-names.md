# Class Names API

基于 clsx 和 tailwind-merge 的样式类名合并工具，提供强大的类名处理功能。

## 核心函数

### cn

合并类名，支持条件类名和 Tailwind CSS 类名去重。

```typescript
function cn(...inputs: ClassValue[]): string
```

**参数：**
- `inputs` - 类名输入，支持字符串、对象、数组等多种格式

**返回值：** 合并后的类名字符串

**示例：**
```typescript
import { cn } from 'outils'

// 基础用法
cn('btn', 'btn-primary') // 'btn btn-primary'

// 条件类名
cn('btn', {
  'btn-primary': true,
  'btn-disabled': false
}) // 'btn btn-primary'

// Tailwind CSS 去重
cn('px-4 py-2', 'px-6') // 'py-2 px-6'
cn('text-red-500', 'text-blue-500') // 'text-blue-500'

// 复杂组合
cn(
  'base-class',
  condition && 'conditional-class',
  {
    'active': isActive,
    'disabled': isDisabled
  },
  'additional-class'
)
```

### cx

仅使用 clsx 合并类名，不进行 Tailwind CSS 去重。

```typescript
function cx(...inputs: ClassValue[]): string
```

**参数：**
- `inputs` - 类名输入

**返回值：** 合并后的类名字符串

**示例：**
```typescript
import { cx } from 'outils'

// 不会进行 Tailwind 去重
cx('px-4 py-2', 'px-6') // 'px-4 py-2 px-6'
cx('text-red-500', 'text-blue-500') // 'text-red-500 text-blue-500'

// 条件类名
cx('btn', {
  'active': true,
  'disabled': false
}) // 'btn active'
```

## 条件工具

### conditionalClass

条件类名工具。

```typescript
function conditionalClass(
  condition: boolean,
  trueClass: string,
  falseClass?: string
): string
```

**参数：**
- `condition` - 判断条件
- `trueClass` - 条件为真时的类名
- `falseClass` - 条件为假时的类名（可选）

**返回值：** 类名字符串

**示例：**
```typescript
import { conditionalClass } from 'outils'

// 基础用法
conditionalClass(isActive, 'active', 'inactive') // 'active' 或 'inactive'
conditionalClass(isLoading, 'loading') // 'loading' 或 ''

// 在组件中使用
function Button({ variant, disabled }) {
  const className = cn(
    'btn',
    conditionalClass(variant === 'primary', 'btn-primary', 'btn-secondary'),
    conditionalClass(disabled, 'btn-disabled')
  )
  
  return <button className={className}>Click me</button>
}
```

## 变体工具

### createVariants

创建类名变体工具。

```typescript
function createVariants<T extends Record<string, Record<string, string>>>(
  baseClass: string,
  variants: T
): Function
```

**参数：**
- `baseClass` - 基础类名
- `variants` - 变体配置对象

**返回值：** 变体函数

**示例：**
```typescript
import { createVariants } from 'outils'

// 创建按钮变体
const buttonVariants = createVariants('btn', {
  variant: {
    primary: 'bg-blue-500 text-white',
    secondary: 'bg-gray-500 text-white',
    outline: 'border border-blue-500 text-blue-500'
  },
  size: {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }
})

// 使用变体
buttonVariants({ variant: 'primary', size: 'md' })
// 'btn bg-blue-500 text-white px-4 py-2'

buttonVariants({ variant: 'outline', size: 'lg', className: 'custom-class' })
// 'btn border border-blue-500 text-blue-500 px-6 py-3 text-lg custom-class'
```

### createCompoundVariants

创建复合变体工具，支持复杂的变体组合。

```typescript
function createCompoundVariants<T, C>(config: {
  base?: string;
  variants?: T;
  compoundVariants?: C;
  defaultVariants?: Partial<T>;
}): Function
```

**参数：**
- `config.base` - 基础类名
- `config.variants` - 变体配置
- `config.compoundVariants` - 复合变体配置
- `config.defaultVariants` - 默认变体

**返回值：** 复合变体函数

**示例：**
```typescript
import { createCompoundVariants } from 'outils'

const buttonVariants = createCompoundVariants({
  base: 'btn transition-colors',
  variants: {
    variant: {
      primary: 'bg-blue-500 text-white',
      secondary: 'bg-gray-500 text-white',
      ghost: 'bg-transparent'
    },
    size: {
      sm: 'px-2 py-1 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg'
    }
  },
  compoundVariants: [
    {
      variant: 'ghost',
      size: 'sm',
      className: 'hover:bg-gray-100'
    },
    {
      variant: 'primary',
      size: 'lg',
      className: 'shadow-lg'
    }
  ],
  defaultVariants: {
    variant: 'primary',
    size: 'md'
  }
})

// 使用默认变体
buttonVariants() // 'btn transition-colors bg-blue-500 text-white px-4 py-2'

// 复合变体
buttonVariants({ variant: 'ghost', size: 'sm' })
// 'btn transition-colors bg-transparent px-2 py-1 text-sm hover:bg-gray-100'
```

## 响应式工具

### responsiveClass

响应式类名工具。

```typescript
function responsiveClass(classes: {
  base?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
}): string
```

**参数：**
- `classes` - 响应式类名配置

**返回值：** 响应式类名字符串

**示例：**
```typescript
import { responsiveClass } from 'outils'

// 响应式布局
responsiveClass({
  base: 'grid',
  sm: 'grid-cols-1',
  md: 'grid-cols-2',
  lg: 'grid-cols-3',
  xl: 'grid-cols-4'
})
// 'grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

// 响应式文字大小
responsiveClass({
  base: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
})
// 'text-sm md:text-base lg:text-lg'
```

## 状态工具

### stateClass

状态类名工具。

```typescript
function stateClass(
  baseClass: string,
  states: {
    hover?: string;
    focus?: string;
    active?: string;
    disabled?: string;
    [key: string]: string | undefined;
  }
): string
```

**参数：**
- `baseClass` - 基础类名
- `states` - 状态配置对象

**返回值：** 包含状态的类名字符串

**示例：**
```typescript
import { stateClass } from 'outils'

// 按钮状态
stateClass('btn bg-blue-500', {
  hover: 'bg-blue-600',
  focus: 'ring-2 ring-blue-300',
  active: 'bg-blue-700',
  disabled: 'opacity-50 cursor-not-allowed'
})
// 'btn bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'

// 链接状态
stateClass('text-blue-500 underline', {
  hover: 'text-blue-700',
  visited: 'text-purple-500'
})
// 'text-blue-500 underline hover:text-blue-700 visited:text-purple-500'
```

### themeClass

主题类名工具。

```typescript
function themeClass(lightClass: string, darkClass: string): string
```

**参数：**
- `lightClass` - 亮色主题类名
- `darkClass` - 暗色主题类名

**返回值：** 主题类名字符串

**示例：**
```typescript
import { themeClass } from 'outils'

// 背景主题
themeClass('bg-white', 'bg-gray-900')
// 'bg-white dark:bg-gray-900'

// 文字主题
themeClass('text-gray-900', 'text-gray-100')
// 'text-gray-900 dark:text-gray-100'

// 边框主题
themeClass('border-gray-200', 'border-gray-700')
// 'border-gray-200 dark:border-gray-700'
```

## 实际应用场景

### React 组件样式

```typescript
import { cn, createVariants } from 'outils'

// 创建按钮组件
const buttonVariants = createVariants('btn', {
  variant: {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50'
  },
  size: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }
})

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

function Button({ variant, size, disabled, className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        buttonVariants({ variant, size }),
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
```

### 条件样式处理

```typescript
import { cn, conditionalClass, themeClass } from 'outils'

// 卡片组件
function Card({ isActive, isLoading, isDark, className, children }) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-all',
        conditionalClass(isActive, 'ring-2 ring-blue-500', 'hover:shadow-md'),
        conditionalClass(isLoading, 'animate-pulse'),
        themeClass('bg-white border-gray-200', 'bg-gray-800 border-gray-700'),
        className
      )}
    >
      {children}
    </div>
  )
}
```

### 响应式布局

```typescript
import { responsiveClass, cn } from 'outils'

// 网格布局组件
function Grid({ children, className }) {
  return (
    <div
      className={cn(
        responsiveClass({
          base: 'grid gap-4',
          sm: 'grid-cols-1',
          md: 'grid-cols-2',
          lg: 'grid-cols-3',
          xl: 'grid-cols-4'
        }),
        className
      )}
    >
      {children}
    </div>
  )
}
```

### 复杂变体系统

```typescript
import { createCompoundVariants } from 'outils'

// 输入框变体
const inputVariants = createCompoundVariants({
  base: 'w-full rounded border px-3 py-2 transition-colors focus:outline-none',
  variants: {
    variant: {
      default: 'border-gray-300 focus:border-blue-500',
      error: 'border-red-500 focus:border-red-600',
      success: 'border-green-500 focus:border-green-600'
    },
    size: {
      sm: 'px-2 py-1 text-sm',
      md: 'px-3 py-2',
      lg: 'px-4 py-3 text-lg'
    }
  },
  compoundVariants: [
    {
      variant: 'error',
      size: 'lg',
      className: 'shadow-red-100 shadow-lg'
    }
  ],
  defaultVariants: {
    variant: 'default',
    size: 'md'
  }
})

function Input({ variant, size, className, ...props }) {
  return (
    <input
      className={inputVariants({ variant, size, className })}
      {...props}
    />
  )
}
```

## 性能优化建议

### 缓存变体函数

```typescript
// 在模块级别创建变体函数，避免重复创建
const buttonVariants = createVariants('btn', {
  // ... 配置
})

// 而不是在组件内部创建
function Button() {
  // ❌ 每次渲染都会创建新函数
  const variants = createVariants('btn', { /* ... */ })
}
```

### 合理使用 cn vs cx

```typescript
// 使用 Tailwind CSS 时使用 cn
const tailwindClasses = cn('px-4 py-2', 'px-6') // 自动去重

// 使用普通 CSS 类时使用 cx
const regularClasses = cx('btn', 'btn-primary') // 不需要去重
```

### 避免过度嵌套

```typescript
// ❌ 过度复杂
const className = cn(
  'base',
  condition1 && cn(
    'nested',
    condition2 && cn('deeply-nested')
  )
)

// ✅ 扁平化
const className = cn(
  'base',
  condition1 && 'nested',
  condition1 && condition2 && 'deeply-nested'
)
```

## 常见问题

### Q: cn 和 cx 的区别是什么？

A: `cn` 会进行 Tailwind CSS 类名去重，`cx` 只是简单合并类名：

```typescript
cn('px-4', 'px-6') // 'px-6' (去重)
cx('px-4', 'px-6') // 'px-4 px-6' (不去重)
```

### Q: 如何处理动态类名？

A: 使用条件表达式或对象形式：

```typescript
// 条件表达式
cn('base', isActive && 'active')

// 对象形式
cn('base', { active: isActive, disabled: isDisabled })

// 使用 conditionalClass
cn('base', conditionalClass(isActive, 'active', 'inactive'))
```

### Q: 如何在 TypeScript 中获得更好的类型支持？

A: 定义严格的类型：

```typescript
type ButtonVariant = 'primary' | 'secondary' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}
```

### Q: 如何处理复杂的条件逻辑？

A: 使用 `createCompoundVariants` 或提前计算：

```typescript
// 提前计算
const isSpecialCase = variant === 'primary' && size === 'lg'
const className = cn(
  baseClass,
  isSpecialCase && 'special-styles'
)

// 或使用复合变体
const variants = createCompoundVariants({
  // ... 配置
  compoundVariants: [
    {
      variant: 'primary',
      size: 'lg',
      className: 'special-styles'
    }
  ]
})
```

## 浏览器兼容性

- **现代浏览器**: 完全支持
- **IE 11**: 需要 polyfill（Object.entries）
- **移动端**: 完全支持

## 相关链接

- [clsx 官方文档](https://github.com/lukeed/clsx)
- [tailwind-merge 官方文档](https://github.com/dcastil/tailwind-merge)
- [Tailwind CSS 官方文档](https://tailwindcss.com/)