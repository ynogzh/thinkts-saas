import { defineModel, t, autoIncrement, index, nullable, primary, required } from "thinkts";

export default defineModel("promote_commission_rule", {
  columns: {
    id: index(autoIncrement(primary(t.bigint()))),
    tenant_id: index(required(t.bigint())),
    biz_type: required(t.string()),
    level_id: required(t.bigint()),
    rate: required(t.decimal()),
    condition_json: nullable(t.string()),
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
