<template>
  <DefaultTable :configs="configsPhones" v-if="loaded && configsPhones" />
</template>

<script>
export default {
  components: {},
  props: {
    loaded: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    configsPhones() {
      return {
        externalFilters: false,
        companyParam: false,
        filters: false,
        controls: false,
        totalItems: 50,
        "full-height": false,
        store: "phones",
        add: true,
        delete: true,
        selection: false,
        search: false,
        title: {
          class: "text-primary text-h6 q-mb-md",
          icon: {
            name: "phone",
            size: "24px",
            class: "q-mr-sm",
          },
        },
      };
    },
  },
};
</script>
