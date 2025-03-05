<template>
  <q-btn
    class="q-pa-xs btn-primary"
    dense
    :icon="row?.id ? 'edit' : 'add'"
    @click="openModal = true"
  >
    <q-tooltip>
      {{ $tt("address", "btn", row?.id ? "edit" : "add") }}
    </q-tooltip>
  </q-btn>
  <q-dialog v-model="openModal" full-width full-height>
    <q-card class="">
      <q-card-section class="q-pa-md row col-12 q-pa-sm">
        <q-toolbar class="">
          <q-toolbar-title class="">{{
            $tt("address", "title", row?.id ? "edit" : "add")
          }}</q-toolbar-title>
          <q-btn
            class="btn-primary"
            no-caps
            flat
            v-close-popup
            round
            dense
            icon="close"
          />
        </q-toolbar>
      </q-card-section>
      <q-card-section class="q-pa-md row items-start card-address">
        <div class="col-12 col-md-6">
          <div class="row q-pa-md">
            <SelectInput
              :configs="configs"
              :column="{
                label: configs.store,

                searchParam:'input',
                list:'gmaps/geoplace'
              }"
              :multiple="false"
              @keydown="this.$emit('keydown', $event)"
              @blur="this.$emit('blur', $event)"
              @update="this.$emit('update', $event)"
              @selected="onSelect"
            />
            <DefaultForm
              :configs="configs"
              @saved="saved"
              @error="error"
              :row="data"
              :key="key"
            />
          </div>
          <div class="row q-pa-md card-street">
            <StreetView :address="data" />
          </div>
        </div>
        <div class="col-12 col-md-6 q-pa-md card-map">
          <Map :address="data" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import SelectInput from "@controleonline/ui-default/src/components/Default/Inputs/Components/SelectInput";
import { mapActions, mapGetters } from "vuex";
import Map from "./Map/Map";
import StreetView from "./Map/StreetView";

export default {
  components: {
    SelectInput,
    StreetView,
    Map,
  },
  data() {
    return {
      openModal: false,
      key: 0,
    };
  },
  props: {
    row: {
      type: Object,
      default: {},
    },
    configs: {
      type: Object,
      default: {},
    },
  },
  created() {
    this.data = this.formatData(this.$copyObject(this.row));
  },
  methods: {
    ...mapActions({}),

    onSelect(selected) {
      let data = selected?.value;
      if (!data) return;
      this.data = this.formatData(data);
      this.key++;
    },
    formatData(data) {
      if (!data) return {};
      return {
        "@id": data["@id"] || "/address/" + data.id,
        id: data.id,
        nickname: data.nickname || "",
        complement: data.complement || "",
        street: data.street?.street || data.street,
        district: data.street?.district?.district || data.district,
        city: data.street?.district?.city?.city || data.city,
        state: data.street?.district?.city?.state?.state || data.state,
        cep: data.street?.cep?.cep || data.postal_code,
        number: data.number,
        country:
          data.street?.district?.city?.state?.country?.countryname ||
          data.country,
      };
    },
  },
};
</script>
<style>
.card-street {
  height: 300px !important;
}

.card-map,
.card-address {
  height: 90vh !important;
}
</style>
