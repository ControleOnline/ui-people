import { LocalStorage } from 'quasar';
import * as types from './mutation_types';

export default {

  [types.SET_COMPANY](state, company) {
    Object.assign(state, { company });
  },

  [types.SET_COMPANIES](state, companies) {
    // console.log('Setting companies:', companies);
    Object.assign(state, { companies });
  },

  [types.SET_CURRENT_COMPANY](state, company) {
    try {
      let session = LocalStorage.has('session') ? LocalStorage.getItem('session') : {};

      if (session.company) {
        session.company = company.id;
      }

      LocalStorage.set('session', session);

      Object.assign(state, { currentCompany: company });

    } catch (e) {

    }
  },

  [types.SET_DEFAULT_COMPANY](state, company) {
    try {
      let session = LocalStorage.has('session') ? LocalStorage.getItem('session') : {};

      session.default = company.id;

      LocalStorage.set('session', session);

      Object.assign(state, { defaultCompany: company });

    } catch (e) {

    }
  },
};
