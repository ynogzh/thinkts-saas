import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("iotbiz_device_sku", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    category_id: listable(required(index(t.bigint()))),
    profile_id: listable(required(index(t.bigint()))),
    code: label("编码")(searchable(listable(required(index(t.string()))))),
    name: label("名称")(searchable(listable(required(t.string())))),
    sale_mode: listable(required(t.string())),
    price: label("单价")(listable(required(t.string()))),
    original_price: listable(nullable(t.string())),
    package_quantity: listable(nullable(t.bigint())),
    validity_days: listable(nullable(t.bigint())),
    benefits_json: nullable(t.json()),
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
