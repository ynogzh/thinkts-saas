import { defineModel, t, autoIncrement, index, nullable, primary, required } from "thinkts";

export default defineModel("promote_user_coupon", {
  columns: {
    id: index(autoIncrement(primary(t.bigint()))),
    tenant_id: index(required(t.bigint())),
    user_id: required(t.bigint()),
    template_id: required(t.bigint()),
    coupon_no: required(t.string()),
    status: t.string(),
    received_at: required(t.timestamp()),
    valid_start_at: required(t.timestamp()),
    valid_end_at: required(t.timestamp()),
    locked_biz_type: nullable(t.string()),
    locked_biz_id: nullable(t.bigint()),
    used_at: nullable(t.timestamp()),
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
