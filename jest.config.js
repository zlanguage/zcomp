module.exports = {
  collectCoverage: !!require("process").env.CI,
  coverageDirectory: "coverage",
  testEnvironment: "node",
  modulePathIgnorePatterns: ["packages/.*/lib"],
};
