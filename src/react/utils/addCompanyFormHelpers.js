
export const LINK_TYPE_OPTIONS = [
  { value: 'employee', translationKey: 'employee' },
  { value: 'owner', translationKey: 'owner' },
  { value: 'director', translationKey: 'director' },
  { value: 'manager', translationKey: 'manager' },
  { value: 'courier', translationKey: 'courier' },
];

export const OWNER_LINK_TYPE = 'owner';
export const FRANCHISE_LINK_TYPE = 'franchisee';

export const normalizePeopleType = value =>
  String(value ?? '')
    .trim()
    .toUpperCase();

export const normalizeIdentityValue = value => String(value ?? "").replace(/\s+/g, " ").trim();

export const extractId = value => String(value || '').replace(/\D/g, '');

export const toPeopleIri = value => {
  const directIri = String(value?.['@id'] || '').trim();
  if (directIri.startsWith('/people/')) {
    return directIri;
  }

  const id = extractId(value?.id || value);
  return id ? `/people/${id}` : '';
};

export const buildExistingOwnerLabel = owner =>
  normalizeIdentityValue(
    owner?.name || owner?.alias || `#${extractId(owner?.id || owner?.['@id'])}`,
  );
