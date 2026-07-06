import { defineModel, t, primary, autoIncrement, required, nullable, unique, index, defaultTo, comment } from "thinkts";

export default defineModel("iotbiz_param_template", {
  columns: {
    id: index(primary(autoIncrement(t.string()))),
    tenant_id: required(index(t.string())),
    code: required(t.string()),
    name: required(t.string()),
    type_id: nullable(t.string()),
    start_mode: required(t.string()),
    pricing_json: nullable(t.string()),
    start_config_json: nullable(t.string()),
    metadata_json: nullable(t.string()),
    status: required(t.string()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {},

  access: {},
});
