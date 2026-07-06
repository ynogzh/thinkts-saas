import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * promote_coupon_use_record — 
 */
export default defineModel("promote_coupon_use_record", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    user_coupon_id: label("用户优惠券")(listable(searchable(index(t.bigint())))),
    user_id: label("用户")(listable(searchable(t.bigint()))),
    biz_type: label("业务类型")(listable(searchable(index(t.string())))),
    biz_id: label("业务ID")(listable(searchable(index(t.bigint())))),
    discount_amount: label("折扣金额")(listable(t.decimal())),
    status: label("状态")(listable(searchable(t.string()))),
    used_at: label("使用时间")(listable(t.timestamp())),
    created_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
