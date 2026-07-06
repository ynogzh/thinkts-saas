import { defineModel, t, primary, autoIncrement, required, nullable, unique, index, defaultTo, comment } from "thinkts";

export default defineModel("iotbiz_campaign", {
  columns: {
    id: index(primary(autoIncrement(t.string()))),
    tenant_id: required(index(t.string())),
    code: required(t.string()),
    name: required(t.string()),
    campaign_type: required(t.string()),
    scene_code: nullable(t.string()),
    device_scope_json: nullable(t.string()),
    package_scope_json: nullable(t.string()),
    coupon_template_id: nullable(t.string()),
    start_at: nullable(t.timestamp()),
    end_at: nullable(t.timestamp()),
    rule_json: nullable(t.string()),
    status: required(t.string()),
    published_at: nullable(t.timestamp()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {},

  access: {},
});
