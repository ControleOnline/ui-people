// Technical wiki: https://github.com/ControleOnline/ui-people/wiki/Cadastro-de-Pessoas-Contatos-Usuarios-e-Vendedores
export const ALL_PEOPLE_LINK_TYPES_KEY = 'all';

export const HUMAN_COMPANY_LINK_TYPES = [
  'employee',
  'owner',
  'director',
  'manager',
  'salesman',
  'after-sales',
  'courier',
];

export const HUMAN_COMPANY_LINK_TYPE_OPTIONS = HUMAN_COMPANY_LINK_TYPES.map(
  value => ({
    value,
    translationKey: value,
  }),
);

export const isHumanCompanyLinkType = value =>
  HUMAN_COMPANY_LINK_TYPES.includes(
    String(value || '')
      .trim()
      .toLowerCase(),
  );

export const normalizeEntityId = value => {
  if (value && typeof value === 'object') {
    return normalizeEntityId(value.value ?? value.id ?? value['@id'] ?? '');
  }

  const raw = String(value ?? '').trim();
  if (!raw || raw.includes(':id') || raw.includes('{id}')) {
    return '';
  }

  const match = raw.match(/\d+/g);
  return match ? match[match.length - 1] : '';
};

export const resolvePeopleIri = value => {
  const id = normalizeEntityId(value);
  return id ? `/people/${id}` : '';
};

const normalizeLinkType = value =>
  String(value || '')
    .trim()
    .toLowerCase();

const resolveSelectedLinkTypes = ({
  availableTypes = [],
  fallbackTypes = [],
  selectedLinkType = '',
}) => {
  const normalizedSelectedLinkType = normalizeLinkType(selectedLinkType);

  if (
    normalizedSelectedLinkType &&
    normalizedSelectedLinkType !== ALL_PEOPLE_LINK_TYPES_KEY
  ) {
    return normalizedSelectedLinkType;
  }

  const linkTypes = (availableTypes.length > 0 ? availableTypes : fallbackTypes)
    .map(normalizeLinkType)
    .filter(type => type && type !== ALL_PEOPLE_LINK_TYPES_KEY);

  return linkTypes.length === 1 ? linkTypes[0] : linkTypes;
};

// peopleType scopes the list to PF ("F") or PJ ("J"). anyLinkType drops the
// link.linkType constraint so every person linked to the company through
// peopleLink is returned (e.g. collaborators = peopleType F linked to the
// current company, whatever the link type).
export const buildPeopleLinkRequestParams = ({
  currentCompany,
  availableTypes = HUMAN_COMPANY_LINK_TYPES,
  selectedLinkType,
  peopleType,
  anyLinkType = false,
}) => {
  const normalizedPeopleType = String(peopleType || '')
    .trim()
    .toUpperCase();
  // The unrestricted scope only applies while no concrete link type is
  // selected; picking a real type in the filter narrows the list again.
  const normalizedSelected = normalizeLinkType(selectedLinkType);
  const dropLinkType =
    anyLinkType &&
    (!normalizedSelected ||
      normalizedSelected === ALL_PEOPLE_LINK_TYPES_KEY ||
      normalizedSelected === 'employment');

  return {
    ...(currentCompany?.id
      ? { 'link.company': resolvePeopleIri(currentCompany) }
      : {}),
    ...(normalizedPeopleType ? { peopleType: normalizedPeopleType } : {}),
    ...(dropLinkType
      ? {}
      : {
          'link.linkType': resolveSelectedLinkTypes({
            availableTypes,
            fallbackTypes: HUMAN_COMPANY_LINK_TYPES,
            selectedLinkType,
          }),
        }),
  };
};

// people_links of the currentCompany (people_link.company_id = currentCompany).
// Equivalent to: SELECT ... FROM people_link WHERE company_id = :currentCompany
// restricted to active links and human link types. A concrete selected type
// narrows the list; "all" keeps every human link type.
export const buildCompanyLinksRequestParams = ({
  currentCompany,
  availableTypes = HUMAN_COMPANY_LINK_TYPES,
  selectedLinkType = ALL_PEOPLE_LINK_TYPES_KEY,
}) => {
  const companyId = normalizeEntityId(currentCompany);
  const normalizedSelected = normalizeLinkType(selectedLinkType);
  // "all" must cover every human role (director, manager, ...), not only the
  // roles offered by the screen's type selector.
  const resolved =
    !normalizedSelected || normalizedSelected === ALL_PEOPLE_LINK_TYPES_KEY
      ? HUMAN_COMPANY_LINK_TYPES
      : resolveSelectedLinkTypes({
          availableTypes,
          fallbackTypes: HUMAN_COMPANY_LINK_TYPES,
          selectedLinkType,
        });
  const humanTypes = (Array.isArray(resolved) ? resolved : [resolved])
    .filter(isHumanCompanyLinkType);

  return {
    // Without a company there is nothing to list; never fall back to all links.
    company: companyId || '0',
    // API Platform rejects a bare scalar here, so always send an array.
    linkType: humanTypes.length > 0 ? humanTypes : HUMAN_COMPANY_LINK_TYPES,
    enable: 1,
  };
};

export const buildParentCompanyRequestParams = ({
  availableTypes = HUMAN_COMPANY_LINK_TYPES,
  selectedLinkType = ALL_PEOPLE_LINK_TYPES_KEY,
  user,
}) => {
  const userPeopleIri = resolvePeopleIri(
    user?.people ?? user?.peopleId ?? user?.person ?? user?.personId ?? '',
  );

  if (!userPeopleIri) {
    return { id: 0 };
  }

  return {
    'company.people': userPeopleIri,
    'company.linkType': resolveSelectedLinkTypes({
      availableTypes,
      fallbackTypes: HUMAN_COMPANY_LINK_TYPES,
      selectedLinkType,
    }),
  };
};
