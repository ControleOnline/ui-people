import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import css from '@controleonline/ui-people/src/react/css/people';
import { useStore } from '@store';
import { useFocusEffect } from '@react-navigation/native';
import md5 from 'md5';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '@controleonline/../../src/styles/colors';
import {useMessage} from '@controleonline/ui-common/src/react/components/MessageService';

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

const toPeopleIri = user => {
  let sessionPeople = '';
  try {
    sessionPeople = JSON.parse(localStorage.getItem('session') || '{}')?.people;
  } catch (error) {
    sessionPeople = '';
  }

  const directIri =
    user?.['@id'] ||
    user?.people?.['@id'] ||
    user?.people?.id ||
    user?.people ||
    sessionPeople ||
    user?.id;

  if (!directIri) {
    return '';
  }

  if (typeof directIri === 'string' && directIri.includes('/people/')) {
    return directIri;
  }

  const id = extractId(directIri);
  return id ? `/people/${id}` : '';
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

const validateEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const normalizeEmailValue = value => String(value || '').trim().toLowerCase();

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
  const phonesStore = useStore('phones');
  const emailsStore = useStore('emails');
  const {showSuccess, showError} = useMessage() || {};
  const userGetters = authStore.getters;
  const authActions = authStore.actions;
  const phonesActions = phonesStore.actions;
  const emailsActions = emailsStore.actions;
  const { user } = userGetters;
  const [phones, setPhones] = useState([]);
  const [emails, setEmails] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const originalPhoneIds = useRef([]);
  const originalEmailIds = useRef([]);
  const originalPhonesSnapshot = useRef([]);
  const originalEmailsSnapshot = useRef([]);

  const fetchUser = useCallback(() => {
    const parsedPhones = (Array.isArray(user?.phone) ? user.phone : [user?.phone])
      .map(toPhoneItem)
      .filter(item => item && item.value);
    const parsedEmails = (Array.isArray(user?.email) ? user.email : [user?.email])
      .map(toEmailItem)
      .filter(item => item && item.value);

    setPhones(parsedPhones);
    setEmails(parsedEmails);
    originalPhoneIds.current = parsedPhones.map(item => item.id).filter(Boolean);
    originalEmailIds.current = parsedEmails.map(item => item.id).filter(Boolean);
    originalPhonesSnapshot.current = normalizePhonesForCompare(parsedPhones);
    originalEmailsSnapshot.current = normalizeEmailsForCompare(parsedEmails);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [fetchUser]),
  );

  const getAvatarUrl = () => {
    if (!user?.email) return 'https://www.gravatar.com/avatar/?d=identicon';
    const emailHash = md5(user.email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${emailHash}?s=200&d=identicon`;
  };

  const handleLogout = () => {
    authActions.logOut();
    navigation.reset({
      index: 0,
      routes: [{ name: 'SignInPage' }],
    });
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
      throw new Error('Telefone com DDD deve ter 10 ou 11 digitos.');
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
      throw new Error('Informe um e-mail valido.');
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

    return (
      !isSameList(currentPhones, originalPhonesSnapshot.current) ||
      !isSameList(currentEmails, originalEmailsSnapshot.current)
    );
  }, [phones, emails]);

  const handleSave = async () => {
    if (isSaving || !hasUnsavedChanges) {
      return;
    }

    const peopleIri = toPeopleIri(user);
    if (!peopleIri) {
      showError?.('Nao foi possivel identificar o perfil para salvar os dados.');
      return;
    }

    setIsSaving(true);

    try {
      const persistedPhones = await savePhones(peopleIri);
      const persistedEmails = await saveEmails(peopleIri);

      setPhones(persistedPhones);
      setEmails(persistedEmails);
      originalPhoneIds.current = persistedPhones.map(item => item.id).filter(Boolean);
      originalEmailIds.current = persistedEmails.map(item => item.id).filter(Boolean);
      originalPhonesSnapshot.current = normalizePhonesForCompare(persistedPhones);
      originalEmailsSnapshot.current = normalizeEmailsForCompare(persistedEmails);

      authActions.logIn({
        ...user,
        phone: persistedPhones[0]?.value || '',
        email: persistedEmails[0]?.value || '',
      });

      showSuccess?.('Dados do perfil salvos com sucesso.');
    } catch (error) {
      showError?.(error?.message || 'Nao foi possivel salvar os dados do perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderEditableList = (items, setItems, type) => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {type === 'phone' ? 'Telefones' : 'E-mails'}
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
            color={colors.textSecondary}
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
            placeholder={type === 'phone' ? 'Adicionar telefone' : 'Adicionar e-mail'}
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
        <Text style={styles.emptyText}>Nenhum {type === 'phone' ? 'telefone' : 'e-mail'} cadastrado</Text>
      )}
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.Profile}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {'N\u00E3o foi poss\u00EDvel carregar os dados do usu\u00E1rio'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.Profile}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: getAvatarUrl() }} style={styles.avatar} />
            <TouchableOpacity style={styles.editAvatarButton}>
              <Icon name="camera-alt" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user.realname}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
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
                  <Text style={styles.saveButtonText}>Salvar alteracoes</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
            <Icon name="logout" size={20} color={colors.error} style={{ marginRight: 8 }} />
            <Text style={styles.logoutButtonText}>Sair da conta</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>{'Vers\u00E3o 1.0.0'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
