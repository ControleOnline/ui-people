import * as types from './mutation_types';

export default {
  [types.SET_COMPANIES](state, companies) {
    state.companies = companies;
    return 'companies';
  },

  [types.SET_CURRENT_COMPANY](state, currentCompany) {
    state.currentCompany = currentCompany;
    return 'currentCompany';
  },

  [types.SET_MAIN_COMPANY](state, mainCompany) {
    state.mainCompany = mainCompany;
    return 'mainCompany';
  },
};
