import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * permission_role_permission — 
 */
export default defineModel("permission_role_permission", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    role_id: label("角色")(listable(searchable(index(t.bigint())))),
    permission_code: label("Permission Code")(listable(index(t.string()))),
    created_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
