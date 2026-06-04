const {afterEach, describe, expect, it} = global

const {resolveLoggedUserId} = require('@controleonline/ui-people/src/react/utils/profileSession')

const originalLocalStorage = global.localStorage

const createStorage = session => ({
  getItem: key => (key === 'session' ? JSON.stringify(session || {}) : null),
})

describe('profileSession', () => {
  afterEach(() => {
    global.localStorage = originalLocalStorage
  })

  it('does not confuse the stored people id with the authenticated user id', () => {
    global.localStorage = createStorage({id: 9})

    expect(resolveLoggedUserId({})).toBe('')
  })

  it('keeps supporting explicit user_id fields when available', () => {
    global.localStorage = createStorage({id: 9, user_id: 12})

    expect(resolveLoggedUserId({user_id: 7})).toBe('7')
  })

  it('extracts numeric ids from iri values', () => {
    global.localStorage = createStorage({'@id': '/users/18'})

    expect(resolveLoggedUserId({})).toBe('18')
  })
})
