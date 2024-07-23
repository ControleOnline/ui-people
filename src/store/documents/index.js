
import * as actions from "@controleonline/quasar-default-ui/src/store/default/actions";
import * as getters from "@controleonline/quasar-default-ui/src/store/default/getters";
import mutations from "@controleonline/quasar-default-ui/src/store/default/mutations";
import Formatter from "@controleonline/ui-common/src/utils/formatter.js";


export default {
  namespaced: true,
  state: {
    resourceEndpoint: "documents",
    isLoading: false,
    error: "",
    violations: null,
    totalItems: 0,
    filters: {},
    columns: [
      {
        sortable: true,
        name: "type",
        editable: false,
        label: "type",
        align: "left",
        format(value, column, row) {
          return row.documentType.documentType;
        },
      },
      {
        sortable: true,
        name: "document",
        editable: false,
        label: "document",
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
