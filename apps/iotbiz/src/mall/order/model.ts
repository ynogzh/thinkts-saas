import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * mall_order — 
 */
export default defineModel("mall_order", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    order_no: label("订单号")(listable(searchable(index(t.string())))),
    user_id: label("用户")(listable(searchable(index(t.bigint())))),
    amount: label("金额")(listable(t.decimal())),
    status: label("状态")(listable(searchable(t.string()))),
    owner_user_id: label("Owner User Id")(listable(searchable(nullable(t.bigint())))),
    dept_id: label("部门")(listable(searchable(nullable(t.bigint())))),
    agent_id: label("代理")(listable(searchable(index(nullable(t.bigint()))))),
    channel_id: label("渠道")(listable(searchable(index(nullable(t.bigint()))))),
    created_at: t.timestamp(),
    updated_at: t.timestamp(),
    deleted_at: nullable(t.timestamp())
  },

  hooks: {},

  system: {
    tenantAware: true,
    softDelete: true,
  },

  access: {},
});
