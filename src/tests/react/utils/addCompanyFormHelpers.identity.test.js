const {
  normalizeIdentityValue,
} = require('@controleonline/ui-people/src/react/utils/addCompanyFormHelpers')

const { describe, expect, it } = global

describe('addCompanyFormHelpers normalizeIdentityValue (#626 my-companies)', () => {
  it('preserves mixed case typed by the user', () => {
    expect(normalizeIdentityValue('Empresa Exemplo Ltda')).toBe('Empresa Exemplo Ltda')
    expect(normalizeIdentityValue('nomeMiXto')).toBe('nomeMiXto')
  })

  it('only trims and collapses spaces', () => {
    expect(normalizeIdentityValue('  a   b  ')).toBe('a b')
    expect(normalizeIdentityValue(null)).toBe('')
  })
})
