const PEOPLE_CONTEXT_META = {
  client: {
    label: () => global.t?.t('people', 'title', 'clients'),
    searchPlaceholder: () => global.t?.t('people', 'searchPlaceholder', 'searchClient'),
  },
  prospect: {
    label: () => global.t?.t('people', 'title', 'prospects'),
    searchPlaceholder: () => global.t?.t('people', 'searchPlaceholder', 'searchProspect'),
  },
  provider: {
    label: () => global.t?.t('people', 'title', 'providers'),
    searchPlaceholder: () => global.t?.t('people', 'searchPlaceholder', 'searchProvider'),
  },
  franchisee: {
    label: () => global.t?.t('people', 'title', 'franchisees') || 'Franquias',
    searchPlaceholder:
      () => global.t?.t('people', 'searchPlaceholder', 'searchFranchise') || 'Buscar franquia',
  },
  employee: {
    label: () => global.t?.t('people', 'label', 'employee'),
    searchPlaceholder: () => global.t?.t('people', 'label', 'employee'),
  },
  owner: {
    label: () => global.t?.t('people', 'label', 'owner'),
    searchPlaceholder: () => global.t?.t('people', 'label', 'owner'),
  },
  director: {
    label: () => global.t?.t('people', 'label', 'director'),
    searchPlaceholder: () => global.t?.t('people', 'label', 'director'),
  },
  manager: {
    label: () => global.t?.t('people', 'label', 'manager'),
    searchPlaceholder: () => global.t?.t('people', 'label', 'manager'),
  },
  courier: {
    label: () => global.t?.t('people', 'label', 'courier'),
    searchPlaceholder: () => global.t?.t('people', 'label', 'courier'),
  },
};

export const normalizePeopleContextType = value =>
  String(value || '')
    .trim()
    .toLowerCase();

const uniqueTypes = values => [...new Set(values)];

const resolveContextSource = context => {
  if (Array.isArray(context?.contextOptions) && context.contextOptions.length > 0) {
    return context.contextOptions;
  }

  if (Array.isArray(context?.context)) {
    return context.context;
  }

  return [context?.context];
};

export const resolvePeopleContextLabel = (type, context = {}) => {
  const normalizedType = normalizePeopleContextType(type);
  const customLabel =
    context?.labels?.[normalizedType] || context?.typeLabels?.[normalizedType];

  if (customLabel) {
    return customLabel;
  }

  return PEOPLE_CONTEXT_META[normalizedType]?.label?.() || normalizedType;
};

export const resolvePeopleContextSearchPlaceholder = (type, context = {}) => {
  const normalizedType = normalizePeopleContextType(type);
  const customPlaceholder =
    context?.searchPlaceholders?.[normalizedType] ||
    context?.searchPlaceholderByType?.[normalizedType];

  if (customPlaceholder) {
    return customPlaceholder;
  }

  return (
    PEOPLE_CONTEXT_META[normalizedType]?.searchPlaceholder?.() ||
    context?.searchPlaceholder ||
    resolvePeopleContextLabel(normalizedType, context)
  );
};

export const resolvePeopleContextModalTitle = (type, context = {}) => {
  const normalizedType = normalizePeopleContextType(type);
  const customTitle =
    context?.modalTitleByType?.[normalizedType] || context?.registrationTitles?.[normalizedType];

  if (customTitle) {
    return customTitle;
  }

  if (context?.modalTitle) {
    return context.modalTitle;
  }

  return global.t?.t('people', 'title', 'newCompany');
};

export const buildPeopleContextConfig = (context = {}) => {
  const availableTypes = uniqueTypes(
    resolveContextSource(context)
      .map(normalizePeopleContextType)
      .filter(Boolean),
  );

  const normalizedDefaultType = normalizePeopleContextType(
    context?.selectedContext ||
      context?.defaultContext ||
      (Array.isArray(context?.context) ? context.context[0] : context?.context),
  );

  const defaultType = availableTypes.includes(normalizedDefaultType)
    ? normalizedDefaultType
    : availableTypes[0] || normalizedDefaultType || '';

  const resolvedTypes = availableTypes.length > 0
    ? availableTypes
    : defaultType
      ? [defaultType]
      : [];

  return {
    availableTypes: resolvedTypes,
    defaultType,
    hasTypeFilter: resolvedTypes.length > 1,
    filterTitle:
      context?.filterTitle ||
      context?.typeSelectorLabel ||
      context?.title ||
      resolvePeopleContextLabel(defaultType, context),
    selectorLabel:
      context?.typeSelectorLabel ||
      context?.filterTitle ||
      context?.title ||
      resolvePeopleContextLabel(defaultType, context),
    modalTitle: resolvePeopleContextModalTitle(defaultType, context),
    enableExistingOwnerSelection: Boolean(context?.enableExistingOwnerSelection),
    options: resolvedTypes.map(type => ({
      key: type,
      label: resolvePeopleContextLabel(type, context),
    })),
  };
};

export default buildPeopleContextConfig;
