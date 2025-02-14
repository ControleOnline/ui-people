<template>
  <q-card class="q-mb-md">
    <q-card-section v-if="people">
      <q-card-section class="row items-center">
        <q-icon name="person" color="primary" size="md" class="q-mr-sm" />
        <div class="text-bold">{{ $tt("people", "label", context) }}</div>
      </q-card-section>
      <q-card-section>
        <DefaultInput
          :columnName="columnName"
          :row="row"
          :configs="configs"
          @saved="saved"
          @loadData="loadData"
        />

        <q-item-label v-for="phone in people.phone" caption
          >({{ phone.ddd }}) {{ phone.phone }}</q-item-label
        >
        <q-item-label v-for="phone in people.email" caption>
          {{ phone.email }}</q-item-label
        >
      </q-card-section>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  components: {},
  props: {
    columnName: {
      default: "client",
    },
    configs: {
      required: true,
    },
    row: {
      required: true,
    },
    context: {
      default: "people",
    },
    people: {
      required: true,
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
