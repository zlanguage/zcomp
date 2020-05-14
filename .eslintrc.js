module.exports = {
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  extends: ["eslint:recommended", "prettier"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 11,
    sourceType: "module",
  },
  rules: {
    "no-useless-escape": 0,
    "no-fallthrough": 0,
  },
  plugins: ["jest"],
};
