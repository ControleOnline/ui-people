import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

import Icon from 'react-native-vector-icons/MaterialIcons';
import AnimatedModal from '@controleonline/ui-common/src/react/components/AnimatedModal';
import { useMessage } from '@controleonline/ui-common/src/react/components/MessageService';
import { useStore } from '@store';
import {
  buildPeopleContextConfig,
  normalizePeopleContextType,
} from '@controleonline/ui-people/src/react/utils/peopleContext';
import {
  buildAuthenticatedPersonLinkPayload,
  resolveAuthenticatedPeopleIri,
  resolveMyCompaniesLinkType,
} from '@controleonline/ui-people/src/react/utils/myCompaniesCreate';
import { toBrDateString, formatDateInput, parseBrDateInput } from '@controleonline/ui-people/src/react/utils/addCompanyDate';
import {
  LINK_TYPE_OPTIONS,
  OWNER_LINK_TYPE,
  FRANCHISE_LINK_TYPE,
  normalizePeopleType,
  normalizeIdentityValue,
  toPeopleIri,
  buildExistingOwnerLabel,
} from '@controleonline/ui-people/src/react/utils/addCompanyFormHelpers';
import { useExistingOwnerOptions } from '@controleonline/ui-people/src/react/hooks/useExistingOwnerOptions';
import AddCompanyContactFields from './AddCompanyContactFields';

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
;

