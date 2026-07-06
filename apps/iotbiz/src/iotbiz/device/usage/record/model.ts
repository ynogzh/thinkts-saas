import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * iotbiz_device_usage_record — 
 */
export default defineModel("iotbiz_device_usage_record", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    user_id: label("用户")(listable(searchable(index(t.bigint())))),
    device_id: label("设备")(listable(searchable(index(t.bigint())))),
    category_id: label("分类")(listable(searchable(index(t.bigint())))),
    session_id: label("会话")(listable(searchable(index(t.bigint())))),
    sku_id: label("SKU")(listable(searchable(nullable(t.bigint())))),
    usage_type: label("用途类型")(listable(t.string())),
    amount: label("金额")(listable(t.decimal())),
    started_at: label("开始时间")(listable(t.timestamp())),
    finished_at: label("完成时间")(listable(nullable(t.timestamp()))),
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
