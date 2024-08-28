export default function getConfigs(context, myCompany) {
  let inner =
    context == "company" || context == "employee" || context == "franchisee";

  return {
    extraFields: {
      context: context,
    },
    companyParam: inner ? false : "company",
    context: context,
    filters: true,
    search: true,
    store: "people",
    "full-height": !inner,
    add: true,
    delete: true,
    selection: false,
    externalFilters: !inner,
  };
}
