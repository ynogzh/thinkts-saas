import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * dashboard_data_source — 
 */
export default defineModel("dashboard_data_source", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    module_code: label("模块编码")(listable(t.string())),
    data_source_code: label("Data Source Code")(listable(index(t.string()))),
    name: label("名称")(listable(searchable(t.string()))),
    query_type: label("Query Type")(listable(t.string())),
    api_url: label("Api Url")(listable(nullable(t.string()))),
    sql_template: label("Sql Template")(listable(nullable(t.text()))),
    params_schema_json: jsonSchema(nullable(t.json()), [jsonSchema(t.json(), [{ key: "notes", label: "Params Schema Json", type: "string", default: "" }])]),
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
