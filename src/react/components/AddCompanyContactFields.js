import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
  inlineStyle_462_18,
  inlineStyle_466_16,
  inlineStyle_475_20,
  inlineStyle_482_18,
  inlineStyle_495_20,
  inlineStyle_502_18,
  inlineStyle_disabledContactInput,
  inlineStyle_ownerHeaderRow,
  inlineStyle_ownerHeaderColumn,
  inlineStyle_ownerFieldsRow,
  inlineStyle_ownerFieldColumn,
  inlineStyle_ownerPickerWrap,
  inlineStyle_525_18,
  inlineStyle_532_20,
  inlineStyle_540_26,
  inlineStyle_516_14,
} from './AddCompanyModal.styles';

const OWNER_LINK_TYPE = 'owner';

/**
 * Contact / first-employee fields for generic PJ company creation.
 * Hidden in My Companies flow (autoLinkAuthenticatedPerson).
 */
const AddCompanyContactFields = ({
  formData,
  setFormData,
  canSelectExistingOwner,
  existingOwnerOptions,
  isLoadingExistingOwners,
  shouldDisableManualContactFields,
  linkTypeOptions,
}) => (
          <>
            <View style={inlineStyle_462_18}>

              
              {canSelectExistingOwner ? (
                <>
                  <View style={inlineStyle_ownerHeaderRow}>
                    <View style={inlineStyle_ownerHeaderColumn}>
                      <Text
                        style={inlineStyle_466_16}>
                        {global.t?.t('people','title','contactLinked')}
                      </Text>
                    </View>
                    <View style={inlineStyle_ownerHeaderColumn}>
                      <Text
                        style={inlineStyle_466_16}>
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
                          placeholder={global.t?.t('people','placeholder','contactName')}
                          style={[
                            inlineStyle_482_18,
                            shouldDisableManualContactFields ? inlineStyle_disabledContactInput : null,
                          ]}
                          placeholderTextColor="#6c757d"
                          editable={!shouldDisableManualContactFields}
                        />
                      </View>
                    </View>

                    <View style={inlineStyle_ownerFieldColumn}>
                      <View style={inlineStyle_475_20}>
                        <View style={inlineStyle_ownerPickerWrap}>
                          <Picker
                            selectedValue={formData.selectedExistingOwnerIri}
                            enabled={!isLoadingExistingOwners}
                            onValueChange={value =>
                              setFormData(prev => ({
                                ...prev,
                                selectedExistingOwnerIri: value,
                                contactLinkType: value ? OWNER_LINK_TYPE : '',
                              }))
                            }>
                            <Picker.Item
                              label={
                                isLoadingExistingOwners
                                  ? global.t?.t('people', 'label', 'loadingOwners')
                                  : existingOwnerOptions.length > 0
                                    ? global.t?.t('people', 'label', 'selectExistingOwner')
                                    : global.t?.t('people', 'label', 'noOwnerFound')
                              }
                              value=""
                            />
                            {existingOwnerOptions.map(option => (
                              <Picker.Item
                                key={option.value}
                                label={option.label}
                                value={option.value}
                              />
                            ))}
                          </Picker>
                        </View>
                      </View>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <Text
                    style={inlineStyle_466_16}>
                    {global.t?.t('people','title','contactLinked')}
                  </Text>

                  <View style={inlineStyle_475_20}>
                    <TextInput
                      value={formData.firstEmployeeName}
                      onChangeText={text =>
                        setFormData(prev => ({ ...prev, firstEmployeeName: text }))
                      }
                      placeholder={global.t?.t('people','placeholder','contactName')}
                      style={[
                        inlineStyle_482_18,
                        shouldDisableManualContactFields
                          ? inlineStyle_disabledContactInput
                          : null,
                      ]}
                      placeholderTextColor="#6c757d"
                      editable={!shouldDisableManualContactFields}
                    />
                  </View>
                </>
              )}

              <View style={inlineStyle_495_20}>
                <TextInput
                  value={formData.firstEmployeeAlias}
                  onChangeText={text =>
                    setFormData(prev => ({ ...prev, firstEmployeeAlias: text }))
                  }
                  placeholder={global.t?.t('people','placeholder','contactAlias')}
                  style={[
                    inlineStyle_502_18,
                    shouldDisableManualContactFields
                      ? inlineStyle_disabledContactInput
                      : null,
                  ]}
                  placeholderTextColor="#6c757d"
                  editable={!shouldDisableManualContactFields}
                />
              </View>

              <Text
                style={inlineStyle_516_14}>
                {global.t?.t('people', 'label', 'contactRole')}
              </Text>

              {shouldDisableManualContactFields ? (
                <View style={inlineStyle_525_18}>
                  <TouchableOpacity
                    activeOpacity={1}
                    style={inlineStyle_532_20({
                      isSelected: true,
                    })}>
                    <Text style={inlineStyle_540_26({
                      isSelected: true,
                    })}>
                      {linkTypeOptions.find(option => option.value === OWNER_LINK_TYPE)?.label}
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
              )}
            </View>
          
</>
);

export default AddCompanyContactFields;
