<template>
  <DefaultTable :configs="configsDocuments" v-if="loaded && configsDocuments" />
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
    configsDocuments() {
      return {
        externalFilters: false,
        filters: false,
        controls: false,
        "full-height": false,
        store: "documents",
        add: true,
        delete: true,
        selection: false,
        search: false,
        title: {
          class: "text-primary text-h6 q-mb-md",
          icon: {
            name: "email",
            size: "24px",
            class: "q-mr-sm",
          },
        },
      };
    },
  },
};
</script>
