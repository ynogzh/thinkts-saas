import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * iotbiz_device_sku — 
 */
export default defineModel("iotbiz_device_sku", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    category_id: label("分类")(listable(searchable(index(t.bigint())))),
    profile_id: label("档案")(listable(searchable(index(t.bigint())))),
    code: label("编码")(listable(searchable(index(t.string())))),
    name: label("名称")(listable(searchable(t.string()))),
    sale_mode: label("销售模式")(listable(t.string())),
    price: label("单价")(listable(t.decimal())),
    original_price: label("原价")(listable(nullable(t.decimal()))),
    package_quantity: label("Package Quantity")(listable(searchable(nullable(t.bigint())))),
    validity_days: label("有效天数")(listable(searchable(nullable(t.bigint())))),
    benefits_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "name", label: "权益名称", type: "string", default: "" }]),
    extra_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "notes", label: "备注", type: "string", default: "" }]),
    status: label("状态")(listable(searchable(index(t.string())))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
