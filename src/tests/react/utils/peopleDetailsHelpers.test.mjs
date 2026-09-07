import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPeopleDetailTabDefs,
  resolvePeopleDetailTabIndex,
} from '../../../react/utils/peopleDetailsHelpers.js';

const translator = { t: (_namespace, _group, key) => key };

test('central people detail contract excludes Categories for every person context', () => {
  const tabs = buildPeopleDetailTabDefs({
    isPessoaJuridica: false,
    isProviderContext: false,
    t: translator,
  });

  assert.deepEqual(tabs.map(tab => tab.key), [
    'general',
    'media',
    'users',
    'contracts',
  ]);
  assert.equal(
    resolvePeopleDetailTabIndex({
      requestedInitialTab: 'categories',
      nextClient: { peopleType: 'F' },
      detailContext: 'employee',
    }),
    0,
  );
});

test('central people detail contract preserves legal-person extensions', () => {
  const tabs = buildPeopleDetailTabDefs({
    isPessoaJuridica: true,
    isProviderContext: false,
    t: translator,
  });

  assert.deepEqual(tabs.map(tab => tab.key), [
    'general',
    'fiscal',
    'media',
    'sellers',
    'franchise',
    'contacts',
    'contracts',
  ]);
});
