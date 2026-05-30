import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import AnimatedModal from '@controleonline/ui-crm/src/react/components/AnimatedModal';
import { useMessage } from '@controleonline/ui-common/src/react/components/MessageService';
import {
  formatDisplayUppercase,
  uppercaseText,
} from '@controleonline/ui-common/src/react/utils/entityDisplay';
import { useStore } from '@store';
import {
  buildPeopleContextConfig,
  normalizePeopleContextType,
} from '@controleonline/ui-people/src/react/utils/peopleContext';

import {
  inlineStyle_233_6,
  inlineStyle_235_8,
  inlineStyle_251_10,
  inlineStyle_261_12,
  inlineStyle_270_12,
  inlineStyle_283_10,
  inlineStyle_286_16,
  inlineStyle_288_14,
  inlineStyle_300_14,
  inlineStyle_313_16,
  inlineStyle_315_14,
  inlineStyle_327_14,
  inlineStyle_340_16,
  inlineStyle_342_14,
  inlineStyle_350_18,
  inlineStyle_360_16,
  inlineStyle_378_18,
  inlineStyle_391_16,
  inlineStyle_409_18,
  inlineStyle_422_16,
  inlineStyle_424_14,
  inlineStyle_433_14,
  inlineStyle_447_16,
  inlineStyle_462_18,
  inlineStyle_466_16,
  inlineStyle_475_20,
  inlineStyle_482_18,
  inlineStyle_495_20,
  inlineStyle_502_18,
  inlineStyle_516_14,
  inlineStyle_525_18,
  inlineStyle_532_20,
  inlineStyle_540_26,
  inlineStyle_559_10,
  inlineStyle_571_12,
  inlineStyle_580_14,
  inlineStyle_595_12,
  inlineStyle_603_14,
} from './AddCompanyModal.styles';

const LINK_TYPE_OPTIONS = [
  { value: 'employee', translationKey: 'employee' },
  { value: 'owner', translationKey: 'owner' },
  { value: 'director', translationKey: 'director' },
  { value: 'manager', translationKey: 'manager' },
  { value: 'courier', translationKey: 'courier' },
];

const normalizePeopleType = value =>
  String(value ?? '')
    .trim()
    .toUpperCase();
