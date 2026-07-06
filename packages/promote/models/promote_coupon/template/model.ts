import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * promote_coupon_template — 
 */
export default defineModel("promote_coupon_template", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    name: label("名称")(listable(searchable(t.string()))),
    code: label("编码")(listable(searchable(index(t.string())))),
    coupon_type: label("优惠券类型")(listable(t.string())),
    face_value: label("面值")(listable(nullable(t.decimal()))),
    discount_rate: label("折扣率")(listable(nullable(t.decimal()))),
    threshold_amount: label("门槛金额")(listable(nullable(t.decimal()))),
    total_quantity: label("总量")(listable(searchable(nullable(t.bigint())))),
    remaining_quantity: label("剩余量")(listable(searchable(nullable(t.bigint())))),
    per_user_limit: label("每人限制")(listable(searchable(nullable(t.bigint())))),
    valid_type: label("有效类型")(listable(t.string())),
    valid_start_at: label("有效开始")(listable(nullable(t.timestamp()))),
    valid_end_at: label("有效结束")(listable(nullable(t.timestamp()))),
    valid_days: label("有效天数")(listable(searchable(nullable(t.bigint())))),
    scene_code: label("场景编码")(listable(nullable(t.string()))),
    rule_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "rule_type", label: "规则类型", type: "string", default: "" }]),
    status: label("状态")(listable(searchable(t.string()))),
    version: label("版本")(listable(searchable(t.bigint()))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
