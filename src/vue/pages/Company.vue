<template>
  <People :context="context" :myCompany="user" v-if="context" />
</template>

<script>
import People from "@controleonline/ui-people/src/vue/components/People/List.vue";
import { mapGetters, mapActions } from "vuex";

export default {
  components: {
    People,
  },
  computed: {
    ...mapGetters({
      user: "auth/user",
    }),
  },
  data() {
    return {
      context: "company",
    };
  },
  created() {},
};
</script>
