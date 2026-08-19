/**
 * Profile save orchestration (name, phones, emails, timezone).
 * Keeps Profile.js under the absolute 500-line component limit.
 */
import {
  extractId,
  getPrimaryEmail,
  getPrimaryPhone,
  splitCombinedIdentity,
  normalizeNameValue,
  normalizeAliasValue,
  normalizePhonesForCompare,
  normalizeEmailsForCompare,
  isSameList,
  resolveTimezoneId,
  resolveTimezoneName,
  toPeopleIri,
} from '@controleonline/ui-people/src/react/utils/profileFormUtils';
import { savePhones, saveEmails } from '@controleonline/ui-people/src/react/utils/profileSaveOps';

export async function runProfileSave({
  user,
  phones,
  emails,
  selectedTimezoneId,
  profileName,
  profileAlias,
  originalPhoneIds,
  originalEmailIds,
  originalPhonesSnapshot,
  originalEmailsSnapshot,
  originalTimezoneSnapshot,
  originalNameSnapshot,
  originalAliasSnapshot,
  originalPhonesItems,
  originalEmailsItems,
  phonesActions,
  emailsActions,
  peopleActions,
  usersActions,
  authActions,
  availableTimezones,
  saveUserTimezone,
  setPhones,
  setEmails,
  setSelectedTimezoneId,
  setProfileName,
  setProfileAlias,
  setIsEditingName,
  setIsEditingAlias,
  showError,
  showSuccess,
}) {
  const peopleIri = toPeopleIri(user);
  if (!peopleIri) {
    showError?.(global.t?.t("people", "error", "Unable to identify profile to save data."));
    return false;
  }

  try {
    const normalizedIdentity = splitCombinedIdentity(profileName, profileAlias);
    const normalizedName = normalizedIdentity.name;
    const normalizedAlias = normalizedIdentity.alias;
    if (!normalizedName) {
      throw new Error(global.t?.t("people", "error", "Please enter a valid name."));
    }

    const phonesChanged = !isSameList(
      normalizePhonesForCompare(phones),
      originalPhonesSnapshot.current,
    );
    const emailsChanged = !isSameList(
      normalizeEmailsForCompare(emails),
      originalEmailsSnapshot.current,
    );
    const timezoneChanged =
      extractId(selectedTimezoneId) !== originalTimezoneSnapshot.current;
    const nameChanged = normalizedName !== originalNameSnapshot.current;
    const aliasChanged = normalizedAlias !== originalAliasSnapshot.current;

    let persistedPhones = phones;
    let persistedEmails = emails;
    let persistedTimezoneId = extractId(selectedTimezoneId);
    let persistedUserSession = null;

    if (phonesChanged) {
      persistedPhones = await savePhones(
        phones,
        peopleIri,
        phonesActions,
        originalPhoneIds.current,
      );
    }

    if (emailsChanged) {
      persistedEmails = await saveEmails(
        emails,
        peopleIri,
        emailsActions,
        originalEmailIds.current,
      );
    }

    if (timezoneChanged) {
      try {
        persistedUserSession = await saveUserTimezone(persistedTimezoneId);
        persistedTimezoneId =
          resolveTimezoneId(persistedUserSession) ||
          persistedTimezoneId;
      } catch (timezoneError) {
        persistedUserSession = null;
      }
    }

    if (nameChanged || aliasChanged) {
      const peopleId = extractId(peopleIri);
      if (peopleId && peopleActions?.save) {
        const peoplePayload = {
          id: peopleId,
          name: normalizedName,
          alias: normalizedAlias,
          nickname: normalizedAlias,
        };

        await peopleActions.save(peoplePayload);
      }
    }

    setPhones(persistedPhones);
    setEmails(persistedEmails);
    setSelectedTimezoneId(persistedTimezoneId);
    setProfileName(normalizedName);
    setProfileAlias(normalizedAlias);
    setIsEditingName(false);
    setIsEditingAlias(false);
    originalPhoneIds.current = persistedPhones.map(item => item.id).filter(Boolean);
    originalEmailIds.current = persistedEmails.map(item => item.id).filter(Boolean);
    originalPhonesSnapshot.current = normalizePhonesForCompare(persistedPhones);
    originalEmailsSnapshot.current = normalizeEmailsForCompare(persistedEmails);
    originalPhonesItems.current = persistedPhones.map(item => ({ ...item }));
    originalEmailsItems.current = persistedEmails.map(item => ({ ...item }));
    originalTimezoneSnapshot.current = persistedTimezoneId;
    originalNameSnapshot.current = normalizedName;
    originalAliasSnapshot.current = normalizedAlias;

    authActions.logIn({
      ...user,
      ...(persistedUserSession || {}),
      realname: normalizedName,
      name: normalizedName,
      alias: normalizedAlias,
      nickname: normalizedAlias,
      phone: persistedPhones[0]?.value || getPrimaryPhone(user?.phone),
      email: persistedEmails[0]?.value || getPrimaryEmail(user?.email),
      timezone: persistedTimezoneId
        ? `/timezones/${persistedTimezoneId}`
        : null,
      timezone_id: persistedTimezoneId || null,
      timezoneId: persistedTimezoneId || null,
    });

    showSuccess?.(global.t?.t("people", "success", "Data saved successfully."));
    return true;
  } catch (error) {
    setEmails(originalEmailsItems.current.map(item => ({ ...item })));
    setPhones(originalPhonesItems.current.map(item => ({ ...item })));
    setProfileName(originalNameSnapshot.current || '');
    setProfileAlias(originalAliasSnapshot.current || '');
    setSelectedTimezoneId(originalTimezoneSnapshot.current || '');
    setIsEditingName(false);
    setIsEditingAlias(false);
    showError?.(error?.message || global.t?.t("people", "error", "Unable to save profile data."));
    return false;
  }
}
