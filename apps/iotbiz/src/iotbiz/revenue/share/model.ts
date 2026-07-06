import { defineModel, t, primary, autoIncrement, required, nullable, unique, index, defaultTo, comment } from "thinkts";

export default defineModel("iotbiz_revenue_share", {
  columns: {
    id: index(primary(autoIncrement(t.string()))),
    tenant_id: required(index(t.string())),
    biz_type: required(t.string()),
    biz_id: required(t.string()),
    session_id: required(t.string()),
    trade_order_id: required(t.string()),
    receiver_type: required(t.string()),
    receiver_id: nullable(t.string()),
    rule_type: required(t.string()),
    rate: required(t.decimal()),
    amount: required(t.decimal()),
    settle_order_id: nullable(t.string()),
    status: required(t.string()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {},

  access: {},
});
