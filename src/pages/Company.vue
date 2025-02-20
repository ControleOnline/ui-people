<template>
  <People :context="context" :myCompany="$auth.user" v-if="context"  />
</template>

<script>
import People from "@controleonline/ui-people/src/components/People/List.vue";

export default {
  components: {
    People,
  },
  computed: {

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
