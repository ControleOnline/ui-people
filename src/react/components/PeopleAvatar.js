import React, { useMemo } from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import UserAvatar from '@controleonline/ui-common/src/react/components/UserAvatar';
import {
  resolvePeopleAvatarMeta,
} from '@controleonline/ui-people/src/react/utils/peopleImage';

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
    () => resolvePeopleAvatarMeta(people, {usePeopleImage}),
    [people, usePeopleImage],
  );
  const effectiveImageUrl = imageUrl || meta.imageUrl;
  const fallbackIcon = meta.isCompany ? 'building' : 'user';

  if (!effectiveImageUrl && meta.isCompany) {
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
        <Icon name={fallbackIcon} size={Math.max(Math.round(size * 0.42), 16)} color={iconColor || textColor} />
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
