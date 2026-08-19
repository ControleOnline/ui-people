import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import AnimatedModal from '@controleonline/ui-common/src/react/components/AnimatedModal';
import { useMessage } from '@controleonline/ui-common/src/react/components/MessageService';
import { useStore } from '@store';
import {
  buildPeopleContextConfig,
  normalizePeopleContextType,
} from '@controleonline/ui-people/src/react/utils/peopleContext';
import {
  LINK_TYPE_OPTIONS,
  OWNER_LINK_TYPE,
  FRANCHISE_LINK_TYPE,
  normalizeIdentityValue,
  toPeopleIri,
  buildExistingOwnerLabel,
  formatDateInput,
  parseBrDateInput,
  buildInitialFormData,
} from '@controleonline/ui-people/src/react/utils/addCompanyFormHelpers';
import AddCompanyLinkedContactSection from './AddCompanyLinkedContactSection';

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
  inlineStyle_559_10,
  inlineStyle_571_12,
  inlineStyle_580_14,
  inlineStyle_595_12,
  inlineStyle_603_14,
} from './AddCompanyModal.styles';

const AddCompanyModal = ({ visible, onClose, context, onSuccess }) => {
  const peopleStore = useStore('people');
  const getters = peopleStore.getters;
  const actions = peopleStore.actions;
  const peopleLinkStore = useStore('people_link');
  const peopleLinkActions = peopleLinkStore?.actions || {};
  const { currentCompany } = getters;

  const { showError } = useMessage();
  const contextConfig = buildPeopleContextConfig(context);

  const [linkTypeOptions, setLinkTypeOptions] = useState(
    LINK_TYPE_OPTIONS.map(option => ({
      value: option.value,
      label: '',
    })),
  );
  const [existingOwnerOptions, setExistingOwnerOptions] = useState([]);
  const [isLoadingExistingOwners, setIsLoadingExistingOwners] = useState(false);
  const canSelectExistingOwner =
    Boolean(contextConfig.enableExistingOwnerSelection) &&
    normalizePeopleContextType(contextConfig.defaultType || context?.context) ===
      FRANCHISE_LINK_TYPE;

  const [formData, setFormData] = useState(() =>
    buildInitialFormData(context, contextConfig),
  );
  const [isLoading, setIsLoading] = useState(false);

  const hasSelectedExistingOwner = String(
    formData.selectedExistingOwnerIri || '',
  ).startsWith('/people/');
  const shouldDisableManualContactFields = hasSelectedExistingOwner;

  const isPessoaFisica = formData.peopleType === 'F';
  const isPessoaJuridica = formData.peopleType === 'J';

  const nameLabel = isPessoaFisica
    ? global.t?.t('people', 'label', 'nameRequired')
    : global.t?.t('people', 'label', 'companyNameRequired');
  const aliasLabel = isPessoaFisica
    ? global.t?.t('people', 'label', 'aliasRequired')
    : global.t?.t('people', 'label', 'tradeNameRequired');
  const namePlaceholder = isPessoaFisica
    ? global.t?.t('people', 'placeholder', 'fullName')
    : global.t?.t('people', 'placeholder', 'companyName');
  const aliasPlaceholder = isPessoaFisica
    ? global.t?.t('people', 'placeholder', 'nickname')
    : global.t?.t('people', 'placeholder', 'tradeName');
  const dateLabel = isPessoaFisica
    ? global.t?.t('people', 'label', 'birthDate')
    : global.t?.t('people', 'label', 'foundationDate');
  const modalTitle =
    contextConfig.modalTitle || global.t?.t('people', 'title', 'newCompany');

  useEffect(() => {
    setLinkTypeOptions(
      LINK_TYPE_OPTIONS.map(option => ({
        value: option.value,
        label: global.t?.t('people', 'label', option.translationKey) || option.value,
      })),
    );
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setFormData(buildInitialFormData(context, contextConfig));
  }, [visible, context?.context, contextConfig.defaultType]);

  useEffect(() => {
    if (!visible || !canSelectExistingOwner) {
      setExistingOwnerOptions([]);
      setIsLoadingExistingOwners(false);
      return undefined;
    }

    let cancelled = false;
    const loadExistingOwners = async () => {
      setIsLoadingExistingOwners(true);
      try {
        const response = await actions.franchiseOwnerCandidates({
          company: currentCompany ? `/people/${currentCompany.id}` : undefined,
        });
        if (cancelled) return;
        const ownerOptions = (response || []).map(owner => ({
          value: toPeopleIri(owner),
          label: buildExistingOwnerLabel(owner),
        }));
        setExistingOwnerOptions(ownerOptions.filter(o => o.value));
      } catch {
        if (!cancelled) {
          setExistingOwnerOptions([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingExistingOwners(false);
        }
      }
    };

    loadExistingOwners();
    return () => {
      cancelled = true;
    };
  }, [visible, canSelectExistingOwner, currentCompany?.id]);

  const handleSave = async () => {
    if (!String(formData.name || '').trim() || !String(formData.alias || '').trim()) {
      showError(
        isPessoaFisica
          ? global.t?.t('people', 'error', 'nameAliasRequired')
          : global.t?.t('people', 'error', 'companyAliasRequired'),
      );
      return;
    }

    if (isPessoaJuridica && !hasSelectedExistingOwner) {
      if (
        !String(formData.firstEmployeeName || '').trim() ||
        !String(formData.firstEmployeeAlias || '').trim()
      ) {
        showError(global.t?.t('people', 'error', 'firstEmployeeRequired'));
        return;
      }
      if (canSelectExistingOwner && !String(formData.contactLinkType || '').trim()) {
        showError(global.t?.t('people', 'error', 'selectContactRole'));
        return;
      }
    }

    const parsedFoundationDate =
      parseBrDateInput(formData.foundationDateInput) || formData.foundationDate;
    if (!parsedFoundationDate || Number.isNaN(parsedFoundationDate.getTime())) {
      showError(global.t?.t('people', 'error', 'invalidDateFormat'));
      return;
    }

    setIsLoading(true);
    try {
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

      if (isPessoaJuridica && savedCompany?.id) {
        if (hasSelectedExistingOwner) {
          await peopleLinkActions.save({
            company: `/people/${savedCompany.id}`,
            people: formData.selectedExistingOwnerIri,
            linkType: OWNER_LINK_TYPE,
          });
        } else {
          await actions.save({
            name: normalizeIdentityValue(formData.firstEmployeeName),
            alias: normalizeIdentityValue(formData.firstEmployeeAlias),
            peopleType: 'F',
            linkType: formData.contactLinkType,
            company: `/people/${savedCompany.id}`,
            'extra-data': {},
          });
        }
      }

      if (onSuccess) {
        onSuccess(savedCompany, { registrationLinkType });
      }

      handleClose();
    } catch (error) {
      showError(
        error?.message || global.t?.t('people', 'error', 'createCompanyFailed'),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(buildInitialFormData(context, contextConfig));
    onClose();
  };

  const handleDateChange = text => {
    const formatted = formatDateInput(text);
    const parsed = parseBrDateInput(formatted);
    setFormData(prev => ({
      ...prev,
      foundationDateInput: formatted,
      ...(parsed ? { foundationDate: parsed } : {}),
    }));
  };

  return (
    <AnimatedModal
      visible={visible}
      onRequestClose={handleClose}
      style={inlineStyle_233_6}>
      <View style={inlineStyle_235_8}>
        <View style={inlineStyle_251_10}>
          <Text style={inlineStyle_261_12}>{modalTitle}</Text>
          <TouchableOpacity onPress={handleClose} style={inlineStyle_270_12}>
            <Icon name="close" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={inlineStyle_283_10}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
          <View style={inlineStyle_286_16}>
            <Text style={inlineStyle_288_14}>{nameLabel}</Text>
            <TextInput
              value={formData.name}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, name: text }))
              }
              placeholder={namePlaceholder}
              style={inlineStyle_300_14}
              placeholderTextColor="#6c757d"
            />
          </View>

          <View style={inlineStyle_313_16}>
            <Text style={inlineStyle_315_14}>{aliasLabel}</Text>
            <TextInput
              value={formData.alias}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, alias: text }))
              }
              placeholder={aliasPlaceholder}
              style={inlineStyle_327_14}
              placeholderTextColor="#6c757d"
            />
          </View>

          <View style={inlineStyle_340_16}>
            <Text style={inlineStyle_342_14}>
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
                    firstEmployeeEmail: '',
                    firstEmployeePhone: '',
                    selectedExistingOwnerIri: '',
                  }))
                }
                style={inlineStyle_360_16({ formData })}>
                <Icon
                  name="person"
                  size={20}
                  color={formData.peopleType === 'F' ? '#007bff' : '#6c757d'}
                />
                <Text style={inlineStyle_378_18({ formData })}>
                  {global.t?.t('people', 'label', 'individual')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  setFormData(prev => ({
                    ...prev,
                    peopleType: 'J',
                  }))
                }
                style={inlineStyle_391_16({ formData })}>
                <Icon
                  name="business"
                  size={20}
                  color={formData.peopleType === 'J' ? '#007bff' : '#6c757d'}
                />
                <Text style={inlineStyle_409_18({ formData })}>
                  {global.t?.t('people', 'label', 'company')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={inlineStyle_422_16}>
            <Text style={inlineStyle_424_14}>{dateLabel}</Text>
            <View style={inlineStyle_433_14}>
              <Icon name="calendar-today" size={20} color="#6c757d" />
              <TextInput
                placeholder={global.t?.t('people', 'placeholder', 'dateFormat')}
                value={formData.foundationDateInput}
                onChangeText={handleDateChange}
                style={inlineStyle_447_16}
                placeholderTextColor="#6c757d"
                keyboardType="numeric"
                maxLength={10}
                editable
              />
            </View>
          </View>

          {isPessoaJuridica && (
            <AddCompanyLinkedContactSection
              formData={formData}
              setFormData={setFormData}
              canSelectExistingOwner={canSelectExistingOwner}
              hasSelectedExistingOwner={hasSelectedExistingOwner}
              shouldDisableManualContactFields={shouldDisableManualContactFields}
              existingOwners={existingOwnerOptions}
              linkTypeOptions={linkTypeOptions}
            />
          )}
        </ScrollView>

        <View style={inlineStyle_559_10}>
          <TouchableOpacity
            onPress={handleClose}
            style={inlineStyle_571_12}
            disabled={isLoading}>
            <Text style={inlineStyle_580_14}>
              {global.t?.t('common', 'button', 'cancel') || 'Cancelar'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            style={inlineStyle_595_12}
            disabled={isLoading}>
            <Text style={inlineStyle_603_14}>
              {isLoading
                ? global.t?.t('common', 'label', 'saving') || 'Salvando...'
                : global.t?.t('common', 'button', 'save') || 'Salvar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </AnimatedModal>
  );
};

export default AddCompanyModal;
