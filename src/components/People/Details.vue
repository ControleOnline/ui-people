<template>
  <q-page v-if="currentPerson">
    <div class="q-pt-lg q-pa-md">
      <div class="q-mb-md q-pa-none">
        <DefaultDetail
          :cardClass="'full-width'"
          :sectionClass="'full-width'"
          :configs="configs"
          :id="currentPerson.id"
        />
      </div>
    </div>

    <q-tabs v-model="tab" class="text-primary">
      <q-tab
        :name="'details'"
        :label="$translate(configs.store, 'details', 'tab')"
      />
      <q-tab
        :name="'peoples'"
        :label="
          currentPerson.peopleType == 'J'
            ? $translate(configs.store, 'employes', 'tab')
            : $translate(configs.store, 'companies', 'tab')
        "
      />

      <q-tab
        v-if="context == 'customers' || context == 'franchisee'"
        :name="'financial'"
        :label="$translate(configs.store, 'receive', 'tab')"
      />
      <q-tab
        v-else
        :name="'financial'"
        :label="$translate(configs.store, 'expense', 'tab')"
      />
      <q-tab
        :name="'attendances'"
        :label="$translate(configs.store, 'attendances', 'tab')"
      />
      <q-tab
        v-if="context == 'customers'"
        :name="'orders'"
        :label="$translate(configs.store, 'salesOrders', 'tab')"
      />
      <q-tab
        v-if="context == 'providers'"
        :name="'orders'"
        :label="$translate(configs.store, 'purchasingOrders', 'tab')"
      />

      <q-tab
        :name="'franchise'"
        :label="$translate(configs.store, 'franchise', 'tab')"
        v-if="
          currentPerson.peopleType == 'J' &&
          defaultCompany.id == currentPerson.id
        "
      />
    </q-tabs>

    <q-tab-panels v-model="tab">
      <q-tab-panel name="details">
        <div class="q-pt-lg">
          <div
            class="row q-col-gutter-md"
            v-if="currentPerson.peopleType !== 'J'"
          >
            <EmailsList :loaded="loaded" />
            <PhonesList :loaded="loaded" />
          </div>
        </div>
        <div class="q-pt-lg">
          <DocumentsList :loaded="loaded" />
        </div>
        <div class="q-pt-lg">
          <AddressesList :loaded="loaded" />
        </div>
        <div class="q-pt-lg" v-if="currentPerson.peopleType == 'F'">
          <UsersList :loaded="loaded" />
        </div>
        <div class="q-pt-lg">
          <!-- <ContractsList :loaded="loaded"  :peopleId="currentPerson" /> -->
        </div>
      </q-tab-panel>
      <q-tab-panel name="peoples">
        <div class="q-pt-lg">
          <!-- Colaboradores de uma Empresa: -->
          <div class="q-pt-lg" v-if="currentPerson.peopleType == 'J'">
            <PeopleList :context="'employee'" :myCompany="currentPerson" />
          </div>
          <!-- Empresas em que a Pessoa Física é Colaboradora (employee) -->
          <div class="q-pt-lg" v-if="currentPerson.peopleType == 'F'">
            <PeopleList
              :context="'company'"
              :myCompany="currentPerson"
              :peopleId="currentPerson"
            />
          </div>
        </div>
      </q-tab-panel>
      <q-tab-panel name="financial">
        <div class="q-pt-lg">
          <q-card class="q-mb-md q-pa-none">
            <q-card-section class="q-pa-none">
              <div class="q-pa-none">
                <Invoice
                  v-if="context == 'customers' || context == 'franchisee'"
                  :loaded="loaded"
                  :context="'receive'"
                  :peopleId="currentPerson.id"
                />
                <Invoice
                  v-else
                  :loaded="loaded"
                  :context="'expense'"
                  :peopleId="currentPerson.id"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <q-tab-panel name="attendances">
        <q-tabs v-model="attendanceTab" class="text-primary">
          <q-tab
            :name="'crm'"
            :label="$translate(configs.store, 'attendances', 'tab')"
          />
          <q-tab
            :name="'tasks'"
            :label="$translate(configs.store, 'tasks', 'tab')"
          />
        </q-tabs>

        <q-tab-panels v-model="attendanceTab">
          <q-tab-panel name="crm">
            <div class="q-pt-lg">
              <q-card class="q-mb-md q-pa-none">
                <q-card-section class="q-pa-none">
                  <div class="q-pa-none">
                    <CRMDetails
                      :loaded="loaded"
                      :context="'relationship'"
                      :peopleId="currentPerson"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-tab-panel>

          <q-tab-panel name="tasks">
            <div class="q-pt-lg">
              <q-card class="q-mb-md q-pa-none">
                <q-card-section class="q-pa-none">
                  <div class="q-pa-none">
                    <TaskDetails
                      :loaded="loaded"
                      :context="'support'"
                      :peopleId="currentPerson"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-tab-panel>

      <q-tab-panel name="orders">
        <div class="q-pt-lg">
          <q-card class="q-mb-md q-pa-none">
            <q-card-section class="q-pa-none">
              <div class="q-pa-none">
                <Orders
                  v-if="context == 'customers'"
                  :loaded="loaded"
                  context="sales"
                  :peopleId="currentPerson.id"
                />
                <Orders
                  v-if="context == 'providers'"
                  :loaded="loaded"
                  context="purchasing"
                  :peopleId="currentPerson.id"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <q-tab-panel class="items-center" name="franchise">
        <div class="q-pt-lg" v-if="currentPerson.peopleType == 'J'">
          <PeopleList context="franchisee" :myCompany="currentPerson" />
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script>
import DefaultDetail from "@controleonline/ui-default/src/components/Default/Common/DefaultDetail.vue";
import DefaultTable from "@controleonline/ui-default/src/components/Default/DefaultTable";
import CRMDetails from "../../../../ui-crm/src/pages/CRM";
import TaskDetails from "../../../../ui-tasks/src/components/Tasks";
import Invoice from "../../../../ui-financial/src/components/Invoice";
import Orders from "../../../../ui-orders/src/components/Orders.vue";

