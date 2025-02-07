import * as types from "./mutation_types";

export default {
  [types.SET_COMPANIES](state, payload) {
    if (!payload?.companies) Object.assign(state, { companies: payload });
    return { ...state, companies: payload?.companies || payload };
  },

  [types.SET_CURRENT_COMPANY](state, payload) {
    if (!payload?.currentCompany)
      Object.assign(state, { currentCompany: payload });
    return { ...state, currentCompany: payload?.currentCompany || payload };
  },

  [types.SET_DEFAULT_COMPANY](state, payload) {
    if (!payload?.defaultCompany)
      Object.assign(state, { defaultCompany: payload });
    return { ...state, defaultCompany: payload?.defaultCompany || payload };
  },
};
