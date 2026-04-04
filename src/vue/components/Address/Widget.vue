<template>
  <q-card>
    <q-card-section>
      <q-card-section class="row items-center">
        <q-icon name="place" color="red" size="md" class="q-mr-sm" />
        <div class="text-bold">
          {{ $tt("order", "label", "Delivery Address") }}
        </div>
      </q-card-section>
      <q-card-section>
        <DefaultInput
          v-if="address"
          :columnName="columnName"
          :row="row"
          :configs="configs"
          @saved="saved"
          @loadData="loadData"
        />
        <Address
          v-if="address"
          :row="row"
          :people="row.client"
          :configs="configsAddress"
        />
      </q-card-section>
    </q-card-section>
  </q-card>
</template>

<script>
import Address from "@controleonline/ui-people/src/vue/components/Address/Details.vue";

export default {
  components: { Address },
  props: {
    columnName: {
      required: true,
    },
    configs: {
      required: true,
    },
    row: {
      required: true,
    },
    address: {
      required: true,
    },
  },
  computed: {
    configsAddress() {
      return {
        store: "address",
      };
    },
  },
  methods: {
    saved(saved) {
      this.$emit("saved", saved);
    },
    loadData() {
      this.$emit("loadData");
    },
  },
};
</script>
