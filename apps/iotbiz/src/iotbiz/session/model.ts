import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("iotbiz_session", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    session_no: label("会话编号")(searchable(listable(required(index(t.string()))))),
    device_id: label("设备")(searchable(listable(required(index(t.bigint()))))),
    merchant_id: label("商户")(searchable(listable(required(t.bigint())))),
    agent_id: label("代理")(listable(required(t.bigint()))),
    user_id: label("用户")(searchable(listable(required(t.bigint())))),
    consume_mode: listable(required(t.string())),
    package_id: listable(nullable(t.bigint())),
    entitlement_id: listable(nullable(t.bigint())),
    trade_order_id: listable(nullable(t.bigint())),
    payment_order_id: listable(nullable(t.bigint())),
    unit_price: listable(required(t.string())),
    quantity: label("数量")(listable(required(t.bigint()))),
    duration_seconds: listable(nullable(t.bigint())),
    amount: label("金额")(listable(required(t.string()))),
    payable_amount: listable(required(t.string())),
    status: label("状态")(searchable(listable(required(index(t.string()))))),
    started_at: listable(nullable(t.timestamp())),
    ended_at: listable(nullable(t.timestamp())),
    finish_reason: listable(nullable(t.string())),
    start_payload_json: nullable(t.json()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
