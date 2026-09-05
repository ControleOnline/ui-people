/* eslint-disable no-unused-vars */
// Technical wiki: https://github.com/ControleOnline/ui-people/wiki/Cadastro-de-Pessoas-Contatos-Usuarios-e-Vendedores
/*
 * Contract imported from AGENTS.md
 * ## Escopo
 * - `ui-people` e o modulo React de pessoas e relacionamentos do app.
 * - Esta tela centraliza busca, filtros e representacao de pessoas.
 *
 * ## Estado
 *
 * ## Limites
 * - Nao espalhar a normalizacao de contexto por outros modulos.
 * - Manter aqui a busca e a apresentacao principal de pessoas.
 */
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Modal, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '@store';
import Icon from 'react-native-vector-icons/FontAwesome';
import AddCompanyModal from '@controleonline/ui-people/src/react/components/AddCompanyModal';
import PeopleAvatar from '@controleonline/ui-people/src/react/components/PeopleAvatar';
import DefaultExternalFilters from '@controleonline/ui-default/src/react/components/filters/DefaultExternalFilters';
import DefaultTable from '@controleonline/ui-default/src/react/components/table/DefaultTable';
import ImportsPage from '@controleonline/ui-common/src/react/pages/Imports';
import {
  buildPeopleContextConfig,
  normalizePeopleContextType,
  resolvePeopleContextSearchPlaceholder,
} from '@controleonline/ui-people/src/react/utils/peopleContext';
import {
  ALL_PEOPLE_LINK_TYPES_KEY,
  buildParentCompanyRequestParams,
  buildPeopleLinkRequestParams,
  normalizeEntityId,
} from '@controleonline/ui-people/src/react/utils/peopleLinkFilters';
import {
  isCompanyPeople,
  resolvePeopleAvatarEmail,
  resolvePeopleDisplayName,
} from '@controleonline/ui-people/src/react/utils/peopleImage';
import styles from './People.styles';
import { inlineStyle_133_14, inlineStyle_137_16 } from './People.styles';

