import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * platform_tenant_module — 
 */
export default defineModel("platform_tenant_module", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    module_code: label("模块编码")(listable(index(t.string()))),
    status: label("状态")(listable(searchable(t.string()))),
    expire_at: label("到期时间")(listable(nullable(t.timestamp()))),
    limit_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "notes", label: "Limit Json", type: "string", default: "" }]),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
