const {describe, expect, it} = global

const {
  persistCurrentCompanyInSession,
  resolveCurrentCompanySelection,
} = require('@controleonline/ui-people/src/react/utils/currentCompanySelection')

describe('currentCompanySelection', () => {
  it('ignores the authenticated people id when it is not an accessible company', () => {
    const company = resolveCurrentCompanySelection({
      session: {people: 44},
      companies: [
        {id: 7, alias: 'Disabled', panel_enabled: false},
        {id: 9, alias: 'Main Company', panel_enabled: true},
      ],
    })

    expect(company).toMatchObject({id: 9, alias: 'Main Company'})
  })

  it('falls back to the first accessible company when the stored company is stale', () => {
    const company = resolveCurrentCompanySelection({
      session: {mycompany: 88, people: 44},
      companies: [
        {id: 15, alias: 'First Enabled', panel_enabled: true},
        {id: 21, alias: 'Second Enabled', panel_enabled: true},
      ],
    })

    expect(company).toMatchObject({id: 15, alias: 'First Enabled'})
    expect(
      persistCurrentCompanyInSession({mycompany: 88, people: 44}, company),
    ).toMatchObject({
      mycompany: 15,
      people: 44,
    })
  })

  it('keeps a valid stored company selection when it is still accessible', () => {
    const company = resolveCurrentCompanySelection({
      session: {mycompany: 21, people: 44},
      companies: [
        {id: 15, alias: 'First Enabled', panel_enabled: true},
        {id: 21, alias: 'Second Enabled', panel_enabled: true},
      ],
    })

    expect(company).toMatchObject({id: 21, alias: 'Second Enabled'})
  })
})


describe('domain theme enrichment', () => {
  it('only enriches the selected company when it is the domain company', () => {
    const mainCompany = {id: 1, theme: {colors: {primary: 'red'}}, logo: 'domain-logo'};
    expect(resolveCurrentCompanySelection({companies: [{id: 1}], mainCompany}))
      .toMatchObject({id: 1, theme: mainCompany.theme, logo: 'domain-logo'});
    expect(resolveCurrentCompanySelection({companies: [{id: 2}], mainCompany}))
      .toEqual({id: 2});
  });

  it('preserves a selected company theme even when its ID matches the domain', () => {
    const company = {id: 1, theme: {colors: {primary: 'blue'}}};
    expect(resolveCurrentCompanySelection({companies: [company], mainCompany: {
      id: 1, theme: {colors: {primary: 'red'}},
    }})).toEqual(company);
  });
});
