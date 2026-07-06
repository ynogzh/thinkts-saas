import { defineModel, t, autoIncrement, index, primary, required } from "thinkts";

export default defineModel("promote_coupon_use_record", {
  columns: {
    id: index(autoIncrement(primary(t.bigint()))),
    tenant_id: index(required(t.bigint())),
    user_coupon_id: required(t.bigint()),
    user_id: required(t.bigint()),
    biz_type: required(t.string()),
    biz_id: required(t.bigint()),
    discount_amount: required(t.decimal()),
    status: t.string(),
    used_at: required(t.timestamp()),
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
