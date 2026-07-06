import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * iotbiz_campaign — 
 */
export default defineModel("iotbiz_campaign", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    code: label("编码")(listable(searchable(index(t.string())))),
    name: label("名称")(listable(searchable(t.string()))),
    campaign_type: label("活动类型")(listable(t.string())),
    scene_code: label("场景编码")(listable(index(nullable(t.string())))),
    device_scope_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "notes", label: "设备范围", type: "string", default: "" }]),
    package_scope_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "notes", label: "套餐范围", type: "string", default: "" }]),
    coupon_template_id: label("优惠券模板")(listable(searchable(nullable(t.bigint())))),
    start_at: label("Start At")(listable(nullable(t.timestamp()))),
    end_at: label("End At")(listable(nullable(t.timestamp()))),
    rule_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "rule_type", label: "规则类型", type: "string", default: "" }]),
    status: label("状态")(listable(searchable(index(t.string())))),
    published_at: label("发布时间")(listable(nullable(t.timestamp()))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
