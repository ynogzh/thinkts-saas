import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("iotbiz_revenue_share", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    biz_type: label("业务类型")(listable(required(t.string()))),
    biz_id: label("业务ID")(listable(required(t.bigint()))),
    session_id: label("会话")(listable(required(t.bigint()))),
    trade_order_id: listable(required(t.bigint())),
    receiver_type: listable(required(index(t.string()))),
    receiver_id: listable(nullable(index(t.bigint()))),
    rule_type: listable(required(t.string())),
    rate: listable(required(t.string())),
    amount: label("金额")(listable(required(t.string()))),
    settle_order_id: listable(nullable(t.bigint())),
    status: label("状态")(searchable(listable(required(index(t.string()))))),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
