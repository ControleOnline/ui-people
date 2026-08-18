import * as actions from '@controleonline/ui-default/src/store/default/actions';
import * as getters from '@controleonline/ui-default/src/store/default/getters';
import mutations from '@controleonline/ui-default/src/store/default/mutations';

/**
 * Store for people ↔ category associations with timeline (start_date / end_date).
 * Backend: /people_categories (api-platform-people PeopleCategory).
 * Contexts: profession, position (PF); sector, activity_branch (PJ).
 */
export default {
  namespaced: true,
  state: {
    item: {},
    items: null,
    resourceEndpoint: 'people_categories',
    isLoading: false,
    error: '',
    totalItems: 0,
    summary: {},
    messages: [],
    message: {},
    filters: {},
    currentCompany: {},
    defaultCompany: {},
    companies: [],
    columns: [],
  },
  actions,
  getters,
  mutations,
};
