import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * payment_callback_log — 
 */
export default defineModel("payment_callback_log", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    channel_code: label("渠道编码")(listable(searchable(index(t.string())))),
    pay_no: label("支付单号")(listable(searchable(index(nullable(t.string()))))),
    refund_no: label("退款单号")(listable(searchable(index(nullable(t.string()))))),
    callback_type: label("回调类型")(listable(searchable(t.string()))),
    request_body: label("请求体")(listable(t.text())),
    headers_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "notes", label: "备注", type: "string", default: "" }]),
    verify_status: label("验证状态")(listable(searchable(nullable(t.string())))),
    handle_status: label("处理状态")(listable(searchable(nullable(t.string())))),
    idempotent_key: label("幂等键")(listable(searchable(index(unique(nullable(t.string())))))),
    created_at: index(t.timestamp())
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
