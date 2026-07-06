import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * dashboard_widget — 
 */
export default defineModel("dashboard_widget", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    dashboard_id: label("Dashboard Id")(listable(searchable(index(t.bigint())))),
    widget_type: label("Widget Type")(listable(t.string())),
    title: label("标题")(listable(searchable(t.string()))),
    data_source_code: label("Data Source Code")(listable(t.string())),
    config_json: jsonSchema(nullable(t.json()), [jsonSchema(t.json(), [{ key: "notes", label: "备注", type: "string", default: "" }])]),
    sort: label("排序")(listable(searchable(t.bigint()))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
