/**
 * Profile avatar upload/attach helpers and logout navigation.
 */
import { extractFileId } from '@controleonline/ui-default/src/react/components/upload/fileUpload';
import { extractId, toPeopleIri } from '@controleonline/ui-people/src/react/utils/profileFormUtils';
import { persistSessionAvatar } from '@controleonline/ui-people/src/react/utils/profileSession';

export const createProfileAvatarHandlers = ({
  user,
  avatarMediaType,
  avatarPeopleMedia,
  peopleActions,
  loadAvatarMedia,
  showSuccess,
  authActions,
  navigation,
}) => {
  const handleLogout = () => {
    authActions.logOut();
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'SignInPage',
          params: {redirectRoute: 'HomePage'},
        },
      ],
    });
  };

  const handleAvatarChanged = async () => {
    const nextPeopleMedia = await loadAvatarMedia();
    try {
      persistSessionAvatar(nextPeopleMedia?.file ?? null);
    } catch {
      // session sync is best-effort
    }
    showSuccess?.(global.t?.t("people", "success", "Profile photo updated successfully."));
  };

  const attachAvatarFile = async file => {
    const fileId = extractFileId(file);
    const peopleIri = toPeopleIri(user);
    const mediaTypeId = extractId(avatarMediaType?.id || avatarMediaType?.['@id']);

    if (!fileId || !peopleIri || !mediaTypeId) {
      throw new Error(global.t?.t("people", "error", "Unable to update profile photo."));
    }

    return peopleActions.savePeopleMedia({
      id: avatarPeopleMedia?.id || avatarPeopleMedia?.['@id'],
      people: peopleIri,
      mediaType: `/media_types/${mediaTypeId}`,
      file: `/files/${fileId}`,
    });
  };

  const uploadAvatarFile = async ({file}) => {
    const mimeType = String(file?.type || '').trim().toLowerCase();
    const fileName = String(file?.name || '').trim().toLowerCase();
    if (mimeType !== 'image/png' && !fileName.endsWith('.png')) {
      throw new Error(global.t?.t("people", "error", "Please select a PNG image."));
    }

    const mediaTypeId = extractId(avatarMediaType?.id || avatarMediaType?.['@id']);
    if (!mediaTypeId) {
      throw new Error(global.t?.t("people", "error", "Unable to update profile photo."));
    }

    return peopleActions.uploadPeopleMedia({
      people: toPeopleIri(user),
      mediaTypeId,
      file,
    });
  };

  return { handleLogout, handleAvatarChanged, attachAvatarFile, uploadAvatarFile };
};
