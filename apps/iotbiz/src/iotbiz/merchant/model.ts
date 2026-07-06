import { defineModel, t, primary, autoIncrement, required, nullable, unique, index, defaultTo, comment } from "thinkts";

export default defineModel("iotbiz_merchant", {
  columns: {
    id: index(primary(autoIncrement(t.string()))),
    tenant_id: required(index(t.string())),
    merchant_no: required(t.string()),
    name: required(t.string()),
    agent_id: required(t.string()),
    contact_user_id: nullable(t.string()),
    contact_name: nullable(t.string()),
    contact_phone: nullable(t.string()),
    merchant_share_rate: required(t.decimal()),
    settlement_cycle: required(t.string()),
    signed_at: nullable(t.timestamp()),
    status: required(t.string()),
    extra_json: nullable(t.string()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {},

  access: {},
});
