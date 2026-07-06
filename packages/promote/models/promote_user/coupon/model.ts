import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("promote_user_coupon", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    user_id: label("用户")(searchable(listable(required(index(t.bigint()))))),
    template_id: listable(required(t.bigint())),
    coupon_no: label("券编号")(listable(required(index(t.string())))),
    status: label("状态")(searchable(listable(required(index(t.string()))))),
    received_at: listable(required(t.timestamp())),
    valid_start_at: listable(required(t.timestamp())),
    valid_end_at: listable(required(index(t.timestamp()))),
    locked_biz_type: listable(nullable(t.string())),
    locked_biz_id: listable(nullable(t.bigint())),
    used_at: listable(nullable(t.timestamp())),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
