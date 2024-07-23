<template>
  <div class="col-12 col-md-6">
    <q-card class="q-mb-md q-pa-none">
      <q-card-section class="q-pa-none">
        <div class="q-pa-none">
          <DefaultTable :configs="configsPhones" v-if="loaded && configsPhones" />
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
    configsPhones() {
      return {
        externalFilters: false,
        filters: true,
        totalItems: 50,
        "full-height": false,
        store: "phones",
        add: true,
        delete: true,
        selection: false,
        search: false,
        title: {
          class: "text-teal text-h6 q-mb-md",
          icon: {
            name: "mdi-phone",
            size: "24px",
            class: "q-mr-sm",
          },
          text: this.$t('phones.title')
        },
      };
    }
  }
}
</script>
