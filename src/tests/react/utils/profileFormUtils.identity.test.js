const {
  normalizeNameValue,
  normalizeAliasValue,
} = require('@controleonline/ui-people/src/react/utils/profileFormUtils')

const { describe, expect, it } = global

describe('profileFormUtils identity normalization (#376)', () => {
  it('preserves mixed case on name (no forced uppercase)', () => {
    expect(normalizeNameValue('João da Silva')).toBe('João da Silva')
    expect(normalizeNameValue('  maria  SOUZA  ')).toBe('maria SOUZA')
  })

  it('preserves mixed case on alias', () => {
    expect(normalizeAliasValue('ApelidoMiXto')).toBe('ApelidoMiXto')
    expect(normalizeAliasValue('  ab  c  ')).toBe('ab c')
  })

  it('collapses whitespace and trims only', () => {
    expect(normalizeNameValue('\tFoo   Bar\n')).toBe('Foo Bar')
    expect(normalizeAliasValue('')).toBe('')
    expect(normalizeNameValue(null)).toBe('')
  })
})
