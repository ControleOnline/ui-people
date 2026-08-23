/**
 * Profile identity header: avatar upload, name/alias editing, primary email.
 */
import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import UserAvatar from '@controleonline/ui-common/src/react/components/UserAvatar';
import DefaultUpload from '@controleonline/ui-default/src/react/components/upload/DefaultUpload';
import { getAvatarDisplayName } from '@controleonline/ui-common/src/react/utils/userAvatar';
import {
  formatDisplayUppercase,
  uppercaseText,
} from '@controleonline/ui-common/src/react/utils/entityDisplay';
import {
  extractId,
  toPeopleIri,
  getDisplayName,
  getDisplayAlias,
} from '@controleonline/ui-people/src/react/utils/profileFormUtils';

export default function ProfileHeader({
  styles,
  palette,
  user,
  avatarImageUrl,
  avatarEmail,
  avatarBrandColors,
  avatarPeopleMedia,
  avatarMediaType,
  profileName,
  profileAlias,
  isEditingName,
  isEditingAlias,
  isEditingProfileIdentity,
  setProfileName,
  setProfileAlias,
  toggleIdentityEditing,
  attachAvatarFile,
  uploadAvatarFile,
  peopleActions,
  handleAvatarChanged,
}) {
  return (
        <View style={styles.headerContainer}>
          <View style={styles.avatarContainer}>
            <UserAvatar
              imageUrl={avatarImageUrl}
              email={avatarEmail}
              name={getAvatarDisplayName(user)}
              size={120}
              backgroundColor={
                avatarBrandColors.buttonBackground || avatarBrandColors.primary
              }
              borderColor={avatarBrandColors.buttonText || avatarBrandColors.white}
              borderWidth={3}
              textColor={avatarBrandColors.buttonText || avatarBrandColors.white}
              style={styles.avatar}
            />
            <DefaultUpload
              relationStoreName="people"
              relationField="people"
              relationResource="people"
              entityId={extractId(toPeopleIri(user))}
              companyId={extractId(toPeopleIri(user))}
              context="people_media"
              libraryContexts={['people_media']}
              attachments={avatarPeopleMedia ? [avatarPeopleMedia] : []}
              acceptedTypes="image/png,.png"
              fileType="image"
              fileTypeLabel="imagem"
              title="avatar"
              triggerLabel="Gerenciar avatar"
              managerTitle="Gerenciador de avatar"
              searchPlaceholder="Buscar imagem"
              uploadButtonLabel="Enviar nova"
              emptyAttachmentLabel="Nenhuma imagem vinculada."
              emptyLibraryLabel="Nenhuma imagem encontrada."
              uploadSuccessMessage="Avatar atualizado com sucesso."
              attachSuccessMessage="Avatar vinculado com sucesso."
              removeSuccessMessage="Avatar removido."
              showInlineContent={false}
              uploadResultAlreadyAttached
              onAttachFile={attachAvatarFile}
              onUploadFile={uploadAvatarFile}
              onRemoveAttachment={async relation => {
                await peopleActions.deletePeopleMedia({mediaId: relation?.id || relation?.['@id']});
              }}
              onChanged={handleAvatarChanged}
              renderTrigger={({disabled, openManager, uploading}) => (
                <TouchableOpacity
                  style={styles.editAvatarButton}
                  onPress={openManager}
                  accessibilityLabel="subir avatar"
                  activeOpacity={0.85}
                  disabled={disabled}>
                  {uploading ? (
                    <ActivityIndicator size="small" color={palette.buttonText} />
                  ) : (
                    <Icon name="camera-alt" size={20} color={palette.buttonText} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
          <View style={styles.userNameRow}>
            {isEditingName ? (
              <TextInput
                style={styles.userNameInput}
                value={profileName}
                onChangeText={text => setProfileName(uppercaseText(text))}
                placeholder={global.t?.t("people", "placeholder", "emailLogin")}
                placeholderTextColor={palette.textSecondary}
                maxLength={80}
                returnKeyType="next"
              />
            ) : (
              <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
                {profileName || getDisplayName(user)}
              </Text>
            )}
            <TouchableOpacity
              style={styles.editNameButton}
              onPress={toggleIdentityEditing}
              activeOpacity={0.85}>
              <Icon
                name={isEditingProfileIdentity ? 'check' : 'edit'}
                size={18}
                color={palette.cardIcon}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.userAliasRow}>
            {isEditingAlias ? (
              <TextInput
                style={styles.userAliasInput}
                value={profileAlias}
                onChangeText={text => setProfileAlias(uppercaseText(text))}
                placeholder={global.t?.t("people", "placeholder", "alias")}
                placeholderTextColor={palette.textSecondary}
                maxLength={40}
                returnKeyType="done"
              />
            ) : (
              <Text style={styles.userAlias} numberOfLines={1} ellipsizeMode="tail">
                {formatDisplayUppercase(profileAlias || getDisplayAlias(user)) || '-'}
              </Text>
            )}
          </View>
          <Text style={styles.userEmail} numberOfLines={1} ellipsizeMode="tail">
            {avatarEmail || ''}
          </Text>
        </View>

  );
}
