import antfu from '@antfu/eslint-config';

export default antfu({
  // 启用 TypeScript 支持
  typescript: true,
  // 代码风格配置
  stylistic: {
    indent: 2,
    quotes: 'single',
    semi: true,
  },
  ignores: ['dist/**', 'node_modules/**', 'docs'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    'ts/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
  },
});
