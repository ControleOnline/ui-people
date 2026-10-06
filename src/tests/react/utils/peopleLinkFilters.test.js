const {
  ALL_PEOPLE_LINK_TYPES_KEY,
  HUMAN_COMPANY_LINK_TYPES,
  HUMAN_COMPANY_LINK_TYPE_OPTIONS,
  isHumanCompanyLinkType,
  buildParentCompanyRequestParams,
  buildPeopleLinkRequestParams,
  buildCompanyLinksRequestParams,
} = require('@controleonline/ui-people/src/react/utils/peopleLinkFilters')

const {describe, expect, it} = global

describe('peopleLinkFilters', () => {
  it('filters regular people lists by children linked to the current company', () => {
    expect(
      buildPeopleLinkRequestParams({
        currentCompany: {id: 3},
        selectedLinkType: 'client',
      }),
    ).toEqual({
      'link.company': '/people/3',
      'link.linkType': 'client',
    })
  })

  it('filters my companies by parent companies linked to the current person', () => {
    expect(
      buildParentCompanyRequestParams({
        selectedLinkType: ALL_PEOPLE_LINK_TYPES_KEY,
        user: {people: '/people/7'},
      }),
    ).toEqual({
      'company.people': '/people/7',
      'company.linkType': HUMAN_COMPANY_LINK_TYPES,
    })
  })

  it('exposes a reusable catalog of human company link types for UI options', () => {
    expect(HUMAN_COMPANY_LINK_TYPES).toEqual([
      'employee',
      'owner',
      'director',
      'manager',
      'salesman',
      'after-sales',
      'courier',
    ])
    expect(new Set(HUMAN_COMPANY_LINK_TYPES).size).toBe(
      HUMAN_COMPANY_LINK_TYPES.length,
    )
    expect(HUMAN_COMPANY_LINK_TYPE_OPTIONS.map(option => option.value)).toEqual(
      HUMAN_COMPANY_LINK_TYPES,
    )
    expect(isHumanCompanyLinkType('salesman')).toBe(true)
    expect(isHumanCompanyLinkType('after-sales')).toBe(true)
    expect(isHumanCompanyLinkType('unknown')).toBe(false)
  })

  it('expands all employee contexts for the initial employees collection', () => {
    expect(buildPeopleLinkRequestParams({
      currentCompany: {id: 3},
      availableTypes: ['all', 'employee', 'owner', 'courier'],
      selectedLinkType: 'all',
    })).toEqual({
      'link.company': '/people/3',
      'link.linkType': ['employee', 'owner', 'courier'],
    })
  })

  it('lists collaborators as PF linked to the current company for any link type', () => {
    expect(buildPeopleLinkRequestParams({
      currentCompany: {id: 3},
      availableTypes: ['employment'],
      selectedLinkType: 'employment',
      peopleType: 'f',
      anyLinkType: true,
    })).toEqual({
      'link.company': '/people/3',
      peopleType: 'F',
    })
  })

  it('drops the link type for "all" but narrows when a concrete type is selected', () => {
    expect(buildPeopleLinkRequestParams({
      currentCompany: {id: 3},
      availableTypes: ['all', 'employee', 'owner', 'courier'],
      selectedLinkType: 'all',
      peopleType: 'F',
      anyLinkType: true,
    })).toEqual({'link.company': '/people/3', peopleType: 'F'})

    expect(buildPeopleLinkRequestParams({
      currentCompany: {id: 3},
      availableTypes: ['all', 'employee', 'owner', 'courier'],
      selectedLinkType: 'owner',
      peopleType: 'F',
      anyLinkType: true,
    })).toEqual({
      'link.company': '/people/3',
      peopleType: 'F',
      'link.linkType': 'owner',
    })
  })

  it('lists the people_links of the current company for human link types', () => {
    expect(buildCompanyLinksRequestParams({
      currentCompany: {id: 51},
      availableTypes: ['all', 'employee', 'owner', 'courier'],
      selectedLinkType: 'all',
    })).toEqual({
      company: '51',
      linkType: HUMAN_COMPANY_LINK_TYPES,
      enable: 1,
    })
    expect(buildCompanyLinksRequestParams({
      currentCompany: {id: 51},
      availableTypes: ['all', 'employee', 'owner'],
      selectedLinkType: 'owner',
    }).linkType).toEqual(['owner'])
    expect(buildCompanyLinksRequestParams({}).company).toBe('0')
  })

  it('keeps a selected human link type when filtering my companies', () => {
    expect(
      buildParentCompanyRequestParams({
        availableTypes: [ALL_PEOPLE_LINK_TYPES_KEY, 'owner', 'employee'],
        selectedLinkType: 'owner',
        user: {people: 7},
      }),
    ).toEqual({
      'company.people': '/people/7',
      'company.linkType': 'owner',
    })
  })
})
