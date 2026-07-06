import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * config_dict — 
 */
export default defineModel("config_dict", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    module_code: label("模块编码")(listable(nullable(t.string()))),
    dict_code: label("Dict Code")(listable(index(t.string()))),
    dict_name: label("Dict Name")(listable(t.string())),
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
