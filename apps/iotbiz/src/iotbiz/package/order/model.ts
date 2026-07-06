import { defineModel, t, primary, autoIncrement, required, nullable, unique, index, defaultTo, comment } from "thinkts";

export default defineModel("iotbiz_package_order", {
  columns: {
    id: index(primary(autoIncrement(t.string()))),
    tenant_id: required(index(t.string())),
    user_id: required(t.string()),
    package_id: required(t.string()),
    order_no: required(t.string()),
    quantity: required(t.string()),
    pay_amount: required(t.decimal()),
    trade_order_id: nullable(t.string()),
    payment_order_id: nullable(t.string()),
    status: required(t.string()),
    paid_at: nullable(t.timestamp()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {},

  access: {},
});
