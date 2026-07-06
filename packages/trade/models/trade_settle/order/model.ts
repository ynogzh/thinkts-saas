import { defineModel, t, autoIncrement, index, nullable, primary, required } from "thinkts";

export default defineModel("trade_settle_order", {
  columns: {
    id: index(autoIncrement(primary(t.bigint()))),
    tenant_id: index(required(t.bigint())),
    settle_no: required(t.string()),
    settle_type: required(t.string()),
    receiver_type: required(t.string()),
    receiver_id: required(t.bigint()),
    amount: required(t.decimal()),
    status: t.string(),
    settled_at: nullable(t.timestamp()),
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
