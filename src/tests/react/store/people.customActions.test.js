/* global FormData, jest */

const {beforeEach, describe, expect, it} = global

jest.mock('@controleonline/ui-common/src/api', () => ({
  api: {
    upload: jest.fn(),
  },
}))

const {api} = require('@controleonline/ui-common/src/api')
const actions = require('../../../store/people/customActions')

class TestFormData {
  constructor() {
    this.entries = []
  }

  append(key, value) {
    this.entries.push([key, value])
  }
}

describe('people customActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.FormData = TestFormData
  })

  it('uploads people media without requiring media type preloading', async () => {
    const file = {name: 'avatar.png', type: 'image/png'}
    api.upload.mockResolvedValueOnce({data: {id: 10}})

    const result = await actions.uploadPeopleMedia(
      {},
      {
        people: '/people/7',
        file,
      },
    )

    expect(result).toEqual({id: 10})
    expect(api.upload).toHaveBeenCalledWith('/people_media/upload', expect.any(TestFormData))
    expect(api.upload.mock.calls[0][1].entries).toEqual([
      ['file', file],
      ['people', '/people/7'],
    ])
  })

  it('keeps sending media type when it is available', async () => {
    const file = {name: 'avatar.png', type: 'image/png'}
    api.upload.mockResolvedValueOnce({data: {id: 11}})

    await actions.uploadPeopleMedia(
      {},
      {
        people: '/people/7',
        mediaTypeId: '/media_types/3',
        file,
      },
    )

    expect(api.upload.mock.calls[0][1].entries).toEqual([
      ['file', file],
      ['people', '/people/7'],
      ['media_type_id', '3'],
    ])
  })
})
