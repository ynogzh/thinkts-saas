import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * mall_order_item — 
 */
export default defineModel("mall_order_item", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    order_id: label("订单")(listable(searchable(index(t.bigint())))),
    product_id: label("商品")(listable(searchable(t.bigint()))),
    product_name: label("Product Name")(listable(t.string())),
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
