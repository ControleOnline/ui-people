export default function getConfigs(context, myCompany) {
  return {
    extraFields: {
      context: context,
    },
    filters: true,
    search:false,
    store: "people",
    "full-height": false,
    add: true,
    delete: false,
    selection: true,
    externalFilters:false,
    title: {
      class: "text-teal text-h6 q-mb-md",
      icon: {
        name: "mdi-email",
        size: "24px",
        class: "q-mr-sm",
      },
      text: 'eee'
    },
  };
}
