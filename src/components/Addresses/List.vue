<template>
  <DefaultTable :configs="configsAddresses" v-if="loaded && configsAddresses" />
</template>

<script>

import Details from "./Details";

export default {
  components: { Details },
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
        add: false,
        editable: false,
        delete: true,
        selection: false,
        search: false,
        components: {
          headerActions: {
            component: Details,
            props: {
              people: this.people,
            },
          },
          tableActions: {
            component: Details,
          },
        },
        title: {
          class: "text-primary text-h6 q-mb-md",
          icon: {
            name: "people",
            size: "24px",
            class: "q-mr-sm",
          },
        },
      };
    },
  },
};
</script>
