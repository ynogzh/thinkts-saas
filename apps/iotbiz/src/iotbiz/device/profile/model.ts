import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * iotbiz_device_profile — 
 */
export default defineModel("iotbiz_device_profile", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    category_id: label("分类")(listable(searchable(index(t.bigint())))),
    code: label("编码")(listable(searchable(index(t.string())))),
    name: label("名称")(listable(searchable(t.string()))),
    start_mode: label("启动模式")(listable(searchable(t.string()))),
    billing_mode: label("计费模式")(listable(t.string())),
    unit_price: label("单价")(listable(t.decimal())),
    duration_seconds: label("时长(秒)")(listable(searchable(nullable(t.bigint())))),
    fault_threshold_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "notes", label: "故障阈值", type: "string", default: "" }]),
    start_command_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "notes", label: "Start Command Json", type: "string", default: "" }]),
    status_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "notes", label: "备注", type: "string", default: "" }]),
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
