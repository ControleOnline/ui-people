const normalizeId = value => {
  if (value == null) return null
  const match = String(value).match(/\d+/)
  return match?.[0] || null
}

// Availability flags come from companies/my; role and tenant scope remain server-owned.
export const isCompanySelectable = company => !!company?.id &&
  ![company.enabled, company.panel_enabled, company.user?.enabled].some(value =>
    value === false || value === 0 || value === '0' || value === 'false');

const pickFirstAccessibleCompany = companies => {
  if (!Array.isArray(companies) || companies.length === 0) {
    return null
  }

  return companies.find(isCompanySelectable) || null
}

const mergeCompanyThemeFromDefault = (company, mainCompany) => {
  if (!company?.id) {
    return company || null
  }

  if (
    company?.theme?.colors ||
    !mainCompany?.id ||
    String(mainCompany.id) !== String(company.id) ||
    !mainCompany?.theme
  ) {
    return company
  }

  return {
    ...company,
    theme: mainCompany.theme,
    logo: company.logo || mainCompany.logo,
    alias: company.alias || mainCompany.alias,
    name: company.name || mainCompany.name,
    configs: company.configs || mainCompany.configs,
  }
}

export const resolveCurrentCompanySelection = ({
  companies = [],
  company = null,
  mainCompany = {},
  session = {},
} = {}) => {
  const accessibleCompanies = Array.isArray(companies) ? companies.filter(isCompanySelectable) : []
  const explicitSelectedId = normalizeId(company?.id)
  const persistedSelectedId = normalizeId(session?.mycompany)
  const desiredSelectedId = explicitSelectedId || persistedSelectedId || null

  let currentCompany = null

  if (desiredSelectedId) {
    const matchedCompany = accessibleCompanies.find(
      item => String(item?.id) === String(desiredSelectedId),
    )

    if (matchedCompany) {
      currentCompany =
        explicitSelectedId &&
        String(explicitSelectedId) === String(matchedCompany.id) &&
        company &&
        typeof company === 'object'
          ? {
              ...matchedCompany,
              ...company,
            }
          : matchedCompany
    }
  }

  if (
    !currentCompany &&
    company &&
    typeof company === 'object' &&
    Array.isArray(companies) && companies.length === 0 &&
    isCompanySelectable(company) &&
    normalizeId(company?.id)
  ) {
    currentCompany = company
  }

  if (!currentCompany) {
    currentCompany = pickFirstAccessibleCompany(accessibleCompanies)
  }

  return mergeCompanyThemeFromDefault(currentCompany, mainCompany)
}

export const persistCurrentCompanyInSession = (session = {}, currentCompany = null) => ({
  ...session,
  mycompany: currentCompany?.id || null,
})
