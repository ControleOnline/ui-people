<template>
  <People :context="context" :myCompany="user" v-if="context"  />
</template>

<script>
import People from "@controleonline/ui-people/src/components/People/List.vue";

export default {
  components: {
    People,
  },
  computed: {
    user() {
      return this.$store.getters["auth/user"];
    },
  },
  data() {
    return {
      context: "company",
    };
  },
  created() {

  },
};
</script>