import EmailsList from "../Emails/ListEmails.vue";
import PhonesList from "../Phones/List.vue";
import AddressesList from "../Addresses/List.vue";
import DocumentsList from "../Documents/List.vue";
import UsersList from "../Users/List.vue";
import CompaniesList from "../Companies/List.vue";
import ContractsList from "../Contracts/List.vue";
import PeopleList from "../People/List.vue";

import { mapGetters, mapActions } from "vuex";
import getConfigs from "./Configs";

export default {
  components: {
    DefaultDetail,
    DefaultTable,
    Invoice,
    Orders,
    CRMDetails,
    TaskDetails,
    EmailsList,
    PhonesList,
    AddressesList,
    DocumentsList,
    UsersList,
    CompaniesList,
    ContractsList,
    PeopleList,
  },
  props: {
    context: {
      required: true,
    },
    peopleId: {
      required: true,
    },
  },
  data() {
    return {
      tab: "details",
      financialTab: "receive",
      attendanceTab: "crm",
      ordersTab: "sales",
      currentPerson: null,
      loaded: false,
    };
  },
  computed: {
    ...mapGetters({
      myCompany: "people/currentCompany",
      defaultCompany: "people/defaultCompany",
      companies: "people/companies",
      columns: "people/columns",
    }),
    configs() {
      let config = getConfigs(this.context, this.myCompany);
      config.externalFilters = false;
      return config;
    },
  },
  created() {
    this.init();
  },
  methods: {
    ...mapActions({
      getPeople: "people/get",
    }),
    init() {
      this.getPeople(this.peopleId)
        .then((currentPerson) => {
          this.currentPerson = currentPerson;

          let filters = {
            people: "/people/" + this.peopleId,
          };
          // Seta os filtros de People:
          this.$store.commit("emails/SET_FILTERS", filters);
          this.$store.commit("phones/SET_FILTERS", filters);
          this.$store.commit("addresses/SET_FILTERS", filters);
          this.$store.commit("documents/SET_FILTERS", filters);
          this.$store.commit("contracts/SET_FILTERS", filters);
          this.$store.commit("usersCustomer/SET_FILTERS", filters);
        })
        .finally(() => {
          this.loaded = true;
        });
    },
  },
};
</script>
