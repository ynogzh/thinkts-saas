import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * iotbiz_session — 
 */
export default defineModel("iotbiz_session", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    session_no: label("会话编号")(listable(searchable(index(t.string())))),
    device_id: label("设备")(listable(searchable(index(t.bigint())))),
    merchant_id: label("商户")(listable(searchable(t.bigint()))),
    agent_id: label("代理")(listable(searchable(t.bigint()))),
    user_id: label("用户")(listable(searchable(t.bigint()))),
    consume_mode: label("消费模式")(listable(t.string())),
    package_id: label("Package Id")(listable(searchable(nullable(t.bigint())))),
    entitlement_id: label("Entitlement Id")(listable(searchable(nullable(t.bigint())))),
    trade_order_id: label("交易订单")(listable(searchable(nullable(t.bigint())))),
    payment_order_id: label("支付单")(listable(searchable(nullable(t.bigint())))),
    unit_price: label("单价")(listable(t.decimal())),
    quantity: label("数量")(listable(searchable(t.bigint()))),
    duration_seconds: label("时长(秒)")(listable(searchable(nullable(t.bigint())))),
    amount: label("金额")(listable(t.decimal())),
    payable_amount: label("应付金额")(listable(t.decimal())),
    status: label("状态")(listable(searchable(index(t.string())))),
    started_at: label("开始时间")(listable(nullable(t.timestamp()))),
    ended_at: label("结束时间")(listable(nullable(t.timestamp()))),
    finish_reason: label("完成原因")(listable(nullable(t.string()))),
    start_payload_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "notes", label: "启动参数", type: "string", default: "" }]),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
