export default function getConfigs(context, myCompany) {
  return {
    extraFields: {
      context: context,
    },
    filters: true,
    store: "people",
    add: true,
    delete: false,
    selection: true,
    search: true,
  };
}
