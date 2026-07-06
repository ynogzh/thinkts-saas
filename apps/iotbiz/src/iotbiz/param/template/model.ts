import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * iotbiz_param_template — 
 */
export default defineModel("iotbiz_param_template", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    code: label("编码")(listable(searchable(index(t.string())))),
    name: label("名称")(listable(searchable(t.string()))),
    type_id: label("Type Id")(listable(searchable(index(nullable(t.bigint()))))),
    start_mode: label("启动模式")(listable(searchable(t.string()))),
    pricing_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "mode", label: "计费模式", type: "string", default: "mock" }, { key: "unit_price", label: "单价(分)", type: "number", default: 0 }]),
    start_config_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "notes", label: "启动配置", type: "string", default: "" }]),
    metadata_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "notes", label: "备注", type: "string", default: "" }]),
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
