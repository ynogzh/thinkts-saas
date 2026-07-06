import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("iotbiz_device_type", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    code: label("编码")(searchable(listable(required(index(t.string()))))),
    name: label("名称")(searchable(listable(required(t.string())))),
    category: listable(required(t.string())),
    billing_mode: listable(required(t.string())),
    default_unit_price: listable(required(t.string())),
    default_duration_seconds: listable(nullable(t.bigint())),
    start_mode: searchable(listable(required(t.string()))),
    config_json: nullable(t.json()),
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
