import { defineModel, t, autoIncrement, index, nullable, primary, required, unique } from "thinkts";

export default defineModel("payment_callback_log", {
  columns: {
    id: index(autoIncrement(primary(t.bigint()))),
    tenant_id: index(required(t.bigint())),
    channel_code: required(t.string()),
    pay_no: nullable(t.string()),
    refund_no: nullable(t.string()),
    callback_type: required(t.string()),
    request_body: required(t.text()),
    headers_json: nullable(t.string()),
    verify_status: nullable(t.string()),
    handle_status: nullable(t.string()),
    idempotent_key: index(unique(nullable(t.string()))),
    created_at: required(t.timestamp())
  },

  hooks: {},

  system: {},

  access: {
    "superadmin": {"allow":["select","find","add","update","delete"]},
    "admin": {"allow":["select","find","add","update","delete"]},
    "user": {"allow":["select","find"],"writable":[],"deny":["add","update","delete"]},
    "guest": {"allow":["select","find"],"writable":[],"deny":["add","update","delete"]}
  },
});
