import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("mall_order", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    order_no: label("订单号")(searchable(listable(required(index(t.string()))))),
    user_id: label("用户")(searchable(listable(required(index(t.bigint()))))),
    amount: label("金额")(listable(required(t.string()))),
    status: label("状态")(searchable(listable(required(t.string())))),
    owner_user_id: listable(nullable(t.bigint())),
    dept_id: label("部门")(listable(nullable(t.bigint()))),
    agent_id: label("代理")(listable(nullable(index(t.bigint())))),
    channel_id: label("渠道")(listable(nullable(index(t.bigint())))),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
    deleted_at: nullable(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
    softDelete: true,
  },

  access: {},
});
