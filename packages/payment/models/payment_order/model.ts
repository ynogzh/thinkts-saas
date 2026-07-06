import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("payment_order", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    pay_no: label("支付单号")(searchable(listable(required(index(t.string()))))),
    trade_order_id: listable(required(index(t.bigint()))),
    biz_type: label("业务类型")(listable(required(t.string()))),
    biz_id: label("业务ID")(listable(required(t.bigint()))),
    amount: label("金额")(listable(required(t.string()))),
    channel_code: listable(required(t.string())),
    status: label("状态")(searchable(listable(required(t.string())))),
    third_trade_no: listable(nullable(t.string())),
    paid_at: label("支付时间")(listable(nullable(t.timestamp()))),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
