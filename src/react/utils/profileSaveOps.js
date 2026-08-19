/**
 * Profile phone/email persistence helpers.
 */
import {
  extractPhoneDigits,
  formatPhoneValue,
  splitPhoneValue,
  extractId,
  validateEmail,
  normalizeEmailValue,
} from '@controleonline/ui-people/src/react/utils/profileFormUtils';

export const syncRemovedItems = async (originalIds, currentIds, removeAction) => {
  const currentSet = new Set(currentIds.filter(Boolean));

  for (const id of originalIds) {
    if (!currentSet.has(id)) {
      await removeAction(id);
    }
  }
};

export const savePhones = async (phones, peopleIri, phonesActions, originalPhoneIds) => {
  const filtered = phones
    .map(item => ({
      ...item,
      value: formatPhoneValue(item?.value || ''),
    }))
    .filter(item => extractPhoneDigits(item.value).length > 0);

  const invalidPhone = filtered.find(item => {
    const digits = extractPhoneDigits(item.value);
    return digits.length !== 10 && digits.length !== 11;
  });

  if (invalidPhone) {
    throw new Error(global.t?.t("people", "error", "Phone number with area code must have 10 or 11 digits."));
  }

  const duplicatedPhone = (() => {
    const seen = new Set();
    for (const item of filtered) {
      const digits = extractPhoneDigits(item.value);
      if (seen.has(digits)) {
        return item;
      }
      seen.add(digits);
    }
    return null;
  })();

  if (duplicatedPhone) {
    throw new Error(global.t?.t("people", "error", "Duplicate phone numbers are not allowed."));
  }

  const currentIds = filtered.map(item => extractId(item.id)).filter(Boolean);
  await syncRemovedItems(originalPhoneIds, currentIds, phonesActions.remove);

  const persistedPhones = [];
  for (const item of filtered) {
    const digits = extractPhoneDigits(item.value);
    const {ddd, phone} = splitPhoneValue(digits);
    const payload = {
      ddi: 55,
      ddd: parseInt(ddd, 10),
      phone: parseInt(phone, 10),
      people: peopleIri,
    };

    const itemId = extractId(item.id);
    if (itemId) {
      payload.id = itemId;
    }

    const saved = await phonesActions.save(payload);
    const savedId = extractId(saved?.id || saved?.['@id'] || itemId);
    const savedValue = formatPhoneValue(
      `${saved?.ddd || ddd}${saved?.phone || phone}`,
    );

    persistedPhones.push({
      id: savedId,
      value: savedValue,
    });
  }

  return persistedPhones;
};

export const saveEmails = async (emails, peopleIri, emailsActions, originalEmailIds) => {
  const filtered = emails
    .map(item => ({
      ...item,
      value: String(item?.value || '').trim(),
    }))
    .filter(item => item.value.length > 0);

  const invalidEmail = filtered.find(item => !validateEmail(item.value));
  if (invalidEmail) {
    throw new Error(global.t?.t("people", "error", "Please enter a valid email address."));
  }

  const duplicatedEmail = (() => {
    const seen = new Set();
    for (const item of filtered) {
      const normalizedEmail = normalizeEmailValue(item.value);
      if (seen.has(normalizedEmail)) {
        return item;
      }
      seen.add(normalizedEmail);
    }
    return null;
  })();

  if (duplicatedEmail) {
    throw new Error(global.t?.t("people", "error", "Duplicate email addresses are not allowed."));
  }

  const currentIds = filtered.map(item => extractId(item.id)).filter(Boolean);
  await syncRemovedItems(originalEmailIds, currentIds, emailsActions.remove);

  const persistedEmails = [];
  for (const item of filtered) {
    const payload = {
      email: item.value,
      people: peopleIri,
    };

    const itemId = extractId(item.id);
    if (itemId) {
      payload.id = itemId;
    }

    const saved = await emailsActions.save(payload);
    persistedEmails.push({
      id: extractId(saved?.id || saved?.['@id'] || itemId),
      value: String(saved?.email || item.value),
    });
  }

  return persistedEmails;
};
