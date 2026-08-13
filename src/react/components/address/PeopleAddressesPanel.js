import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
 */
export default function PeopleAddressesPanel({peopleIri, title = 'Endereços'}) {
  const addressStore = useStore('address');
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

  const removeAddress = async row => {
    const addressId = extractId(row?.id || row?.['@id']);

    if (!addressId || typeof addressStore.actions.remove !== 'function') {
      showError?.('Serviço de endereços indisponível no momento.');
      return;
    }

    setDeletingAddressId(addressId);

    try {
      await addressStore.actions.remove(addressId);
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
          <FeatherIcon name="plus" size={16} color={palette.buttonIcon} />
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator color={palette.loadingSpinner} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ScrollView style={styles.list}>
        {items.map(row => {
          const summary = buildAddressOptionSummary(row);
          const key = row['@id'] || row.id;
          const addressId = extractId(row?.id || row?.['@id']);
          const isDeleting = addressId && deletingAddressId === addressId;
          return (
            <View key={key} style={styles.card}>
              <TouchableOpacity
                style={styles.cardContent}
                onPress={() => openEdit(row)}>
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
                disabled={!!isDeleting}>
                {isDeleting ? (
                  <ActivityIndicator size="small" color={palette.buttonIcon} />
                ) : (
                  <FeatherIcon name="trash-2" size={16} color={palette.buttonIcon} />
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

const createStyles = palette => StyleSheet.create({
  container: {flex: 1, padding: 12},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {fontSize: 16, fontWeight: '700', color: palette.textPrimary},
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
  list: {flex: 1},
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: palette.cardBackground,
  },
  cardContent: {
    flex: 1,
  },
  cardPrimary: {fontWeight: '600', color: palette.cardText},
  cardSecondary: {color: palette.textSecondary, marginTop: 4},
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
  empty: {color: palette.textSecondary, marginTop: 12},
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
