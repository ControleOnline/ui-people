import React, { useState, useCallback, useRef, useMemo } from 'react';

import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import css from '@controleonline/ui-people/src/react/css/people';
import { useStore } from '@store';
import PeopleAddressesPanel from '@controleonline/ui-people/src/react/components/address/PeopleAddressesPanel';
import { useProfileLoad } from '@controleonline/ui-people/src/react/utils/useProfileLoad';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useMessage} from '@controleonline/ui-common/src/react/components/MessageService';
import {app_type} from '@appType';
import { createProfileAvatarHandlers } from '@controleonline/ui-people/src/react/utils/profileAvatarHandlers';
import {resolveThemePalette} from '@controleonline/../../src/styles/branding';
import {colors} from '@controleonline/../../src/styles/colors';
import { isManagerAppType } from '@controleonline/ui-common/src/react/utils/managerOrderNotifications';
import { resolveLoggedUserId } from '@controleonline/ui-people/src/react/utils/profileSession';
import {
  extractPhoneDigits,
  formatPhoneValue,
  splitPhoneValue,
  extractId,
  toPeopleIri,
  normalizeCollection,
  toPhoneItem,
  toEmailItem,
  getPrimaryEmail,
  getPrimaryPhone,
  getDisplayName,
  getDisplayAlias,
  getAvatarFromUser,
  validateEmail,
  normalizeEmailValue,
  normalizeNameValue,
  normalizeAliasValue,
  toTimezoneItem,
  resolveTimezoneId,
  resolveTimezoneName,
  extractCollectionItems,
  splitCombinedIdentity,
  normalizePhonesForCompare,
  normalizeEmailsForCompare,
  isSameList,
  fetchTimezonesCached,
} from '@controleonline/ui-people/src/react/utils/profileFormUtils';
import { runProfileSave } from '@controleonline/ui-people/src/react/utils/profileHandleSave';
import {
  ProfileSkeleton,
  TimezoneSelector,
  EditableContactList,
} from '@controleonline/ui-people/src/react/components/ProfileSections';
import ProfileHeader from '@controleonline/ui-people/src/react/components/ProfileHeader';
import { inlineStyle_1025_20, inlineStyle_1042_16, inlineStyle_1051_63 } from './Profile.styles';

const Profile = ({ navigation }) => {
  const themeStore = useStore('theme');
  const themeColors = themeStore?.getters?.colors || {};
  // themeStore getters return a new colors object each render — depend on primitives only.
  const paletteKey = [
    themeColors.pageBackground, themeColors.cardBackground, themeColors.textPrimary,
    themeColors.textSecondary, themeColors.buttonBackground, themeColors.buttonBorder,
    themeColors.buttonIcon, themeColors.buttonBackgroundSecondary, themeColors.buttonText,
    themeColors.buttonIconSecondary, themeColors.cardIcon, themeColors.selectBackground,
    themeColors.selectBorder, themeColors.selectIcon, themeColors.selectText, themeColors.textDanger,
  ].join('|');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- paletteKey encodes primitives
    [paletteKey],
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
  // Stable identity keys — full user/company objects change reference often and
  // must not be effect dependencies (React #185 / Maximum update depth).
  const peopleIri = useMemo(() => toPeopleIri(user), [user]);
  const peopleIriKey = peopleIri || '';
  const companyIdKey = extractId(currentCompany?.id || currentCompany?.['@id']);
  const userIdKey = extractId(user?.id || user?.['@id'] || user?.user_id);

  const phonesActionsRef = useRef(phonesActions);
  phonesActionsRef.current = phonesActions;
  const emailsActionsRef = useRef(emailsActions);
  emailsActionsRef.current = emailsActions;
  const timezonesActionsRef = useRef(timezonesActions);
  timezonesActionsRef.current = timezonesActions;
  const peopleActionsRef = useRef(peopleActions);
  peopleActionsRef.current = peopleActions;
  const userRef = useRef(user);
  userRef.current = user;
  const currentCompanyRef = useRef(currentCompany);
  currentCompanyRef.current = currentCompany;
  const timezoneFiltersRef = useRef(timezoneFilters);
  timezoneFiltersRef.current = timezoneFilters;

  const companyThemeColors = currentCompany?.theme?.colors;
  const avatarBrandColors = useMemo(
    () =>
      resolveThemePalette(
        {...themeColors, ...(companyThemeColors || {})},
        colors,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- primitives + company id only
    [companyIdKey, companyThemeColors],
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
  const originalPhonesItems = useRef([]);
  const originalEmailsItems = useRef([]);
  const originalTimezoneSnapshot = useRef('');
  const originalNameSnapshot = useRef('');
  const originalAliasSnapshot = useRef('');
  const [timezones, setTimezones] = useState([]);
  const [selectedTimezoneId, setSelectedTimezoneId] = useState('');
  const { loadAvatarMedia } = useProfileLoad({
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
  });

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

  const {
    handleLogout,
    handleAvatarChanged,
    attachAvatarFile,
    uploadAvatarFile,
  } = createProfileAvatarHandlers({
    user,
    avatarMediaType,
    avatarPeopleMedia,
    peopleActions,
    loadAvatarMedia,
    showSuccess,
    authActions,
    navigation,
  });

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
    setIsSaving(true);
    try {
      await runProfileSave({
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
      });
    } finally {
      setIsSaving(false);
    }
  };

  // UI sections → ProfileSections.js

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
    return <ProfileSkeleton styles={styles} />;
  }

  return (
    <SafeAreaView style={styles.Profile}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ProfileHeader
          styles={styles}
          palette={palette}
          user={user}
          avatarImageUrl={avatarImageUrl}
          avatarEmail={avatarEmail}
          avatarBrandColors={avatarBrandColors}
          avatarPeopleMedia={avatarPeopleMedia}
          avatarMediaType={avatarMediaType}
          profileName={profileName}
          profileAlias={profileAlias}
          isEditingName={isEditingName}
          isEditingAlias={isEditingAlias}
          isEditingProfileIdentity={isEditingProfileIdentity}
          setProfileName={setProfileName}
          setProfileAlias={setProfileAlias}
          toggleIdentityEditing={toggleIdentityEditing}
          attachAvatarFile={attachAvatarFile}
          uploadAvatarFile={uploadAvatarFile}
          peopleActions={peopleActions}
          handleAvatarChanged={handleAvatarChanged}
        />

        <View style={styles.contentContainer}>
          <TimezoneSelector
            styles={styles}
            palette={palette}
            selectedTimezoneId={selectedTimezoneId}
            selectedTimezoneLabel={selectedTimezoneLabel}
            timezoneOptions={timezoneOptions}
            onSelect={setSelectedTimezoneId}
          />
          <EditableContactList
            styles={styles}
            palette={palette}
            items={phones}
            setItems={setPhones}
            type="phone"
            formatPhoneValue={formatPhoneValue}
          />
          <EditableContactList
            styles={styles}
            palette={palette}
            items={emails}
            setItems={setEmails}
            type="email"
            formatPhoneValue={formatPhoneValue}
          />

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
