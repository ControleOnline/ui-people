<template>
  <iframe
    :src="getMap()"
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

    getMap() {
      let url = `https://www.google.com/maps/embed/v1/place?key=${this.apiKey}&q=`;

      if (this.address.cep) url += this.address.cep + "-";
      if (this.address.street) url += this.address.street;
      if (this.address.number) url += "," + this.address.number;
      if (this.address.district) url += "-" + this.address.district;
      if (this.address.city) url += "-" + this.address.city;
      if (this.address.state) url += "-" + this.address.state;
      if (this.address.country) url += "-" + this.address.country;

      return url;
    },
  },
};
</script>
