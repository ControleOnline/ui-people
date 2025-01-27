<template>
  <iframe
    :src="getstreetview()"
    width="100%"
    height="100%"
    style="border: 0"
    allowfullscreen=""
    loading="lazy"
  >
  </iframe>
</template>

<script>
import SelectInput from "@controleonline/ui-default/src/components/Default/Common/Inputs/SelectInput";
import { mapActions, mapGetters } from "vuex";

export default {
  components: {
    SelectInput,
  },
  data() {
    return {
      apiKey:
        process.env.GMAPS_GOOGLE_CLIENT_ID ||
        "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8",
    };
  },
  props: {
    address: {
      type: Object,
      default: {},
    },
  },
  created() {},
  methods: {
    ...mapActions({}),

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
