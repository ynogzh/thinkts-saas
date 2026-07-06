import { defineModel, t, primary, autoIncrement, required, nullable, unique, index, defaultTo, comment } from "thinkts";

export default defineModel("iotbiz_recharge_order", {
  columns: {
    id: index(primary(autoIncrement(t.string()))),
    tenant_id: required(index(t.string())),
    user_id: required(t.string()),
    recharge_no: required(t.string()),
    asset_type: required(t.string()),
    amount: required(t.decimal()),
    bonus_amount: required(t.decimal()),
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
