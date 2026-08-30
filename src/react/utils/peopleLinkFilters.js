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

export const buildPeopleLinkRequestParams = ({
  currentCompany,
  selectedLinkType,
}) => ({
  ...(currentCompany?.id
    ? { 'link.company': resolvePeopleIri(currentCompany) }
    : {}),
  'link.linkType': normalizeLinkType(selectedLinkType),
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
