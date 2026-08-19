/**
 * Profile data loading: phones/emails/timezones + avatar media.
 * Stable deps only (peopleIriKey / userIdKey / companyIdKey) to avoid React #185.
 */
import { useCallback, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { resolveFileImageUrl } from '@controleonline/ui-common/src/react/utils/fileUrl';
import {
  toPhoneItem,
  toEmailItem,
  toPeopleIri,
  toTimezoneItem,
  resolveTimezoneId,
  extractCollectionItems,
  splitCombinedIdentity,
  getDisplayName,
  getDisplayAlias,
  getAvatarFromUser,
  normalizePhonesForCompare,
  normalizeEmailsForCompare,
  normalizeCollection,
  fetchTimezonesCached,
} from '@controleonline/ui-people/src/react/utils/profileFormUtils';

/**
 * Pure guard used by fetchUser to avoid re-entry / re-fetch loops (React #185).
 * Exported for unit coverage of the coalescence rules.
 *
 * @param {{ inFlight: boolean, hasInitiallyLoaded: boolean, forceRefresh?: boolean }} state
 * @returns {'in-flight' | 'already-loaded' | 'run'}
 */
export function shouldSkipProfileFetch({
  inFlight,
  hasInitiallyLoaded,
  forceRefresh = false,
}) {
  if (inFlight) {
    return 'in-flight';
  }
  if (hasInitiallyLoaded && !forceRefresh) {
    return 'already-loaded';
  }
  return 'run';
}

export function useProfileLoad({
  userIdKey,
  peopleIriKey,
  companyIdKey,
  userRef,
  phonesActionsRef,
  emailsActionsRef,
  timezonesActionsRef,
  peopleActionsRef,
  currentCompanyRef,
  timezoneFiltersRef,
  setIsFetchingProfile,
  setPhones,
  setEmails,
  setTimezones,
  setSelectedTimezoneId,
  setAvatarOverride,
  setProfileName,
  setProfileAlias,
  setIsEditingName,
  setIsEditingAlias,
  setAvatarMediaType,
  setAvatarPeopleMedia,
  originalPhoneIds,
  originalEmailIds,
  originalPhonesSnapshot,
  originalEmailsSnapshot,
  originalPhonesItems,
  originalEmailsItems,
  originalTimezoneSnapshot,
  originalNameSnapshot,
  originalAliasSnapshot,
}) {
  const fetchPromiseRef = useRef(null);
  const hasInitiallyLoadedRef = useRef(false);

  const fetchUser = useCallback(async (forceRefresh = false) => {
    const decision = shouldSkipProfileFetch({
      inFlight: Boolean(fetchPromiseRef.current),
      hasInitiallyLoaded: hasInitiallyLoadedRef.current,
      forceRefresh,
    });

    // Evita requisições duplicadas quando já há uma em andamento
    if (decision === 'in-flight') {
      return fetchPromiseRef.current;
    }

    // Se já carregou inicialmente e não é refresh forçado, não recarrega
    if (decision === 'already-loaded') {
      return;
    }

    setIsFetchingProfile(true);

    const promise = (async () => {
      try {
        const userSnapshot = userRef.current;
        const phonesActions = phonesActionsRef.current;
        const emailsActions = emailsActionsRef.current;
        const timezonesActions = timezonesActionsRef.current;
        const timezoneFilters = timezoneFiltersRef.current;

        const fallbackPhones = (Array.isArray(userSnapshot?.phone) ? userSnapshot.phone : [userSnapshot?.phone])
          .map(toPhoneItem)
          .filter(item => item && item.value);
        const fallbackEmails = (Array.isArray(userSnapshot?.email) ? userSnapshot.email : [userSnapshot?.email])
          .map(toEmailItem)
          .filter(item => item && item.value);

        let parsedPhones = fallbackPhones;
        let parsedEmails = fallbackEmails;
        let parsedTimezones = [];
        // A sessão autenticada já carrega o timezone do login atual.
        let parsedTimezoneId = resolveTimezoneId(userSnapshot);
        const peopleIri = toPeopleIri(userSnapshot);

        const [remotePhones, remoteEmails, timezoneResponse] = await Promise.all([
          peopleIri
            ? phonesActions.getItems({people: peopleIri}).catch(() => fallbackPhones)
            : Promise.resolve(fallbackPhones),
          peopleIri
            ? emailsActions.getItems({people: peopleIri}).catch(() => fallbackEmails)
            : Promise.resolve(fallbackEmails),
          fetchTimezonesCached(timezonesActions, timezoneFilters).catch(() => ({
            member: [],
          })),
        ]);

        const normalizedRemotePhones = (Array.isArray(remotePhones) ? remotePhones : [])
          .map(toPhoneItem)
          .filter(item => item && item.value);
        const normalizedRemoteEmails = (Array.isArray(remoteEmails) ? remoteEmails : [])
          .map(toEmailItem)
          .filter(item => item && item.value);
        parsedPhones =
          normalizedRemotePhones.length > 0 ? normalizedRemotePhones : fallbackPhones;
        parsedEmails =
          normalizedRemoteEmails.length > 0 ? normalizedRemoteEmails : fallbackEmails;
        parsedTimezones = extractCollectionItems(timezoneResponse)
          .map(toTimezoneItem)
          .filter(Boolean);

        setPhones(parsedPhones);
        setEmails(parsedEmails);
        setTimezones(parsedTimezones);
        setSelectedTimezoneId(parsedTimezoneId);
        setAvatarOverride(getAvatarFromUser(userSnapshot));
        const loadedIdentity = splitCombinedIdentity(
          getDisplayName(userSnapshot),
          getDisplayAlias(userSnapshot),
        );
        const loadedName = loadedIdentity.name;
        const loadedAlias = loadedIdentity.alias;
        setProfileName(loadedName);
        setProfileAlias(loadedAlias);
        setIsEditingName(false);
        setIsEditingAlias(false);
        originalPhoneIds.current = parsedPhones.map(item => item.id).filter(Boolean);
        originalEmailIds.current = parsedEmails.map(item => item.id).filter(Boolean);
        originalPhonesSnapshot.current = normalizePhonesForCompare(parsedPhones);
        originalEmailsSnapshot.current = normalizeEmailsForCompare(parsedEmails);
        originalPhonesItems.current = parsedPhones.map(item => ({ ...item }));
        originalEmailsItems.current = parsedEmails.map(item => ({ ...item }));
        originalTimezoneSnapshot.current = parsedTimezoneId;
        originalNameSnapshot.current = loadedName;
        originalAliasSnapshot.current = loadedAlias;

        hasInitiallyLoadedRef.current = true;
      } finally {
        setIsFetchingProfile(false);
        fetchPromiseRef.current = null;
      }
    })();

    fetchPromiseRef.current = promise;
    return promise;
  }, [userIdKey, peopleIriKey]);

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [fetchUser]),
  );

  const loadAvatarMedia = useCallback(async () => {
    const iri = peopleIriKey;
    const actions = peopleActionsRef.current;
    const company = currentCompanyRef.current;

    if (!iri) {
      setAvatarMediaType(null);
      setAvatarPeopleMedia(null);
      return null;
    }

    const [mediaTypes, peopleMedia] = await Promise.all([
      actions.getMediaTypes({
        type: 'avatar',
        peopleType: 'F',
        itemsPerPage: 1,
      }).catch(() => []),
      actions.getPeopleMedia({
        people: iri,
        'mediaType.type': 'avatar',
        itemsPerPage: 1,
      }).catch(() => []),
    ]);

    setAvatarMediaType(normalizeCollection(mediaTypes)[0] || null);
    const nextPeopleMedia = normalizeCollection(peopleMedia)[0] || null;
    setAvatarPeopleMedia(nextPeopleMedia);
    if (nextPeopleMedia?.file) {
      setAvatarOverride(resolveFileImageUrl(nextPeopleMedia.file, { company }));
    } else {
      setAvatarOverride('');
    }
    return nextPeopleMedia;
  }, [peopleIriKey, companyIdKey]);

  useEffect(() => {
    void loadAvatarMedia();
  }, [loadAvatarMedia]);


  return { loadAvatarMedia, fetchUser };
}
