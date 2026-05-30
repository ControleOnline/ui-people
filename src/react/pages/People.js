/*
 * Contract imported from AGENTS.md
 * ## Escopo
 * - `ui-people` e o modulo React de pessoas e relacionamentos do app.
 * - Esta tela centraliza busca, filtros e representacao de pessoas.
 *
 * ## Estado
 * - Se existir `src/vue`, ela e apenas legado e nao deve receber este contrato.
 *
 * ## Limites
 * - Nao espalhar a normalizacao de contexto por outros modulos.
 * - Manter aqui a busca e a apresentacao principal de pessoas.
 */
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '@store';
import Icon from 'react-native-vector-icons/FontAwesome';
import AddCompanyModal from '@controleonline/ui-people/src/react/components/AddCompanyModal';
import CompactFilterSelector from '@controleonline/ui-default/src/react/components/filters/CompactFilterSelector';
import DefaultTable from '@controleonline/ui-default/src/react/components/table/DefaultTable';
import ImportsPage from '@controleonline/ui-common/src/react/pages/Imports';
import { getDateRange } from '@controleonline/ui-common/src/react/utils/dateRangeFilter';
import { formatDisplayUppercase } from '@controleonline/ui-common/src/react/utils/entityDisplay';
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

const normalizeText = value => String(value || '').trim();

const normalizeFilterValue = value => {
  if (value && typeof value === 'object') {
    return normalizeFilterValue(value.value ?? value.id ?? value['@id'] ?? '');
  }

  return normalizeText(value);
};

const resolveDateFilterParams = value => {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const shortcut = value.shortcut || value.value || 'all';
  const customRange = value.customRange || { from: '', to: '' };
  const dateRange = getDateRange(shortcut, customRange, {
    relativeMode: 'rolling',
    useCurrentMoment: true,
  });

  return {
    after: dateRange?.after || '',
    before: dateRange?.before || '',
  };
};

