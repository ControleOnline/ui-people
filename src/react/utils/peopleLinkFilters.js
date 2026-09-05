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

export const normalizeEntityId = value => {
  if (value && typeof value === 'object') {
    return normalizeEntityId(value.value ?? value.id ?? value['@id'] ?? '');
  }

  const match = String(value ?? '').match(/\d+/g);
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

export const buildPeopleLinkRequestParams = ({
  currentCompany,
  availableTypes = HUMAN_COMPANY_LINK_TYPES,
  selectedLinkType,
}) => ({
  ...(currentCompany?.id
    ? { 'link.company': resolvePeopleIri(currentCompany) }
    : {}),
  'link.linkType': resolveSelectedLinkTypes({
    availableTypes,
    fallbackTypes: HUMAN_COMPANY_LINK_TYPES,
    selectedLinkType,
  }),
});

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
