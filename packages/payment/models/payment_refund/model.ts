import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * payment_refund — 
 */
export default defineModel("payment_refund", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    refund_no: label("退款单号")(listable(searchable(index(t.string())))),
    payment_order_id: label("支付单")(listable(searchable(index(t.bigint())))),
    amount: label("金额")(listable(t.decimal())),
    reason: label("原因")(listable(nullable(t.string()))),
    status: label("状态")(listable(searchable(t.string()))),
    third_refund_no: label("第三方退款号")(listable(nullable(t.string()))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
