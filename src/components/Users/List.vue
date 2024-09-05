<template>
  <div class="q-pt-lg">
    <q-card class="q-mb-md q-pa-none">
      <q-card-section class="q-pa-none">
        <div class="q-pa-none">
          <DefaultTable :configs="configsUsers" v-if="loaded && configsUsers" />
        </div>
      </q-card-section>
    </q-card>
  </div>
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
    configsUsers() {
      return {
        externalFilters: false,
        filters: false,
        controls: false,
        totalItems: 50,
        "full-height": false,
        store: "usersCustomer",
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
    },
  }
}
</script>
