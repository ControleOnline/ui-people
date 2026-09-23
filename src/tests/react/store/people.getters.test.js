const getters = require('../../../store/people/getters')

describe('people company getters', () => {
  it('reads the main company from canonical state', () => {
    const company = {id: 42, name: 'Main company'}
    const state = {mainCompany: company}

    expect(getters.mainCompany(state)).toBe(company)
  })
})
