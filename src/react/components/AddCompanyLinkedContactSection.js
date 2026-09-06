// Technical wiki: https://github.com/ControleOnline/ui-people/wiki/Cadastro-de-Pessoas-Contatos-Usuarios-e-Vendedores
import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { formatPhoneValue } from '@controleonline/ui-people/src/react/utils/companyLinkedContact';
import {
  OWNER_LINK_TYPE,
} from '@controleonline/ui-people/src/react/utils/addCompanyFormHelpers';
import {
  inlineStyle_462_18,
  inlineStyle_ownerHeaderRow,
  inlineStyle_ownerHeaderColumn,
  inlineStyle_466_16,
  inlineStyle_ownerFieldsRow,
  inlineStyle_ownerFieldColumn,
  inlineStyle_475_20,
  inlineStyle_482_18,
  inlineStyle_disabledContactInput,
  inlineStyle_516_14,
  inlineStyle_ownerPickerWrap,
  inlineStyle_525_18,
  inlineStyle_532_20,
  inlineStyle_540_26,
} from './AddCompanyModal.styles';

/**
 * Linked contact (PF) fields shown when creating a pessoa jurídica.
 * Supports either selecting an existing owner or entering a new contact
 * with name, alias, email and phone.
 */
const AddCompanyLinkedContactSection = ({
  formData,
  setFormData,
  canSelectExistingOwner,
  hasSelectedExistingOwner,
  shouldDisableManualContactFields,
  existingOwners = [],
  linkTypeOptions = [],
}) => {
  const isOwnerLocked = hasSelectedExistingOwner;

  return (
    <View style={inlineStyle_462_18}>
      {canSelectExistingOwner ? (
        <>
          <View style={inlineStyle_ownerHeaderRow}>
            <View style={inlineStyle_ownerHeaderColumn}>
              <Text style={inlineStyle_466_16}>
                {global.t?.t('people', 'title', 'contactLinked')}
              </Text>
            </View>
            <View style={inlineStyle_ownerHeaderColumn}>
              <Text style={inlineStyle_466_16}>
                {global.t?.t('people', 'label', 'existingOwner')}
              </Text>
            </View>
          </View>

          <View style={inlineStyle_ownerFieldsRow}>
            <View style={inlineStyle_ownerFieldColumn}>
              <View style={inlineStyle_475_20}>
                <TextInput
                  value={formData.firstEmployeeName}
                  onChangeText={text =>
                    setFormData(prev => ({ ...prev, firstEmployeeName: text }))
                  }
                  placeholder={global.t?.t('people', 'placeholder', 'contactName')}
                  style={
                    shouldDisableManualContactFields
                      ? inlineStyle_disabledContactInput
                      : inlineStyle_482_18
                  }
                  editable={!shouldDisableManualContactFields}
                  placeholderTextColor="#6c757d"
                />
              </View>
              <View style={inlineStyle_475_20}>
                <TextInput
                  value={formData.firstEmployeeAlias}
                  onChangeText={text =>
                    setFormData(prev => ({ ...prev, firstEmployeeAlias: text }))
                  }
                  placeholder={global.t?.t('people', 'placeholder', 'contactAlias')}
                  style={
                    shouldDisableManualContactFields
                      ? inlineStyle_disabledContactInput
                      : inlineStyle_482_18
                  }
                  editable={!shouldDisableManualContactFields}
                  placeholderTextColor="#6c757d"
                />
              </View>
              <View style={inlineStyle_475_20}>
                <TextInput
                  value={formData.firstEmployeeEmail}
                  onChangeText={text =>
                    setFormData(prev => ({ ...prev, firstEmployeeEmail: text }))
                  }
                  placeholder={
                    global.t?.t('people', 'placeholder', 'email') || 'E-mail'
                  }
                  style={
                    shouldDisableManualContactFields
                      ? inlineStyle_disabledContactInput
                      : inlineStyle_482_18
                  }
                  editable={!shouldDisableManualContactFields}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#6c757d"
                />
              </View>
              <View style={inlineStyle_475_20}>
                <TextInput
                  value={formData.firstEmployeePhone}
                  onChangeText={text =>
                    setFormData(prev => ({
                      ...prev,
                      firstEmployeePhone: formatPhoneValue(text),
                    }))
                  }
                  placeholder={
                    global.t?.t('people', 'placeholder', 'phone') || 'Telefone'
                  }
                  style={
                    shouldDisableManualContactFields
                      ? inlineStyle_disabledContactInput
                      : inlineStyle_482_18
                  }
                  editable={!shouldDisableManualContactFields}
                  keyboardType="phone-pad"
                  placeholderTextColor="#6c757d"
                />
              </View>
            </View>

            <View style={inlineStyle_ownerFieldColumn}>
              <View style={inlineStyle_ownerPickerWrap}>
                <Picker
                  selectedValue={formData.selectedExistingOwnerIri || ''}
                  onValueChange={value => {
                    const selected = String(value || '');
                    setFormData(prev => ({
                      ...prev,
                      selectedExistingOwnerIri: selected,
                      contactLinkType: selected ? OWNER_LINK_TYPE : prev.contactLinkType,
                      ...(selected
                        ? {
                            firstEmployeeName: '',
                            firstEmployeeAlias: '',
                            firstEmployeeEmail: '',
                            firstEmployeePhone: '',
                          }
                        : {}),
                    }));
                  }}
                  style={inlineStyle_516_14}
                >
                  <Picker.Item
                    label={
                      global.t?.t('people', 'placeholder', 'selectOwner') ||
                      'Selecionar existente'
                    }
                    value=""
                  />
                  {existingOwners.map(owner => (
                    <Picker.Item
                      key={owner.iri}
                      label={owner.label}
                      value={owner.iri}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {isOwnerLocked ? (
            <View style={inlineStyle_525_18}>
              <TouchableOpacity
                activeOpacity={1}
                style={inlineStyle_532_20({ isSelected: true })}
              >
                <Text style={inlineStyle_540_26({ isSelected: true })}>
                  {
                    linkTypeOptions.find(option => option.value === OWNER_LINK_TYPE)
                      ?.label
                  }
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={inlineStyle_525_18}>
              {linkTypeOptions.map(option => {
                const isSelected = formData.contactLinkType === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() =>
                      setFormData(prev => ({
                        ...prev,
                        contactLinkType: option.value,
                      }))
                    }
                    style={inlineStyle_532_20({ isSelected })}
                  >
                    <Text style={inlineStyle_540_26({ isSelected })}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </>
      ) : (
        <>
          <Text style={inlineStyle_466_16}>
            {global.t?.t('people', 'title', 'contactLinked')}
          </Text>
          <View style={inlineStyle_475_20}>
            <TextInput
              value={formData.firstEmployeeName}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, firstEmployeeName: text }))
              }
              placeholder={global.t?.t('people', 'placeholder', 'contactName')}
              style={inlineStyle_482_18}
              placeholderTextColor="#6c757d"
            />
          </View>
          <View style={inlineStyle_475_20}>
            <TextInput
              value={formData.firstEmployeeAlias}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, firstEmployeeAlias: text }))
              }
              placeholder={global.t?.t('people', 'placeholder', 'contactAlias')}
              style={inlineStyle_482_18}
              placeholderTextColor="#6c757d"
            />
          </View>
          <View style={inlineStyle_475_20}>
            <TextInput
              value={formData.firstEmployeeEmail}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, firstEmployeeEmail: text }))
              }
              placeholder={
                global.t?.t('people', 'placeholder', 'email') || 'E-mail'
              }
              style={inlineStyle_482_18}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#6c757d"
            />
          </View>
          <View style={inlineStyle_475_20}>
            <TextInput
              value={formData.firstEmployeePhone}
              onChangeText={text =>
                setFormData(prev => ({
                  ...prev,
                  firstEmployeePhone: formatPhoneValue(text),
                }))
              }
              placeholder={
                global.t?.t('people', 'placeholder', 'phone') || 'Telefone'
              }
              style={inlineStyle_482_18}
              keyboardType="phone-pad"
              placeholderTextColor="#6c757d"
            />
          </View>
          <Text style={inlineStyle_466_16}>
            {global.t?.t('people', 'label', 'contactRole')}
          </Text>
          <View style={inlineStyle_525_18}>
            {linkTypeOptions.map(option => {
              const isSelected = formData.contactLinkType === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() =>
                    setFormData(prev => ({
                      ...prev,
                      contactLinkType: option.value,
                    }))
                  }
                  style={inlineStyle_532_20({ isSelected })}
                >
                  <Text style={inlineStyle_540_26({ isSelected })}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
};

export default AddCompanyLinkedContactSection;
