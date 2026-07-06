import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("permission_data_resource", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    module_code: listable(required(index(t.string()))),
    resource_code: listable(required(index(t.string()))),
    resource_name: listable(required(t.string())),
    table_name: listable(nullable(t.string())),
    tenant_field: listable(required(t.string())),
    owner_field: listable(nullable(t.string())),
    dept_field: listable(nullable(t.string())),
    agent_field: listable(nullable(t.string())),
    region_field: listable(nullable(t.string())),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {},

  access: {},
});
