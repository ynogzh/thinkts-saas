import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * iotbiz_recharge_order — 
 */
export default defineModel("iotbiz_recharge_order", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    user_id: label("用户")(listable(searchable(t.bigint()))),
    recharge_no: label("充值单号")(listable(index(t.string()))),
    asset_type: label("资产类型")(listable(t.string())),
    amount: label("金额")(listable(t.decimal())),
    bonus_amount: label("赠送金额")(listable(t.decimal())),
    trade_order_id: label("交易订单")(listable(searchable(nullable(t.bigint())))),
    payment_order_id: label("支付单")(listable(searchable(nullable(t.bigint())))),
    status: label("状态")(listable(searchable(t.string()))),
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
