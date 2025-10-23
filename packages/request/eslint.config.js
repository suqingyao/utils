import antfu from '@antfu/eslint-config';

export default antfu({
  typescript: true,
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
