import * as actions from "@controleonline/ui-default/src/store/default/actions";
import * as getters from "@controleonline/ui-default/src/store/default/getters";
import mutations from "@controleonline/ui-default/src/store/default/mutations";
import Formatter from "@controleonline/ui-common/src/utils/formatter.js";


export default {
  namespaced: true,
  state: {
    resourceEndpoint: "addresses",
    isLoading: false,
    error: "",
    violations: null,
    totalItems: 0,
    filters: {},
    columns: [
      {
        sortable: true,
        name: "nickname",
        editable: false,
        label: "nickname",
        align: "left",
        format(value, column, row) {
          return row.nickname;
        },
      },
      {
        sortable: true,
        name: "cep",
        editable: false,
        label: "CEP",
        align: "left",
        format(value, column, row) {
          return row.street?.cep?.cep;
        },
      },
      {
        sortable: true,
        name: "street",
        editable: false,
        label: "street",
        align: "left",
        format(value, column, row) {
          return row.street?.street;
        },
      },
      {
        sortable: true,
        name: "number",
        editable: false,
        label: "number",
        align: "left",
        format(value, column, row) {
          return row.number;
        },
      },
      {
        sortable: true,
        name: "complement",
        editable: false,
        label: "complement",
        align: "left",
        format(value, column, row) {
          return row.complement;
        },
      },
      {
        sortable: true,
        name: "district",
        editable: false,
        label: "district",
        align: "left",
        format(value, column, row) {
          return row.street?.district?.district;
        },
      },
      {
        sortable: true,
        name: "city",
        editable: false,
        label: "city",
        align: "left",
        format(value, column, row) {
          return row.street?.district?.city?.city;
        },
      },
      {
        sortable: true,
        name: "state",
        editable: false,
        label: "state",
        align: "left",
        format(value, column, row) {
          return row.street?.district?.city?.state?.state;
        },
      },
      {
        sortable: true,
        name: "country",
        editable: false,
        label: "country",
        align: "left",
        format(value, column, row) {
          return row.street?.district?.city?.state?.country?.countryname;
        },
      },
      {
        sortable: true,
        name: "searchFor",
        editable: false,
        label: "searchFor",
        align: "left",
        format(value, column, row) {
          return row.searchFor;
        },
      },
      {
        sortable: true,
        name: "openingHours",
        editable: false,
        label: "openingHours",
        align: "left",
        format(value, column, row) {
          return row.openingHours;
        },
      }
    ]
  },
  actions: actions,
  getters,
  mutations,
};
