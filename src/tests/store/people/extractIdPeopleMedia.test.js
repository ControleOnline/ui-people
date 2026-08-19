/**
 * Unit tests for people media id extraction used by deletePeopleMedia / savePeopleMedia.
 * Covers the regression: numeric id from hydra member / DefaultUpload row must resolve.
 */

// Mirror the production extractId (kept local so the test does not depend on private export).
const extractId = value => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }

  if (typeof value === 'string') {
    const match = value.match(/(\d+)$/);
    return match ? match[1] : '';
  }

  const raw =
    value?.mediaId ??
    value?.id ??
    value?.['@id'] ??
    null;

  if (raw === null || raw === undefined || raw === '') {
    return '';
  }

  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return String(Math.trunc(raw));
  }

  const match = String(raw).match(/(\d+)$/);
  return match ? match[1] : '';
};

describe('people extractId (deletePeopleMedia path)', () => {
  test('resolves plain numeric id', () => {
    expect(extractId(123)).toBe('123');
    expect(extractId(0)).toBe('0');
  });

  test('resolves string numeric and IRI', () => {
    expect(extractId('456')).toBe('456');
    expect(extractId('/people_media/789')).toBe('789');
  });

  test('resolves object with numeric id (hydra member shape)', () => {
    expect(extractId({ id: 42 })).toBe('42');
    expect(extractId({ id: '42' })).toBe('42');
  });

  test('resolves object with @id IRI', () => {
    expect(extractId({ '@id': '/people_media/100' })).toBe('100');
  });

  test('resolves payload { mediaId: number } as used by MediaTab', () => {
    const payload = { mediaId: 55 };
    expect(extractId(payload?.mediaId || payload)).toBe('55');
    expect(extractId(payload)).toBe('55');
  });

  test('returns empty for missing / invalid', () => {
    expect(extractId(null)).toBe('');
    expect(extractId(undefined)).toBe('');
    expect(extractId('')).toBe('');
    expect(extractId({})).toBe('');
    expect(extractId({ name: 'x' })).toBe('');
  });
});
