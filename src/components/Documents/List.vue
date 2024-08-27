<template>
  <div class="q-pt-lg">
    <q-card class="q-mb-md q-pa-none">
      <q-card-section class="q-pa-none">
        <div class="q-pa-none">
          <DefaultTable
            :configs="configsDocuments"
            v-if="loaded && configsDocuments"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import DefaultTable from "@controleonline/ui-default/src/components/Default/DefaultTable.vue";

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
          text: this.$t("documents.title"),
        },
      };
    },
  },
};
</script>
