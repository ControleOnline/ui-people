const {
  resolveUserTimezoneId,
} = require('@controleonline/ui-people/src/react/utils/profileFormUtils')

const {describe, expect, it} = global

const list = [
  {id: '3', name: 'America/Sao_Paulo'},
  {id: '12', name: 'America/Cuiaba'},
  {id: '30', name: 'Etc/GMT+3'},
]

describe('resolveUserTimezoneId (#48)', () => {
  it('keeps numeric ids and IRIs', () => {
    expect(resolveUserTimezoneId({timezone: 12}, list)).toBe('12')
    expect(resolveUserTimezoneId({timezone: '12'}, list)).toBe('12')
    expect(resolveUserTimezoneId({timezone: '/timezones/12'}, list)).toBe('12')
    expect(resolveUserTimezoneId({timezone: {'@id': '/timezones/3'}}, list)).toBe('3')
    expect(resolveUserTimezoneId({timezone_id: 3}, list)).toBe('3')
  })

  it('matches a timezone name to the loaded list (case-insensitive)', () => {
    expect(resolveUserTimezoneId({timezone: 'America/Cuiaba'}, list)).toBe('12')
    expect(resolveUserTimezoneId({timezone: ' america/cuiaba '}, list)).toBe('12')
    expect(resolveUserTimezoneId({timezone: {name: 'America/Sao_Paulo'}}, list)).toBe('3')
  })

  it('does not turn digits inside a name into an id', () => {
    expect(resolveUserTimezoneId({timezone: 'Etc/GMT+3'}, list)).toBe('30')
    expect(resolveUserTimezoneId({timezone: 'Etc/GMT+9'}, list)).toBe('')
  })

  it('does not use the user name as timezone name', () => {
    expect(resolveUserTimezoneId({name: 'America/Cuiaba'}, list)).toBe('')
  })

  it('returns empty when user has no timezone, and the id when list is empty', () => {
    expect(resolveUserTimezoneId({}, list)).toBe('')
    expect(resolveUserTimezoneId(null, list)).toBe('')
    expect(resolveUserTimezoneId({timezone: '/timezones/12'}, [])).toBe('12')
  })
})
