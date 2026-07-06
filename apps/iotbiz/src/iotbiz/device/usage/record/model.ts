import { defineModel, t, primary, autoIncrement, required, nullable, unique, index, defaultTo, comment } from "thinkts";

export default defineModel("iotbiz_device_usage_record", {
  columns: {
    id: autoIncrement(t.string()),
    tenant_id: required(t.string()),
    user_id: required(t.string()),
    device_id: required(t.string()),
    category_id: required(t.string()),
    session_id: required(t.string()),
    sku_id: nullable(t.string()),
    usage_type: required(t.string()),
    amount: required(t.decimal()),
    started_at: required(t.timestamp()),
    finished_at: nullable(t.timestamp()),
    extra_json: nullable(t.string()),
    status: required(t.string()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {},

  access: {},
});
