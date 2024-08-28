export default function getConfigs(context, myCompany) {
  let list =
    context != "company" && context != "employee" && context != "franchisee";

  return {
    extraFields: {
      context: context,
    },
    companyParam: list ? "company" : false,
    context: context,
    filters: true,
    search: true,
    store: "people",
    "full-height": false,
    add: true,
    delete: false,
    selection: true,
    externalFilters: false,
  };
}
