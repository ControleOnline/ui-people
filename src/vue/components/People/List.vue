<template>
  <DefaultTable :configs="configs" v-if="loaded" />
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import getConfigs from "./Configs";

export default {
  components: {},
  props: {
    context: {
      required: true,
    },
    myCompany: {
      required: true,
    },
  },
  computed: {
    ...mapGetters({
      columns: "people/columns",
    }),
    filters() {
      return this.$store.getters[this.configs.store + "/filters"];
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
            target:'__blank'
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
        filters.link = "/people/" + this.myCompany?.id;
        filters.link_type = "employee";
      }

      if (this.context == "employee") {
        delete filters.link;
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

      if (this.context == "franchisee") {
        delete filters.link;
        filters.company = "/people/" + this.myCompany?.id;
        filters.link_type = "franchisee";
      }

      this.$store.commit(this.configs.store + "/SET_FILTERS", filters);
      this.loaded = true;
    },
  },
};
</script>
