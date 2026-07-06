import { defineModel, t, autoIncrement, index, nullable, primary, required } from "thinkts";

export default defineModel("identity_login_log", {
  columns: {
    id: index(autoIncrement(primary(t.bigint()))),
    tenant_id: index(required(t.bigint())),
    user_id: nullable(t.bigint()),
    login_type: required(t.string()),
    ip: nullable(t.string()),
    user_agent: nullable(t.string()),
    status: t.string(),
    fail_reason: nullable(t.string()),
    created_at: required(t.timestamp())
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