const AddCompanyModal = ({ visible, onClose, context, onSuccess, autoLinkAuthenticatedPerson = false }) => {
  const peopleStore = useStore('people');
  const getters  = peopleStore.getters;
  const actions  = peopleStore.actions;
  const peopleLinkStore = useStore('people_link');
  const peopleLinkActions = peopleLinkStore?.actions || {};
  const authStore = useStore('auth');
  const { currentCompany } = getters;
  const { user } = authStore?.getters || {};
  const shouldAutoLinkAuthenticatedPerson = Boolean(autoLinkAuthenticatedPerson);

  const { showError } = useMessage();
  const contextConfig = buildPeopleContextConfig(context);
  const [linkTypeOptions, setLinkTypeOptions] = useState(
    LINK_TYPE_OPTIONS.map(option => ({
      value: option.value,
      label: '',
    })),
  );
  const canSelectExistingOwner =
    Boolean(contextConfig.enableExistingOwnerSelection) &&
    normalizePeopleContextType(contextConfig.defaultType || context?.context) ===
      FRANCHISE_LINK_TYPE;
  const { existingOwnerOptions, isLoadingExistingOwners } = useExistingOwnerOptions({
    visible,
    canSelectExistingOwner,
    currentCompanyId: currentCompany?.id,
    loadCandidates: actions.franchiseOwnerCandidates,
  });

  const buildInitialFormData = registrationLinkType => {
    const defaultDate = new Date();
    const normalizedRegistrationLinkType =
      normalizePeopleContextType(registrationLinkType || contextConfig.defaultType) ||
      normalizePeopleContextType(context?.context) ||
      'employee';
    const shouldRequireManualRole =
      Boolean(contextConfig.enableExistingOwnerSelection) &&
      normalizedRegistrationLinkType === FRANCHISE_LINK_TYPE;

    return {
      name: '',
      alias: '',
      foundationDate: defaultDate,
      foundationDateInput: toBrDateString(defaultDate),
      peopleType: normalizePeopleType(context?.defaultPeopleType) || 'J',
      contactLinkType: shouldRequireManualRole ? '' : 'employee',
      registrationLinkType: normalizedRegistrationLinkType,
      firstEmployeeName: '',
      firstEmployeeAlias: '',
      selectedExistingOwnerIri: '',
    };
  };
  const [formData, setFormData] = useState(() =>
    buildInitialFormData(contextConfig.defaultType),
  );
  const [isLoading, setIsLoading] = useState(false);
  const isPessoaFisica = formData.peopleType === 'F';
  const isPessoaJuridica = formData.peopleType === 'J';
  const hasSelectedExistingOwner = String(formData.selectedExistingOwnerIri || '').startsWith('/people/');
  const shouldDisableManualContactFields =
    isPessoaJuridica &&
    (shouldAutoLinkAuthenticatedPerson ||
      (canSelectExistingOwner && hasSelectedExistingOwner));
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

    if (isPessoaJuridica && !shouldAutoLinkAuthenticatedPerson) {
      if (!hasSelectedExistingOwner) {
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
    }

    if (isPessoaJuridica && shouldAutoLinkAuthenticatedPerson) {
      if (!resolveAuthenticatedPeopleIri(user)) {
        showError(
          global.t?.t('people', 'error', 'authenticatedPersonRequired') ||
            'Nao foi possivel identificar a pessoa do usuario autenticado.',
        );
        return;
      }
    }

    setIsLoading(true);
    try {
      let parsedFoundationDate = formData.foundationDate;
      if (formData.foundationDateInput) {
        const parsed = parseBrDateInput(formData.foundationDateInput);
        if (parsed.error) {
          showError(global.t?.t('people', 'error', 'invalidDateFormat'));
          setIsLoading(false);
          return;
        }
        parsedFoundationDate = parsed.date;
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
        'extra-data': {},
      };

      // Generic create (client/CRM/etc.): register under current company + role.
      // My Companies auto-link: do NOT attach currentCompany/linkType here —
      // the authenticated person link is created explicitly via people_links.
      if (shouldAutoLinkAuthenticatedPerson) {
        // omit company + linkType so postPersist does not invent an unrelated link
      } else {
        companyData.linkType = registrationLinkType;
        companyData.company = currentCompany ? '/people/' + currentCompany.id : null;
      }

      const savedCompany = await actions.save(companyData);

      /* cria o contato PF vinculado à empresa PJ recém criada */
      if (isPessoaJuridica && savedCompany?.id) {
        if (shouldAutoLinkAuthenticatedPerson) {
          const linkPayload = buildAuthenticatedPersonLinkPayload({
            companyId: savedCompany.id,
            user,
            linkType: registrationLinkType,
          });
          if (!linkPayload) {
            throw new Error(
              global.t?.t('people', 'error', 'authenticatedPersonRequired') ||
                'Nao foi possivel vincular a pessoa autenticada a empresa.',
            );
          }
          if (typeof peopleLinkActions.save !== 'function') {
            throw new Error(
              'people_link store indisponivel para vincular a pessoa autenticada.',
            );
          }
          await peopleLinkActions.save(linkPayload);
        } else if (hasSelectedExistingOwner) {
          await peopleLinkActions.save({
            company: `/people/${savedCompany.id}`,
            people: formData.selectedExistingOwnerIri,
            linkType: OWNER_LINK_TYPE,
          });
        } else {
          await actions.save({
            name:           normalizeIdentityValue(formData.firstEmployeeName),
            alias:          normalizeIdentityValue(formData.firstEmployeeAlias),
            peopleType:     'F',
            linkType:       formData.contactLinkType,
            company:        `/people/${savedCompany.id}`,
            'extra-data':   {},
          });
        }
      }

      if (onSuccess) {
        onSuccess(savedCompany, { registrationLinkType });
      }

      handleClose();
    } catch (error) {
      showError(error?.message || global.t?.t('people', 'error', 'createCompanyFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(buildInitialFormData(contextConfig.defaultType));
    onClose();
  };

  const handleDateChange = text => {
    const formatted = formatDateInput(text);
    const parsed = formatted.length === 10 ? parseBrDateInput(formatted) : null;
    setFormData(prev => ({
      ...prev,
      foundationDateInput: formatted,
      ...(parsed && parsed.date ? { foundationDate: parsed.date } : {}),
    }));
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
              onChangeText={text => setFormData(prev => ({ ...prev, name: text }))}
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
              onChangeText={text => setFormData(prev => ({ ...prev, alias: text }))}
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
          
          {isPessoaJuridica && !shouldAutoLinkAuthenticatedPerson && (
            <AddCompanyContactFields
              formData={formData}
              setFormData={setFormData}
              canSelectExistingOwner={canSelectExistingOwner}
              existingOwnerOptions={existingOwnerOptions}
              isLoadingExistingOwners={isLoadingExistingOwners}
              shouldDisableManualContactFields={shouldDisableManualContactFields}
              linkTypeOptions={linkTypeOptions}
            />
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
              {global.t?.t('people', 'button', 'cancel')}
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
              {isLoading
                ? global.t?.t('people', 'button', 'saving')
                : global.t?.t('people', 'button', 'save')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </AnimatedModal>
  );
};

export default AddCompanyModal;
