const normalizeId = value => {
  if (value == null) return null
  const match = String(value).match(/\d+/)
  return match?.[0] || null
}

const pickFirstAccessibleCompany = companies => {
  if (!Array.isArray(companies) || companies.length === 0) {
    return null
  }

  return companies.find(item => item?.panel_enabled !== false) || companies[0]
}

const mergeCompanyThemeFromDefault = (company, defaultCompany) => {
  if (!company?.id) {
    return company || null
  }

  if (
    company?.theme?.colors ||
    !defaultCompany?.id ||
    String(defaultCompany.id) !== String(company.id) ||
    !defaultCompany?.theme
  ) {
    return company
  }

  return {
    ...company,
    theme: defaultCompany.theme,
    logo: company.logo || defaultCompany.logo,
    alias: company.alias || defaultCompany.alias,
    name: company.name || defaultCompany.name,
    configs: company.configs || defaultCompany.configs,
  }
}

export const resolveCurrentCompanySelection = ({
  companies = [],
  company = null,
  defaultCompany = {},
  session = {},
} = {}) => {
  const accessibleCompanies = Array.isArray(companies) ? companies : []
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
    accessibleCompanies.length === 0 &&
    normalizeId(company?.id)
  ) {
    currentCompany = company
  }

  if (!currentCompany) {
    currentCompany = pickFirstAccessibleCompany(accessibleCompanies)
  }

  return mergeCompanyThemeFromDefault(currentCompany, defaultCompany)
}

export const persistCurrentCompanyInSession = (session = {}, currentCompany = null) => ({
  ...session,
  mycompany: currentCompany?.id || null,
})
