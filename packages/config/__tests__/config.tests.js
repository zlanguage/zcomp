import fs from "fs";
import rimraf from "rimraf";
import loadConfig from "../src";

beforeAll(() => {
  if (!fs.existsSync("fixtures-in-progress")) {
    fs.mkdirSync("fixtures-in-progress");
  } else {
    rimraf("fixtures-in-progress");
    fs.mkdirSync("fixtures-in-progress");
  }
});

afterAll(() => {
  rimraf.sync("fixtures-in-progress");
});

describe("loading from zconfig.json", () => {
  let fakeConfigJson = { plugins: ["fake-plugin"] };

  beforeEach(() => {
    fs.writeFileSync(
      "fixtures-in-progress/zconfig.json",
      JSON.stringify(fakeConfigJson)
    );
  });

  it("loads the config", () => {
    process.chdir("fixtures-in-progress");
    expect(loadConfig()).toEqual(fakeConfigJson);
    process.chdir("..");
  });
});

describe("loading from package.json", () => {
  let fakePackageJson = { zConfig: { plugins: ["fake-plugin"] } };

  beforeEach(() => {
    fs.writeFileSync(
      "fixtures-in-progress/package.json",
      JSON.stringify(fakePackageJson)
    );
  });

  it("loads the config", () => {
    process.chdir("fixtures-in-progress");
    expect(loadConfig()).toEqual(fakePackageJson.zConfig);
    process.chdir("..");
  });
});
