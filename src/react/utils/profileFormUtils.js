/**
 * Pure helpers for Profile page (phones, emails, timezone, identity).
 * Extracted from Profile.js to keep the page under the 500-line limit
 * and avoid re-creating unstable identities that can loop effects.
 */
import { resolveFileImageUrl } from '@controleonline/ui-common/src/react/utils/fileUrl';
import { resolveUserPeopleIri } from '@controleonline/ui-common/src/react/utils/userAvatar';
import { resolvePeopleImageUrl } from '@controleonline/ui-people/src/react/utils/peopleImage';

export const extractPhoneDigits = value =>
  String(value || '')
    .replace(/\D/g, '')
    .slice(0, 11);

export const formatPhoneValue = value => {
  const digits = extractPhoneDigits(value);
  if (!digits) {
    return '';
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  const ddd = digits.slice(0, 2);
  const phoneNumber = digits.slice(2);

  if (phoneNumber.length <= 4) {
    return `(${ddd}) ${phoneNumber}`;
  }

  if (phoneNumber.length <= 8) {
    return `(${ddd}) ${phoneNumber.slice(0, phoneNumber.length - 4)}-${phoneNumber.slice(-4)}`;
  }

  return `(${ddd}) ${phoneNumber.slice(0, 5)}-${phoneNumber.slice(5, 9)}`;
};

export const splitPhoneValue = value => {
  const digits = extractPhoneDigits(value);
  if (digits.length < 2) {
    return {ddd: '', phone: ''};
  }

  return {
    ddd: digits.slice(0, 2),
    phone: digits.slice(2),
  };
};

export const extractId = value => {
  const normalized = String(value || '').replace(/\D/g, '');
  return normalized || '';
};

export const getSessionData = () => {
  try {
    return JSON.parse(localStorage.getItem('session') || '{}');
  } catch {
    return {};
  }
};

export const toPeopleIri = user => {
  const session = getSessionData();
  return resolveUserPeopleIri(user, session);
};

export const normalizeCollection = payload => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload.member)) return payload.member;
  if (Array.isArray(payload['hydra:member'])) return payload['hydra:member'];
  if (Array.isArray(payload.items)) return payload.items;
  return [];
};

export const toPhoneItem = entry => {
  if (entry == null) {
    return null;
  }

  if (typeof entry === 'string' || typeof entry === 'number') {
    return {id: '', value: formatPhoneValue(entry)};
  }

  const rawId = entry?.id || entry?.['@id'];
  const composedPhone = entry?.value || `${entry?.ddd || ''}${entry?.phone || ''}`;

  return {
    id: extractId(rawId),
    value: formatPhoneValue(composedPhone),
  };
};

export const toEmailItem = entry => {
  if (entry == null) {
    return null;
  }

  if (typeof entry === 'string') {
    return {id: '', value: entry};
  }

  return {
    id: extractId(entry?.id || entry?.['@id']),
    value: String(entry?.email || entry?.value || ''),
  };
};

export const getPrimaryEmail = value => {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (Array.isArray(value) && value.length > 0) {
    const first = value[0];
    if (typeof first === 'string') {
      return first.trim();
    }
    return String(first?.email || first?.value || '').trim();
  }

  if (typeof value === 'object') {
    return String(value?.email || value?.value || '').trim();
  }

  return '';
};

export const getPrimaryPhone = value => {
  if (!value) {
    return '';
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return formatPhoneValue(value);
  }

  if (Array.isArray(value) && value.length > 0) {
    const first = value[0];
    if (typeof first === 'string' || typeof first === 'number') {
      return formatPhoneValue(first);
    }
    return formatPhoneValue(`${first?.ddd || ''}${first?.phone || first?.value || ''}`);
  }

  if (typeof value === 'object') {
    return formatPhoneValue(`${value?.ddd || ''}${value?.phone || value?.value || ''}`);
  }

  return '';
};

export const getDisplayName = user =>
  String(user?.name || user?.realname || user?.username || 'Usuario').trim();

export const getDisplayAlias = user =>
  String(user?.alias || user?.nickname || '').trim();

export const getAvatarFromUser = user => {
  return resolvePeopleImageUrl(user, resolveFileImageUrl);
};

