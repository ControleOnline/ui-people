const {describe, expect, it} = global

const {
  shouldSkipProfileFetch,
} = require('@controleonline/ui-people/src/react/utils/useProfileLoad')

describe('shouldSkipProfileFetch (React #185 guards)', () => {
  it('skips when a fetch is already in flight', () => {
    expect(
      shouldSkipProfileFetch({
        inFlight: true,
        hasInitiallyLoaded: false,
        forceRefresh: false,
      }),
    ).toBe('in-flight')
  })

  it('skips when already loaded and forceRefresh is false', () => {
    expect(
      shouldSkipProfileFetch({
        inFlight: false,
        hasInitiallyLoaded: true,
        forceRefresh: false,
      }),
    ).toBe('already-loaded')
  })

  it('runs when never loaded even without forceRefresh', () => {
    expect(
      shouldSkipProfileFetch({
        inFlight: false,
        hasInitiallyLoaded: false,
        forceRefresh: false,
      }),
    ).toBe('run')
  })

  it('runs when forceRefresh is true even if already loaded', () => {
    expect(
      shouldSkipProfileFetch({
        inFlight: false,
        hasInitiallyLoaded: true,
        forceRefresh: true,
      }),
    ).toBe('run')
  })

  it('prefers in-flight over already-loaded', () => {
    expect(
      shouldSkipProfileFetch({
        inFlight: true,
        hasInitiallyLoaded: true,
        forceRefresh: true,
      }),
    ).toBe('in-flight')
  })
})
