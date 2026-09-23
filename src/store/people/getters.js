export const currentCompany = state => state.currentCompany;
export const defaultCompany = state => state.defaultCompany;
// Preserve the legacy getter used by existing app-community screens.
export const mainCompany = state => state.defaultCompany;
export const companies      = state => state.companies;