export const validateEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const normalizeEmailValue = value => String(value || '').trim().toLowerCase();

export const normalizeNameValue = value =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim();

export const normalizeAliasValue = value =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim();

export const toTimezoneItem = entry => {
  if (!entry) {
    return null;
  }

  const id = extractId(entry?.id || entry?.['@id']);
  const name = String(entry?.name || '').trim();
  const displayName = String(entry?.displayName || '').trim(); // ✅ novo

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    displayName, // ✅ importante
  };
};

export const resolveTimezoneId = value => {
  if (!value) {
    return '';
  }

  if (typeof value === 'object') {
    const nestedTimezone = value?.timezone;

    if (nestedTimezone && typeof nestedTimezone === 'object') {
      const nestedId = extractId(nestedTimezone?.id || nestedTimezone?.['@id']);
      if (nestedId) {
        return nestedId;
      }
    }

    return extractId(
      value?.timezone_id ||
      value?.timezoneId ||
      value?.time_zone_id ||
      (typeof nestedTimezone === 'string' || typeof nestedTimezone === 'number'
        ? nestedTimezone
        : ''),
    );
  }

  return extractId(value);
};

export const resolveTimezoneName = value => {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value.includes('/timezones/') ? '' : value.trim();
  }

  if (typeof value === 'object') {
    if (typeof value?.name === 'string') {
      return value.name.trim();
    }

    if (typeof value?.timezone === 'string') {
      return value.timezone.trim();
    }

    if (value?.timezone && typeof value.timezone === 'object') {
      return resolveTimezoneName(value.timezone);
    }
  }

  return '';
};

export const extractCollectionItems = payload => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.member)) {
    return payload.member;
  }

  if (Array.isArray(payload?.['hydra:member'])) {
    return payload['hydra:member'];
  }

  return [];
};

export const splitCombinedIdentity = (nameValue, aliasValue) => {
  const normalizedName = normalizeNameValue(nameValue);
  const normalizedAlias = normalizeAliasValue(aliasValue);

  if (!normalizedName || normalizedAlias) {
    return {
      name: normalizedName,
      alias: normalizedAlias,
    };
  }

  const separators = [' - ', ' – ', ' — ', ' | '];
  for (const separator of separators) {
    if (!normalizedName.includes(separator)) {
      continue;
    }

    const [possibleName, ...possibleAliasParts] = normalizedName
      .split(separator)
      .map(part => normalizeNameValue(part))
      .filter(Boolean);

    if (!possibleName || possibleAliasParts.length === 0) {
      continue;
    }

    return {
      name: possibleName,
      alias: normalizeAliasValue(possibleAliasParts.join(' ')),
    };
  }

  return {
    name: normalizedName,
    alias: normalizedAlias,
  };
};

export const normalizePhonesForCompare = items =>
  (Array.isArray(items) ? items : [])
    .map(item => {
      const id = extractId(item?.id);
      const digits = extractPhoneDigits(item?.value || item);
      if (!digits) {
        return '';
      }
      return `${id || 'new'}:${digits}`;
    })
    .filter(Boolean);

export const normalizeEmailsForCompare = items =>
  (Array.isArray(items) ? items : [])
    .map(item => {
      const id = extractId(item?.id);
      const email = normalizeEmailValue(item?.value || item?.email || item);
      if (!email) {
        return '';
      }
      return `${id || 'new'}:${email}`;
    })
    .filter(Boolean);

export const isSameList = (left, right) => {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
};

// Cache global simples para timezones carregados do backend
let timezonesCache = null;
let timezoneCachePromise = null;

export const fetchTimezonesCached = async (timezonesActions, timezoneFilters = {}) => {
  if (timezonesCache) {
    return timezonesCache;
  }

  if (timezoneCachePromise) {
    return timezoneCachePromise;
  }

  timezoneCachePromise = timezonesActions.getItems(timezoneFilters)
    .then(response => {
      timezonesCache = response;
      timezoneCachePromise = null;
      return response;
    })
    .catch(error => {
      timezoneCachePromise = null;
      throw error;
    });

  return timezoneCachePromise;
};

