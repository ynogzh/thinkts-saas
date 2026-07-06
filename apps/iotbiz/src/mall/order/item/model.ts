import { defineModel, t, primary, autoIncrement, required, nullable, unique, index, defaultTo, comment } from "thinkts";

export default defineModel("mall_order_item", {
  columns: {
    id: index(primary(autoIncrement(t.string()))),
    tenant_id: required(index(t.string())),
    order_id: required(t.string()),
    product_id: required(t.string()),
    product_name: required(t.string()),
    quantity: required(t.string()),
    price: required(t.decimal()),
    amount: required(t.decimal()),
    created_at: required(t.timestamp()),
  },

  hooks: {},

  system: {},

  access: {},
});
