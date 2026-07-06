import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * promote_user_coupon — 
 */
export default defineModel("promote_user_coupon", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    user_id: label("用户")(listable(searchable(index(t.bigint())))),
    template_id: label("模板")(listable(searchable(t.bigint()))),
    coupon_no: label("券编号")(listable(index(t.string()))),
    status: label("状态")(listable(searchable(index(t.string())))),
    received_at: label("领取时间")(listable(t.timestamp())),
    valid_start_at: label("有效开始")(listable(t.timestamp())),
    valid_end_at: label("有效结束")(listable(index(t.timestamp()))),
    locked_biz_type: label("Locked Biz Type")(listable(nullable(t.string()))),
    locked_biz_id: label("Locked Biz Id")(listable(searchable(nullable(t.bigint())))),
    used_at: label("使用时间")(listable(nullable(t.timestamp()))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
