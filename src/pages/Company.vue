<template>
    <People :context="context" v-if="context"/>
  </template>
  
  <script>
  import People from "@controleonline/ui-people/src/components/People/List.vue";
  
  export default {
    components: {
        People,
    },
  
    data() {
      return {
        context: 'company'
      };
    },
    created() {
     },
  };
  </script>
  