import { defineModel, t, autoIncrement, index, nullable, primary, required } from "thinkts";

export default defineModel("payment_refund", {
  columns: {
    id: index(autoIncrement(primary(t.bigint()))),
    tenant_id: index(required(t.bigint())),
    refund_no: required(t.string()),
    payment_order_id: required(t.bigint()),
    amount: required(t.decimal()),
    reason: nullable(t.string()),
    status: t.string(),
    third_refund_no: nullable(t.string()),
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
