import {
  DEFAULT_MY_COMPANIES_LINK_TYPE,
  resolveMyCompaniesLinkType,
  resolveAuthenticatedPeopleIri,
  buildAuthenticatedPersonLinkPayload,
} from '../../../react/utils/myCompaniesCreate';

describe('myCompaniesCreate', () => {
  describe('resolveMyCompaniesLinkType', () => {
    it('defaults to owner when empty or all', () => {
      expect(resolveMyCompaniesLinkType('')).toBe(DEFAULT_MY_COMPANIES_LINK_TYPE);
      expect(resolveMyCompaniesLinkType('all')).toBe(DEFAULT_MY_COMPANIES_LINK_TYPE);
      expect(resolveMyCompaniesLinkType(null)).toBe(DEFAULT_MY_COMPANIES_LINK_TYPE);
    });

    it('accepts valid human roles', () => {
      expect(resolveMyCompaniesLinkType('owner')).toBe('owner');
      expect(resolveMyCompaniesLinkType('employee')).toBe('employee');
      expect(resolveMyCompaniesLinkType('director')).toBe('director');
    });

    it('falls back for unknown types', () => {
      expect(resolveMyCompaniesLinkType('franchisee')).toBe(DEFAULT_MY_COMPANIES_LINK_TYPE);
    });
  });

  describe('resolveAuthenticatedPeopleIri', () => {
    it('resolves from people IRI or id', () => {
      expect(resolveAuthenticatedPeopleIri({ people: '/people/7' })).toBe('/people/7');
      expect(resolveAuthenticatedPeopleIri({ people: 7 })).toBe('/people/7');
      expect(resolveAuthenticatedPeopleIri({ peopleId: '12' })).toBe('/people/12');
    });

    it('returns empty when missing', () => {
      expect(resolveAuthenticatedPeopleIri(null)).toBe('');
      expect(resolveAuthenticatedPeopleIri({})).toBe('');
    });

    it('rejects hydra placeholder IRIs', () => {
      expect(resolveAuthenticatedPeopleIri({ people: '/people/:id' })).toBe('');
      expect(resolveAuthenticatedPeopleIri({ people: { '@id': '/people/:id' } })).toBe('');
    });
  });

  describe('buildAuthenticatedPersonLinkPayload', () => {
    it('builds payload with owner default', () => {
      expect(
        buildAuthenticatedPersonLinkPayload({
          companyId: 99,
          user: { people: '/people/7' },
          linkType: 'all',
        }),
      ).toEqual({
        company: '/people/99',
        people: '/people/7',
        linkType: 'owner',
      });
    });

    it('returns null when identity is missing', () => {
      expect(
        buildAuthenticatedPersonLinkPayload({
          companyId: 99,
          user: {},
          linkType: 'owner',
        }),
      ).toBeNull();
    });
  });
});
