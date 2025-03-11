<template>
  <DefaultTable :configs="configsAddress" v-if="loaded && configsAddress" />
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
    configsAddress() {
      return {
        externalFilters: false,
        filters: false,
        controls: false,
        totalItems: 50,
        "full-height": false,
        store: "address",
        add: false,
        editable: false,
        delete: true,
        selection: false,
        search: false,
        components: {
          headerActions: [{
            component: Details,
            props: {
              people: this.people,
            },
          }],
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
