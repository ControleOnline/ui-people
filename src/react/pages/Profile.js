import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';

import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import css from '@controleonline/ui-people/src/react/css/people';
import { useStore } from '@store';
import PeopleAddressesPanel from '@controleonline/ui-people/src/react/components/address/PeopleAddressesPanel';
import { useFocusEffect } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useMessage} from '@controleonline/ui-common/src/react/components/MessageService';
import CompactFilterSelector from '@controleonline/ui-default/src/react/components/filters/CompactFilterSelector';
import {app_type} from '@appType';
import {
  formatDisplayUppercase,
  uppercaseText,
} from '@controleonline/ui-common/src/react/utils/entityDisplay';
import { resolveFileImageUrl } from '@controleonline/ui-common/src/react/utils/fileUrl';
import UserAvatar from '@controleonline/ui-common/src/react/components/UserAvatar';
import DefaultUpload from '@controleonline/ui-default/src/react/components/upload/DefaultUpload';
import { extractFileId } from '@controleonline/ui-default/src/react/components/upload/fileUpload';
import {
  getAvatarDisplayName,
  resolveUserPeopleIri,
} from '@controleonline/ui-common/src/react/utils/userAvatar';
import { resolvePeopleImageUrl } from '@controleonline/ui-people/src/react/utils/peopleImage';
import {resolveThemePalette} from '@controleonline/../../src/styles/branding';
import {colors} from '@controleonline/../../src/styles/colors';
import { isManagerAppType } from '@controleonline/ui-common/src/react/utils/managerOrderNotifications';
import { resolveLoggedUserId, persistSessionAvatar } from '@controleonline/ui-people/src/react/utils/profileSession';
import { inlineStyle_1025_20, inlineStyle_1042_16, inlineStyle_1051_63 } from './Profile.styles';

const extractPhoneDigits = value =>
  String(value || '')
    .replace(/\D/g, '')
    .slice(0, 11);

const formatPhoneValue = value => {
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

const splitPhoneValue = value => {
  const digits = extractPhoneDigits(value);
  if (digits.length < 2) {
    return {ddd: '', phone: ''};
  }

  return {
    ddd: digits.slice(0, 2),
    phone: digits.slice(2),
  };
};

const extractId = value => {
  const normalized = String(value || '').replace(/\D/g, '');
  return normalized || '';
};

const getSessionData = () => {
  try {
    return JSON.parse(localStorage.getItem('session') || '{}');
  } catch {
    return {};
  }
};

const toPeopleIri = user => {
  const session = getSessionData();
  return resolveUserPeopleIri(user, session);
};

const normalizeCollection = payload => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload.member)) return payload.member;
  if (Array.isArray(payload['hydra:member'])) return payload['hydra:member'];
  if (Array.isArray(payload.items)) return payload.items;
  return [];
};

