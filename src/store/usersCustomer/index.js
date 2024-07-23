import * as actions from "@controleonline/quasar-default-ui/src/store/default/actions";
import * as getters from "@controleonline/quasar-default-ui/src/store/default/getters";
import mutations from "@controleonline/quasar-default-ui/src/store/default/mutations";
import Formatter from "@controleonline/ui-common/src/utils/formatter.js";


export default {
  namespaced: true,
  state: {
    resourceEndpoint: "users",
    isLoading: false,
    error: "",
    violations: null,
    totalItems: 0,
    filters: {},
    columns: [
      {
        isIdentity: true,
        sortable: true,
        name: "username",
        label: "username",
        align: "left",
        format(value, column, row) {
          return value;
        },
      },
      {
        sortable: true,
        name: "apiKey",
        label: "apiKey",
        align: "left",
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
