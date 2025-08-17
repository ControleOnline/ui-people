import * as actions from '@controleonline/ui-default/src/store/default/actions';
import * as getters from '@controleonline/ui-default/src/store/default/getters';
import mutations from '@controleonline/ui-default/src/store/default/mutations';

export default {
  namespaced: true,
  state: {
    item: {},
    items: [],
    resourceEndpoint: 'documents',
    isLoading: false,
    error: '',

    totalItems: 0,
    messages: [],
    message: {},
    filters: {},
    columns: [
      {
        sortable: true,
        name: 'type',
        editable: false,
        label: 'type',
        align: 'left',
        format(value, column, row) {
          return row?.documentType?.documentType;
        },
      },
      {
        sortable: true,
        name: 'document',
        editable: false,
        label: 'document',
        align: 'left',
        format(value, column, row) {
          return value;
        },
      },
    ],
  },
  actions: actions,
  getters,
  mutations,
};
