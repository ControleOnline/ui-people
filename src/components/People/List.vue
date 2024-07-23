<template>
  <DefaultTable :configs="configs" v-if="loaded" />
</template>
<script>
import DefaultTable from "@controleonline/ui-default/src/components/Default/DefaultTable";
import { mapActions, mapGetters } from "vuex";
import Button from "@controleonline/ui-common/src/components/Categories/Button";
import getConfigs from "./Configs";  

export default {
  components: {
    DefaultTable,
    Button,
  },
  props: {
    context: {
      required: true,
    },
  },
  computed: {
    ...mapGetters({
      myCompany: "people/currentCompany",
      columns: "people/columns",
    }),
    filters() {
      return this.$store.getters[this.configs.store + "/filters"];
    },
    user() {
      return this.$store.getters["auth/user"];
    },
    configs() {
      let config = getConfigs(this.context, this.myCompany);
      return config;
    },
  },
  data() {
    return {
      loaded: false,
    };
  },
  created() {
    this.addColumnTo();
    this.load();
  },
  methods: {
    routeExists(routeName) {
      return this.$router.options.routes.some((route) => {
        if (route.children)
          return route.children.some((child) => routeName === child.name);
      });
    },
    addColumnTo() {
      let routeName =
        this.context.charAt(0).toUpperCase() +
        this.context.slice(1) +
        "Details";
      if (this.routeExists(routeName)) {
        const columns = this.$copyObject(this.columns);
        columns[0].to = (value) => {
          return {
            name: routeName,
            params: {
              id: value,
            },
          };
        };

        this.$store.commit(this.configs.store + "/SET_COLUMNS", columns);
      }
    },

    load() {
      if (!this.context) return;

      let filters = this.$copyObject(this.filters);
      if (this.context == "company") {
        delete filters.company;
        filters.link = "/people/" + this.user?.people;
        filters.link_type = "employee";
      }

      if (this.context == "employee") {
        delete filters.company;
        filters.company = "/people/" + this.myCompany?.id;
        filters.link_type = "employee";
      }

      if (this.context == "customers") {
        delete filters.link;
        filters.company = "/people/" + this.myCompany?.id;
        filters.link_type = "client";
      }

      if (this.context == "professional") {
        delete filters.link;
        filters.company = "/people/" + this.myCompany?.id;
        filters.link_type = "professional";
      }

      if (this.context == "carrier") {
        delete filters.link;
        filters.company = "/people/" + this.myCompany?.id;
        filters.link_type = "carrier";
      }

      if (this.context == "provider") {
        delete filters.link;
        filters.company = "/people/" + this.myCompany?.id;
        filters.link_type = "provider";
      }

      this.$store.commit(this.configs.store + "/SET_FILTERS", filters);
      this.loaded = true;
    },
  },
};
</script>
