import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * trade_order_item — 
 */
export default defineModel("trade_order_item", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    trade_order_id: label("交易订单")(listable(searchable(index(t.bigint())))),
    item_type: label("项目类型")(listable(searchable(nullable(t.string())))),
    item_id: label("Item Id")(listable(searchable(nullable(t.bigint())))),
    item_name: label("Item Name")(listable(searchable(t.string()))),
    quantity: label("数量")(listable(searchable(t.bigint()))),
    price: label("单价")(listable(t.decimal())),
    amount: label("金额")(listable(t.decimal())),
    created_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
