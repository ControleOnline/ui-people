<template>
  <q-page>
    <div class="q-pt-lg q-pa-md">
      <div class="q-mb-md q-pa-none">
        <DefaultDetail
          :cardClass="'full-width'"
          :sectionClass="'full-width'"
          :configs="configs"
          :id="peopleId"
          v-if="peopleId"
        />
      </div>
    </div>

    <q-tabs v-model="tab" class="text-primary">
      <q-tab :name="'details'" :label="$t('menu.details')" />
      <q-tab :name="'financial'" :label="$t('menu.financial')" />
      <q-tab :name="'attendances'" :label="$t('menu.attendances')" />
      <q-tab :name="'orders'" :label="$t('menu.orders')" />
      <q-tab
        :name="'franchise'"
        :label="$t('menu.franchise')"
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
          <!-- <ContractsList :loaded="loaded"  :peopleId="peopleId" /> -->
        </div>

        <!-- Colaboradores de uma Empresa: -->
        <div class="q-pt-lg" v-if="currentPerson.peopleType == 'J'">
          <PeopleList :context="'employee'" :myCompany="peopleId" />
        </div>
        <!-- Empresas em que a Pessoa Física é Colaboradora (employee) -->
        <div class="q-pt-lg" v-if="currentPerson.peopleType == 'F'">
          <PeopleList
            :context="'company'"
            :myCompany="peopleId"
            :peopleId="peopleId"
          />
        </div>
      </q-tab-panel>

      <q-tab-panel name="financial">
        <q-tabs v-model="financialTab" class="text-primary">
          <q-tab :name="'receive'" :label="$t('button.receive')" />
          <q-tab :name="'expense'" :label="$t('button.expense')" />
        </q-tabs>

        <q-tab-panels v-model="financialTab">
          <q-tab-panel name="receive">
            <div class="q-pt-lg">
              <q-card class="q-mb-md q-pa-none">
                <q-card-section class="q-pa-none">
                  <div class="q-pa-none">
                    <Invoice
                      :loaded="loaded"
                      :context="'receive'"
                      :peopleId="peopleId"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-tab-panel>

          <q-tab-panel name="expense">
            <div class="q-pt-lg">
              <q-card class="q-mb-md q-pa-none">
                <q-card-section class="q-pa-none">
                  <div class="q-pa-none">
                    <Invoice
                      :loaded="loaded"
                      :context="'expense'"
                      :peopleId="peopleId"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-tab-panel>

      <q-tab-panel name="attendances">
        <q-tabs v-model="attendanceTab" class="text-primary">
          <q-tab :name="'crm'" :label="$t('menu.attendances')" />
          <q-tab :name="'tasks'" :label="$t('menu.tasks')" />
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
                      :peopleId="peopleId"
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
                      :peopleId="peopleId"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-tab-panel>

      <q-tab-panel name="orders">
        <q-tabs v-model="ordersTab" class="text-primary">
          <q-tab :name="'purchases'" :label="$t('menu.purchasingorders')" />
          <q-tab :name="'sales'" :label="$t('menu.salesorders')" />
        </q-tabs>

        <q-tab-panels v-model="ordersTab">
          <q-tab-panel name="sales">
            <div class="q-pt-lg">
              <q-card class="q-mb-md q-pa-none">
                <q-card-section class="q-pa-none">
                  <div class="q-pa-none">
                    <Orders
                      :loaded="loaded"
                      :context="'sales'"
                      :peopleId="peopleId"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-tab-panel>

          <q-tab-panel name="purchases">
            <div class="q-pt-lg">
              <q-card class="q-mb-md q-pa-none">
                <q-card-section class="q-pa-none">
                  <div class="q-pa-none">
                    <Orders
                      :loaded="loaded"
                      :context="'purchasing'"
                      :peopleId="peopleId"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-tab-panel>

      <q-tab-panel class="items-center" name="franchise">
        <div class="q-pt-lg" v-if="currentPerson.peopleType == 'J'">
          <PeopleList context="franchisee" :myCompany="peopleId" />
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
      currentPerson: {},
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
