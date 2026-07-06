import { defineModel, t, autoIncrement, index, nullable, primary, required } from "thinkts";

export default defineModel("trade_order", {
  columns: {
    id: index(autoIncrement(primary(t.bigint()))),
    tenant_id: index(required(t.bigint())),
    order_no: required(t.string()),
    biz_type: required(t.string()),
    biz_id: required(t.bigint()),
    user_id: required(t.bigint()),
    amount: required(t.decimal()),
    discount_amount: t.decimal(),
    pay_amount: required(t.decimal()),
    status: t.string(),
    paid_at: nullable(t.timestamp()),
    closed_at: nullable(t.timestamp()),
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
