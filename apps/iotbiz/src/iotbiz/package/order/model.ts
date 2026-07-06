import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * iotbiz_package_order — 
 */
export default defineModel("iotbiz_package_order", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    user_id: label("用户")(listable(searchable(t.bigint()))),
    package_id: label("Package Id")(listable(searchable(t.bigint()))),
    order_no: label("订单号")(listable(searchable(index(t.string())))),
    quantity: label("数量")(listable(searchable(t.bigint()))),
    pay_amount: label("支付金额")(listable(t.decimal())),
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
