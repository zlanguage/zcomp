module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "10",
        },
      },
    ],
  ],
  plugins: [
    "@babel/proposal-optional-chaining",
    "@babel/proposal-nullish-coalescing-operator",
  ],
};
