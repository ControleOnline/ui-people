import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import css from '@controleonline/ui-people/src/react/css/people';
import { useStore } from '@store';
import { useFocusEffect } from '@react-navigation/native';
import md5 from 'md5';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '@controleonline/../../src/styles/colors';
import {useMessage} from '@controleonline/ui-common/src/react/components/MessageService';
import { env as APP_ENV } from '@env';
import { buildScreenMetrics } from '@controleonline/ui-common/src/react/utils/screenMetrics';

const {version: appVersion} = require('../../../../../../package.json');

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

const unwrapUploadFile = payload => {
  const data = payload?.response?.data ?? payload?.data ?? payload;

  if (!data) {
    return null;
  }

  if (data?.file) {
    return data.file;
  }

  if (Array.isArray(data)) {
    return data[0] || null;
  }

  if (Array.isArray(data?.member)) {
    return data.member[0] || null;
  }

  if (Array.isArray(data?.['hydra:member'])) {
    return data['hydra:member'][0] || null;
  }

  if (Array.isArray(data?.files)) {
    return data.files[0] || null;
  }

  return data;
};

const getSessionData = () => {
  try {
    return JSON.parse(localStorage.getItem('session') || '{}');
  } catch (error) {
    return {};
  }
};

const toPeopleIri = user => {
  const session = getSessionData();
  const candidates = [
    session?.people,
    session?.person,
    session?.peopleId,
    session?.people_id,
    user?.people?.['@id'],
    user?.people?.id,
    user?.people,
    user?.person?.['@id'],
    user?.person?.id,
    user?.person,
    user?.peopleId,
    user?.people_id,
    user?.person_id,
    user?.['@id'],
    user?.id,
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const normalized = String(candidate).trim();
    if (!normalized) {
      continue;
    }

    if (normalized.includes('/people/')) {
      return normalized;
    }

    const id = extractId(normalized);
    if (id) {
      return `/people/${id}`;
    }
  }

  return '';
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
  String(user?.realname || user?.name || user?.username || 'Usuario').trim();

const getDisplayAlias = user =>
  String(user?.alias || user?.nickname || '').trim();

const getAvatarFromUser = user => {
  if (typeof user?.avatarUrl === 'string' && user.avatarUrl) {
    return user.avatarUrl;
  }

  if (user?.avatar?.url) {
    const domain = user?.avatar?.domain || APP_ENV?.API_ENTRYPOINT || '';
    return `${domain}${user.avatar.url}`;
  }

  return '';
};

const validateEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const normalizeEmailValue = value => String(value || '').trim().toLowerCase();
const normalizeNameValue = value =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeAliasValue = value =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim();

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

const Profile = ({ navigation }) => {
  const { styles } = css();
  const authStore = useStore('auth');
  const peopleStore = useStore('people');
  const deviceConfigStore = useStore('device_config');
  const phonesStore = useStore('phones');
  const emailsStore = useStore('emails');
  const {showSuccess, showError} = useMessage() || {};
  const userGetters = authStore.getters;
  const peopleGetters = peopleStore.getters;
  const deviceConfigGetters = deviceConfigStore.getters;
  const authActions = authStore.actions;
  const peopleActions = peopleStore.actions;
  const phonesActions = phonesStore.actions;
  const emailsActions = emailsStore.actions;
  const { item: deviceConfig } = deviceConfigGetters;
  const { user: storeUser } = userGetters;
  const user = useMemo(() => {
    if (storeUser && Object.keys(storeUser).length > 0) {
      return storeUser;
    }

    try {
      const sessionUser = JSON.parse(localStorage.getItem('session') || '{}');
      return sessionUser && Object.keys(sessionUser).length > 0 ? sessionUser : null;
    } catch (error) {
      return null;
    }
  }, [storeUser]);
  const currentResolution = useMemo(() => {
    return deviceConfig?.configs?.actualSize || buildScreenMetrics().actualSize || '-';
  }, [deviceConfig]);
  const {currentCompany} = peopleGetters;
  const [phones, setPhones] = useState([]);
  const [emails, setEmails] = useState([]);
  const [profileName, setProfileName] = useState('');
  const [profileAlias, setProfileAlias] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [avatarOverride, setAvatarOverride] = useState('');
  const originalPhoneIds = useRef([]);
  const originalEmailIds = useRef([]);
  const originalPhonesSnapshot = useRef([]);
  const originalEmailsSnapshot = useRef([]);
  const originalNameSnapshot = useRef('');
  const originalAliasSnapshot = useRef('');

  const fetchUser = useCallback(async () => {
    setIsFetchingProfile(true);
    try {
      const fallbackPhones = (Array.isArray(user?.phone) ? user.phone : [user?.phone])
        .map(toPhoneItem)
        .filter(item => item && item.value);
      const fallbackEmails = (Array.isArray(user?.email) ? user.email : [user?.email])
        .map(toEmailItem)
        .filter(item => item && item.value);

      let parsedPhones = fallbackPhones;
      let parsedEmails = fallbackEmails;
      const peopleIri = toPeopleIri(user);

      if (peopleIri) {
        try {
          const [remotePhones, remoteEmails] = await Promise.all([
            phonesActions.getItems({people: peopleIri}),
            emailsActions.getItems({people: peopleIri}),
          ]);

          const normalizedRemotePhones = (Array.isArray(remotePhones) ? remotePhones : [])
            .map(toPhoneItem)
            .filter(item => item && item.value);
          const normalizedRemoteEmails = (Array.isArray(remoteEmails) ? remoteEmails : [])
            .map(toEmailItem)
            .filter(item => item && item.value);

          parsedPhones = normalizedRemotePhones;
          parsedEmails = normalizedRemoteEmails;
        } catch (error) {
          parsedPhones = fallbackPhones;
          parsedEmails = fallbackEmails;
        }
      }

      setPhones(parsedPhones);
      setEmails(parsedEmails);
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
      originalNameSnapshot.current = loadedName;
      originalAliasSnapshot.current = loadedAlias;
    } finally {
      setIsFetchingProfile(false);
    }
  }, [emailsActions, phonesActions, user]);

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [fetchUser]),
  );

  const canShowResyncTranslations = useMemo(() => {
    return String(APP_ENV?.APP_TYPE || '').toUpperCase() !== 'POS';
  }, []);

  const getAvatarUrl = () => {
    const persistedAvatar = avatarOverride || getAvatarFromUser(user);
    if (persistedAvatar) {
      return persistedAvatar;
    }

    const firstEmail = emails[0]?.value || getPrimaryEmail(user?.email);
    if (!firstEmail) {
      return 'https://www.gravatar.com/avatar/?d=identicon';
    }

    const emailHash = md5(firstEmail.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${emailHash}?s=200&d=identicon`;
  };

  const handleLogout = () => {
    authActions.logOut();
    navigation.reset({
      index: 0,
      routes: [{ name: 'SignInPage' }],
    });
  };

  const handleClearTranslate = () => {
    Promise.resolve(global.t?.reload?.())
      .then(() => {
        global.refreshTranslationsUI?.();

        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.location.reload();
          return;
        }

        navigation.reset({
          index: 0,
          routes: [{name: 'ProfilePage'}],
        });
      })
      .catch(() => {});
  };

  const uploadAvatarFile = async file => {
    const session = JSON.parse(localStorage.getItem('session') || '{}');
    const token = user?.api_key || session?.api_key || session?.token;
    if (!token) {
      throw new Error(global.t?.t("people", "error", "Invalid session for photo upload."));
    }

    const peopleIri = toPeopleIri(user);
    const peopleId = extractId(peopleIri);
    const companyId = extractId(currentCompany?.id || session?.mycompany || peopleId);
    const host = APP_ENV?.DOMAIN || (typeof location !== 'undefined' ? location.host : '');

    const formData = new FormData();
    formData.append('file', file);
    if (companyId) {
      formData.append('people', companyId);
    }
    if (peopleId) {
      formData.append('id', peopleId);
    }
    formData.append('context', 'profile');

    const apiEntryPoint = String(APP_ENV?.API_ENTRYPOINT || '').replace(/\/$/, '');
    const response = await fetch(`${apiEntryPoint}/files/upload`, {
      method: 'POST',
      headers: {
        'API-TOKEN': token,
        'App-Domain': host,
        Accept: 'application/json',
      },
      body: formData,
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || result?.['@type'] === 'Error') {
      throw new Error(result?.description || result?.message ||  global.t?.t("people", "error", "Failed to upload profile photo."));
    }

    const uploadedFile = unwrapUploadFile(result);
    const fileId = extractId(
      uploadedFile?.id ||
      uploadedFile?.['@id'] ||
      result?.id ||
      result?.['@id'],
    );
    if (!fileId) {
      throw new Error(global.t?.t("people", "error", "Upload completed, but file not returned."));
    }

    return `${apiEntryPoint}/files/${fileId}/download?app-domain=${encodeURIComponent(host)}`;
  };

  const handleChangeAvatar = async () => {
    if (isSavingAvatar) {
      return;
    }

    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      showError?.(global.t?.t("people", "error", "Photo change available only in web mode in this version."));
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async event => {
      const file = event?.target?.files?.[0];
      if (!file) {
        return;
      }

      setIsSavingAvatar(true);
      try {
        const avatarUrl = await uploadAvatarFile(file);
        setAvatarOverride(avatarUrl);

        authActions.logIn({
          ...user,
          avatarUrl,
        });

        showSuccess?.(global.t?.t("people", "success", "Profile photo updated successfully."));
      } catch (error) {
        showError?.(error?.message || global.t?.t("people", "error", "Unable to update profile photo."));
      } finally {
        setIsSavingAvatar(false);
      }
    };

    input.click();
  };

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

  const hasUnsavedChanges = useMemo(() => {
    const currentPhones = normalizePhonesForCompare(phones);
    const currentEmails = normalizeEmailsForCompare(emails);
    const currentName = normalizeNameValue(profileName);
    const currentAlias = normalizeAliasValue(profileAlias);

    return (
      !isSameList(currentPhones, originalPhonesSnapshot.current) ||
      !isSameList(currentEmails, originalEmailsSnapshot.current) ||
      currentName !== originalNameSnapshot.current ||
      currentAlias !== originalAliasSnapshot.current
    );
  }, [phones, emails, profileName, profileAlias]);

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
      const nameChanged = normalizedName !== originalNameSnapshot.current;
      const aliasChanged = normalizedAlias !== originalAliasSnapshot.current;

      let persistedPhones = phones;
      let persistedEmails = emails;

      if (phonesChanged) {
        persistedPhones = await savePhones(peopleIri);
      }

      if (emailsChanged) {
        persistedEmails = await saveEmails(peopleIri);
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
      setProfileName(normalizedName);
      setProfileAlias(normalizedAlias);
      setIsEditingName(false);
      setIsEditingAlias(false);
      originalPhoneIds.current = persistedPhones.map(item => item.id).filter(Boolean);
      originalEmailIds.current = persistedEmails.map(item => item.id).filter(Boolean);
      originalPhonesSnapshot.current = normalizePhonesForCompare(persistedPhones);
      originalEmailsSnapshot.current = normalizeEmailsForCompare(persistedEmails);
      originalNameSnapshot.current = normalizedName;
      originalAliasSnapshot.current = normalizedAlias;

      authActions.logIn({
        ...user,
        realname: normalizedName,
        name: normalizedName,
        alias: normalizedAlias,
        nickname: normalizedAlias,
        phone: persistedPhones[0]?.value || getPrimaryPhone(user?.phone),
        email: persistedEmails[0]?.value || getPrimaryEmail(user?.email),
        avatarUrl: avatarOverride || user?.avatarUrl || '',
      });

      showSuccess?.(global.t?.t("people", "success", "Data saved successfully."));
    } catch (error) {
      showError?.(error?.message || global.t?.t("people", "error", "Unable to save profile data."));
    } finally {
      setIsSaving(false);
    }
  };

  const renderEditableList = (items, setItems, type) => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {type === 'phone' ? global.t?.t("people", "label", "phones") : global.t?.t("people", "label", "email")}
        </Text>
        <TouchableOpacity
          onPress={() => setItems([...items, {id: '', value: ''}])}
          style={styles.addButton}>
          <Icon name="add" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
      {items.map((item, index) => (
        <View key={`${type}-${item.id || index}`} style={styles.cardItem}>
          <Icon
            name={type === 'phone' ? 'phone' : 'email'}
            size={20}
            color={colors.primary}
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
            placeholderTextColor={colors.textSecondary}
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
            <Icon name="close" size={18} color={colors.error} />
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
            <Image source={{ uri: getAvatarUrl() }} style={styles.avatar} />
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={handleChangeAvatar}
              activeOpacity={0.85}
              disabled={isSavingAvatar}>
              {isSavingAvatar ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Icon name="camera-alt" size={20} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.userNameRow}>
            {isEditingName ? (
              <TextInput
                style={styles.userNameInput}
                value={profileName}
                onChangeText={setProfileName}
                placeholder={global.t?.t("people", "placeholder", "userName")}
                placeholderTextColor={colors.textSecondary}
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
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.userAliasRow}>
            {isEditingAlias ? (
              <TextInput
                style={styles.userAliasInput}
                value={profileAlias}
                onChangeText={setProfileAlias}
                placeholder={global.t?.t("people", "placeholder", "alias")}
                placeholderTextColor={colors.textSecondary}
                maxLength={40}
                returnKeyType="done"
              />
            ) : (
              <Text style={styles.userAlias} numberOfLines={1} ellipsizeMode="tail">
                {profileAlias || getDisplayAlias(user) || '-'}
              </Text>
            )}
          </View>
          <Text style={styles.userEmail} numberOfLines={1} ellipsizeMode="tail">
            {emails[0]?.value || getPrimaryEmail(user?.email)}
          </Text>
        </View>

        <View style={styles.contentContainer}>
          {renderEditableList(phones, setPhones, 'phone')}
          {renderEditableList(emails, setEmails, 'email')}

          {(hasUnsavedChanges || isSaving) && (
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Icon
                    name="save"
                    size={18}
                    color={colors.white}
                    style={{marginRight: 8}}
                  />
                  <Text style={styles.saveButtonText}>{global.t?.t("people", "label", "save")}</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {canShowResyncTranslations && (
            <TouchableOpacity
              style={styles.profileActionButton}
              onPress={handleClearTranslate}
              activeOpacity={0.85}>
              <Icon
                name="add-circle"
                size={20}
                color={colors.white}
                style={{marginRight: 8}}
              />
              <Text style={styles.profileActionButtonText}>
                {global.t?.t("configs", "label", "resync translations")}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
            <Icon name="logout" size={20} color={colors.error} style={{ marginRight: 8 }} />
            <Text style={styles.logoutButtonText}>{global.t?.t("people", "label", "logout")}</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>{`${global.t?.t("people", "label", "version")} ${appVersion}`}</Text>
          <Text style={styles.resolutionText}>{`${global.t?.t("people", "label", "resolution")}: ${currentResolution}`}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
