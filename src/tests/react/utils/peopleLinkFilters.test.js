const {
  ALL_PEOPLE_LINK_TYPES_KEY,
  HUMAN_COMPANY_LINK_TYPES,
  HUMAN_COMPANY_LINK_TYPE_OPTIONS,
  isHumanCompanyLinkType,
  buildParentCompanyRequestParams,
  buildPeopleLinkRequestParams,
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
