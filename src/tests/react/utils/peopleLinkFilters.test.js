const {
  ALL_PEOPLE_LINK_TYPES_KEY,
  HUMAN_COMPANY_LINK_TYPES,
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