const normalizeIdentityValue = value => formatDisplayUppercase(value);

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
  const contextConfig = buildPeopleContextConfig(context);
  const [linkTypeOptions, setLinkTypeOptions] = useState(
    LINK_TYPE_OPTIONS.map(option => ({
      value: option.value,
      label: '',
    })),
  );

  const buildInitialFormData = registrationLinkType => {
    const defaultDate = new Date();

    return {
      name: '',
      alias: '',
      foundationDate: defaultDate,
      foundationDateInput: toBrDateString(defaultDate),
      peopleType: normalizePeopleType(context?.defaultPeopleType) || 'J',
      contactLinkType: 'employee',
      registrationLinkType:
        normalizePeopleContextType(registrationLinkType || contextConfig.defaultType) ||
        normalizePeopleContextType(context?.context) ||
        'employee',
      firstEmployeeName: '',
      firstEmployeeAlias: '',
    };
  };
  const [formData, setFormData] = useState(() =>
    buildInitialFormData(contextConfig.defaultType),
  );
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
  const modalTitle = contextConfig.modalTitle || global.t?.t('people', 'title', 'newCompany');

  useEffect(() => {
    setLinkTypeOptions(
      LINK_TYPE_OPTIONS.map(option => ({
        value: option.value,
        label: global.t?.t('people', 'label', option.translationKey),
      })),
    );
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setFormData(buildInitialFormData(contextConfig.defaultType));
  }, [contextConfig.defaultType, visible]);

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

      // O vinculo principal respeita o tipo selecionado no cadastro atual.
      const registrationLinkType =
        normalizePeopleContextType(formData.registrationLinkType) ||
        normalizePeopleContextType(context?.context) ||
        'employee';

      const companyData = {
        name: normalizeIdentityValue(formData.name),
        alias: normalizeIdentityValue(formData.alias),
        foundationDate: parsedFoundationDate.toISOString().split('T')[0],
        peopleType: formData.peopleType,
        linkType: registrationLinkType,
        'extra-data': {},
        company: currentCompany ? '/people/' + currentCompany.id : null,
      };

      const savedCompany = await actions.save(companyData);

      /* cria o contato PF vinculado à empresa PJ recém criada */
      if (isPessoaJuridica && savedCompany?.id) {
        await actions.save({
          name:           normalizeIdentityValue(formData.firstEmployeeName),
          alias:          normalizeIdentityValue(formData.firstEmployeeAlias),
          peopleType:     'F',
          linkType:       formData.contactLinkType,
          company:        `/people/${savedCompany.id}`,
          'extra-data':   {},
        });
      }

      if (onSuccess) {
        onSuccess(savedCompany, { registrationLinkType });
      }

      handleClose();
    } catch (error) {
      showError(error?.message || 'Erro ao criar empresa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(buildInitialFormData(contextConfig.defaultType));
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
      style={inlineStyle_233_6}>
      <View
        style={inlineStyle_235_8}>
        <View
          style={inlineStyle_251_10}>
          <Text
            style={inlineStyle_261_12}>
            {modalTitle}
          </Text>
          <TouchableOpacity
            onPress={handleClose}
            style={inlineStyle_270_12}>
            <Icon name="close" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={inlineStyle_283_10}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
          <View style={inlineStyle_286_16}>
            <Text
              style={inlineStyle_288_14}>
              {nameLabel}
            </Text>
            <TextInput
              value={formData.name}
              onChangeText={text => setFormData(prev => ({ ...prev, name: uppercaseText(text) }))}
              placeholder={namePlaceholder}
              style={inlineStyle_300_14}
              placeholderTextColor="#6c757d"
            />
          </View>

          <View style={inlineStyle_313_16}>
            <Text
              style={inlineStyle_315_14}>
              {aliasLabel}
            </Text>
            <TextInput
              value={formData.alias}
              onChangeText={text => setFormData(prev => ({ ...prev, alias: uppercaseText(text) }))}
              placeholder={aliasPlaceholder}
              style={inlineStyle_327_14}
              placeholderTextColor="#6c757d"
            />
          </View>

          <View style={inlineStyle_340_16}>
            <Text
              style={inlineStyle_342_14}>
              {global.t?.t('people', 'label', 'personType')}
            </Text>
            <View style={inlineStyle_350_18}>
              <TouchableOpacity
                onPress={() =>
                  setFormData(prev => ({
                    ...prev,
                    peopleType: 'F',
                    firstEmployeeName: '',
                    firstEmployeeAlias: '',
                  }))
                }
                style={inlineStyle_360_16({
                  formData: formData,
                })}>
                <Icon
                  name="person"
                  size={20}
                  color={formData.peopleType === 'F' ? '#007bff' : '#6c757d'}
                />
                <Text
                  style={inlineStyle_378_18({
                    formData: formData,
                  })}>
                  {global.t?.t('people', 'label', 'individual')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFormData(prev => ({ ...prev, peopleType: 'J' }))}
                style={inlineStyle_391_16({
                  formData: formData,
                })}>
                <Icon
                  name="business"
                  size={20}
                  color={formData.peopleType === 'J' ? '#007bff' : '#6c757d'}
                />
                <Text
                  style={inlineStyle_409_18({
                    formData: formData,
                  })}>
                  {global.t?.t('people', 'label', 'legalEntity')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={inlineStyle_422_16}>
            <Text
              style={inlineStyle_424_14}>
              {dateLabel}
            </Text>
            <View
              style={inlineStyle_433_14}>
              <Icon name="calendar-today" size={20} color="#6c757d" />
              <TextInput
                placeholder={global.t?.t('people', 'placeholder', 'dateFormat')}
                value={formData.foundationDateInput}
                onChangeText={handleDateChange}
                style={inlineStyle_447_16}
                placeholderTextColor="#6c757d"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>
          
          {isPessoaJuridica && (
            <View style={inlineStyle_462_18}>

              
              <Text
                style={inlineStyle_466_16}>
                {global.t?.t('people','title','contactLinked')}
              </Text>

              <View style={inlineStyle_475_20}>
                <TextInput
                  value={formData.firstEmployeeName}
                  onChangeText={text =>
                    setFormData(prev => ({ ...prev, firstEmployeeName: uppercaseText(text) }))
                  }
                  placeholder={global.t?.t('people','placeholder','contactName')}
                  style={inlineStyle_482_18}
                  placeholderTextColor="#6c757d"
                />
              </View>

              <View style={inlineStyle_495_20}>
                <TextInput
                  value={formData.firstEmployeeAlias}
                  onChangeText={text =>
                    setFormData(prev => ({ ...prev, firstEmployeeAlias: uppercaseText(text) }))
                  }
                  placeholder={global.t?.t('people','placeholder','contactAlias')}
                  style={inlineStyle_502_18}
                  placeholderTextColor="#6c757d"
                />
              </View>
              <Text
                style={inlineStyle_516_14}>
                {global.t?.t('people', 'label', 'contactRole')}
              </Text>

              <View style={inlineStyle_525_18}>
                {linkTypeOptions.map(option => {
                  const isSelected = formData.contactLinkType === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() =>
                        setFormData(prev => ({ ...prev, contactLinkType: option.value }))
                      }
                      style={inlineStyle_532_20({
                        isSelected: isSelected,
                      })}>
                      <Text style={inlineStyle_540_26({
                        isSelected: isSelected,
                      })}>
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
          style={inlineStyle_559_10}>
          <TouchableOpacity
            onPress={() => {
              Keyboard.dismiss();
              handleClose();
            }}
            style={inlineStyle_571_12}>
            <Text
              style={inlineStyle_580_14}>
              Cancelar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Keyboard.dismiss();
              handleSave();
            }}
            disabled={isLoading}
            style={inlineStyle_595_12({
              isLoading: isLoading,
            })}>
            <Text
              style={inlineStyle_603_14}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </AnimatedModal>
  );
};

export default AddCompanyModal;
