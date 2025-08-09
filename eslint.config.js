import antfu from '@antfu/eslint-config';

export default antfu(
  {
    // 启用 TypeScript 支持
    typescript: true,
    // 代码风格配置
    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: true,
    },
  },
  {
    // 忽略文件
    ignores: ['dist/**', 'node_modules/**', 'docs'],
  },
  {
    // 自定义规则
    rules: {
      // 允许 console 语句（开发阶段）
      'no-console': 'warn',
      // TypeScript 相关规则
      '@typescript-eslint/no-explicit-any': 'warn',
      'ts/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
      // 放宽一些严格规则
      'unicorn/prefer-number-properties': 'warn',
      'ts/no-this-alias': 'warn',
      'jsdoc/check-param-names': 'warn',
      // 关闭一些过于严格的格式化规则
      'antfu/if-newline': 'off',
      'style/brace-style': 'warn',
    },
  },
);
