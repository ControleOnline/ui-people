<template>
  <div class="q-pt-lg">
    <q-card class="q-mb-md q-pa-none">
      <q-card-section class="q-pa-none">
        <div class="q-pa-none">
          <DefaultTable :configs="configsContracts" v-if="loaded" />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import DefaultTable from '@controleonline/quasar-default-ui/src/components/Default/DefaultTable.vue';

export default {
  components: {
    DefaultTable,
  },
  props: {
    loaded: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    configsContracts() {
      return {
        externalFilters: false,
        filters: true,
        "full-height": false,
        store: "contracts",
        add: true,
        delete: true,
        selection: false,
        search: false,
        title: {
          class: "text-teal text-h6 q-mb-md",
          icon: {
            name: "mdi-office-building",
            size: "24px",
            class: "q-mr-sm",
          },
          text: this.$t('contracts.title')
        },
      };
    },
  }
}
</script>
