const extractNumericId = value => {
  if (value === null || value === undefined) {
    return '';
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return '';
  }

  if (/^\d+$/.test(normalized)) {
    return normalized;
  }

  const match = normalized.match(/\/(\d+)(?:\/)?$/);
  return match ? match[1] : '';
};

const readStoredSession = () => {
  if (typeof localStorage === 'undefined' || !localStorage?.getItem) {
    return {};
  }

  try {
    const rawSession = localStorage.getItem('session');
    return rawSession ? JSON.parse(rawSession) : {};
  } catch {
    return {};
  }
};

export const resolveLoggedUserId = currentUser => {
  const session = readStoredSession();

  return (
    extractNumericId(currentUser?.user_id) ||
    extractNumericId(currentUser?.userId) ||
    extractNumericId(currentUser?.user?.id) ||
    extractNumericId(currentUser?.user?.['@id']) ||
    extractNumericId(currentUser?.idUser) ||
    extractNumericId(session?.user_id) ||
    extractNumericId(session?.userId) ||
    extractNumericId(session?.user?.id) ||
    extractNumericId(session?.user?.['@id']) ||
    extractNumericId(session?.['@id']) ||
    ''
  );
};

export default resolveLoggedUserId;
