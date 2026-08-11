import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useStore} from '@store';
import DefaultAddress from '@controleonline/ui-default/src/react/components/address/DefaultAddress';
import {buildAddressOptionSummary} from '@controleonline/ui-common/src/react/utils/entityDisplay';
import {buildAddressSavePayload} from '@controleonline/ui-default/src/react/services/addressGeo';

/**
 * List + create/edit addresses for a people (person or company) IRI.
 */
export default function PeopleAddressesPanel({peopleIri, title = 'Endereços'}) {
  const addressStore = useStore('address');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null); // null | {} create | row edit
  const [modalVisible, setModalVisible] = useState(false);

  const load = useCallback(async () => {
    if (!peopleIri || !addressStore?.actions?.getItems) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await addressStore.actions.getItems({
        people: peopleIri,
        itemsPerPage: 50,
      });
      const list = Array.isArray(result)
        ? result
        : result?.member || addressStore.getters?.items || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e?.message || 'Falha ao carregar endereços');
    } finally {
      setLoading(false);
    }
  }, [peopleIri, addressStore]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing({});
    setModalVisible(true);
  };

  const openEdit = row => {
    setEditing(row);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditing(null);
  };

  const saveAction = async payload => {
    const mode = editing && (editing.id || editing['@id']) ? 'edit' : 'create';
    const body = {...payload, people: peopleIri};
    if (mode === 'edit') {
      body.id = editing['@id'] || editing.id;
    }
    if (typeof addressStore.actions.save === 'function') {
      return addressStore.actions.save(body);
    }
    throw new Error('address store save indisponível');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <Text style={styles.addBtnText}>Novo</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ScrollView style={styles.list}>
        {items.map(row => {
          const summary = buildAddressOptionSummary(row);
          const key = row['@id'] || row.id;
          return (
            <TouchableOpacity
              key={key}
              style={styles.card}
              onPress={() => openEdit(row)}>
              <Text style={styles.cardPrimary}>
                {summary.primary || row.nickname || 'Endereço'}
              </Text>
              <Text style={styles.cardSecondary}>
                {summary.secondary || ''}
              </Text>
            </TouchableOpacity>
          );
        })}
        {!loading && items.length === 0 ? (
          <Text style={styles.empty}>Nenhum endereço cadastrado.</Text>
        ) : null}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <DefaultAddress
              mode={editing && (editing.id || editing['@id']) ? 'edit' : 'create'}
              row={editing && (editing.id || editing['@id']) ? editing : null}
              peopleIri={peopleIri}
              saveAction={saveAction}
              onCancel={closeModal}
              onSaved={() => {
                closeModal();
                load();
              }}
              submitLabel="Salvar endereço"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 12},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {fontSize: 16, fontWeight: '700', color: '#0F172A'},
  addBtn: {
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {color: '#fff', fontWeight: '600'},
  list: {flex: 1},
  card: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  cardPrimary: {fontWeight: '600', color: '#0F172A'},
  cardSecondary: {color: '#64748B', marginTop: 4},
  empty: {color: '#64748B', marginTop: 12},
  error: {color: '#B91C1C', marginBottom: 8},
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '90%',
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
});
