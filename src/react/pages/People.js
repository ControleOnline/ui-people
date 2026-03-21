import React, { useCallback, useState, useEffect, useLayoutEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useStore } from '@store';
import { useMessage } from '@controleonline/ui-common/src/react/components/MessageService';
import { colors } from '@controleonline/../../src/styles/colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconAdd from 'react-native-vector-icons/MaterialIcons';

import AddCompanyModal from '@controleonline/ui-people/src/react/components/AddCompanyModal';
import ImportsPage from '@controleonline/ui-common/src/react/pages/Imports';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  subHeader: {
    paddingHorizontal: 16,
    paddingTop: 9,
    paddingBottom: 9,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  searchRow: { flexDirection: 'row', alignItems: 'center' },

  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    height: 40,
  },

  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 8,
    color: colors.text,
    fontSize: 14,
    outlineStyle: 'none',
    outlineWidth: 0,
  },

  clearSearchButton: { padding: 4 },

  importButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    backgroundColor: '#E8F5E9',
  },

  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
      web: { boxShadow: '0 8px 16px rgba(15, 23, 42, 0.1)' },
    }),
  },

  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },

  clientName: {
    flex: 1,
    fontWeight: '700',
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
  },

  cardBody: { marginTop: 4 },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
  },

  infoText: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 8,
    fontWeight: '500',
    flex: 1,
  },
});

const People = ({ context = {} }) => {

  const linkType = context.context;
  const title = context.title;
  const searchPlaceholder = context.searchPlaceholder;

  const { showError } = useMessage();

  const peopleStore = useStore('people');
  const getters = peopleStore.getters;
  const actions = peopleStore.actions;

  const { items: clients, isLoading } = getters;
  const { currentCompany } = getters;

  const navigation = useNavigation();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [allClients, setAllClients] = useState([]);

  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const fetchClients = useCallback((query, page) => {

    if (currentCompany && Object.keys(currentCompany).length > 0) {

      const params = {
        'link.company': '/people/' + currentCompany.id,
        'link.linkType': linkType,
        page: page ?? currentPage,
        itemsPerPage,
      };

      if (String(query ?? searchQuery).trim()) {
        params.name = String(query ?? searchQuery).trim();
      }

      actions.getItems(params);
    }

  }, [currentCompany, currentPage, itemsPerPage, searchQuery, linkType]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: title,
    });
  }, [navigation, title]);

  useFocusEffect(
    useCallback(() => {
      fetchClients(searchQuery, currentPage);
    }, [currentCompany?.id, currentPage, itemsPerPage, searchQuery, linkType]),
  );

  useEffect(() => {

    if (isLoading) return;

    if (clients && Array.isArray(clients)) {

      if (currentPage === 1) {
        setAllClients(clients);
      } else {

        setAllClients(prev => {

          const newIds = new Set(clients.map(c => c.id));
          const filteredPrev = prev.filter(p => !newIds.has(p.id));

          return [...filteredPrev, ...clients];

        });

      }

    }

  }, [clients, currentPage, isLoading]);

  useEffect(() => {

    const t = setTimeout(() => {
      setSearchQuery(searchText.trim());
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(t);

  }, [searchText]);

  const handleEdit = client => {
    navigation.navigate('ClientDetails', { client });
  };

  const openImport = () => {
    setShowImportModal(true);
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

        <View style={{ flex: 1 }}>
          <Text style={[styles.clientName, { lineHeight: 30 }]} numberOfLines={1}>
            {client.alias}
            {client.peopleType === 'J' ? ' (PJ)' : ' (PF)'}
          </Text>
          <Text style={{ fontSize: 14, color: '#94A3B8', lineHeight: 18 }}>
            {client.name}
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
              placeholder={searchPlaceholder}
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
        context={context}
        onSuccess={() => {
          fetchClients(searchQuery, 1);
          setCurrentPage(1);
        }}
      />

      <Modal
        visible={showImportModal}
        animationType="slide"
        transparent={false}
      >
        <ImportsPage
          context={context}
          onClose={() => setShowImportModal(false)}
        />
      </Modal>

    </View>
  );
};

export default People;