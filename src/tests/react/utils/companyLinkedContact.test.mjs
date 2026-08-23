import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildLinkedContactCommunicationPayloads,
  formatPhoneValue,
  persistLinkedContactCommunication,
  splitPhoneValue,
  isValidEmail,
  validateLinkedContactCommunication,
} from '@controleonline/ui-people/src/react/utils/companyLinkedContact.js';
import {
  normalizeIdentityValue,
} from '@controleonline/ui-people/src/react/utils/addCompanyFormHelpers.js';

test('formatPhoneValue applies the expected mask for linked contact phones', () => {
  assert.equal(formatPhoneValue('11987654321'), '(11) 98765-4321');
  assert.equal(formatPhoneValue('1132654321'), '(11) 3265-4321');
});

test('splitPhoneValue separates ddd and phone only when enough digits exist', () => {
  assert.deepEqual(splitPhoneValue('(11) 98765-4321'), {
    ddd: '11',
    phone: '987654321',
  });
  assert.deepEqual(splitPhoneValue('12345'), { ddd: '', phone: '' });
});

test('isValidEmail accepts normalized addresses', () => {
  assert.equal(isValidEmail('  Contato@Empresa.com  '), true);
  assert.equal(isValidEmail('invalid'), false);
});

test('validateLinkedContactCommunication requires email and 10+ digit phone', () => {
  assert.deepEqual(
    validateLinkedContactCommunication({
      email: 'contato@empresa.com',
      phone: '(11) 98765-4321',
    }),
    { ok: true },
  );
  assert.equal(
    validateLinkedContactCommunication({ email: 'x', phone: '(11) 98765-4321' })
      .errorKey,
    'invalidEmail',
  );
  assert.equal(
    validateLinkedContactCommunication({
      email: 'contato@empresa.com',
      phone: '119',
    }).errorKey,
    'invalidPhone',
  );
});

test('buildLinkedContactCommunicationPayloads normalizes email and phone payloads', () => {
  assert.deepEqual(
    buildLinkedContactCommunicationPayloads({
      email: '  Contato@Empresa.com  ',
      phone: '(11) 98765-4321',
      people: '/people/42',
    }),
    {
      emailPayload: {
        email: 'contato@empresa.com',
        people: '/people/42',
      },
      phonePayload: {
        ddi: 55,
        ddd: 11,
        phone: 987654321,
        people: '/people/42',
      },
    },
  );
});

test('persistLinkedContactCommunication saves both resources with normalized payloads', async () => {
  const calls = [];
  const emailsActions = {
    save: async payload => {
      calls.push({ type: 'email', payload });
      return payload;
    },
  };
  const phonesActions = {
    save: async payload => {
      calls.push({ type: 'phone', payload });
      return payload;
    },
  };

  const result = await persistLinkedContactCommunication({
    emailsActions,
    phonesActions,
    email: 'Contato@Empresa.com',
    phone: '(11) 98765-4321',
    people: '/people/99',
  });

  assert.deepEqual(result, {
    emailPayload: {
      email: 'contato@empresa.com',
      people: '/people/99',
    },
    phonePayload: {
      ddi: 55,
      ddd: 11,
      phone: 987654321,
      people: '/people/99',
    },
  });
  assert.deepEqual(calls, [
    {
      type: 'email',
      payload: {
        email: 'contato@empresa.com',
        people: '/people/99',
      },
    },
    {
      type: 'phone',
      payload: {
        ddi: 55,
        ddd: 11,
        phone: 987654321,
        people: '/people/99',
      },
    },
  ]);
});

test('persistLinkedContactCommunication fails fast when channel stores are unavailable', async () => {
  await assert.rejects(
    () =>
      persistLinkedContactCommunication({
        emailsActions: {},
        phonesActions: {},
        email: 'contato@empresa.com',
        phone: '(11) 98765-4321',
        people: '/people/99',
      }),
    /servicos de e-mail e telefone nao estao disponiveis/i,
  );
});


test('normalizeIdentityValue preserves mixed case and only trims whitespace', () => {
  assert.equal(normalizeIdentityValue('  Cláudia Silva  '), 'Cláudia Silva');
  assert.equal(normalizeIdentityValue('ACME Ltda'), 'ACME Ltda');
  assert.equal(normalizeIdentityValue('kibelicia   comida  árabe'), 'kibelicia comida árabe');
  assert.equal(normalizeIdentityValue(''), '');
});
