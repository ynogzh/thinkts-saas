import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * permission_data_scope — 
 */
export default defineModel("permission_data_scope", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    role_id: label("角色")(listable(searchable(index(t.bigint())))),
    module_code: label("模块编码")(listable(t.string())),
    resource_code: label("Resource Code")(listable(index(t.string()))),
    scope_type: label("范围类型")(listable(t.string())),
    scope_value_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "notes", label: "Scope Value Json", type: "string", default: "" }]),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
