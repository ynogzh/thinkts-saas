import { defineModel, t, autoIncrement, index, nullable, primary, required } from "thinkts";

export default defineModel("trade_order_item", {
  columns: {
    id: index(autoIncrement(primary(t.bigint()))),
    tenant_id: index(required(t.bigint())),
    trade_order_id: required(t.bigint()),
    item_type: nullable(t.string()),
    item_id: nullable(t.bigint()),
    item_name: required(t.string()),
    quantity: required(t.integer()),
    price: required(t.decimal()),
    amount: required(t.decimal()),
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
