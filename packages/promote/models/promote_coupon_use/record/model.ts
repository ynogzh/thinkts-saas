import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("promote_coupon_use_record", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    user_coupon_id: listable(required(index(t.bigint()))),
    user_id: label("用户")(searchable(listable(required(t.bigint())))),
    biz_type: label("业务类型")(listable(required(index(t.string())))),
    biz_id: label("业务ID")(listable(required(index(t.bigint())))),
    discount_amount: listable(required(t.string())),
    status: label("状态")(searchable(listable(required(t.string())))),
    used_at: listable(required(t.timestamp())),
    created_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
