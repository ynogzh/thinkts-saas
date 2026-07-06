import { defineModel, t, autoIncrement, index, nullable, primary, required } from "thinkts";

export default defineModel("platform_tenant_module", {
  columns: {
    id: index(autoIncrement(primary(t.bigint()))),
    tenant_id: index(required(t.bigint())),
    module_code: required(t.string()),
    status: t.string(),
    expire_at: nullable(t.timestamp()),
    limit_json: nullable(t.string()),
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
