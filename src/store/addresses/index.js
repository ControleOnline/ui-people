import * as actions from "@controleonline/quasar-default-ui/src/store/default/actions";
import * as getters from "@controleonline/quasar-default-ui/src/store/default/getters";
import mutations from "@controleonline/quasar-default-ui/src/store/default/mutations";
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
        label: "Apelido",
        align: "left",
        format(value, column, row) {
          return row.nickname;
        },
      },
      {
        sortable: true,
        name: "locator",
        editable: false,
        label: "Localizador",
        align: "left",
        format(value, column, row) {
          return row.street?.locator;
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
        label: "Rua / Avenida",
        align: "left",
        format(value, column, row) {
          return row.street?.street;
        },
      },
      {
        sortable: true,
        name: "number",
        editable: false,
        label: "Número",
        align: "left",
        format(value, column, row) {
          return row.number;
        },
      },
      {
        sortable: true,
        name: "complement",
        editable: false,
        label: "Complemento",
        align: "left",
        format(value, column, row) {
          return row.complement;
        },
      },
      {
        sortable: true,
        name: "district",
        editable: false,
        label: "Bairro",
        align: "left",
        format(value, column, row) {
          return row.street?.district?.district;
        },
      },
      {
        sortable: true,
        name: "city",
        editable: false,
        label: "Cidade",
        align: "left",
        format(value, column, row) {
          return row.street?.district?.city?.city;
        },
      },
      {
        sortable: true,
        name: "state",
        editable: false,
        label: "Estado",
        align: "left",
        format(value, column, row) {
          return row.street?.district?.city?.state?.state;
        },
      },
      {
        sortable: true,
        name: "country",
        editable: false,
        label: "País",
        align: "left",
        format(value, column, row) {
          return row.street?.district?.city?.state?.country?.countryname;
        },
      },
      {
        sortable: true,
        name: "searchFor",
        editable: false,
        label: "Procurar por",
        align: "left",
        format(value, column, row) {
          return row.searchFor;
        },
      },
      {
        sortable: true,
        name: "openingHours",
        editable: false,
        label: "Horário de Funcionamento",
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
