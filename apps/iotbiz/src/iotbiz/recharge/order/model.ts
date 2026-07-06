import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("iotbiz_recharge_order", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    user_id: label("用户")(searchable(listable(required(t.bigint())))),
    recharge_no: label("充值单号")(listable(required(index(t.string())))),
    asset_type: listable(required(t.string())),
    amount: label("金额")(listable(required(t.string()))),
    bonus_amount: listable(required(t.string())),
    trade_order_id: listable(nullable(t.bigint())),
    payment_order_id: listable(nullable(t.bigint())),
    status: label("状态")(searchable(listable(required(t.string())))),
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
