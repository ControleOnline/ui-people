<template>
  <DefaultTable :configs="configsEmail" v-if="loaded && configsEmail" />
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
    configsEmail() {
      return {
        externalFilters: false,
        totalItems: 50,
        filters: false,
        controls: false,
        "full-height": false,
        store: "emails",
        title: {
          class: "text-primary text-h6 q-mb-md",
          icon: {
            name: "email",
            size: "24px",
            class: "q-mr-sm",
          },
        },
        add: true,
        delete: true,
        selection: false,
        search: false,
      };
    },
  },
};
</script>
