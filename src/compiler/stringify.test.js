const gen = require('./gen')

describe("zStringify returns normal strings", () => {
    expect(gen.zStringify("helloworld")).to.eql("helloworld");
})
