import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("promote_coupon_template", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    name: label("名称")(searchable(listable(required(t.string())))),
    code: label("编码")(searchable(listable(required(index(t.string()))))),
    coupon_type: listable(required(t.string())),
    face_value: listable(nullable(t.string())),
    discount_rate: listable(nullable(t.string())),
    threshold_amount: listable(nullable(t.string())),
    total_quantity: listable(nullable(t.bigint())),
    remaining_quantity: listable(nullable(t.bigint())),
    per_user_limit: listable(nullable(t.bigint())),
    valid_type: listable(required(t.string())),
    valid_start_at: listable(nullable(t.timestamp())),
    valid_end_at: listable(nullable(t.timestamp())),
    valid_days: listable(nullable(t.bigint())),
    scene_code: listable(nullable(t.string())),
    rule_json: nullable(t.json()),
    status: label("状态")(searchable(listable(required(t.string())))),
    version: listable(required(t.bigint())),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
