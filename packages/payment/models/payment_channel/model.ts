import { defineModel, t, autoIncrement, index, primary, required } from "thinkts";

export default defineModel("payment_channel", {
  columns: {
    id: index(autoIncrement(primary(t.bigint()))),
    tenant_id: index(required(t.bigint())),
    channel_code: required(t.string()),
    channel_name: required(t.string()),
    provider: required(t.string()),
    config_json: required(t.string()),
    status: t.string(),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp())
  },

  hooks: {},

  system: {},

  access: {
    "superadmin": {"allow":["select","find","add","update","delete"]},
    "admin": {"allow":["select","find","add","update","delete"]},
    "user": {"allow":["select","find"],"writable":[],"deny":["add","update","delete"]},
    "guest": {"allow":["select","find","add","update","delete"],"writable":null,"readable":null}
  },
});
