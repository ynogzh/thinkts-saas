import { defineModel, t, primary, autoIncrement, required, nullable, unique, index, defaultTo, comment } from "thinkts";

export default defineModel("iotbiz_device_type", {
  columns: {
    id: index(primary(autoIncrement(t.string()))),
    tenant_id: required(index(t.string())),
    code: required(t.string()),
    name: required(t.string()),
    category: required(t.string()),
    billing_mode: required(t.string()),
    default_unit_price: required(t.decimal()),
    default_duration_seconds: nullable(t.string()),
    start_mode: required(t.string()),
    config_json: nullable(t.string()),
    status: required(t.string()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {},

  access: {},
});
