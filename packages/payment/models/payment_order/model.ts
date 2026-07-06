import { defineModel, t, autoIncrement, index, nullable, primary, required } from "thinkts";

export default defineModel("payment_order", {
  columns: {
    id: index(autoIncrement(primary(t.bigint()))),
    tenant_id: index(required(t.bigint())),
    pay_no: required(t.string()),
    trade_order_id: required(t.bigint()),
    biz_type: required(t.string()),
    biz_id: required(t.bigint()),
    amount: required(t.decimal()),
    channel_code: required(t.string()),
    status: t.string(),
    third_trade_no: nullable(t.string()),
    paid_at: nullable(t.timestamp()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp())
  },

  hooks: {},

  system: {},

  access: {
    "superadmin": {"allow":["select","find","add","update","delete"]},
    "admin": {"allow":["select","find","add","update","delete"]},
    "user": {"allow":["select","find"],"writable":[],"deny":["add","update","delete"]},
    "guest": {"allow":["select","find","add","update","delete"],"writable":null,"readable":null}
  },
});
