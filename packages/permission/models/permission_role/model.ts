import { defineModel, t, autoIncrement, index, primary, required } from "thinkts";

export default defineModel("permission_role", {
  columns: {
    id: index(autoIncrement(primary(t.bigint()))),
    tenant_id: index(required(t.bigint())),
    name: required(t.string()),
    code: required(t.string()),
    status: t.string(),
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
