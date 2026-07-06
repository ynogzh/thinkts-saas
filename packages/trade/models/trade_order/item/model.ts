import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("trade_order_item", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    trade_order_id: listable(required(index(t.bigint()))),
    item_type: listable(nullable(t.string())),
    item_id: listable(nullable(t.bigint())),
    item_name: listable(required(t.string())),
    quantity: label("数量")(listable(required(t.bigint()))),
    price: label("单价")(listable(required(t.string()))),
    amount: label("金额")(listable(required(t.string()))),
    created_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
