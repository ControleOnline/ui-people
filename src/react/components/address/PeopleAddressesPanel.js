import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
import FeatherIcon from 'react-native-vector-icons/Feather';
import DefaultAddress from '@controleonline/ui-default/src/react/components/address/DefaultAddress';
import {useMessage} from '@controleonline/ui-common/src/react/components/MessageService';
import {buildAddressOptionSummary} from '@controleonline/ui-common/src/react/utils/entityDisplay';

const extractId = value => String(value || '').replace(/\D/g, '');

/**
 * List + create/edit addresses for a people (person or company) IRI.
 *
 * Load is guarded against infinite re-fetch loops: addressStore must not be
 * a useCallback dependency (useStore can return a new reference each render),
 * and concurrent loads for the same peopleIri are coalesced.
 */
export default function PeopleAddressesPanel({peopleIri, title = 'Endereços'}) {
  const addressStore = useStore('address');
  const addressStoreRef = useRef(addressStore);
  addressStoreRef.current = addressStore;

  const themeStore = useStore('theme');
  const {colors: themeColors} = themeStore.getters;
  const {showDialog, showError, showSuccess} = useMessage() || {};
  const palette = useMemo(
    () => ({
      buttonBackground: themeColors.buttonBackground,
      buttonIcon: themeColors.buttonIcon,
      cardBackground: themeColors.cardBackground,
      cardBorder: themeColors.cardBorder,
      cardText: themeColors.cardText,
      loadingSpinner: themeColors.loadingSpinner,
      modalBackground: themeColors.modalBackground,
      modalOverlay: themeColors.modalOverlay,
      textDanger: themeColors.textDanger,
      textPrimary: themeColors.textPrimary,
      textSecondary: themeColors.textSecondary,
    }),
    [themeColors],
  );
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null); // null | {} create | row edit
  const [modalVisible, setModalVisible] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState('');

  const loadPromiseRef = useRef(null);
  const lastLoadedIriRef = useRef(null);

  const load = useCallback(async (force = false) => {
    const store = addressStoreRef.current;
    if (!peopleIri || !store?.actions?.getItems) {
      setItems([]);
      return;
    }

    if (!force && lastLoadedIriRef.current === peopleIri && loadPromiseRef.current == null) {
      return;
    }

    if (loadPromiseRef.current) {
      return loadPromiseRef.current;
    }

    setLoading(true);
    setError(null);

    const promise = (async () => {
      try {
        const result = await store.actions.getItems({
          people: peopleIri,
          itemsPerPage: 50,
        });
        const list = Array.isArray(result)
          ? result
          : result?.member || store.getters?.items || [];
        setItems(Array.isArray(list) ? list : []);
        lastLoadedIriRef.current = peopleIri;
      } catch (e) {
        setError(e?.message || 'Falha ao carregar endereços');
      } finally {
        setLoading(false);
        loadPromiseRef.current = null;
      }
    })();

    loadPromiseRef.current = promise;
    return promise;
  }, [peopleIri]);

  useEffect(() => {
    lastLoadedIriRef.current = null;
    load(true);
  }, [peopleIri, load]);

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
    const store = addressStoreRef.current;
    const mode = editing && (editing.id || editing['@id']) ? 'edit' : 'create';
    const body = {...payload, people: peopleIri};
    if (mode === 'edit') {
      body.id = editing['@id'] || editing.id;
    }
    if (typeof store?.actions?.save === 'function') {
      return store.actions.save(body);
    }
    throw new Error('address store save indisponível');
  };

  const removeAddress = async row => {
    const store = addressStoreRef.current;
    const addressId = extractId(row?.id || row?.['@id']);

    if (!addressId || typeof store?.actions?.remove !== 'function') {
      showError?.('Serviço de endereços indisponível no momento.');
      return;
    }

    setDeletingAddressId(addressId);

    try {
      await store.actions.remove(addressId);
      setItems(currentItems =>
        currentItems.filter(item => extractId(item?.id || item?.['@id']) !== addressId),
      );
      showSuccess?.('Endereço removido com sucesso.');
    } catch {
      showError?.('Falha ao remover endereço. Tente novamente.');
    } finally {
      setDeletingAddressId('');
    }
  };

  const confirmRemoveAddress = row => {
    const onConfirm = () => removeAddress(row);

    if (showDialog) {
      showDialog({
        title: 'Confirmar exclusão',
        message: 'Deseja realmente remover este endereço?',
        onConfirm,
      });
      return;
    }

    onConfirm();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreate}>
          <FeatherIcon name="plus" size={18} color={palette.buttonIcon || '#fff'} />
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <ActivityIndicator color={palette.loadingSpinner} /> : null}

      <ScrollView style={styles.list}>
        {items.map(row => {
          const summary = buildAddressOptionSummary(row);
          const key = row['@id'] || row.id;
          const addressId = extractId(row?.id || row?.['@id']);
          const isDeleting = deletingAddressId === addressId;
          return (
            <View key={key} style={styles.card}>
              <TouchableOpacity style={styles.cardContent} onPress={() => openEdit(row)}>
                <Text style={styles.cardPrimary}>
                  {summary.primary || row.nickname || 'Endereço'}
                </Text>
                <Text style={styles.cardSecondary}>
                  {summary.secondary || ''}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteAction}
                onPress={() => confirmRemoveAddress(row)}
                disabled={isDeleting}>
                {isDeleting ? (
                  <ActivityIndicator size="small" color={palette.buttonIcon || '#fff'} />
                ) : (
                  <FeatherIcon name="trash-2" size={16} color={palette.buttonIcon || '#fff'} />
                )}
              </TouchableOpacity>
            </View>
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
                load(true);
              }}
              submitLabel="Salvar endereço"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = palette => StyleSheet.create({
  // Alinhado ao padrão section/cardItem de Profile (people css) — app-community#373
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  addButton: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.buttonBackground,
    borderColor: palette.buttonBackground,
  },
  list: {},
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#64748B',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardContent: {
    flex: 1,
  },
  cardPrimary: {
    fontWeight: '600',
    fontSize: 15,
    color: palette.cardText || palette.textPrimary,
  },
  cardSecondary: {
    color: palette.textSecondary,
    marginTop: 4,
    fontSize: 13,
  },
  deleteAction: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    backgroundColor: palette.buttonBackground,
    borderColor: palette.buttonBackground,
  },
  empty: {
    color: palette.textSecondary,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  error: {color: palette.textDanger, marginBottom: 8},
  modalBackdrop: {
    flex: 1,
    backgroundColor: palette.modalOverlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '90%',
    backgroundColor: palette.modalBackground,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
});
