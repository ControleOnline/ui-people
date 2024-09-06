<template>
  <q-btn
    class="q-pa-xs btn-primary"
    dense
    :icon="this.row.id ? 'edit' : 'add'"
    @click="openModal = true"
  >
    <q-tooltip>
      {{ $tt("address", "btn", this.row.id ? "editAddress" : "addAddress") }}
    </q-tooltip>
  </q-btn>
  <q-dialog v-model="openModal" full-width full-height>
    <q-card class="">
      <q-card-section class="q-pa-md row col-12 q-pa-sm">
        <q-toolbar class="">
          <q-toolbar-title class="">{{
            $tt("address", "title", this.row.id ? "editAddress" : "addAddress")
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
            <DefaultForm
              :configs="configs"
              @saved="saved"
              @error="error"
              :data="row"
              :index="index"
            />
          </div>
          <div class="row q-pa-md card-street">
            <iframe
              :src="getstreetview()"
              width="100%"
              height="100%"
              style="border: 0"
              allowfullscreen=""
              loading="lazy"
            >
            </iframe>
          </div>
        </div>
        <div class="col-12 col-md-6 q-pa-md card-map">
          <iframe
            :src="getMap()"
            width="100%"
            height="100%"
            style="border: 0"
            allowfullscreen=""
            loading="lazy"
          >
          </iframe>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      openModal: false,
      apiKey:
        process.env.GMAPS_GOOGLE_CLIENT_ID ||
        "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8",
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
    index: {
      type: Number,
      required: false,
    },
  },
  created() {
    console.log(this.row);
  },
  methods: {
    ...mapActions({
      changeApiKey: "address/changeApiKey",
    }),
    getMap() {
      let url = `https://www.google.com/maps/embed/v1/place?key=${this.apiKey}&q=`;
      return url + "Alameda+Yayá,+424";
    },
    getstreetview() {
      const latitude = -23.5386;
      const longitude = -46.6934;

      let url = `https://www.google.com/maps/embed/v1/streetview?key=${this.apiKey}&location=${latitude},${longitude}`;

      // Parâmetros adicionais
      const heading = 210; // Direção da câmera (ajuste conforme necessário)
      const pitch = 10; // Inclinação da câmera

      return `${url}&heading=${heading}&pitch=${pitch}`;
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
