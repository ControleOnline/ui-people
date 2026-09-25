/**
 * Navigation param contract for My Companies → MyCompanyDetails (app-community#463).
 * Mirrors MyCompaniesPage detailsRouteParams + normalizeEntityId behaviour.
 */

function normalizeEntityId(value) {
  if (value && typeof value === 'object') {
    return normalizeEntityId(value.value ?? value.id ?? value['@id'] ?? '');
  }
  const match = String(value ?? '').match(/\d+/g);
  return match ? match[match.length - 1] : '';
}

const ALL_PEOPLE_LINK_TYPES_KEY = 'all';

function buildMyCompanyDetailsParams(client, selectedLinkType) {
  const clientId =
    normalizeEntityId(client?.id ?? client?.['@id']) ||
    normalizeEntityId(client?.company?.id ?? client?.company?.['@id']);
  return {
    clientId,
    contextKey:
      selectedLinkType === ALL_PEOPLE_LINK_TYPES_KEY
        ? 'company'
        : String(selectedLinkType || 'company'),
  };
}

describe('My Companies details navigation params (app-community#463)', () => {
  it('resolves clientId from people id and uses company context', () => {
    expect(buildMyCompanyDetailsParams({id: 42}, ALL_PEOPLE_LINK_TYPES_KEY)).toEqual({
      clientId: '42',
      contextKey: 'company',
    });
  });

  it('resolves clientId from IRI @id', () => {
    expect(buildMyCompanyDetailsParams({'@id': '/people/99'}, 'owner')).toEqual({
      clientId: '99',
      contextKey: 'owner',
    });
  });

  it('resolves clientId from nested company object', () => {
    expect(
      buildMyCompanyDetailsParams({company: {id: 7}}, ALL_PEOPLE_LINK_TYPES_KEY),
    ).toEqual({
      clientId: '7',
      contextKey: 'company',
    });
  });

  it('returns empty clientId when entity has no id (caller must no-op)', () => {
    expect(buildMyCompanyDetailsParams({}, ALL_PEOPLE_LINK_TYPES_KEY).clientId).toBe('');
  });
});
