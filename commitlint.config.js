export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'test',
        'chore',
        'perf',
        'ci',
        'build',
        'revert',
      ],
    ],
    'subject-max-length': [2, 'always', 50],
    'subject-min-length': [2, 'always', 10],
    'header-max-length': [2, 'always', 72],
  },
};