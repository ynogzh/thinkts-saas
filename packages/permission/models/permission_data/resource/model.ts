import { defineModel, t, autoIncrement, index, nullable, primary, required } from "thinkts";

export default defineModel("permission_data_resource", {
  columns: {
    id: index(autoIncrement(primary(t.bigint()))),
    module_code: index(required(t.string())),
    resource_code: required(t.string()),
    resource_name: required(t.string()),
    table_name: nullable(t.string()),
    tenant_field: t.string(),
    owner_field: nullable(t.string()),
    dept_field: nullable(t.string()),
    agent_field: nullable(t.string()),
    region_field: nullable(t.string()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp())
  },

  hooks: {},

  system: {},

  access: {
    "superadmin": {"allow":["select","find","add","update","delete"]},
    "admin": {"allow":["select","find","add","update","delete"]},
    "user": {"allow":["select","find"],"writable":[],"deny":["add","update","delete"]},
    "guest": {"allow":["select","find"],"writable":[],"deny":["add","update","delete"]}
  },
});
