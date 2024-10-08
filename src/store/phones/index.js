import * as actions from "@controleonline/ui-default/src/store/default/actions";
import * as getters from "@controleonline/ui-default/src/store/default/getters";
import mutations from "@controleonline/ui-default/src/store/default/mutations";
import Formatter from "@controleonline/ui-common/src/utils/formatter.js";


export default {
  namespaced: true,
  state: {
    resourceEndpoint: "phones",
    isLoading: false,
    error: "",
    violations: null,
    totalItems: 0,
    filters: {},
    columns: [
      //{
        // isIdentity: true,
        // sortable: true,
        // name: "id",
        // label: "id",
        // align: "left",
        // format(value) {
        //   return "#" + value;
        // },
     // },
      {
        sortable: true,
        name: "ddd",
        label: "ddd",
        align: "left",
        format(value, column, row) {
          return value;
        },
      },
      {
        sortable: true,
        name: "phone",
        label: "phone",
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
