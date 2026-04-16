import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AnimatedModal from '@controleonline/ui-crm/src/react/components/AnimatedModal';
import { useMessage } from '@controleonline/ui-common/src/react/components/MessageService';
import { useStore } from '@store';

const LINK_TYPE_OPTIONS = [
  { value: 'employee', translationKey: 'employee' },
  { value: 'owner', translationKey: 'owner' },
  { value: 'director', translationKey: 'director' },
  { value: 'manager', translationKey: 'manager' },
];


const toBrDateString = date => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day}/${month}/${year}`;
};

const AddCompanyModal = ({ visible, onClose, context, onSuccess }) => {
  const peopleStore = useStore('people');
  const getters  = peopleStore.getters;
  const actions  = peopleStore.actions;
  const { currentCompany } = getters;

  const { showError } = useMessage();
  const defaultDate = new Date();
  const [linkTypeOptions, setLinkTypeOptions] = useState(
    LINK_TYPE_OPTIONS.map(option => ({
      value: option.value,
      label: '',
    })),
  );

  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    foundationDate: defaultDate,
    foundationDateInput: toBrDateString(defaultDate),
    peopleType: 'J',
    linkType: 'employee',
    firstEmployeeName: '',
    firstEmployeeAlias: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const isPessoaFisica = formData.peopleType === 'F';
  const isPessoaJuridica = formData.peopleType === 'J';
  const nameLabel = isPessoaFisica ? global.t?.t('people', 'label', 'nameRequired') : global.t?.t('people', 'label', 'companyNameRequired');
  const namePlaceholder = isPessoaFisica
    ? global.t?.t('people', 'placeholder', 'enterName')
    : global.t?.t('people', 'placeholder', 'enterCompanyName');
  const aliasLabel = isPessoaFisica ? global.t?.t('people', 'label', 'aliasRequired') : global.t?.t('people', 'label', 'tradeNameRequired');
  const aliasPlaceholder = isPessoaFisica
    ? global.t?.t('people', 'placeholder', 'enterAlias')
    : global.t?.t('people', 'placeholder', 'enterTradeName');
  const dateLabel = isPessoaFisica
    ? global.t?.t('people', 'label', 'birthDate')
    : global.t?.t('people', 'label', 'foundationDate');
  const modalTitle = isPessoaFisica ? global.t?.t('people', 'title', 'newPerson') : global.t?.t('people', 'title', 'newCompany');

  useEffect(() => {
    setLinkTypeOptions(
      LINK_TYPE_OPTIONS.map(option => ({
        value: option.value,
        label: global.t?.t('people', 'label', option.translationKey),
      })),
    );
  }, []);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.alias.trim()) {
      showError(
        isPessoaFisica
          ? global.t?.t('people', 'error', 'nameAliasRequired')
          : global.t?.t('people', 'error', 'companyAliasRequired'),
      );
      return;
    }

    if (isPessoaJuridica) {
      if (
        !String(formData.firstEmployeeName || '').trim() ||
        !String(formData.firstEmployeeAlias || '').trim()
      ) {
        showError(global.t?.t('people', 'error', 'firstEmployeeRequired'));
        return;
      }
    }

    setIsLoading(true);
    try {
      let parsedFoundationDate = formData.foundationDate;
      if (formData.foundationDateInput) {
        const normalized = formatDateInput(formData.foundationDateInput);
        if (normalized.length !== 10) {
          showError(global.t?.t('people', 'error', 'invalidDateFormat'));
          setIsLoading(false);
          return;
        }

        const [day, month, year] = normalized
          .split('/')
          .map(part => parseInt(part, 10));
        const candidate = new Date(year, month - 1, day);
        const validDate =
          candidate.getFullYear() === year &&
          candidate.getMonth() === month - 1 &&
          candidate.getDate() === day;

        if (!validDate) {
          showError(global.t?.t('people', 'error', 'invalidDateFormat'));
          setIsLoading(false);
          return;
        }

        parsedFoundationDate = candidate;
      }

      /* linkType para o backend: contexto externo (client/provider) usa o context,
         demais casos (criação de funcionário) usam o cargo selecionado no form */
      const linkType = context?.context || formData.linkType;

      const companyData = {
        name: formData.name.trim(),
        alias: formData.alias.trim(),
        foundationDate: parsedFoundationDate.toISOString().split('T')[0],
        peopleType: formData.peopleType,
        linkType,
        'extra-data': {},
        company: currentCompany ? '/people/' + currentCompany.id : null,
      };

      const savedCompany = await actions.save(companyData);

      /* cria o contato PF vinculado à empresa PJ recém criada */
      if (isPessoaJuridica && savedCompany?.id) {
        await actions.save({
          name:           String(formData.firstEmployeeName || '').trim(),
          alias:          String(formData.firstEmployeeAlias || '').trim(),
          peopleType:     'F',
          linkType:       formData.linkType,
          company:        `/people/${savedCompany.id}`,
          'extra-data':   {},
        });
      }

      if (onSuccess) {
        onSuccess(savedCompany);
      }

      handleClose();
    } catch (error) {
      showError(error?.message || 'Erro ao criar empresa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    const resetDate = new Date();
    setFormData({
      name: '',
      alias: '',
      foundationDate: resetDate,
      foundationDateInput: toBrDateString(resetDate),
      peopleType: 'J',
      linkType: 'employee',
      firstEmployeeName: '',
      firstEmployeeAlias: '',
    });
    onClose();
  };

  const formatDateInput = text => {
    const numbers = String(text || '').replace(/\D/g, '').slice(0, 8);
    if (!numbers) {
      return '';
    }

    if (numbers.length <= 2) {
      return numbers;
    }

    if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    }

    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
  };

  const handleDateChange = text => {
    const formatted = formatDateInput(text);
    setFormData(prev => ({ ...prev, foundationDateInput: formatted }));

    if (formatted.length === 10) {
      const parts = formatted.split('/');
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);

      if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900) {
        const newDate = new Date(year, month, day);
        if (!isNaN(newDate.getTime())) {
          setFormData(prev => ({
            ...prev,
            foundationDate: newDate,
          }));
        }
      }
    }
  };

  return (
    <AnimatedModal
      visible={visible}
      onRequestClose={handleClose}
      style={{ justifyContent: 'flex-end' }}>
      <View
        style={{
          backgroundColor: '#fff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: '90%',
          width: '100%',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 10,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            paddingVertical: 20,
            borderBottomWidth: 1,
            borderBottomColor: '#F1F5F9',
          }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#0F172A',
            }}>
            {modalTitle}
          </Text>
          <TouchableOpacity
            onPress={handleClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#F1F5F9',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Icon name="close" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ padding: 20 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#212529',
                marginBottom: 8,
              }}>
              {nameLabel}
            </Text>
            <TextInput
              value={formData.name}
              onChangeText={text => setFormData(prev => ({ ...prev, name: text }))}
              placeholder={namePlaceholder}
              style={{
                borderWidth: 1,
                borderColor: '#e9ecef',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                backgroundColor: '#f8f9fa',
              }}
              placeholderTextColor="#6c757d"
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#212529',
                marginBottom: 8,
              }}>
              {aliasLabel}
            </Text>
            <TextInput
              value={formData.alias}
              onChangeText={text => setFormData(prev => ({ ...prev, alias: text }))}
              placeholder={aliasPlaceholder}
              style={{
                borderWidth: 1,
                borderColor: '#e9ecef',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                backgroundColor: '#f8f9fa',
              }}
              placeholderTextColor="#6c757d"
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#212529',
                marginBottom: 8,
              }}>
              {global.t?.t('people', 'label', 'personType')}
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() =>
                  setFormData(prev => ({
                    ...prev,
                    peopleType: 'F',
                    firstEmployeeName: '',
                    firstEmployeeAlias: '',
                  }))
                }
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor:
                    formData.peopleType === 'F' ? '#007bff' : '#e9ecef',
                  backgroundColor:
                    formData.peopleType === 'F' ? '#e7f3ff' : '#f8f9fa',
                }}>
                <Icon
                  name="person"
                  size={20}
                  color={formData.peopleType === 'F' ? '#007bff' : '#6c757d'}
                />
                <Text
                  style={{
                    marginLeft: 8,
                    fontSize: 16,
                    color:
                      formData.peopleType === 'F' ? '#007bff' : '#6c757d',
                    fontWeight: formData.peopleType === 'F' ? '600' : '400',
                  }}>
                  {global.t?.t('people', 'label', 'individual')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFormData(prev => ({ ...prev, peopleType: 'J' }))}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor:
                    formData.peopleType === 'J' ? '#007bff' : '#e9ecef',
                  backgroundColor:
                    formData.peopleType === 'J' ? '#e7f3ff' : '#f8f9fa',
                }}>
                <Icon
                  name="business"
                  size={20}
                  color={formData.peopleType === 'J' ? '#007bff' : '#6c757d'}
                />
                <Text
                  style={{
                    marginLeft: 8,
                    fontSize: 16,
                    color:
                      formData.peopleType === 'J' ? '#007bff' : '#6c757d',
                    fontWeight: formData.peopleType === 'J' ? '600' : '400',
                  }}>
                  {global.t?.t('people', 'label', 'legalEntity')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginBottom: 30 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#212529',
                marginBottom: 8,
              }}>
              {dateLabel}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#e9ecef',
                borderRadius: 12,
                paddingHorizontal: 16,
                backgroundColor: '#f8f9fa',
              }}>
              <Icon name="calendar-today" size={20} color="#6c757d" />
              <TextInput
                placeholder={global.t?.t('people', 'placeholder', 'dateFormat')}
                value={formData.foundationDateInput}
                onChangeText={handleDateChange}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  fontSize: 16,
                  color: '#212529',
                }}
                placeholderTextColor="#6c757d"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>
          
          {isPessoaJuridica && (
            <View style={{ marginBottom: 20 }}>

              
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#212529',
                  marginBottom: 8,
                }}>
                {global.t?.t('people','title','contactLinked')}
              </Text>

              <View style={{ marginBottom: 12 }}>
                <TextInput
                  value={formData.firstEmployeeName}
                  onChangeText={text =>
                    setFormData(prev => ({ ...prev, firstEmployeeName: text }))
                  }
                  placeholder={global.t?.t('people','placeholder','contactName')}
                  style={{
                    borderWidth: 1,
                    borderColor: '#e9ecef',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    backgroundColor: '#f8f9fa',
                  }}
                  placeholderTextColor="#6c757d"
                />
              </View>

              <View style={{ marginBottom: 12 }}>
                <TextInput
                  value={formData.firstEmployeeAlias}
                  onChangeText={text =>
                    setFormData(prev => ({ ...prev, firstEmployeeAlias: text }))
                  }
                  placeholder={global.t?.t('people','placeholder','contactAlias')}
                  style={{
                    borderWidth: 1,
                    borderColor: '#e9ecef',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    backgroundColor: '#f8f9fa',
                  }}
                  placeholderTextColor="#6c757d"
                />
              </View>

<Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#212529',
                marginBottom: 8,
              }}>
              {global.t?.t('people', 'label', 'contactRole')}
              </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {linkTypeOptions.map(option => {
                const isSelected = formData.linkType === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setFormData(prev => ({ ...prev, linkType: option.value }))}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor:      isSelected ? '#007bff' : '#e9ecef',
                      backgroundColor:  isSelected ? '#e7f3ff' : '#f8f9fa',
                    }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: isSelected ? '600' : '400',
                      color: isSelected ? '#007bff' : '#6c757d',
                    }}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>


            </View>
          )}

        </ScrollView>

        <View
          style={{
            flexDirection: 'row',
            padding: 20,
            gap: 12,
            borderTopWidth: 1,
            borderTopColor: '#e9ecef',
          }}>
          <TouchableOpacity
            onPress={() => {
              Keyboard.dismiss();
              handleClose();
            }}
            style={{
              flex: 1,
              paddingVertical: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#6c757d',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#6c757d',
              }}>
              Cancelar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Keyboard.dismiss();
              handleSave();
            }}
            disabled={isLoading}
            style={{
              flex: 1,
              paddingVertical: 14,
              borderRadius: 12,
              backgroundColor: isLoading ? '#6c757d' : '#007bff',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#fff',
              }}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </AnimatedModal>
  );
};

export default AddCompanyModal;
