import * as actions from '@controleonline/ui-default/src/store/default/actions';
import * as getters from '@controleonline/ui-default/src/store/default/getters';
import mutations from '@controleonline/ui-default/src/store/default/mutations';

export default {
  namespaced: true,
  state: {
    item: {},
    items: [],
    resourceEndpoint: 'addresses',
    isLoading: false,
    error: '',

    totalItems: 0,

    summary: {},
    messages: [],
    message: {},
    filters: {},
    columns: [
      {
        sortable: true,
        name: 'nickname',
        editable: true,
        label: 'nickname',
        align: 'left',
        format(value, column, row) {
          return row?.nickname;
        },
      },
      {
        sortable: true,
        name: 'cep',
        editable: true,
        label: 'CEP',
        align: 'left',
        format(value, column, row) {
          return row?.street?.cep?.cep || row?.postal_code || row?.cep;
        },
      },
      {
        sortable: true,
        name: 'street',
        editable: true,
        label: 'street',
        align: 'left',
        format(value, column, row) {
          return row?.street?.street || row?.street;
        },
      },
      {
        sortable: true,
        name: 'number',
        editable: true,
        label: 'number',
        align: 'left',
        format(value, column, row) {
          return row?.number;
        },
      },
      {
        sortable: true,
        name: 'complement',
        editable: true,
        label: 'complement',
        align: 'left',
        format(value, column, row) {
          return row?.complement;
        },
      },
      {
        sortable: true,
        name: 'district',
        editable: true,
        label: 'district',
        align: 'left',
        format(value, column, row) {
          return row?.street?.district?.district || row?.district;
        },
      },
      {
        sortable: true,
        name: 'city',
        editable: true,
        label: 'city',
        align: 'left',
        format(value, column, row) {
          return row?.street?.district?.city?.city || row?.city;
        },
      },
      {
        sortable: true,
        name: 'state',
        editable: true,
        label: 'state',
        align: 'left',
        format(value, column, row) {
          return row?.street?.district?.city?.state?.state || row?.state;
        },
      },
      {
        sortable: true,
        name: 'country',
        editable: true,
        label: 'country',
        align: 'left',
        format(value, column, row) {
          return (
            row?.street?.district?.city?.state?.country?.countryname ||
            row?.countryname ||
            row?.country
          );
        },
      },
      {
        sortable: true,
        name: 'searchFor',
        editable: false,
        label: 'searchFor',
        align: 'left',
        format(value, column, row) {
          return row?.searchFor;
        },
      },
      {
        sortable: true,
        name: 'openingHours',
        editable: false,
        label: 'openingHours',
        align: 'left',
        format(value, column, row) {
          return row?.openingHours;
        },
      },
    ],
  },
  actions: actions,
  getters,
  mutations,
};
