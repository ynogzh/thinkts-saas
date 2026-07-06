import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * dashboard_dashboard — 
 */
export default defineModel("dashboard_dashboard", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    name: label("名称")(listable(searchable(t.string()))),
    code: label("编码")(listable(searchable(index(t.string())))),
    layout_json: jsonSchema(nullable(t.json()), [jsonSchema(t.json(), [{ key: "notes", label: "Layout Json", type: "string", default: "" }])]),
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
