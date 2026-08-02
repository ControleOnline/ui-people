const {
  isCompanyPeople,
  resolvePeopleAvatarEmail,
  resolvePeopleImageCandidate,
  resolvePeopleImageUrl,
} = require('@controleonline/ui-people/src/react/utils/peopleImage')

const {describe, expect, it} = global

describe('peopleImage', () => {
  it('prefers company icon media for legal entities', () => {
    const people = {
      peopleType: 'J',
      media: [
        {mediaType: {type: 'avatar'}, file: {id: 1}},
        {mediaType: {type: 'icon'}, file: {id: 2}},
      ],
    }

    expect(isCompanyPeople(people)).toBe(true)
    expect(resolvePeopleImageCandidate(people)).toEqual({id: 2})
  })

  it('prefers profile avatar media for natural people', () => {
    const people = {
      peopleType: 'F',
      media: [
        {mediaType: {type: 'icon'}, file: {id: 2}},
        {mediaType: {type: 'avatar'}, file: {id: 3}},
      ],
    }

    expect(resolvePeopleImageCandidate(people)).toEqual({id: 3})
  })

  it('resolves a normalized image url through the provided resolver', () => {
    const calls = []
    const resolver = (file, options) => {
      calls.push([file, options])
      return file?.id ? `/files/${file.id}/download` : ''
    }

    expect(resolvePeopleImageUrl({peopleType: 'F', avatar: {id: 8}}, resolver)).toBe('/files/8/download')
    expect(calls).toEqual([[{id: 8}, {}]])
  })

  it('extracts the first usable people email', () => {
    expect(
      resolvePeopleAvatarEmail({
        email: [{value: ''}, {email: 'contact@example.com'}],
      }),
    ).toBe('contact@example.com')
  })
})
