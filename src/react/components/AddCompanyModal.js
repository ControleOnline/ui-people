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
import AnimatedModal from '@controleonline/ui-common/src/react/components/AnimatedModal';
import { useMessage } from '@controleonline/ui-common/src/react/components/MessageService';
import {
  uppercaseText,
} from '@controleonline/ui-common/src/react/utils/entityDisplay';
import { useStore } from '@store';
import {
  LINK_TYPE_OPTIONS,
  OWNER_LINK_TYPE,
  FRANCHISE_LINK_TYPE,
  normalizePeopleType,
  normalizeIdentityValue,
  extractId,
  toPeopleIri,
  buildExistingOwnerLabel,
  toBrDateString,
  formatDateInput,
  buildInitialFormData,
  validateAddCompanyForm,
} from '@controleonline/ui-people/src/react/utils/addCompanyFormHelpers';
import {
  persistLinkedContactCommunication,
} from '@controleonline/ui-people/src/react/utils/companyLinkedContact';
import {
  buildPeopleContextConfig,
  normalizePeopleContextType,
} from '@controleonline/ui-people/src/react/utils/peopleContext';
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
  const emailsActions = useStore('emails')?.actions || {};
  const phonesActions = useStore('phones')?.actions || {};
  const { currentCompany } = getters;
  const { showError } = useMessage();

  const contextConfig = buildPeopleContextConfig(context);
  const canSelectExistingOwner =
    Boolean(contextConfig.enableExistingOwnerSelection) &&
    normalizePeopleContextType(contextConfig.defaultType || context?.context) ===
      FRANCHISE_LINK_TYPE;

  const [linkTypeOptions, setLinkTypeOptions] = useState(
    LINK_TYPE_OPTIONS.map(option => ({ value: option.value, label: '' })),
  );
  const [existingOwnerOptions, setExistingOwnerOptions] = useState([]);
  const [formData, setFormData] = useState(() =>
    buildInitialFormData(context, contextConfig),
  );
  const [isLoading, setIsLoading] = useState(false);

  const isPessoaFisica = formData.peopleType === 'F';
  const isPessoaJuridica = formData.peopleType === 'J';
  const hasSelectedExistingOwner = String(
    formData.selectedExistingOwnerIri || '',
  ).startsWith('/people/');
  const shouldDisableManualContactFields =
    isPessoaJuridica && canSelectExistingOwner && hasSelectedExistingOwner;
  const shouldRequireManualRole =
    Boolean(contextConfig.enableExistingOwnerSelection) &&
    normalizePeopleContextType(formData.registrationLinkType) === FRANCHISE_LINK_TYPE;

  const nameLabel = isPessoaFisica
    ? global.t?.t('people', 'label', 'nameRequired')
    : global.t?.t('people', 'label', 'companyNameRequired');
  const namePlaceholder = isPessoaFisica
    ? global.t?.t('people', 'placeholder', 'enterName')
    : global.t?.t('people', 'placeholder', 'enterCompanyName');
  const aliasLabel = isPessoaFisica
    ? global.t?.t('people', 'label', 'aliasRequired')
    : global.t?.t('people', 'label', 'tradeNameRequired');
  const aliasPlaceholder = isPessoaFisica
    ? global.t?.t('people', 'placeholder', 'enterAlias')
    : global.t?.t('people', 'placeholder', 'enterTradeName');
  const dateLabel = isPessoaFisica
    ? global.t?.t('people', 'label', 'birthDate')
    : global.t?.t('people', 'label', 'foundationDate');
  const modalTitle =
    contextConfig.modalTitle || global.t?.t('people', 'title', 'newCompany');

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
    setFormData(buildInitialFormData(context, contextConfig));
  }, [contextConfig.defaultType, visible]);

  useEffect(() => {
    if (!visible || !canSelectExistingOwner || !currentCompany?.id) {
      setExistingOwnerOptions([]);
      return;
    }

    let cancelled = false;

    const loadExistingOwners = async () => {
      try {
        const response = await actions.franchiseOwnerCandidates({
          companyId: currentCompany.id,
        });
        const ownerOptions = (response || [])
          .map(owner => ({
            iri: toPeopleIri(owner),
            label: buildExistingOwnerLabel(owner),
          }))
          .filter(option => option.iri)
          .sort((left, right) => left.label.localeCompare(right.label));

        if (!cancelled) {
          setExistingOwnerOptions(ownerOptions);
        }
      } catch {
        if (!cancelled) {
          setExistingOwnerOptions([]);
        }
        showError(
          global.t?.t('people', 'error', 'franchiseOwnerCandidatesLoadFailed'),
        );
      }
    };

    loadExistingOwners();
    return () => {
      cancelled = true;
    };
  }, [visible, canSelectExistingOwner, currentCompany?.id]);

  const resolveErrorMessage = errorKey => {
    const map = {
      nameRequired: isPessoaFisica
        ? global.t?.t('people', 'error', 'nameAliasRequired')
        : global.t?.t('people', 'error', 'companyNameRequired'),
      aliasRequired: isPessoaFisica
        ? global.t?.t('people', 'error', 'nameAliasRequired')
        : global.t?.t('people', 'error', 'tradeNameRequired'),
      invalidDateFormat: global.t?.t('people', 'error', 'invalidDateFormat'),
      firstEmployeeRequired: global.t?.t('people', 'error', 'firstEmployeeRequired'),
      invalidEmail:
        global.t?.t('people', 'error', 'invalidEmail') ||
        'Informe um e-mail válido para o contato vinculado.',
      invalidPhone:
        global.t?.t('people', 'error', 'invalidPhone') ||
        'Informe um telefone válido (DDD + número) para o contato vinculado.',
      contactRoleRequired:
        global.t?.t('people', 'error', 'contactRoleRequired') ||
        'Selecione o papel do contato vinculado.',
    };
    return map[errorKey] || global.t?.t('people', 'error', 'createCompanyFailed');
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const validation = validateAddCompanyForm({
        formData,
        isPessoaJuridica,
        hasSelectedExistingOwner,
        canSelectExistingOwner,
        shouldRequireManualRole,
      });

      if (!validation.ok) {
        showError(resolveErrorMessage(validation.errorKey));
        setIsLoading(false);
        return;
      }

      const registrationLinkType =
        normalizePeopleContextType(formData.registrationLinkType) ||
        normalizePeopleContextType(context?.context) ||
        'employee';

      const companyData = {
        name: normalizeIdentityValue(formData.name),
        alias: normalizeIdentityValue(formData.alias),
        foundationDate: validation.parsedFoundationDate
          .toISOString()
          .split('T')[0],
        peopleType: formData.peopleType,
        linkType: registrationLinkType,
        'extra-data': {},
        company: currentCompany ? '/people/' + currentCompany.id : null,
      };

      const savedCompany = await actions.save(companyData);
      const savedCompanyId = extractId(savedCompany?.id || savedCompany?.['@id']);

      if (isPessoaJuridica && savedCompanyId) {
        if (hasSelectedExistingOwner) {
          await peopleLinkActions.save({
            company: `/people/${savedCompanyId}`,
            people: formData.selectedExistingOwnerIri,
            linkType: OWNER_LINK_TYPE,
          });
        } else {
          const savedContact = await actions.save({
            name: normalizeIdentityValue(formData.firstEmployeeName),
            alias: normalizeIdentityValue(formData.firstEmployeeAlias),
            peopleType: 'F',
            linkType: formData.contactLinkType,
            company: `/people/${savedCompanyId}`,
            'extra-data': {},
          });

          const savedContactId = extractId(
            savedContact?.id || savedContact?.['@id'],
          );
          if (!savedContactId) {
            throw new Error(
              'Nao foi possivel identificar o contato vinculado criado para salvar e-mail e telefone.',
            );
          }

          await persistLinkedContactCommunication({
            emailsActions,
            phonesActions,
            email: formData.firstEmployeeEmail,
            phone: formData.firstEmployeePhone,
            people: `/people/${savedContactId}`,
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
    setFormData(prev => ({ ...prev, foundationDateInput: formatted }));
  };

  return (
    <AnimatedModal visible={visible} onClose={handleClose}>
      <View style={inlineStyle_233_6}>
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
            keyboardDismissMode="on-drag"
          >
            <View style={inlineStyle_286_16}>
              <Text style={inlineStyle_288_14}>{nameLabel}</Text>
              <TextInput
                value={formData.name}
                onChangeText={text =>
                  setFormData(prev => ({ ...prev, name: uppercaseText(text) }))
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
                  setFormData(prev => ({ ...prev, alias: uppercaseText(text) }))
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
                    }))
                  }
                  style={inlineStyle_360_16({ formData })}
                >
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
                  onPress={() => setFormData(prev => ({ ...prev, peopleType: 'J' }))}
                  style={inlineStyle_391_16({ formData })}
                >
                  <Icon
                    name="business"
                    size={20}
                    color={formData.peopleType === 'J' ? '#007bff' : '#6c757d'}
                  />
                  <Text style={inlineStyle_409_18({ formData })}>
                    {global.t?.t('people', 'label', 'legalEntity')}
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
              onPress={() => {
                Keyboard.dismiss();
                handleClose();
              }}
              style={inlineStyle_571_12}
            >
              <Text style={inlineStyle_580_14}>
                {global.t?.t('people', 'button', 'cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                handleSave();
              }}
              disabled={isLoading}
              style={inlineStyle_595_12({ isLoading })}
            >
              <Text style={inlineStyle_603_14}>
                {isLoading
                  ? global.t?.t('people', 'button', 'saving')
                  : global.t?.t('people', 'button', 'save')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </AnimatedModal>
  );
};

export default AddCompanyModal;
