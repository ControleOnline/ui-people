import {
  ALL_PEOPLE_LINK_TYPES_KEY,
  HUMAN_COMPANY_LINK_TYPES,
  resolvePeopleIri,
} from './peopleLinkFilters';

export const DEFAULT_MY_COMPANIES_LINK_TYPE = 'owner';

/**
 * Resolve a human linkType suitable for My Companies create flow.
 * Never returns "all".
 */
export const resolveMyCompaniesLinkType = (candidate, fallback = DEFAULT_MY_COMPANIES_LINK_TYPE) => {
  const normalized = String(candidate || '')
    .trim()
    .toLowerCase();

  if (!normalized || normalized === ALL_PEOPLE_LINK_TYPES_KEY) {
    return fallback;
  }

  if (HUMAN_COMPANY_LINK_TYPES.includes(normalized)) {
    return normalized;
  }

  return fallback;
};

/**
 * Resolve authenticated person IRI from auth user / session fields.
 */
export const resolveAuthenticatedPeopleIri = user => {
  if (!user) {
    return '';
  }

  return (
    resolvePeopleIri(user.people) ||
    resolvePeopleIri(user.peopleId) ||
    resolvePeopleIri(user.person) ||
    resolvePeopleIri(user.personId) ||
    resolvePeopleIri(user?.user?.people) ||
    ''
  );
};

/**
 * Build people_link payload linking a newly created company to the
 * authenticated person with a valid human role.
 */
export const buildAuthenticatedPersonLinkPayload = ({
  companyId,
  user,
  linkType,
}) => {
  const companyIri = resolvePeopleIri(companyId);
  const peopleIri = resolveAuthenticatedPeopleIri(user);
  const safeLinkType = resolveMyCompaniesLinkType(linkType);

  if (!companyIri || !peopleIri) {
    return null;
  }

  return {
    company: companyIri,
    people: peopleIri,
    linkType: safeLinkType,
  };
};

export default {
  DEFAULT_MY_COMPANIES_LINK_TYPE,
  resolveMyCompaniesLinkType,
  resolveAuthenticatedPeopleIri,
  buildAuthenticatedPersonLinkPayload,
};
