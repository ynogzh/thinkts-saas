import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * payment_order — 
 */
export default defineModel("payment_order", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    pay_no: label("支付单号")(listable(searchable(index(t.string())))),
    trade_order_id: label("交易订单")(listable(searchable(index(t.bigint())))),
    biz_type: label("业务类型")(listable(searchable(t.string()))),
    biz_id: label("业务ID")(listable(searchable(t.bigint()))),
    amount: label("金额")(listable(t.decimal())),
    channel_code: label("渠道编码")(listable(searchable(t.string()))),
    status: label("状态")(listable(searchable(t.string()))),
    third_trade_no: label("第三方交易号")(listable(searchable(nullable(t.string())))),
    paid_at: label("支付时间")(listable(nullable(t.timestamp()))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
