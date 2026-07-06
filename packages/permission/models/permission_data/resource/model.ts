import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * permission_data_resource — 
 */
export default defineModel("permission_data_resource", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    module_code: label("模块编码")(listable(index(t.string()))),
    resource_code: label("Resource Code")(listable(index(t.string()))),
    resource_name: label("Resource Name")(listable(t.string())),
    table_name: label("Table Name")(listable(nullable(t.string()))),
    tenant_field: label("Tenant Field")(listable(t.string())),
    owner_field: label("Owner Field")(listable(nullable(t.string()))),
    dept_field: label("Dept Field")(listable(nullable(t.string()))),
    agent_field: label("Agent Field")(listable(nullable(t.string()))),
    region_field: label("Region Field")(listable(nullable(t.string()))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
  },

  access: {},
});
