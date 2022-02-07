module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-await-in-loop': 0,
    'no-console': 0,
    camelcase: 0,
    'no-constant-condition': 0,
    'no-restricted-syntax': 0,
    'no-plusplus': 0,
  },
};
