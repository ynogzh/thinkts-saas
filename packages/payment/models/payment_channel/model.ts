import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("payment_channel", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    channel_code: listable(required(index(t.string()))),
    channel_name: listable(required(t.string())),
    provider: listable(required(t.string())),
    config_json: required(t.json()),
    status: label("状态")(searchable(listable(required(t.string())))),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
