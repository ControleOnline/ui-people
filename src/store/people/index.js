import * as actions from '@controleonline/ui-default/src/store/default/actions';
import * as getters from '@controleonline/ui-default/src/store/default/getters';
import mutations from '@controleonline/ui-default/src/store/default/mutations';
import * as customActions from './customActions';
import customMutations from './mutations';
import * as customGetters from './getters';
import Formatter from '@controleonline/ui-common/src/utils/formatter.js';

export default {
  namespaced: true,
  state: {
    item: {},
    items: null,
    resourceEndpoint: 'people',
    isLoading: false,
    error: '',
    totalItems: 0,
    messages: [],
    message: {},
    filters: {},
    currentCompany: {},
    defaultCompany: {},
    companies: [],
    columns: [
      {
        editable: false,
        isIdentity: true,
        sortable: true,
        name: 'id',
        align: 'left',
        label: 'id',
        externalFilter: false,
        format: function (value) {
          return '#' + value;
        },
      },
      {
        editable: true,
        sortable: true,
        name: 'image',
        align: 'left',
        label: 'image',
        inputType: 'file',
        fileType: ['image'],
        externalFilter: false,
      },
      {
        icon: 'person',
        editable: true,
        sortable: true,
        name: 'name',
        align: 'left',
        label: 'name',
        externalFilter: false,
      },
      {
        editable: true,
        sortable: true,
        name: 'alias',
        align: 'left',
        label: 'alias',
        externalFilter: false,
      },
      {
        inputType: 'date-range',
        sortable: true,
        name: 'foundationDate',
        align: 'left',
        label: 'foundationDate',
        externalFilter: false,
        saveFormat: function (value) {
          return Formatter.buildAmericanDate(value);
        },
        format: function (value) {
          return Formatter.formatDateYmdTodmY(value);
        },
      },
      {
        editable: true,
        sortable: true,
        list: [
          {
            label: 'Física',
            value: 'F',
          },
          {
            label: 'Jurídica',
            value: 'J',
          },
        ],
        name: 'peopleType',
        align: 'left',
        label: 'peopleType',
        externalFilter: false,
      },
    ],
  },
  actions: {
    ...customActions,
    ...actions,
  },
  getters: {
    ...customGetters,
    ...getters,
  },
  mutations: {
    ...mutations,
    ...customMutations,
  },
};
