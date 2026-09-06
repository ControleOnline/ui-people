// Technical wiki: https://github.com/ControleOnline/ui-people/wiki/Cadastro-de-Pessoas-Contatos-Usuarios-e-Vendedores
import {
  normalizePeopleContextType,
} from '@controleonline/ui-people/src/react/utils/peopleContext';
import { validateLinkedContactCommunication } from '@controleonline/ui-people/src/react/utils/companyLinkedContact';

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
  const directIri = String(value?.['@id'] || value || '').trim();
  if (directIri.includes(':id') || directIri.includes('{id}')) {
    return '';
  }
  if (/^\/people\/\d+$/.test(directIri)) {
    return directIri;
  }

  const id = extractId(value?.id || value);
  return id ? `/people/${id}` : '';
};

export const buildExistingOwnerLabel = owner =>
  normalizeIdentityValue(
    owner?.name || owner?.alias || `#${extractId(owner?.id || owner?.['@id'])}`,
  );

export const toBrDateString = date => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDateInput = text => {
  const numbers = String(text || '').replace(/\D/g, '').slice(0, 8);
  if (!numbers) {
    return '';
  }
  if (numbers.length <= 2) {
    return numbers;
  }
  if (numbers.length <= 4) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  }
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
};

export const parseBrDateInput = formatted => {
  if (!formatted || formatted.length !== 10) {
    return null;
  }
  const parts = formatted.split('/');
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);

  if (!(day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900)) {
    return null;
  }

  const candidate = new Date(year, month, day);
  const validDate =
    candidate.getFullYear() === year &&
    candidate.getMonth() === month &&
    candidate.getDate() === day;

  return validDate ? candidate : null;
};

export const buildInitialFormData = (context, contextConfig) => {
  const defaultDate = new Date();
  const normalizedRegistrationLinkType =
    normalizePeopleContextType(context?.context) || 'employee';
  const shouldRequireManualRole =
    Boolean(contextConfig?.enableExistingOwnerSelection) &&
    normalizedRegistrationLinkType === FRANCHISE_LINK_TYPE;

  return {
    name: '',
    alias: '',
    foundationDate: defaultDate,
    foundationDateInput: toBrDateString(defaultDate),
    peopleType: normalizePeopleType(context?.defaultPeopleType) || 'J',
    contactLinkType: shouldRequireManualRole ? '' : 'employee',
    registrationLinkType: normalizedRegistrationLinkType,
    firstEmployeeName: '',
    firstEmployeeAlias: '',
    firstEmployeeEmail: '',
    firstEmployeePhone: '',
    selectedExistingOwnerIri: '',
  };
};

/**
 * Validates the AddCompany form before save.
 * Returns { ok: true } or { ok: false, errorKey, errorMessage? }.
 */
export const validateAddCompanyForm = ({
  formData,
  isPessoaJuridica,
  hasSelectedExistingOwner,
  canSelectExistingOwner,
  shouldRequireManualRole,
  skipLinkedContact = false,
}) => {
  if (!String(formData.name || '').trim()) {
    return { ok: false, errorKey: 'nameRequired' };
  }
  if (!String(formData.alias || '').trim()) {
    return { ok: false, errorKey: 'aliasRequired' };
  }

  const parsedDate = parseBrDateInput(formData.foundationDateInput);
  if (!parsedDate) {
    return { ok: false, errorKey: 'invalidDateFormat' };
  }

  if (isPessoaJuridica && !hasSelectedExistingOwner && !skipLinkedContact) {
    if (
      !String(formData.firstEmployeeName || '').trim() ||
      !String(formData.firstEmployeeAlias || '').trim()
    ) {
      return { ok: false, errorKey: 'firstEmployeeRequired' };
    }

    const communication = validateLinkedContactCommunication({
      email: formData.firstEmployeeEmail,
      phone: formData.firstEmployeePhone,
    });
    if (!communication.ok) {
      return communication;
    }

    if (shouldRequireManualRole && !String(formData.contactLinkType || '').trim()) {
      return { ok: false, errorKey: 'contactRoleRequired' };
    }
  }

  if (
    isPessoaJuridica &&
    !skipLinkedContact &&
    canSelectExistingOwner &&
    hasSelectedExistingOwner === false &&
    shouldRequireManualRole &&
    !String(formData.contactLinkType || '').trim()
  ) {
    return { ok: false, errorKey: 'contactRoleRequired' };
  }

  return { ok: true, parsedFoundationDate: parsedDate };
};
