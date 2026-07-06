import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * config_setting — 
 */
export default defineModel("config_setting", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    module_code: label("模块编码")(listable(index(t.string()))),
    config_key: label("Config Key")(listable(index(t.string()))),
    config_value: label("Config Value")(listable(nullable(t.text()))),
    value_type: label("Value Type")(listable(t.string())),
    status: label("状态")(listable(searchable(t.string()))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
