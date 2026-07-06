import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("payment_refund", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    refund_no: label("退款单号")(searchable(listable(required(index(t.string()))))),
    payment_order_id: listable(required(index(t.bigint()))),
    amount: label("金额")(listable(required(t.string()))),
    reason: listable(nullable(t.string())),
    status: label("状态")(searchable(listable(required(t.string())))),
    third_refund_no: listable(nullable(t.string())),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
