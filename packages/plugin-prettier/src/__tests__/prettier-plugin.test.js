import gen from "../../../zcomp/src/compiler/gen"
import parse from "../../../zcomp/src/compiler/parse"
import tokenize from "../../../zcomp/src/compiler/tokenize"
import PrettierPlugin from "../../../plugin-prettier/src/index"

const normalCode = `
importstd traits

def { Show, Enum }: traits

enum Color {
  Red,
  Orange,
  Yellow,
  Green,
  Blue,
  Purple
} derives (Show, Enum)

Red().succ().toString()`

function transpileZ(z, plugins = []) {
  return gen(parse(tokenize(z)), true, plugins);
}

describe("prettier plugin", () => {
  it("outputs normal code", () => {
    expect(transpileZ(normalCode)).toMatchSnapshot()
  })

  it("outputs code with prettier correctly", () => {
    expect(transpileZ(normalCode, [new PrettierPlugin()])).toMatchSnapshot()
  })

  it("has the correct metadata", () => {
    expect(new PrettierPlugin().name).toBe("zcomp-plugin-prettier")
  })

  it("has a difference with the prettier plugin", () => {
    expect(transpileZ(normalCode, [new PrettierPlugin()])).not.toBe(transpileZ(normalCode))
  })
})
