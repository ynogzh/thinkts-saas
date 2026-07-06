import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * iotbiz_revenue_share — 
 */
export default defineModel("iotbiz_revenue_share", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    biz_type: label("业务类型")(listable(t.string())),
    biz_id: label("业务ID")(listable(searchable(t.bigint()))),
    session_id: label("会话")(listable(searchable(t.bigint()))),
    trade_order_id: label("交易订单")(listable(searchable(t.bigint()))),
    receiver_type: label("接收方类型")(listable(index(t.string()))),
    receiver_id: label("Receiver Id")(listable(searchable(index(nullable(t.bigint()))))),
    rule_type: label("规则类型")(listable(t.string())),
    rate: label("比率")(listable(t.decimal())),
    amount: label("金额")(listable(t.decimal())),
    settle_order_id: label("结算单")(listable(searchable(nullable(t.bigint())))),
    status: label("状态")(listable(searchable(index(t.string())))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
