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
import CompactFilterSelector from '@controleonline/ui-default/src/react/components/filters/CompactFilterSelector';
import DefaultTable from '@controleonline/ui-default/src/react/components/table/DefaultTable';
import ImportsPage from '@controleonline/ui-common/src/react/pages/Imports';
import { formatDisplayUppercase } from '@controleonline/ui-common/src/react/utils/entityDisplay';
import {
  buildPeopleContextConfig,
  normalizePeopleContextType,
  resolvePeopleContextSearchPlaceholder,
} from '@controleonline/ui-people/src/react/utils/peopleContext';
import styles from './People.styles';
import { inlineStyle_133_14, inlineStyle_137_16 } from './People.styles';

const People = ({ context = {}, initialShowAddModal = false }) => {
  const contextConfig = useMemo(() => buildPeopleContextConfig(context), [context]);
  const title = context.title;

  const peopleStore = useStore('people');
  const themeStore = useStore('theme');
  const { getters, actions } = peopleStore;
  const { currentCompany } = getters;
  const { colors: themeColors } = themeStore.getters;

  const navigation = useNavigation();

  const [selectedLinkType, setSelectedLinkType] = useState(contextConfig.defaultType);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

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

  const activeTypeOption = useMemo(
    () =>
      contextConfig.options.find(option => option.key === selectedLinkType) ||
      contextConfig.options[0] ||
      null,
    [contextConfig.options, selectedLinkType],
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

  const avatarTextStyle = useMemo(
    () => ({
      color: palette.iconInverse,
    }),
    [palette.iconInverse],
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
        style: {
          backgroundColor: palette.buttonBackground,
          borderColor: palette.buttonBorder,
        },
        color: palette.buttonText,
        onPress: () => setShowAddCompanyModal(true),
      },
    ],
    [palette],
  );

  const requestParams = useMemo(
    () => ({
      ...(currentCompany?.id
        ? { 'link.company': `/people/${currentCompany.id}` }
        : {}),
      'link.linkType': normalizePeopleContextType(selectedLinkType),
    }),
    [currentCompany?.id, selectedLinkType],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: title,
    });
  }, [navigation, title]);

  const handleLinkTypeChange = useCallback(
    nextLinkType => {
      setSelectedLinkType(nextLinkType);
    },
    [],
  );

  const handleEdit = useCallback(
    client => {
      const clientId = String(client?.id || client?.['@id'] || '').replace(/\D/g, '');
      if (!clientId) {
        return;
      }

      actions?.setItem?.(client);
      navigation.push('ClientDetails', {
        clientId,
        contextKey: String(selectedLinkType || ''),
      });
    },
    [actions, navigation, selectedLinkType],
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

  const renderClientCard = useCallback(
    ({ item: client, openRow }) => (
      <TouchableOpacity
        style={[styles.card, cardStyle]}
        onPress={openRow || (() => handleEdit(client))}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, avatarStyle]}>
            <Text style={[styles.avatarText, avatarTextStyle]}>
              {client?.name?.charAt(0)?.toUpperCase() || 'C'}
            </Text>
          </View>

          <View style={inlineStyle_133_14}>
            <Text style={[styles.clientName, clientNameStyle]} numberOfLines={1}>
              {formatDisplayUppercase(client.alias)}
            </Text>
            <Text style={[styles.clientSubtitle, inlineStyle_137_16, clientSubtitleStyle]}>
              {client.peopleType === 'J' ? ' (PJ)' : ' (PF)'} {formatDisplayUppercase(client.name)}
            </Text>
          </View>

          <Icon name="chevron-right" size={14} color={palette.listItemIcon} />
        </View>
      </TouchableOpacity>
    ),
    [
      avatarStyle,
      avatarTextStyle,
      cardStyle,
      clientNameStyle,
      clientSubtitleStyle,
      handleEdit,
      palette.listItemIcon,
    ],
  );

  return (
    <View style={styles.container}>
      {contextConfig.hasTypeFilter && activeTypeOption ? (
        <View style={styles.filterRow}>
          <CompactFilterSelector
            dense
            icon="filter"
            label={activeTypeOption.label}
            title={contextConfig.filterTitle}
            active
            options={contextConfig.options}
            selectedKey={selectedLinkType}
            onSelect={optionKey => {
              handleLinkTypeChange(optionKey);
              return true;
            }}
          />
        </View>
      ) : null}

      <View style={styles.tableWrap}>
        <DefaultTable
          actions={actions}
          add={false}
          requestParams={requestParams}
          onRowPress={handleEdit}
          renderCard={renderClientCard}
          searchProps={{
            placeholder: activeSearchPlaceholder,
            searchKey: 'search',
          }}
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