const People = ({ context = {} }) => {
  const contextConfig = useMemo(() => buildPeopleContextConfig(context), [context]);
  const title = context.title;

  const peopleStore = useStore('people');
  const { getters, actions } = peopleStore;
  const { currentCompany } = getters;
  const totalItems = Number(getters.totalItems || 0);

  const navigation = useNavigation();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [selectedLinkType, setSelectedLinkType] = useState(contextConfig.defaultType);
  const [allClients, setAllClients] = useState([]);
  const [sortState, setSortState] = useState(null);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const lastFetchKeyRef = useRef('');

  const storeFilters = getters.filters || {};
  const storeFiltersKey = useMemo(
    () => JSON.stringify(storeFilters || {}),
    [storeFilters],
  );

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
      defaultPeopleType:
        selectedLinkType === 'courier' ? 'F' : context.defaultPeopleType,
      selectedContext: selectedLinkType,
    }),
    [context, contextConfig.availableTypes, contextConfig.defaultType, selectedLinkType],
  );

  const peopleColumns = useMemo(() => {
    const columns = Array.isArray(getters.columns) ? getters.columns : [];

    return columns.map(column =>
      column?.name === 'image'
        ? {
            ...column,
            table: false,
            visible: false,
          }
        : column,
    );
  }, [getters.columns]);

  const toolbarActions = useMemo(
    () => [
      {
        key: 'import',
        icon: 'upload',
        style: { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' },
        color: '#2E7D32',
        onPress: () => setShowImportModal(true),
      },
      {
        key: 'add',
        icon: 'plus',
        style: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
        color: '#FFFFFF',
        onPress: () => setShowAddCompanyModal(true),
      },
    ],
    [],
  );

  const commitFilters = useCallback(
    nextFilters => {
      const resolvedFilters = nextFilters || {};
      actions.setFilters(resolvedFilters);
      setCurrentPage(1);
      setAllClients([]);
    },
    [actions],
  );

  const fetchClients = useCallback(
    (page, requestedLinkType = selectedLinkType, requestedSort = sortState, requestedFilters = storeFilters) => {
      if (!currentCompany?.id) return Promise.resolve();

      const normalizedLinkType = normalizePeopleContextType(requestedLinkType);
      const nextPage = page ?? 1;
      const filters = requestedFilters || {};
      const searchValue = normalizeText(filters.search);
      const fetchKey = JSON.stringify({
        company: currentCompany.id,
        linkType: normalizedLinkType,
        page: nextPage,
        search: searchValue,
        sort: requestedSort || null,
        filters,
      });

      lastFetchKeyRef.current = fetchKey;

      const params = {
        'link.company': `/people/${currentCompany.id}`,
        'link.linkType': normalizedLinkType,
        itemsPerPage,
        page: nextPage,
      };

      if (searchValue) {
        params.search = searchValue;
      }

      if (requestedSort?.field && requestedSort?.direction) {
        params[`order[${requestedSort.field}]`] = requestedSort.direction;
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (!key || key === 'search') {
          return;
        }

        if (key === 'foundationDate') {
          const dateParams = resolveDateFilterParams(value);
          if (dateParams.after) params['foundationDate[after]'] = dateParams.after;
          if (dateParams.before) params['foundationDate[before]'] = dateParams.before;
          return;
        }

        if (Array.isArray(value)) {
          params[key] = value.map(normalizeFilterValue).filter(Boolean);
          return;
        }

        const normalizedValue = normalizeFilterValue(value);
        if (normalizedValue) {
          params[key] = normalizedValue;
        }
      });

      return actions.getItems(params).then(response => {
        if (lastFetchKeyRef.current !== fetchKey) {
          return null;
        }

        const items = extractItems(response);
        if (nextPage === 1) {
          setAllClients(items);
          return items;
        }

        setAllClients(prev => {
          const newIds = new Set(items.map(item => item.id));
          const filteredPrev = prev.filter(item => !newIds.has(item.id));
          return [...filteredPrev, ...items];
        });

        return items;
      });
    },
    [actions, currentCompany?.id, itemsPerPage, selectedLinkType, sortState, storeFilters],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: title,
    });
  }, [navigation, title]);

  useEffect(() => {
    if (!currentCompany?.id) {
      return;
    }

    setCurrentPage(1);
    setAllClients([]);
    fetchClients(1, selectedLinkType, sortState, storeFilters);
  }, [
    currentCompany?.id,
    fetchClients,
    selectedLinkType,
    sortState?.direction,
    sortState?.field,
    storeFiltersKey,
  ]);

  const handleSortChange = useCallback(
    nextSort => {
      setSortState(nextSort);
      setCurrentPage(1);
      setAllClients([]);
    },
    [],
  );

  const handleLinkTypeChange = useCallback(
    nextLinkType => {
      setSelectedLinkType(nextLinkType);
      setCurrentPage(1);
      setAllClients([]);
    },
    [],
  );

  const loadMore = useCallback(() => {
    if (!currentCompany?.id) return;
    if (!Array.isArray(allClients) || allClients.length === 0) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchClients(nextPage, selectedLinkType, sortState, storeFilters);
  }, [allClients, currentCompany?.id, currentPage, fetchClients, selectedLinkType, sortState, storeFilters]);

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
    },
    [contextConfig.availableTypes, selectedLinkType],
  );

  const renderClientCard = useCallback(
    ({ item: client, openRow }) => (
      <TouchableOpacity
        style={styles.card}
        onPress={openRow || (() => handleEdit(client))}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {client?.name?.charAt(0)?.toUpperCase() || 'C'}
            </Text>
          </View>

          <View style={inlineStyle_133_14}>
            <Text style={[styles.clientName, { lineHeight: 30 }]} numberOfLines={1}>
              {formatDisplayUppercase(client.alias)}
            </Text>
            <Text style={inlineStyle_137_16}>
              {client.peopleType === 'J' ? ' (PJ)' : ' (PF)'} {formatDisplayUppercase(client.name)}
            </Text>
          </View>

          <Icon name="chevron-right" size={14} color="#CBD5E1" />
        </View>
      </TouchableOpacity>
    ),
    [handleEdit],
  );

  const hasMore = useMemo(
    () => allClients.length < totalItems,
    [allClients.length, totalItems],
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
          columns={peopleColumns}
          data={allClients}
          filters={storeFilters}
          hasMore={hasMore}
          isLoading={Boolean(getters.isLoading)}
          onEndReached={loadMore}
          onFilterChange={commitFilters}
          onRowPress={handleEdit}
          onSortChange={handleSortChange}
          renderCard={renderClientCard}
          searchProps={{
            filters: storeFilters,
            onChangeFilters: commitFilters,
            placeholder: activeSearchPlaceholder,
            searchKey: 'search',
          }}
          showRowActions={false}
          sort={sortState}
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
