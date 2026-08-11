const {afterEach, describe, expect, it} = global

const {
  resolveLoggedUserId,
  persistSessionAvatar,
} = require('@controleonline/ui-people/src/react/utils/profileSession')

const originalLocalStorage = global.localStorage

const createStorage = (session, {writable = false} = {}) => {
  let stored = session == null ? null : JSON.stringify(session)
  return {
    getItem: key => (key === 'session' ? stored : null),
    setItem: writable
      ? (key, value) => {
          if (key === 'session') {
            stored = value
          }
        }
      : undefined,
  }
}

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

  it('persistSessionAvatar writes avatar without dropping other session fields', () => {
    global.localStorage = createStorage(
      {user_id: 42, token: 'abc', avatar: {id: 1}},
      {writable: true},
    )

    const next = persistSessionAvatar({id: 99, url: '/files/99'})

    expect(next.user_id).toBe(42)
    expect(next.token).toBe('abc')
    expect(next.avatar).toEqual({id: 99, url: '/files/99'})
    expect(JSON.parse(global.localStorage.getItem('session')).avatar).toEqual({
      id: 99,
      url: '/files/99',
    })
  })

  it('persistSessionAvatar clears avatar when null is passed', () => {
    global.localStorage = createStorage(
      {user_id: 7, avatar: {id: 3}},
      {writable: true},
    )

    const next = persistSessionAvatar(null)

    expect(next.avatar).toBeNull()
    expect(JSON.parse(global.localStorage.getItem('session')).avatar).toBeNull()
    expect(JSON.parse(global.localStorage.getItem('session')).user_id).toBe(7)
  })
})
