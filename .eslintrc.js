module.exports = {
  root: true,
  env: {
    node: true,
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2017,
    sourceType: 'module',
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  rules: {
    'no-unused-vars': 'off',
    'no-self-assign': 'off',
    'prettier/prettier': [
      'warn',
      {
        singleQuote: true,
        trailingComma: 'es5',
        printWidth: 120,
        tabWidth: 2,
        useTabs: false,
      },
    ],
    '@typescript-eslint/no-unused-vars': [2, { args: 'none' }],
    semi: 0,
  },
};