const toPhoneItem = entry => {
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

const toEmailItem = entry => {
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

const getPrimaryEmail = value => {
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

const getPrimaryPhone = value => {
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

const getDisplayName = user =>
  String(user?.name || user?.realname || user?.username || 'Usuario').trim();

const getDisplayAlias = user =>
  String(user?.alias || user?.nickname || '').trim();

const getAvatarFromUser = user => {
  return resolvePeopleImageUrl(user, resolveFileImageUrl);
};

const validateEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const normalizeEmailValue = value => String(value || '').trim().toLowerCase();

const normalizeNameValue = value =>
  formatDisplayUppercase(
    String(value || '')
      .replace(/\s+/g, ' ')
      .trim(),
  );

const normalizeAliasValue = value =>
  formatDisplayUppercase(
    String(value || '')
      .replace(/\s+/g, ' ')
      .trim(),
  );

const toTimezoneItem = entry => {
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

const resolveTimezoneId = value => {
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

const resolveTimezoneName = value => {
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

const extractCollectionItems = payload => {
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

const splitCombinedIdentity = (nameValue, aliasValue) => {
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

const normalizePhonesForCompare = items =>
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

const normalizeEmailsForCompare = items =>
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

const isSameList = (left, right) => {
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

const fetchTimezonesCached = async (timezonesActions, timezoneFilters = {}) => {
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

const Profile = ({ navigation }) => {
  const themeStore = useStore('theme');
  const themeColors = themeStore?.getters?.colors || {};
  const palette = useMemo(
    () => ({
      pageBackground: themeColors.pageBackground,
      cardBackground: themeColors.cardBackground,
      textPrimary: themeColors.textPrimary,
      textSecondary: themeColors.textSecondary,
      buttonBackground: themeColors.buttonBackground,
      buttonBorder: themeColors.buttonBorder,
      buttonIcon: themeColors.buttonIcon,
      buttonBackgroundSecondary: themeColors.buttonBackgroundSecondary,
      buttonText: themeColors.buttonText,
      buttonIconSecondary: themeColors.buttonIconSecondary,
      cardIcon: themeColors.cardIcon,
      selectBackground: themeColors.selectBackground,
      selectBorder: themeColors.selectBorder,
      selectIcon: themeColors.selectIcon,
      selectText: themeColors.selectText,
      textDanger: themeColors.textDanger,
    }),
    [themeColors],
  );
  const { styles } = css(palette);
  const authStore = useStore('auth');
  const peopleStore = useStore('people');
  const phonesStore = useStore('phones');
  const emailsStore = useStore('emails');
  const timezonesStore = useStore('timezones');
  const usersStore = useStore('users');
  const {showSuccess, showError} = useMessage() || {};
  const userGetters = authStore.getters;
  const peopleGetters = peopleStore.getters;
  const authActions = authStore.actions;
  const peopleActions = peopleStore.actions;
  const phonesActions = phonesStore.actions;
  const emailsActions = emailsStore.actions;
  const timezonesActions = timezonesStore.actions;
  const timezoneFilters = timezonesStore.getters.filters;
  const usersActions = usersStore.actions;
  const { user: storeUser } = userGetters;
  const user = useMemo(() => {
    if (storeUser && Object.keys(storeUser).length > 0) {
      return storeUser;
    }

    try {
      const sessionUser = JSON.parse(localStorage.getItem('session') || '{}');
      return sessionUser && Object.keys(sessionUser).length > 0 ? sessionUser : null;
    } catch {
      return null;
    }
  }, [storeUser]);
  const {currentCompany} = peopleGetters;
  const avatarBrandColors = useMemo(
    () =>
      resolveThemePalette(
        {...themeColors, ...(currentCompany?.theme?.colors || {})},
        colors,
      ),
    [currentCompany?.id, currentCompany?.theme?.colors, themeColors],
  );
  const [phones, setPhones] = useState([]);
  const [emails, setEmails] = useState([]);
  const [profileName, setProfileName] = useState('');
  const [profileAlias, setProfileAlias] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [avatarOverride, setAvatarOverride] = useState('');
  const [avatarMediaType, setAvatarMediaType] = useState(null);
  const [avatarPeopleMedia, setAvatarPeopleMedia] = useState(null);
  const originalPhoneIds = useRef([]);
  const originalEmailIds = useRef([]);
  const originalPhonesSnapshot = useRef([]);
  const originalEmailsSnapshot = useRef([]);
  const originalTimezoneSnapshot = useRef('');
  const originalNameSnapshot = useRef('');
  const originalAliasSnapshot = useRef('');
  const [timezones, setTimezones] = useState([]);
  const [selectedTimezoneId, setSelectedTimezoneId] = useState('');
  const fetchPromiseRef = useRef(null);
  const hasInitiallyLoadedRef = useRef(false);

  const fetchUser = useCallback(async (forceRefresh = false) => {
    // Evita requisições duplicadas quando já há uma em andamento
    if (fetchPromiseRef.current) {
      return fetchPromiseRef.current;
    }

    // Se já carregou inicialmente e não é refresh forçado, não recarrega
    if (hasInitiallyLoadedRef.current && !forceRefresh) {
      return;
    }

    setIsFetchingProfile(true);

    const promise = (async () => {
      try {
        const fallbackPhones = (Array.isArray(user?.phone) ? user.phone : [user?.phone])
          .map(toPhoneItem)
          .filter(item => item && item.value);
        const fallbackEmails = (Array.isArray(user?.email) ? user.email : [user?.email])
          .map(toEmailItem)
          .filter(item => item && item.value);

        let parsedPhones = fallbackPhones;
        let parsedEmails = fallbackEmails;
        let parsedTimezones = [];
        // A sessão autenticada já carrega o timezone do login atual.
        let parsedTimezoneId = resolveTimezoneId(user);
        const peopleIri = toPeopleIri(user);

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
        setAvatarOverride(getAvatarFromUser(user));
        const loadedIdentity = splitCombinedIdentity(
          getDisplayName(user),
          getDisplayAlias(user),
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
  }, [emailsActions, phonesActions, timezoneFilters, timezonesActions, user]);

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [fetchUser]),
  );

  const loadAvatarMedia = useCallback(async () => {
    const peopleIri = toPeopleIri(user);

    if (!peopleIri) {
      setAvatarMediaType(null);
      setAvatarPeopleMedia(null);
      return null;
    }

    const [mediaTypes, peopleMedia] = await Promise.all([
      peopleActions.getMediaTypes({
        type: 'avatar',
        peopleType: 'F',
        itemsPerPage: 1,
      }).catch(() => []),
      peopleActions.getPeopleMedia({
        people: peopleIri,
        'mediaType.type': 'avatar',
        itemsPerPage: 1,
      }).catch(() => []),
    ]);

    setAvatarMediaType(normalizeCollection(mediaTypes)[0] || null);
    const nextPeopleMedia = normalizeCollection(peopleMedia)[0] || null;
    setAvatarPeopleMedia(nextPeopleMedia);
    if (nextPeopleMedia?.file) {
      setAvatarOverride(resolveFileImageUrl(nextPeopleMedia.file, { company: currentCompany }));
    } else {
      setAvatarOverride('');
    }
    return nextPeopleMedia;
  }, [currentCompany, peopleActions, user]);

  useEffect(() => {
    void loadAvatarMedia();
  }, [loadAvatarMedia]);

  const availableTimezones = useMemo(() => {
    return Array.isArray(timezones) ? timezones : [];
  }, [timezones]);

  const timezoneOptions = useMemo(
    () => [
      {
        key: '',
        label: global.t?.t('invoice', 'label', 'select'),
      },
      ...availableTimezones.map(timezone => ({
        key: timezone.id,
        label: timezone.displayName || timezone.name,
      })),
    ],
    [availableTimezones],
  );

  const selectedTimezoneLabel = (() => {
    const matchedTimezone = availableTimezones.find(
      timezone => timezone.id === selectedTimezoneId,
    );

    return (
      matchedTimezone?.displayName || matchedTimezone?.name ||
      global.t?.t('people', 'label', 'select_timezone')
    );
  })();

  const canConfigureManagerNotifications = useMemo(
    () => isManagerAppType(app_type),
    [],
  );

  const avatarImageUrl = avatarOverride || getAvatarFromUser(user);
  const avatarEmail = emails[0]?.value || getPrimaryEmail(user?.email);

  const handleLogout = () => {
    authActions.logOut();
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'SignInPage',
          params: {redirectRoute: 'HomePage'},
        },
      ],
    });
  };

  const handleAvatarChanged = useCallback(async () => {
    const nextPeopleMedia = await loadAvatarMedia();
    // Keep localStorage session.avatar in sync so headers/menus stop using stale URLs.
    try {
      persistSessionAvatar(nextPeopleMedia?.file ?? null);
    } catch {
      // session sync is best-effort; profile media already reloaded above
    }
    showSuccess?.(global.t?.t("people", "success", "Profile photo updated successfully."));
  }, [loadAvatarMedia, showSuccess]);

  const attachAvatarFile = useCallback(async file => {
    const fileId = extractFileId(file);
    const peopleIri = toPeopleIri(user);
    const mediaTypeId = extractId(avatarMediaType?.id || avatarMediaType?.['@id']);

    if (!fileId || !peopleIri || !mediaTypeId) {
      throw new Error(global.t?.t("people", "error", "Unable to update profile photo."));
    }

    return peopleActions.savePeopleMedia({
      id: avatarPeopleMedia?.id || avatarPeopleMedia?.['@id'],
      people: peopleIri,
      mediaType: `/media_types/${mediaTypeId}`,
      file: `/files/${fileId}`,
    });
  }, [avatarMediaType, avatarPeopleMedia, peopleActions, user]);

  const uploadAvatarFile = useCallback(async ({file}) => {
    const mimeType = String(file?.type || '').trim().toLowerCase();
    const fileName = String(file?.name || '').trim().toLowerCase();
    if (mimeType !== 'image/png' && !fileName.endsWith('.png')) {
      throw new Error(global.t?.t("people", "error", "Please select a PNG image."));
    }

    const mediaTypeId = extractId(avatarMediaType?.id || avatarMediaType?.['@id']);
    if (!mediaTypeId) {
      throw new Error(global.t?.t("people", "error", "Unable to update profile photo."));
    }

    return peopleActions.uploadPeopleMedia({
      people: toPeopleIri(user),
      mediaTypeId,
      file,
    });
  }, [avatarMediaType, peopleActions, user]);

  const syncRemovedItems = async (originalIds, currentIds, removeAction) => {
    const currentSet = new Set(currentIds.filter(Boolean));

    for (const id of originalIds) {
      if (!currentSet.has(id)) {
        await removeAction(id);
      }
    }
  };

  const savePhones = async peopleIri => {
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
    await syncRemovedItems(
      originalPhoneIds.current,
      currentIds,
      phonesActions.remove,
    );

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

  const saveEmails = async peopleIri => {
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
    await syncRemovedItems(
      originalEmailIds.current,
      currentIds,
      emailsActions.remove,
    );

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

  const saveUserTimezone = useCallback(
    async nextTimezoneId => {
      const normalizedTimezoneId = extractId(nextTimezoneId);
      const loggedUserId = resolveLoggedUserId(user);

      return usersActions.updateMyPreferences({
        id: loggedUserId || undefined,
        timezone: normalizedTimezoneId
          ? `/timezones/${normalizedTimezoneId}`
          : null,
      });
    },
    [user, usersActions],
  );

  const hasUnsavedChanges = useMemo(() => {
    const currentPhones = normalizePhonesForCompare(phones);
    const currentEmails = normalizeEmailsForCompare(emails);
    const currentTimezoneId = extractId(selectedTimezoneId);
    const currentName = normalizeNameValue(profileName);
    const currentAlias = normalizeAliasValue(profileAlias);

    return (
      !isSameList(currentPhones, originalPhonesSnapshot.current) ||
      !isSameList(currentEmails, originalEmailsSnapshot.current) ||
      currentTimezoneId !== originalTimezoneSnapshot.current ||
      currentName !== originalNameSnapshot.current ||
      currentAlias !== originalAliasSnapshot.current
    );
  }, [phones, emails, selectedTimezoneId, profileName, profileAlias]);

  const isEditingProfileIdentity = isEditingName || isEditingAlias;

  const toggleIdentityEditing = useCallback(() => {
    const next = !isEditingProfileIdentity;
    setIsEditingName(next);
    setIsEditingAlias(next);
  }, [isEditingProfileIdentity]);

  const handleSave = async () => {
    if (isSaving || !hasUnsavedChanges) {
      return;
    }

    const peopleIri = toPeopleIri(user);
    if (!peopleIri) {
      showError?.(global.t?.t("people", "error", "Unable to identify profile to save data."));
      return;
    }

    setIsSaving(true);

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
        persistedPhones = await savePhones(peopleIri);
      }

      if (emailsChanged) {
        persistedEmails = await saveEmails(peopleIri);
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
      originalTimezoneSnapshot.current = persistedTimezoneId;
      originalNameSnapshot.current = normalizedName;
      originalAliasSnapshot.current = normalizedAlias;
      const persistedTimezoneName =
        resolveTimezoneName(persistedUserSession?.timezone) ||
        resolveTimezoneName(persistedUserSession) ||
        availableTimezones.find(timezone => timezone.id === persistedTimezoneId)?.name ||
        null;

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
    } catch (error) {
      showError?.(error?.message || global.t?.t("people", "error", "Unable to save profile data."));
    } finally {
      setIsSaving(false);
    }
  };

  const renderTimezoneSelector = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {global.t?.t('people', 'label', 'timezone')}
        </Text>
      </View>

      <CompactFilterSelector
        active={!!selectedTimezoneId}
        accentColor={palette.selectIcon}
        icon="clock"
        label={selectedTimezoneLabel}
        labelCaption={global.t?.t('people', 'label', 'timezone')}
        onSelect={optionKey => {
          setSelectedTimezoneId(String(optionKey || '').trim());
        }}
        options={timezoneOptions}
        selectedKey={selectedTimezoneId}
        themeColors={{
          activeChevronColor: palette.selectIcon,
          activeIconColor: palette.selectIcon,
          activeTextColor: palette.selectText,
          backgroundColor: palette.selectBackground,
          borderColor: palette.selectBorder,
          captionColor: palette.selectText,
          chevronColor: palette.selectIcon,
          closeIconColor: palette.selectIcon,
          iconBackgroundColor: palette.selectBackground,
          iconColor: palette.selectIcon,
          modalBackgroundColor: palette.selectBackground,
          modalTitleColor: palette.selectText,
          optionBackgroundColor: palette.selectBackground,
          optionBorderColor: palette.selectBorder,
          optionSelectedTextColor: palette.selectText,
          textColor: palette.selectText,
        }}
        title={global.t?.t('people', 'title', 'select_timezone')}
      />

      {timezoneOptions.length <= 1 && (
        <Text style={styles.emptyText}>
          {global.t?.t('people', 'message', 'no_timezone_available')}
        </Text>
      )}
    </View>
  );

  const renderEditableList = (items, setItems, type) => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {type === 'phone' ? global.t?.t("people", "label", "phones") : global.t?.t("people", "label", "email")}
        </Text>
        <TouchableOpacity
          onPress={() => setItems([...items, {id: '', value: ''}])}
          style={styles.addButton}>
          <FeatherIcon name="plus" size={16} color={palette.buttonIcon} />
        </TouchableOpacity>
      </View>
      {items.map((item, index) => (
        <View
          key={`${type}-${item.id || index}`}
          style={[styles.cardItem, styles.cardItemWithActions]}>
          <Icon
            name={type === 'phone' ? 'phone' : 'email'}
            size={20}
            color={palette.cardIcon}
            style={styles.cardIcon}
          />
          <TextInput
            style={styles.input}
            value={item.value}
            onChangeText={text => {
              const newItems = [...items];
              newItems[index] = {
                ...newItems[index],
                value: type === 'phone' ? formatPhoneValue(text) : text,
              };
              setItems(newItems);
            }}
            placeholder={type === 'phone' ? global.t?.t("people", "placeholder", "addPhone") : global.t?.t("people", "placeholder", "addEmail")}
            placeholderTextColor={palette.textSecondary}
            keyboardType={type === 'phone' ? 'phone-pad' : 'email-address'}
            maxLength={type === 'phone' ? 15 : undefined}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => {
              const newItems = items.filter((_, i) => i !== index);
              setItems(newItems);
            }}
            style={styles.deleteAction}>
            <FeatherIcon name="trash-2" size={16} color={palette.buttonIcon} />
          </TouchableOpacity>
        </View>
      ))}
      {items.length === 0 && (
        <Text style={styles.emptyText}>{type === 'phone' ? global.t?.t("people", "message", "noPhoneRegistered") : global.t?.t("people", "message", "noEmailRegistered")}</Text>
      )}
    </View>
  );

  const renderProfileSkeleton = () => (
    <SafeAreaView style={styles.Profile}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.loadingSkeletonContainer}>
          <View style={styles.skeletonAvatar} />
          <View style={styles.skeletonName} />
          <View style={styles.skeletonEmail} />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.skeletonSection}>
            <View style={styles.skeletonSectionHeader} />
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonLine} />
          </View>

          <View style={styles.skeletonSection}>
            <View style={styles.skeletonSectionHeader} />
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonLine} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  if (!user || !user?.id) {
    return (
      <SafeAreaView style={styles.Profile}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {global.t?.t("people", "error", "unableLoadUserData")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isFetchingProfile) {
    return renderProfileSkeleton();
  }

  return (
    <SafeAreaView style={styles.Profile}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <View style={styles.avatarContainer}>
            <UserAvatar
              imageUrl={avatarImageUrl}
              email={avatarEmail}
              name={getAvatarDisplayName(user)}
              size={120}
              backgroundColor={
                avatarBrandColors.buttonBackground || avatarBrandColors.primary
              }
              borderColor={avatarBrandColors.buttonText || avatarBrandColors.white}
              borderWidth={3}
              textColor={avatarBrandColors.buttonText || avatarBrandColors.white}
              style={styles.avatar}
            />
            <DefaultUpload
              relationStoreName="people"
              relationField="people"
              relationResource="people"
              entityId={extractId(toPeopleIri(user))}
              companyId={extractId(toPeopleIri(user))}
              context="people_media"
              libraryContexts={['people_media']}
              attachments={avatarPeopleMedia ? [avatarPeopleMedia] : []}
              acceptedTypes="image/png,.png"
              fileType="image"
              fileTypeLabel="imagem"
              title="avatar"
              triggerLabel="Gerenciar avatar"
              managerTitle="Gerenciador de avatar"
              searchPlaceholder="Buscar imagem"
              uploadButtonLabel="Enviar nova"
              emptyAttachmentLabel="Nenhuma imagem vinculada."
              emptyLibraryLabel="Nenhuma imagem encontrada."
              uploadSuccessMessage="Avatar atualizado com sucesso."
              attachSuccessMessage="Avatar vinculado com sucesso."
              removeSuccessMessage="Avatar removido."
              showInlineContent={false}
              uploadResultAlreadyAttached
              onAttachFile={attachAvatarFile}
              onUploadFile={uploadAvatarFile}
              onRemoveAttachment={async relation => {
                await peopleActions.deletePeopleMedia({mediaId: relation?.id || relation?.['@id']});
              }}
              onChanged={handleAvatarChanged}
              renderTrigger={({disabled, openManager, uploading}) => (
                <TouchableOpacity
                  style={styles.editAvatarButton}
                  onPress={openManager}
                  accessibilityLabel="subir avatar"
                  activeOpacity={0.85}
                  disabled={disabled}>
                  {uploading ? (
                    <ActivityIndicator size="small" color={palette.buttonText} />
                  ) : (
                    <Icon name="camera-alt" size={20} color={palette.buttonText} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
          <View style={styles.userNameRow}>
            {isEditingName ? (
              <TextInput
                style={styles.userNameInput}
                value={profileName}
                onChangeText={text => setProfileName(uppercaseText(text))}
                placeholder={global.t?.t("people", "placeholder", "emailLogin")}
                placeholderTextColor={palette.textSecondary}
                maxLength={80}
                returnKeyType="next"
              />
            ) : (
              <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
                {profileName || getDisplayName(user)}
              </Text>
            )}
            <TouchableOpacity
              style={styles.editNameButton}
              onPress={toggleIdentityEditing}
              activeOpacity={0.85}>
              <Icon
                name={isEditingProfileIdentity ? 'check' : 'edit'}
                size={18}
                color={palette.cardIcon}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.userAliasRow}>
            {isEditingAlias ? (
              <TextInput
                style={styles.userAliasInput}
                value={profileAlias}
                onChangeText={text => setProfileAlias(uppercaseText(text))}
                placeholder={global.t?.t("people", "placeholder", "alias")}
                placeholderTextColor={palette.textSecondary}
                maxLength={40}
                returnKeyType="done"
              />
            ) : (
              <Text style={styles.userAlias} numberOfLines={1} ellipsizeMode="tail">
                {formatDisplayUppercase(profileAlias || getDisplayAlias(user)) || '-'}
              </Text>
            )}
          </View>
          <Text style={styles.userEmail} numberOfLines={1} ellipsizeMode="tail">
            {emails[0]?.value || getPrimaryEmail(user?.email)}
          </Text>
        </View>

        <View style={styles.contentContainer}>
          {renderTimezoneSelector()}
          {renderEditableList(phones, setPhones, 'phone')}
          {renderEditableList(emails, setEmails, 'email')}

          {toPeopleIri(user) ? (
            <PeopleAddressesPanel
              peopleIri={toPeopleIri(user)}
              title={global.t?.t('people', 'label', 'addresses') || 'Endereços'}
            />
          ) : null}

          {(hasUnsavedChanges || isSaving) && (
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator size="small" color={palette.buttonText} />
              ) : (
                <>
                  <Icon
                    name="save"
                    size={18}
                    color={palette.buttonText}
                    style={inlineStyle_1025_20}
                  />
                  <Text style={styles.saveButtonText}>{global.t?.t("people", "label", "save")}</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {canConfigureManagerNotifications && (
            <TouchableOpacity
              style={styles.profileActionButton}
              onPress={() => navigation.navigate('ManagerOrderNotificationsPage')}
              activeOpacity={0.85}>
              <Icon
                name="notifications-active"
                size={20}
                color={palette.buttonText}
                style={inlineStyle_1042_16}
              />
              <Text style={styles.profileActionButtonText}>
                Configurar notificações de pedidos
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.profileActionButton}
            onPress={handleLogout}
            activeOpacity={0.85}>
            <Icon
              name="logout"
              size={20}
              color={palette.buttonText}
              style={inlineStyle_1051_63}
            />
            <Text style={styles.profileActionButtonText}>
              {global.t?.t("people", "label", "logout")}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
