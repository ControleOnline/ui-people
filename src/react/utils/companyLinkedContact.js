export const normalizeEmail = value => String(value || '').trim().toLowerCase();

export const isValidEmail = value =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));

export const extractPhoneDigits = value =>
  String(value || '')
    .replace(/\D/g, '')
    .slice(0, 11);

export const formatPhoneValue = value => {
  const digits = extractPhoneDigits(value);
  if (!digits) {
    return '';
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  const ddd = digits.slice(0, 2);
  const phoneNumber = digits.slice(2);

  if (phoneNumber.length <= 4) {
    return `(${ddd}) ${phoneNumber}`;
  }

  if (phoneNumber.length <= 8) {
    return `(${ddd}) ${phoneNumber.slice(0, phoneNumber.length - 4)}-${phoneNumber.slice(-4)}`;
  }

  return `(${ddd}) ${phoneNumber.slice(0, 5)}-${phoneNumber.slice(5, 9)}`;
};

export const splitPhoneValue = value => {
  const digits = extractPhoneDigits(value);
  if (digits.length < 10) {
    return { ddd: '', phone: '' };
  }

  return {
    ddd: digits.slice(0, 2),
    phone: digits.slice(2),
  };
};

export const buildLinkedContactCommunicationPayloads = ({
  email,
  phone,
  people,
}) => {
  const normalizedEmail = normalizeEmail(email);
  const { ddd, phone: phoneNumber } = splitPhoneValue(phone);

  return {
    emailPayload: {
      email: normalizedEmail,
      people,
    },
    phonePayload: {
      ddi: 55,
      ddd: Number.parseInt(ddd, 10),
      phone: Number.parseInt(phoneNumber, 10),
      people,
    },
  };
};

export const persistLinkedContactCommunication = async ({
  emailsActions,
  phonesActions,
  email,
  phone,
  people,
}) => {
  if (!emailsActions?.save || !phonesActions?.save) {
    throw new Error(
      'Os servicos de e-mail e telefone nao estao disponiveis para concluir o contato vinculado.',
    );
  }

  const { emailPayload, phonePayload } = buildLinkedContactCommunicationPayloads({
    email,
    phone,
    people,
  });

  await emailsActions.save(emailPayload);
  await phonesActions.save(phonePayload);

  return { emailPayload, phonePayload };
};

export const validateLinkedContactCommunication = ({ email, phone }) => {
  if (!isValidEmail(email)) {
    return { ok: false, errorKey: 'invalidEmail' };
  }

  if (extractPhoneDigits(phone).length < 10) {
    return { ok: false, errorKey: 'invalidPhone' };
  }

  return { ok: true };
};
