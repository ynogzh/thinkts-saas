import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("trade_order", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    order_no: label("订单号")(searchable(listable(required(index(t.string()))))),
    biz_type: label("业务类型")(listable(required(index(t.string())))),
    biz_id: label("业务ID")(listable(required(index(t.bigint())))),
    user_id: label("用户")(searchable(listable(required(t.bigint())))),
    amount: label("金额")(listable(required(t.string()))),
    discount_amount: listable(required(t.string())),
    pay_amount: listable(required(t.string())),
    status: label("状态")(searchable(listable(required(t.string())))),
    paid_at: label("支付时间")(listable(nullable(t.timestamp()))),
    closed_at: listable(nullable(t.timestamp())),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
