<template>

          <DefaultTable :configs="configsAddresses" v-if="loaded && configsAddresses" />

</template>

<script>

export default {
  components: {
  },
  props: {
    loaded: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    configsAddresses() {
      return {
        externalFilters: false,
        filters: false,
        controls: false,
        totalItems: 50,
        "full-height": false,
        store: "addresses",
        add: true,
        delete: true,
        selection: false,
        search: false,
        title: {
          class: "text-primary text-h6 q-mb-md",
          icon: {
            name: "people",
            size: "24px",
            class: "q-mr-sm",
          },
        },
      };
    }
  }
}
</script>
