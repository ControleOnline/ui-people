import * as actions from "@controleonline/quasar-default-ui/src/store/default/actions";
import * as getters from "@controleonline/quasar-default-ui/src/store/default/getters";
import mutations from "@controleonline/quasar-default-ui/src/store/default/mutations";
import customMutations from "./mutations";
import * as customActions from "./customActions";
import * as customGetters from "./getters";

export default {
  namespaced: true,
  state: {
    resourceEndpoint: "people",
    isLoading: false,
    error: "",
    violations: null,
    totalItems: 0,
    filters: true,
    company: null,
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
        label: "ID",
        externalFilter: true,
        format: function (value) {
          return "#" + value;
        },
      },
      {
        editable: true,
        sortable: true,
        name: "alias",
        align: "left",
        label: "Alias",
        externalFilter: true,
      },
      {
        editable: true,
        sortable: true,
        name: "enabled",
        align: "left",
        label: "Enabled",
        externalFilter: true,
      },
      {
        editable: true,
        sortable: true,
        name: "document",
        align: "left",
        label: "Document",
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
