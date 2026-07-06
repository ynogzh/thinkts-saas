import { defineModel, t, primary, autoIncrement, required, nullable, unique, index, defaultTo, comment } from "thinkts";

export default defineModel("iotbiz_device_profile", {
  columns: {
    id: autoIncrement(t.string()),
    tenant_id: required(t.string()),
    category_id: required(t.string()),
    code: required(t.string()),
    name: required(t.string()),
    start_mode: required(t.string()),
    billing_mode: required(t.string()),
    unit_price: required(t.decimal()),
    duration_seconds: nullable(t.string()),
    fault_threshold_json: nullable(t.string()),
    start_command_json: nullable(t.string()),
    status_json: nullable(t.string()),
    extra_json: nullable(t.string()),
    status: required(t.string()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {},

  access: {},
});
