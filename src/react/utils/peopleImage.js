import { resolveFileImageUrl } from '@controleonline/ui-common/src/react/utils/fileUrl';

const COMPANY_PEOPLE_TYPE = 'J';
const PERSON_PEOPLE_TYPE = 'F';
const COMPANY_MEDIA_TYPES = ['icon', 'logo'];
const PERSON_MEDIA_TYPES = ['avatar', 'photo', 'profile', 'profile-photo'];

const normalizeText = value => String(value || '').trim();
const normalizeType = value => normalizeText(value).toLowerCase();

const normalizeCollection = payload => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload.member)) return payload.member;
  if (Array.isArray(payload['hydra:member'])) return payload['hydra:member'];
  if (Array.isArray(payload.items)) return payload.items;
  return [];
};

export const resolvePeopleType = people =>
  normalizeText(
    people?.peopleType ||
      people?.type ||
      people?.personType ||
      people?.people_type,
  ).toUpperCase();

export const isCompanyPeople = people =>
  resolvePeopleType(people).startsWith(COMPANY_PEOPLE_TYPE);

export const isNaturalPeople = people =>
  resolvePeopleType(people).startsWith(PERSON_PEOPLE_TYPE);

export const resolvePeopleDisplayName = people =>
  normalizeText(people?.alias || people?.name || people?.realname || people?.username);

export const resolvePeopleAvatarEmail = people => {
  const email = people?.email || people?.emails;

  if (typeof email === 'string') {
    return normalizeText(email);
  }

  if (Array.isArray(email)) {
    const item = email.find(entry => {
      const value =
        entry && typeof entry === 'object'
          ? entry.email || entry.value
          : entry;

      return normalizeText(value);
    });

    return normalizeText(
      item && typeof item === 'object'
        ? item.email || item.value
        : item,
    );
  }

  if (email && typeof email === 'object') {
    return normalizeText(email.email || email.value);
  }

  return '';
};

const resolveMediaType = media =>
  normalizeType(
    media?.mediaType?.type ||
      media?.mediaType?.name ||
      media?.media_type?.type ||
      media?.type ||
      media?.name,
  );

const resolveMediaFile = media =>
  media?.file || media?.image || media?.avatar || media?.icon || media?.logo || media;

const findMediaByTypes = (people, preferredTypes) => {
  const mediaItems = [
    ...normalizeCollection(people?.media),
    ...normalizeCollection(people?.medias),
    ...normalizeCollection(people?.peopleMedia),
    ...normalizeCollection(people?.peopleMedias),
  ];
  const normalizedTypes = preferredTypes.map(normalizeType);

  for (const media of mediaItems) {
    if (normalizedTypes.includes(resolveMediaType(media))) {
      return resolveMediaFile(media);
    }
  }

  return null;
};

const resolveDirectCandidate = (people, preferredFields) => {
  for (const field of preferredFields) {
    const candidate = people?.[field];
    if (candidate) {
      return resolveMediaFile(candidate);
    }
  }

  return null;
};

export const resolvePeopleImageCandidate = people => {
  if (!people || typeof people !== 'object') {
    return null;
  }

  if (isCompanyPeople(people)) {
    return (
      findMediaByTypes(people, COMPANY_MEDIA_TYPES) ||
      resolveDirectCandidate(people, ['icon', 'logo', 'image', 'avatar', 'photo', 'picture'])
    );
  }

  return (
    findMediaByTypes(people, PERSON_MEDIA_TYPES) ||
    resolveDirectCandidate(people, ['avatar', 'photo', 'image', 'profilePicture', 'picture', 'icon'])
  );
};

export const resolvePeopleImageUrl = (
  people,
  resolveImageUrl = resolveFileImageUrl,
  options = {},
) => {
  const candidate = resolvePeopleImageCandidate(people);

  return typeof resolveImageUrl === 'function'
    ? normalizeText(resolveImageUrl(candidate, options))
    : '';
};

export const resolvePeopleAvatarMeta = (people, options = {}) => ({
  email: resolvePeopleAvatarEmail(people),
  imageUrl: resolvePeopleImageUrl(people, options.resolveImageUrl, options.fileOptions),
  isCompany: isCompanyPeople(people),
  name: resolvePeopleDisplayName(people),
});

export default {
  isCompanyPeople,
  isNaturalPeople,
  resolvePeopleAvatarEmail,
  resolvePeopleAvatarMeta,
  resolvePeopleDisplayName,
  resolvePeopleImageCandidate,
  resolvePeopleImageUrl,
  resolvePeopleType,
};
