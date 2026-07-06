import { defineModel, t, autoIncrement, index, nullable, primary, required } from "thinkts";

export default defineModel("promote_coupon_template", {
  columns: {
    id: index(autoIncrement(primary(t.bigint()))),
    tenant_id: index(required(t.bigint())),
    name: required(t.string()),
    code: required(t.string()),
    coupon_type: required(t.string()),
    face_value: nullable(t.decimal()),
    discount_rate: nullable(t.decimal()),
    threshold_amount: nullable(t.decimal()),
    total_quantity: nullable(t.integer()),
    remaining_quantity: nullable(t.integer()),
    per_user_limit: nullable(t.integer()),
    valid_type: required(t.string()),
    valid_start_at: nullable(t.timestamp()),
    valid_end_at: nullable(t.timestamp()),
    valid_days: nullable(t.integer()),
    scene_code: nullable(t.string()),
    rule_json: nullable(t.string()),
    status: t.string(),
    version: t.integer(),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp())
  },

  hooks: {},

  system: {},

  access: {
    "superadmin": {"allow":["select","find","add","update","delete"]},
    "admin": {"allow":["select","find","add","update","delete"]},
    "user": {"allow":["select","find"],"writable":[],"deny":["add","update","delete"]},
    "guest": {"allow":["select","find"],"writable":[],"deny":["add","update","delete"]}
  },
});
