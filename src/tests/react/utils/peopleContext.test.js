const {
  buildPeopleContextConfig,
  resolvePeopleContextLabel,
  resolvePeopleContextModalTitle,
  resolvePeopleContextSearchPlaceholder,
} = require('@controleonline/ui-people/src/react/utils/peopleContext')

const {afterEach, beforeEach, describe, expect, it} = global

describe('peopleContext', () => {
  const originalTranslator = global.t

  beforeEach(() => {
    global.t = {
      t: (scope, group, key) => `${scope}.${group}.${key}`,
    }
  })

  afterEach(() => {
    global.t = originalTranslator
  })

  it('supports multiple types and keeps the selected active context', () => {
    const config = buildPeopleContextConfig({
      context: 'prospect',
      contextOptions: ['client', 'prospect'],
      defaultContext: 'client',
      selectedContext: 'prospect',
    })

    expect(config.availableTypes).toEqual(['client', 'prospect'])
    expect(config.defaultType).toBe('prospect')
    expect(config.hasTypeFilter).toBe(true)
  })

  it('falls back to the first available type when the default is not valid', () => {
    const config = buildPeopleContextConfig({
      context: ['employee', 'owner'],
      defaultContext: 'manager',
    })

    expect(config.defaultType).toBe('employee')
    expect(config.options).toEqual([
      {key: 'employee', label: 'people.label.employee'},
      {key: 'owner', label: 'people.label.owner'},
    ])
  })

  it('resolves labels and search placeholders for known types', () => {
    expect(resolvePeopleContextLabel('client')).toBe('people.title.clients')
    expect(resolvePeopleContextLabel('owner')).toBe('people.label.owner')
    expect(resolvePeopleContextSearchPlaceholder('prospect')).toBe(
      'people.searchPlaceholder.searchProspect',
    )
  })

  it('prefers explicit modal titles for the current context type', () => {
    expect(
      resolvePeopleContextModalTitle('client', {
        modalTitleByType: {
          client: 'Cadastro de Cliente',
          prospect: 'Cadastro de Prospect',
        },
      }),
    ).toBe('Cadastro de Cliente')

    expect(
      buildPeopleContextConfig({
        context: ['client', 'prospect'],
        selectedContext: 'prospect',
        modalTitleByType: {
          client: 'Cadastro de Cliente',
          prospect: 'Cadastro de Prospect',
        },
      }).modalTitle,
    ).toBe('Cadastro de Prospect')
  })
})
