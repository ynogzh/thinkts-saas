import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * iotbiz_device_type — 
 */
export default defineModel("iotbiz_device_type", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    code: label("编码")(listable(searchable(index(t.string())))),
    name: label("名称")(listable(searchable(t.string()))),
    category: label("Category")(listable(t.string())),
    billing_mode: label("计费模式")(listable(t.string())),
    default_unit_price: label("Default Unit Price")(listable(t.decimal())),
    default_duration_seconds: label("Default Duration Seconds")(listable(searchable(nullable(t.bigint())))),
    start_mode: label("启动模式")(listable(searchable(t.string()))),
    config_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "notes", label: "备注", type: "string", default: "" }]),
    status: label("状态")(listable(searchable(t.string()))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
