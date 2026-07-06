import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * trade_order — 
 */
export default defineModel("trade_order", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    order_no: label("订单号")(listable(searchable(index(t.string())))),
    biz_type: label("业务类型")(listable(index(t.string()))),
    biz_id: label("业务ID")(listable(searchable(index(t.bigint())))),
    user_id: label("用户")(listable(searchable(t.bigint()))),
    amount: label("金额")(listable(t.decimal())),
    discount_amount: label("折扣金额")(listable(t.decimal())),
    pay_amount: label("支付金额")(listable(t.decimal())),
    status: label("状态")(listable(searchable(t.string()))),
    paid_at: label("支付时间")(listable(nullable(t.timestamp()))),
    closed_at: label("关闭时间")(listable(nullable(t.timestamp()))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
