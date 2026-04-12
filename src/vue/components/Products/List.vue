<template>
  <q-card class="full-height q-mb-md q-pa-none">
    <q-card-section class="row items-center justify-between">
      <div>
        <div class="text-h6">Produtos</div>
        <div class="text-caption text-grey-7">
          {{
            normalizedRelations.length === 1
              ? "1 produto vinculado a este fornecedor"
              : `${normalizedRelations.length} produtos vinculados a este fornecedor`
          }}
        </div>
      </div>

      <q-badge color="primary" outline>
        {{ normalizedRelations.length }}
      </q-badge>
    </q-card-section>

    <q-separator />

    <q-list v-if="normalizedRelations.length > 0" separator>
      <q-item
        v-for="relation in normalizedRelations"
        :key="relation.id || `${relation.product?.id || 'product'}-${relation.priority || 0}`"
        clickable
        @click="openProduct(relation)"
      >
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white" icon="inventory_2" />
        </q-item-section>

        <q-item-section>
          <q-item-label>
            {{ productName(relation.product) }}
          </q-item-label>
          <q-item-label caption>
            {{ productSubtitle(relation.product) }}
          </q-item-label>

          <div class="q-mt-sm row q-col-gutter-sm">
            <div class="col-auto">
              <q-chip dense color="blue-1" text-color="primary">
                {{ roleLabel(relation.role) }}
              </q-chip>
            </div>

            <div
              v-for="item in relationMeta(relation)"
              :key="`${relation.id}-${item.label}`"
              class="col-auto"
            >
              <q-chip dense color="grey-2" text-color="grey-9">
                {{ item.label }}: {{ item.value }}
              </q-chip>
            </div>
          </div>
        </q-item-section>

        <q-item-section side>
          <q-icon name="chevron_right" color="grey-5" />
        </q-item-section>
      </q-item>
    </q-list>

    <q-card-section v-else class="text-grey-7 text-center q-py-xl">
      Nenhum produto vinculado a este fornecedor.
    </q-card-section>
  </q-card>
</template>

<script>
const ROLE_LABELS = {
  supplier: "Fornecedor",
  manufacturer: "Fabricante",
  distributor: "Distribuidor",
};

const SUPPLY_TYPES = ["component", "feedstock", "package"];

export default {
  props: {
    relations: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    normalizedRelations() {
      const safeRelations = Array.isArray(this.relations) ? [...this.relations] : [];

      return safeRelations.sort((left, right) => {
        const leftPriority = Number(left?.priority ?? 9999);
        const rightPriority = Number(right?.priority ?? 9999);

        if (leftPriority !== rightPriority) {
          return leftPriority - rightPriority;
        }

        return this.productName(left?.product)
          .toLowerCase()
          .localeCompare(this.productName(right?.product).toLowerCase());
      });
    },
  },
  methods: {
    roleLabel(role) {
      return ROLE_LABELS[role] || role || "Relacionamento";
    },
    productName(product) {
      return String(product?.product || `Produto #${product?.id || ""}`).trim();
    },
    productSubtitle(product) {
      const items = [];

      if (product?.sku) {
        items.push(`SKU ${product.sku}`);
      }

      if (product?.type) {
        items.push(String(product.type).trim());
      }

      return items.join(" | ");
    },
    formatMoney(value) {
      if (value === null || value === undefined || value === "") {
        return "";
      }

      const parsed = Number(String(value).replace(",", "."));
      if (!Number.isFinite(parsed)) {
        return String(value);
      }

      try {
        return parsed.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
      } catch (error) {
        return `R$ ${parsed.toFixed(2)}`;
      }
    },
    relationMeta(relation) {
      const items = [];

      if (relation?.costPrice) {
        items.push({ label: "Custo", value: this.formatMoney(relation.costPrice) });
      }

      if (relation?.supplierSku) {
        items.push({ label: "Cod. interno", value: relation.supplierSku });
      }

      if (relation?.leadTimeDays || relation?.leadTimeDays === 0) {
        items.push({
          label: "Prazo",
          value: `${relation.leadTimeDays} ${
            Number(relation.leadTimeDays) === 1 ? "dia" : "dias"
          }`,
        });
      }

      if (relation?.priority || relation?.priority === 0) {
        items.push({ label: "Prioridade", value: String(relation.priority) });
      }

      return items;
    },
    resolveProductContext(product) {
      return SUPPLY_TYPES.includes(String(product?.type || "").toLowerCase())
        ? "supplies"
        : "products";
    },
    openProduct(relation) {
      const productId = relation?.product?.id;
      if (!productId) {
        return;
      }

      this.$router.push({
        name: "ProductDetails",
        params: {
          id: productId,
        },
        query: {
          context: this.resolveProductContext(relation.product),
        },
      });
    },
  },
};
</script>
