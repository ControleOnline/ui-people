import React, {
  useCallback,
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { Text, View, TouchableOpacity, FlatList, TextInput, Modal } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useStore } from '@store';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconAdd from 'react-native-vector-icons/MaterialIcons';
import AddCompanyModal from '@controleonline/ui-people/src/react/components/AddCompanyModal';
import CompactFilterSelector from '@controleonline/ui-default/src/react/components/filters/CompactFilterSelector';
import ImportsPage from '@controleonline/ui-common/src/react/pages/Imports';
import {
  buildPeopleContextConfig,
  normalizePeopleContextType,
  resolvePeopleContextSearchPlaceholder,
} from '@controleonline/ui-people/src/react/utils/peopleContext';
import styles from './People.styles';
import { inlineStyle_133_14, inlineStyle_137_16 } from './People.styles';

const extractItems = response => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.['hydra:member'])) return response['hydra:member'];
  return [];
};

const People = ({ context = {} }) => {
  const contextConfig = useMemo(() => buildPeopleContextConfig(context), [context]);
  const title = context.title;

  const peopleStore = useStore('people');
  const getters = peopleStore.getters;
  const actions = peopleStore.actions;

  const { currentCompany } = getters;

  const navigation = useNavigation();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);

  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLinkType, setSelectedLinkType] = useState(contextConfig.defaultType);

  const [allClients, setAllClients] = useState([]);
  const lastFetchKeyRef = useRef('');

  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    setSelectedLinkType(previousType =>
      contextConfig.availableTypes.includes(previousType)
        ? previousType
        : contextConfig.defaultType,
    );
  }, [contextConfig.availableTypes, contextConfig.defaultType]);

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
      selectedContext: selectedLinkType,
    }),
    [context, contextConfig.availableTypes, contextConfig.defaultType, selectedLinkType],
  );

  const fetchClients = useCallback((query, page, requestedLinkType = selectedLinkType) => {
    const normalizedLinkType = normalizePeopleContextType(requestedLinkType);

    if (currentCompany && Object.keys(currentCompany).length > 0) {
      const nextPage = page ?? currentPage;

      const params = {
        'link.company': '/people/' + currentCompany.id,
        'link.linkType': normalizedLinkType,
        page: nextPage,
        itemsPerPage,
      };

      if (String(query ?? searchQuery).trim()) {
        params.search = String(query ?? searchQuery).trim();
      }

      const fetchKey = JSON.stringify({
        company: currentCompany.id,
        linkType: normalizedLinkType,
        page: nextPage,
        query: String(query ?? searchQuery).trim(),
      });
      lastFetchKeyRef.current = fetchKey;

      return actions.getItems(params).then(response => {
        if (lastFetchKeyRef.current !== fetchKey) return;

        const items = extractItems(response);
        if (nextPage === 1) {
          setAllClients(items);
          return;
        }

        setAllClients(prev => {
          const newIds = new Set(items.map(c => c.id));
          const filteredPrev = prev.filter(p => !newIds.has(p.id));
          return [...filteredPrev, ...items];
        });
      });
    }

    return Promise.resolve();
  }, [
    actions,
    currentCompany,
    currentPage,
    itemsPerPage,
    searchQuery,
    selectedLinkType,
  ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: title,
    });
  }, [navigation, title]);

  useFocusEffect(
    useCallback(() => {
      fetchClients(searchQuery, currentPage, selectedLinkType);
    }, [currentCompany?.id, currentPage, fetchClients, searchQuery, selectedLinkType]),
  );

  useEffect(() => {
    setAllClients([]);
    setCurrentPage(1);
  }, [currentCompany?.id, selectedLinkType]);

  useEffect(() => {

    const t = setTimeout(() => {
      setSearchQuery(searchText.trim());
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(t);

  }, [searchText]);

  const handleEdit = client => {
    const clientId = String(client?.id || client?.['@id'] || '').replace(/\D/g, '');
    if (!clientId) {
      return;
    }

    actions?.setItem?.(client);
    navigation.push('ClientDetails', {
      clientId,
      contextKey: String(selectedLinkType || ''),
    });
  };

  const openImport = () => {
    setShowImportModal(true);
  };

  const handleCreateSuccess = (savedClient, metadata = {}) => {
    const registrationLinkType = normalizePeopleContextType(metadata?.registrationLinkType);
    const nextLinkType =
      registrationLinkType && contextConfig.availableTypes.includes(registrationLinkType)
        ? registrationLinkType
        : selectedLinkType;
    const shouldSwitchType = nextLinkType && nextLinkType !== selectedLinkType;

    setCurrentPage(1);
    if (!shouldSwitchType && savedClient?.id) {
      setAllClients(prev => [
        savedClient,
        ...prev.filter(item => String(item.id) !== String(savedClient.id)),
      ]);
    }

    if (shouldSwitchType) {
      setSelectedLinkType(nextLinkType);
      setAllClients([]);
    }

    fetchClients(searchQuery, 1, nextLinkType);
  };

  const renderClientCard = ({ item: client }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleEdit(client)}
      activeOpacity={0.8}
    >

      <View style={styles.cardHeader}>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {client.name?.charAt(0)?.toUpperCase() || 'C'}
          </Text>
        </View>

        <View style={inlineStyle_133_14}>
          <Text style={[styles.clientName, { lineHeight: 30 }]} numberOfLines={1}>
            {client.alias}
          </Text>
          <Text style={inlineStyle_137_16}>
            {client.peopleType === 'J' ? ' (PJ)' : ' (PF)'} {client.name}
          </Text>
        </View>
      

        <Icon name="chevron-right" size={14} color="#CBD5E1" />

      </View>

{/* ALEMAC // 20/03/2026 // NÃO FAZ SENTIDO TER ESSAS INFOS AQUI */}
      {/* <View style={styles.cardBody}>

        {client.phone?.[0] && (
          <View style={styles.infoRow}>
            <Icon name="phone" size={16} color={colors.primary} />
            <Text style={styles.infoText}>
              ({client.phone[0].ddd}) {client.phone[0].phone}
            </Text>
          </View>
        )}

        {client.email?.[0]?.email && (
          <View style={styles.infoRow}>
            <Icon name="envelope-o" size={14} color={colors.primary} />
            <Text style={styles.infoText} numberOfLines={1}>
              {client.email[0].email}
            </Text>
          </View>
        )}

      </View> */}

    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      <View style={styles.subHeader}>

        <View style={styles.searchRow}>

          <View style={styles.searchInputContainer}>

            <Icon name="search" size={16} color="#94A3B8" />

            <TextInput
              style={styles.searchInput}
              placeholder={activeSearchPlaceholder}
              placeholderTextColor="#94A3B8"
              value={searchText}
              onChangeText={setSearchText}
            />

            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText('')}
                style={styles.clearSearchButton}
              >
                <Icon name="times-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}

          </View>

          <TouchableOpacity
            style={styles.importButton}
            onPress={openImport}
          >
            <Icon name="file-excel-o" size={18} color="#2E7D32" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddCompanyModal(true)}
          >
            <IconAdd name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>

        </View>

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
                setSelectedLinkType(optionKey);
                return true;
              }}
            />
          </View>
        ) : null}

      </View>

      <FlatList
        data={allClients}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderClientCard}
        contentContainerStyle={styles.scrollContent}
      />

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
