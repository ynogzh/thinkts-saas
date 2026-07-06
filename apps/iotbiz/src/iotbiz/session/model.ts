import { defineModel, t, primary, autoIncrement, required, nullable, unique, index, defaultTo, comment } from "thinkts";

export default defineModel("iotbiz_session", {
  columns: {
    id: index(primary(autoIncrement(t.string()))),
    tenant_id: required(index(t.string())),
    session_no: required(t.string()),
    device_id: required(t.string()),
    merchant_id: required(t.string()),
    agent_id: required(t.string()),
    user_id: required(t.string()),
    consume_mode: required(t.string()),
    package_id: nullable(t.string()),
    entitlement_id: nullable(t.string()),
    trade_order_id: nullable(t.string()),
    payment_order_id: nullable(t.string()),
    unit_price: required(t.decimal()),
    quantity: required(t.string()),
    duration_seconds: nullable(t.string()),
    amount: required(t.decimal()),
    payable_amount: required(t.decimal()),
    status: required(t.string()),
    started_at: nullable(t.timestamp()),
    ended_at: nullable(t.timestamp()),
    finish_reason: nullable(t.string()),
    start_payload_json: nullable(t.string()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {},

  access: {},
});
