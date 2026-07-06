import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * iotbiz_package — 
 */
export default defineModel("iotbiz_package", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    code: label("编码")(listable(searchable(index(t.string())))),
    name: label("名称")(listable(searchable(t.string()))),
    package_type: label("套餐类型")(listable(t.string())),
    sale_price: label("Sale Price")(listable(t.decimal())),
    recharge_amount: label("充值金额")(listable(nullable(t.decimal()))),
    bonus_amount: label("赠送金额")(listable(t.decimal())),
    total_times: label("总次数")(listable(searchable(nullable(t.bigint())))),
    total_duration_seconds: label("总时长(秒)")(listable(searchable(nullable(t.bigint())))),
    validity_days: label("有效天数")(listable(searchable(nullable(t.bigint())))),
    device_type_scope_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "notes", label: "Device Type Scope Json", type: "string", default: "" }]),
    benefits_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "name", label: "权益名称", type: "string", default: "" }]),
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
