import { defineModel, t, autoIncrement, index, nullable, primary, required } from "thinkts";

export default defineModel("promote_coupon_scope", {
  columns: {
    id: index(autoIncrement(primary(t.bigint()))),
    tenant_id: index(required(t.bigint())),
    template_id: required(t.bigint()),
    scope_type: required(t.string()),
    scope_value: nullable(t.string()),
    include_type: t.string(),
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
