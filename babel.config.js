module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current",
        },
      },
    ],
  ],
  plugins: [
    "transform-inline-consecutive-adds",
    "@babel/proposal-optional-chaining",
    "@babel/proposal-nullish-coalescing-operator",
  ],
};
