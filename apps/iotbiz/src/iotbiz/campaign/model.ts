import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("iotbiz_campaign", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    code: label("编码")(searchable(listable(required(index(t.string()))))),
    name: label("名称")(searchable(listable(required(t.string())))),
    campaign_type: listable(required(t.string())),
    scene_code: listable(nullable(index(t.string()))),
    device_scope_json: nullable(t.json()),
    package_scope_json: nullable(t.json()),
    coupon_template_id: listable(nullable(t.bigint())),
    start_at: label("开始时间")(listable(nullable(t.timestamp()))),
    end_at: label("结束时间")(listable(nullable(t.timestamp()))),
    rule_json: nullable(t.json()),
    status: label("状态")(searchable(listable(required(index(t.string()))))),
    published_at: listable(nullable(t.timestamp())),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
