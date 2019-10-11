const IParse = require('./parse')

beforeEach(() => {
    IParse.tok = 1;
})

describe('Error building tests', () => {
    it('can properly build a basic error message', () => {
        expect(
            IParse.error("Mocked Error")
        ).to.eql(
            {
                id: "(error)",
                zeroth: `Error: Mocked Error at 1.`
            }
        )
    })
})
