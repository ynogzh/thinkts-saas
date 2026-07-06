import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("iotbiz_device_profile", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    category_id: listable(required(index(t.bigint()))),
    code: label("编码")(searchable(listable(required(index(t.string()))))),
    name: label("名称")(searchable(listable(required(t.string())))),
    start_mode: searchable(listable(required(t.string()))),
    billing_mode: listable(required(t.string())),
    unit_price: listable(required(t.string())),
    duration_seconds: listable(nullable(t.bigint())),
    fault_threshold_json: nullable(t.json()),
    start_command_json: nullable(t.json()),
    status_json: nullable(t.json()),
    extra_json: nullable(t.json()),
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
