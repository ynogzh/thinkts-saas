import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("payment_callback_log", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    channel_code: listable(required(index(t.string()))),
    pay_no: label("支付单号")(searchable(listable(nullable(index(t.string()))))),
    refund_no: label("退款单号")(searchable(listable(nullable(index(t.string()))))),
    callback_type: listable(required(t.string())),
    request_body: listable(required(t.text())),
    headers_json: nullable(t.json()),
    verify_status: listable(nullable(t.string())),
    handle_status: listable(nullable(t.string())),
    idempotent_key: listable(nullable(index(t.string()))),
    created_at: required(index(t.timestamp())),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
