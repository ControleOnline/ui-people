<template>
  <div class="col-12 col-md-6">
    <q-card class="q-mb-md q-pa-none">
      <q-card-section class="q-pa-none">
        <div class="q-pa-none">
          <DefaultTable :configs="configsEmail" v-if="loaded && configsEmail" />
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
    configsEmail() {
      return {
        externalFilters: false,
        totalItems: 50,
        filters: true,
        "full-height": false,
        store: "emails",
        title: {
          class: "text-teal text-h6 q-mb-md",
          icon: {
            name: "mdi-email",
            size: "24px",
            class: "q-mr-sm",
          },
          text: this.$t('emails.title')
        },
        add: true,
        delete: true,
        selection: false,
        search: false,
      };
    }
  }
};
</script>
