const getters = require('../../../store/people/getters')

describe('people company getters', () => {
  it('preserves mainCompany as an alias for defaultCompany', () => {
    const company = {id: 42, name: 'Main company'}
    const state = {defaultCompany: company}

    expect(getters.mainCompany(state)).toBe(company)
    expect(getters.defaultCompany(state)).toBe(company)
  })
})
