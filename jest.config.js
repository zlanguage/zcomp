const process = require("process");

process.env.IS_Z_SRC_TEST_RUNNING = true;

module.exports = {
  collectCoverage: !!require("process").env.CI,
  coverageDirectory: "coverage",
  testEnvironment: "node",
};
