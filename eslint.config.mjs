import herokuConfig from '@heroku-cli/test-utils/eslint-config';

export default [
  ...herokuConfig,
  {
    rules: {
      camelcase: ['error', {allow: ['^_'], properties: 'never'}],
      'unicorn/filename-case': 'off',
    },
  },
  {
    files: ['test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      camelcase: 'off',
      'import/no-named-as-default-member': 'off',
    },
  },
];