const People = ({ context = {}, initialShowAddModal = false, companyScope = 'people' }) => {
  const contextConfig = useMemo(() => buildPeopleContextConfig(context), [context]);
  const title = context.title;

  const peopleStore = useStore('people');
  const authStore = useStore('auth');
  const themeStore = useStore('theme');
  const { getters, actions } = peopleStore;
  const { currentCompany } = getters;
  const { user } = authStore.getters || {};
  const { colors: themeColors } = themeStore.getters;

  const navigation = useNavigation();

  const [selectedLinkType, setSelectedLinkType] = useState(contextConfig.defaultType);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const isCompanyScope = companyScope === 'companies';

  const hasAutoOpenedAddModalRef = useRef(false);

  useEffect(() => {
    setSelectedLinkType(previousType =>
      contextConfig.availableTypes.includes(previousType)
        ? previousType
        : contextConfig.defaultType,
    );
  }, [contextConfig.availableTypes, contextConfig.defaultType]);

  useEffect(() => {
    if (!initialShowAddModal || hasAutoOpenedAddModalRef.current) {
      return;
    }

    hasAutoOpenedAddModalRef.current = true;
    setShowAddCompanyModal(true);
  }, [initialShowAddModal]);

  const activeSearchPlaceholder = useMemo(
    () => resolvePeopleContextSearchPlaceholder(selectedLinkType, context),
    [context, selectedLinkType],
  );

  const runtimeContext = useMemo(
    () => ({
      ...context,
      context: selectedLinkType,
      contextOptions: contextConfig.availableTypes,
      defaultContext: contextConfig.defaultType,
      defaultPeopleType:
        selectedLinkType === 'courier' ? 'F' : context.defaultPeopleType,
      enableExistingOwnerSelection:
        context.enableExistingOwnerSelection ?? selectedLinkType === 'franchisee',
      selectedContext: selectedLinkType,
    }),
    [context, contextConfig.availableTypes, contextConfig.defaultType, selectedLinkType],
  );

  const palette = useMemo(
    () => ({
      buttonBackground: themeColors.buttonBackground,
      buttonBorder: themeColors.buttonBorder,
      buttonText: themeColors.buttonText,
      cardBackground: themeColors.cardBackground,
      cardBorder: themeColors.cardBorder,
      cardIcon: themeColors.cardIcon,
      cardShadow: themeColors.cardShadow,
      iconInverse: themeColors.iconInverse,
      listItemIcon: themeColors.listItemIcon,
      listItemSubtitleText: themeColors.listItemSubtitleText,
      listItemText: themeColors.listItemText,
      tableActionBackground: themeColors.tableActionBackground,
      tableActionBorder: themeColors.tableActionBorder,
      tableActionIcon: themeColors.tableActionIcon,
    }),
    [themeColors],
  );

  const cardStyle = useMemo(
    () => ({
      backgroundColor: palette.cardBackground,
      borderWidth: palette.cardBorder ? 1 : 0,
      borderColor: palette.cardBorder,
      shadowColor: palette.cardShadow,
      ...(Platform.OS === 'web' && palette.cardShadow
        ? { boxShadow: `0 8px 16px ${palette.cardShadow}` }
        : {}),
    }),
    [palette],
  );

  const avatarStyle = useMemo(
    () => ({
      backgroundColor: palette.cardIcon,
    }),
    [palette.cardIcon],
  );

  const clientNameStyle = useMemo(
    () => ({
      color: palette.listItemText,
      lineHeight: 30,
    }),
    [palette.listItemText],
  );

  const clientSubtitleStyle = useMemo(
    () => ({
      color: palette.listItemSubtitleText,
    }),
    [palette.listItemSubtitleText],
  );

  const toolbarActions = useMemo(
    () => [
      {
        key: 'import',
        icon: 'upload',
        style: {
          backgroundColor: palette.buttonBackground,
          borderColor: palette.buttonBorder,
        },
        color: palette.buttonText,
        onPress: () => setShowImportModal(true),
      },
      {
        key: 'add',
        icon: 'plus',
        testID: isCompanyScope ? 'my-companies-add' : 'people-add',
        style: {
          backgroundColor: palette.buttonBackground,
          borderColor: palette.buttonBorder,
        },
        color: palette.buttonText,
        onPress: () => setShowAddCompanyModal(true),
      },
    ],
    [palette, isCompanyScope],
  );

  const requestParams = useMemo(
    () =>
      isCompanyScope
        ? buildParentCompanyRequestParams({
            availableTypes: contextConfig.availableTypes,
            selectedLinkType,
            user,
          })
        : buildPeopleLinkRequestParams({
            currentCompany,
            availableTypes: contextConfig.availableTypes,
            selectedLinkType,
          }),
    [
      contextConfig.availableTypes,
      currentCompany,
      isCompanyScope,
      selectedLinkType,
      user,
    ],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: title,
    });
  }, [navigation, title]);

  const linkTypeFilters = useMemo(
    () => ({
      'link.linkType': selectedLinkType,
    }),
    [selectedLinkType],
  );
  const getExternalFilterOptions = useCallback(
    column => ((column?.name || column?.key) === 'link.linkType' ? contextConfig.options : []),
    [contextConfig.options],
  );

  const handleLinkTypeFiltersChange = useCallback(
    nextFilters => {
      const rawLinkType = nextFilters?.['link.linkType'];
      const selectedValue = Array.isArray(rawLinkType)
        ? rawLinkType[0]
        : rawLinkType?.value ?? rawLinkType;
      const nextLinkType = normalizePeopleContextType(selectedValue) || contextConfig.defaultType;
      setSelectedLinkType(
        contextConfig.availableTypes.includes(nextLinkType)
          ? nextLinkType
          : contextConfig.defaultType,
      );
    },
    [contextConfig.availableTypes, contextConfig.defaultType],
  );

  const handleEdit = useCallback(
    client => {
      // Resolve people id from common list shapes (direct people, nested company, IRI).
      const clientId =
        normalizeEntityId(client?.id ?? client?.['@id']) ||
        normalizeEntityId(client?.company?.id ?? client?.company?.['@id']) ||
        normalizeEntityId(client?.people?.id ?? client?.people?.['@id']);
      if (!clientId) {
        return;
      }

      const peoplePayload =
        client && typeof client === 'object'
          ? client.company && typeof client.company === 'object'
            ? client.company
            : client
          : null;

      if (peoplePayload) {
        actions?.setItem?.(peoplePayload);
      }

      const detailsRouteName = context?.detailsRouteName || 'ClientDetails';
      const baseParams =
        typeof context?.detailsRouteParams === 'function'
          ? context.detailsRouteParams(peoplePayload || client, selectedLinkType)
          : (context?.detailsRouteParams || {
              clientId,
              contextKey:
                selectedLinkType === ALL_PEOPLE_LINK_TYPES_KEY
                  ? ''
                  : String(selectedLinkType || ''),
            });

      // Only serializable scalars in route params — never `client: object`
      // (web query becomes client=[object Object], app-community#641).
      const detailsRouteParams = {
        ...(baseParams && typeof baseParams === 'object' ? baseParams : {}),
        // Seed for details screen so first paint does not depend only on store.
        client: peoplePayload || client,
      };

      if (baseParams?.companyId) {
        detailsRouteParams.companyId = String(baseParams.companyId);
        delete detailsRouteParams.clientId;
      } else {
        detailsRouteParams.clientId = String(baseParams?.clientId || clientId);
      }

      try {
        if (typeof navigation?.navigate === 'function') {
          navigation.navigate(detailsRouteName, detailsRouteParams);
        } else if (typeof navigation?.push === 'function') {
          navigation.push(detailsRouteName, detailsRouteParams);
        }
      } catch (err) {
        // Fallback: CRM client-details route always registered.
        if (detailsRouteName !== 'ClientDetails' && typeof navigation?.navigate === 'function') {
          navigation.navigate('ClientDetails', detailsRouteParams);
        }
      }
    },
    [actions, context?.detailsRouteName, context?.detailsRouteParams, navigation, selectedLinkType],
  );

  const handleCreateSuccess = useCallback(
    (savedClient, metadata = {}) => {
      const registrationLinkType = normalizePeopleContextType(metadata?.registrationLinkType);
      const nextLinkType =
        registrationLinkType && contextConfig.availableTypes.includes(registrationLinkType)
          ? registrationLinkType
          : selectedLinkType;
      if (savedClient?.id) {
        actions?.setItem?.(savedClient);
      }
      if (nextLinkType && nextLinkType !== selectedLinkType) {
        setSelectedLinkType(nextLinkType);
      }
    },
    [actions, contextConfig.availableTypes, selectedLinkType],
  );

  const renderContactLine = useCallback(people => {
    const email = resolvePeopleAvatarEmail(people);
    const phone = Array.isArray(people?.phone)
      ? people.phone.find(item => item?.phone || item?.value)
      : people?.phone;
    const phoneValue =
      typeof phone === 'object'
        ? String(phone?.phone || phone?.value || '').trim()
        : String(phone || '').trim();

    return email || phoneValue || '';
  }, []);

  const renderPeopleCard = useCallback(
    ({ item: people, openRow }) => {
      const displayName = String(resolvePeopleDisplayName(people) ?? '').replace(/\s+/g, ' ').trim();
      const legalName = String(people?.name || people?.alias || '').replace(/\s+/g, ' ').trim();
      const contactLine = renderContactLine(people);
      const peopleTypeLabel = isCompanyPeople(people) ? 'PJ' : 'PF';

      return (
        <TouchableOpacity
          style={[styles.card, styles.contactCard, cardStyle]}
          onPress={() => handleEdit(people)}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <PeopleAvatar
              people={people}
              size={52}
              backgroundColor={avatarStyle.backgroundColor}
              borderColor={palette.cardBorder || avatarStyle.backgroundColor}
              borderWidth={1}
              textColor={palette.iconInverse}
              iconColor={palette.iconInverse}
              useGravatar={contextConfig.useGravatar}
              usePeopleImage={contextConfig.usePeopleImage}
              style={styles.avatar}
            />

            <View style={inlineStyle_133_14}>
              <View style={styles.contactTitleRow}>
                <Text style={[styles.clientName, clientNameStyle]} numberOfLines={1}>
                  {displayName || legalName || '-'}
                </Text>
                <View style={[styles.peopleTypeBadge, { borderColor: palette.cardBorder }]}>
                  <Text style={[styles.peopleTypeBadgeText, { color: palette.listItemSubtitleText }]}>
                    {peopleTypeLabel}
                  </Text>
                </View>
              </View>
              <Text style={[styles.clientSubtitle, inlineStyle_137_16, clientSubtitleStyle]} numberOfLines={1}>
                {legalName && legalName !== displayName ? legalName : contactLine || '-'}
              </Text>
              {legalName && legalName !== displayName && contactLine ? (
                <Text style={[styles.contactLine, clientSubtitleStyle]} numberOfLines={1}>
                  {contactLine}
                </Text>
              ) : null}
            </View>

            <Icon name="chevron-right" size={14} color={palette.listItemIcon} />
          </View>
        </TouchableOpacity>
      );
    },
    [
      avatarStyle.backgroundColor,
      cardStyle,
      clientNameStyle,
      clientSubtitleStyle,
      handleEdit,
      palette.cardBorder,
      palette.iconInverse,
      palette.listItemIcon,
      palette.listItemSubtitleText,
      renderContactLine,
    ],
  );

  const renderClientCard = useCallback(
    args => renderPeopleCard(args),
    [renderPeopleCard],
  );

  const renderCompanyCard = useCallback(
    args => renderPeopleCard(args),
    [renderPeopleCard],
  );

  return (
    <View style={styles.container}>
      {contextConfig.hasTypeFilter ? (
          <DefaultExternalFilters
            filters={linkTypeFilters}
            getOptionsForColumn={getExternalFilterOptions}
          onChangeFilters={handleLinkTypeFiltersChange}
          storeName="people"
        />
      ) : null}

      <View style={styles.tableWrap}>
        <DefaultTable
          actions={actions}
          add={false}
          initialViewMode="cards"
          requestParams={requestParams}
          onRowPress={handleEdit}
          renderCard={isCompanyScope ? renderCompanyCard : renderClientCard}
          searchKey="search"
          searchPlaceholder={activeSearchPlaceholder}
          showSearch
          showRowActions={false}
          storeName="people"
          toolbarActions={toolbarActions}
        />
      </View>

      <AddCompanyModal
        visible={showAddCompanyModal}
        onClose={() => setShowAddCompanyModal(false)}
        context={runtimeContext}
        onSuccess={handleCreateSuccess}
        autoLinkAuthenticatedPerson={isCompanyScope}
      />

      <Modal
        visible={showImportModal}
        animationType="slide"
        transparent={false}
      >
        <ImportsPage
          context={runtimeContext}
          onClose={() => setShowImportModal(false)}
        />
      </Modal>
    </View>
  );
};

export default People;
