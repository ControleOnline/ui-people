<template>
  <q-page v-if="currentPerson">
    <div class="q-pt-lg q-pa-md flex-container full-height full-width">
      <div class="full-height q-mb-md q-pa-none right-column">
        <DefaultDetail
          :cardClass="'full-width'"
          :sectionClass="'full-width'"
          :configs="configs"
          :id="currentPerson.id"
        />
      </div>
    </div>

    <q-tabs v-model="tab" class="tab-people">
      <q-tab :name="'details'" :label="$tt(configs.store, 'tab', 'details')" />
      <q-tab
        :name="'peoples'"
        :label="
          currentPerson.peopleType == 'J'
            ? $tt(configs.store, 'tab', 'employes')
            : $tt(configs.store, 'tab', 'companies')
        "
      />

      <q-tab
        v-if="context == 'customers' || context == 'franchisee'"
        :name="'financial'"
        :label="$tt(configs.store, 'tab', 'receive')"
      />
      <q-tab
        v-else
        :name="'financial'"
        :label="$tt(configs.store, 'tab', 'expense')"
      />
      <q-tab
        :name="'attendances'"
        :label="$tt(configs.store, 'tab', 'attendances')"
      />
      <q-tab
        v-if="context == 'customers'"
        :name="'orders'"
        :label="$tt(configs.store, 'tab', 'salesOrders')"
      />
      <q-tab
        v-if="context == 'providers'"
        :name="'orders'"
        :label="$tt(configs.store, 'tab', 'purchasingOrders')"
      />

      <q-tab
        :name="'franchise'"
        :label="$tt(configs.store, 'tab', 'franchise')"
        v-if="
          currentPerson.peopleType == 'J' &&
          defaultCompany.id == currentPerson.id
        "
      />
    </q-tabs>

    <q-tab-panels v-model="tab">
      <q-tab-panel name="details">
        <div
          class="q-pt-lg row q-col-gutter-md"
          v-if="currentPerson.peopleType !== 'J'"
        >
          <div class="col-12 col-md-6">
            <q-card class="full-height q-mb-md q-pa-none">
              <EmailsList :loaded="loaded" />
            </q-card>
          </div>
          <div class="col-12 col-md-6">
            <q-card class="full-height q-mb-md q-pa-none">
              <PhonesList :loaded="loaded" />
            </q-card>
          </div>
        </div>
        <div class="q-pt-lg row q-col-gutter-md">
          <div
            :class="
              currentPerson.peopleType == 'F' ? 'col-12 col-md-6' : 'col-12'
            "
          >
            <q-card class="full-height q-mb-md q-pa-none">
              <DocumentsList :loaded="loaded" />
            </q-card>
          </div>

          <div class="col-12 col-md-6" v-if="currentPerson.peopleType == 'F'">
            <q-card class="full-height q-mb-md q-pa-none">
              <UsersList :people="peopleId" />
            </q-card>
          </div>
        </div>
        <div class="q-pt-lg">
          <div class="q-pt-lg">
            <q-card class="full-height q-mb-md q-pa-none">
              <AddressesList :loaded="loaded" />
            </q-card>
          </div>
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
          <q-card class="full-height q-mb-md q-pa-none">
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
          </q-card>
        </div>
      </q-tab-panel>

      <q-tab-panel name="attendances">
        <q-tabs v-model="attendanceTab" class="text-primary">
          <q-tab
            :name="'crm'"
            :label="$tt(configs.store, 'tab', 'attendances')"
          />
          <q-tab :name="'tasks'" :label="$tt(configs.store, 'tab', 'tasks')" />
        </q-tabs>

        <q-tab-panels v-model="attendanceTab">
          <q-tab-panel name="crm">
            <div class="q-pt-lg">
              <q-card class="full-height q-mb-md q-pa-none">
                <CRMDetails
                  :loaded="loaded"
                  :context="'relationship'"
                  :peopleId="currentPerson"
                />
              </q-card>
            </div>
          </q-tab-panel>

          <q-tab-panel name="tasks">
            <div class="q-pt-lg">
              <q-card class="full-height q-mb-md q-pa-none">
                <TaskDetails
                  :loaded="loaded"
                  :context="'support'"
                  :peopleId="currentPerson"
                />
              </q-card>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-tab-panel>

      <q-tab-panel name="orders">
        <div class="q-pt-lg">
          <q-card class="full-height q-mb-md q-pa-none">
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

import CRMDetails from "../../../../ui-crm/src/pages/CRM";
import TaskDetails from "../../../../ui-tasks/src/components/Tasks";
import Invoice from "../../../../ui-financial/src/components/Invoice";
import Orders from "../../../../ui-orders/src/components/Orders.vue";

import EmailsList from "../Emails/ListEmails.vue";
import PhonesList from "../Phones/List.vue";
import AddressesList from "../Addresses/List.vue";
import DocumentsList from "../Documents/List.vue";
import UsersList from "@controleonline/ui-users/src/components/Users/List.vue";
import CompaniesList from "../Companies/List.vue";
import ContractsList from "../Contracts/List.vue";
import PeopleList from "../People/List.vue";

import { mapGetters, mapActions } from "vuex";
import getConfigs from "./Configs";

export default {
  components: {
    DefaultDetail,
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
        })
        .finally(() => {
          this.loaded = true;
        });
    },
  },
};
</script>
<style scoped>
.tab-people {
  background-color: var(--secondary) !important;
  color: var(--text-secondary);
}
.flex-container {
  display: flex;
  align-items: flex-start; /* Alinhar itens ao topo */
  flex-wrap: wrap; /* Permitir que o conteúdo "quebre" para a próxima linha no mobile */
}

.left-column {
  flex: 0 0 200px; /* Largura fixa para a coluna esquerda no desktop */
  padding-right: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative; /* Necessário para o ícone de upload posicionado */
}

.right-column {
  width: 100%; /* Garante que o componente use a largura completa */
}
/* Media query para mobile */
@media (max-width: 768px) {
  .flex-container {
    flex-direction: column; /* Empilha as colunas no mobile */
    align-items: center; /* Centraliza os itens */
  }

  .left-column {
    flex: 0 0 auto; /* Deixa a largura da coluna automática no mobile */
    padding-right: 0; /* Remove o padding da direita */
    margin-bottom: 20px; /* Adiciona um espaçamento inferior */
  }

  .right-column {
    flex: 0 0 auto; /* Deixa a largura da coluna automática no mobile */
  }
}
</style>
