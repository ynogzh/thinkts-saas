import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("iotbiz_package", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    code: label("编码")(searchable(listable(required(index(t.string()))))),
    name: label("名称")(searchable(listable(required(t.string())))),
    package_type: listable(required(t.string())),
    sale_price: listable(required(t.string())),
    recharge_amount: listable(nullable(t.string())),
    bonus_amount: listable(required(t.string())),
    total_times: listable(nullable(t.bigint())),
    total_duration_seconds: listable(nullable(t.bigint())),
    validity_days: listable(nullable(t.bigint())),
    device_type_scope_json: nullable(t.json()),
    benefits_json: nullable(t.json()),
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
