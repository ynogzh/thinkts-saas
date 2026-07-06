import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("promote_commission_record", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    agent_id: label("代理")(listable(required(index(t.bigint())))),
    biz_type: label("业务类型")(listable(required(index(t.string())))),
    biz_id: label("业务ID")(listable(required(index(t.bigint())))),
    amount: label("金额")(listable(required(t.string()))),
    commission_amount: listable(required(t.string())),
    status: label("状态")(searchable(listable(required(index(t.string()))))),
    settle_order_id: listable(nullable(t.bigint())),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
