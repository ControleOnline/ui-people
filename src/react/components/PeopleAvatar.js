import React, { useMemo } from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import UserAvatar from '@controleonline/ui-common/src/react/components/UserAvatar';
import { resolveFileImageUrl } from '@controleonline/ui-common/src/react/utils/fileUrl';
import {
  isCompanyPeople,
  resolvePeopleAvatarMeta,
  resolvePeopleImageUrl,
} from '@controleonline/ui-people/src/react/utils/peopleImage';

const normalizeText = value => String(value || '').trim();

/**
 * Company icon/logo must resolve even when usePeopleImage is false
 * (My Companies list historically left the flag off → always showed building).
 * FileService shape {id,url} needs resolveFileImageUrl for /files/.../download.
 */
const resolveAvatarImageUrl = (people, { imageUrl = '', usePeopleImage = false } = {}) => {
  const direct = normalizeText(imageUrl);
  if (direct) {
    return direct;
  }
  if (!people || typeof people !== 'object') {
    return '';
  }

  const isCompany = isCompanyPeople(people);
  // Always attempt company icon/logo; person media only when opted in.
  if (!isCompany && !usePeopleImage) {
    return '';
  }

  return normalizeText(
    resolvePeopleImageUrl(
      isCompany ? { ...people, peopleType: people.peopleType || 'J' } : people,
      resolveFileImageUrl,
      {
        usePeopleImage: true,
        fileOptions: { company: isCompany ? people : undefined },
      },
    ),
  );
};

const PeopleAvatar = ({
  backgroundColor,
  borderColor,
  borderWidth = 1,
  imageUrl = '',
  iconColor,
  people,
  size = 40,
  style,
  textColor,
  useGravatar = false,
  usePeopleImage = false,
}) => {
  const meta = useMemo(
    () =>
      resolvePeopleAvatarMeta(people, {
        usePeopleImage: true,
        resolveImageUrl: resolveFileImageUrl,
        fileOptions: { company: isCompanyPeople(people) ? people : undefined },
      }),
    [people],
  );
  const effectiveImageUrl = useMemo(
    () => resolveAvatarImageUrl(people, { imageUrl, usePeopleImage }),
    [people, imageUrl, usePeopleImage],
  );
  const isCompany = meta.isCompany;
  const fallbackIcon = isCompany ? 'building' : 'user';

  if (!effectiveImageUrl && isCompany) {
    return (
      <View
        style={[
          style,
          {
            alignItems: 'center',
            backgroundColor,
            borderColor,
            borderRadius: size / 2,
            borderWidth,
            height: size,
            justifyContent: 'center',
            width: size,
          },
        ]}
      >
        <Icon
          name={fallbackIcon}
          size={Math.max(Math.round(size * 0.42), 16)}
          color={iconColor || textColor}
        />
      </View>
    );
  }

  return (
    <UserAvatar
      imageUrl={effectiveImageUrl}
      email={meta.email}
      name={meta.name}
      size={size}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      borderWidth={borderWidth}
      textColor={textColor}
      useGravatar={useGravatar}
      style={style}
    />
  );
};

export default PeopleAvatar;
