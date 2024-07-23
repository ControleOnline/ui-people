import * as actions from "@controleonline/quasar-default-ui/src/store/default/actions";
import * as getters from "@controleonline/quasar-default-ui/src/store/default/getters";
import mutations from "@controleonline/quasar-default-ui/src/store/default/mutations";
import * as customActions from "./customActions";
import customMutations from "./mutations";
import * as customGetters from "./getters";

export default {
  namespaced: true,
  state: {
    resourceEndpoint: "people",
    isLoading: false,
    error: "",
    violations: null,
    totalItems: 0,
    filters: {},
    company: null,
    item: {},
    currentCompany: null,
    defaultCompany: null,
    companies: [],

    columns: [
      {
        editable: false,
        isIdentity: true,
        sortable: true,
        name: "id",
        align: "left",
        label: "id",
        externalFilter: true,
        format: function (value) {
          return "#" + value;
        },
      },
      {
        editable: true,
        sortable: true,
        name: "name",
        align: "left",
        label: "name",
        externalFilter: true,
      },
      {
        editable: true,
        sortable: true,
        name: "alias",
        align: "left",
        label: "alias",
        externalFilter: true,
      },
      {
        editable: true,
        sortable: true,
        list: [
          {
            label: "Física",
            value: "F",
          },
          {
            label: "Jurídica",
            value: "J",
          },
        ],
        name: "peopleType",
        align: "left",
        label: "peopleType",
        externalFilter: true,
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
