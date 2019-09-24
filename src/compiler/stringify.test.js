const gen = require('./gen')

describe("zStringify can return normal strings", () => {
    expect(gen.zStringify("helloworld")).to.eql("helloworld");
})
