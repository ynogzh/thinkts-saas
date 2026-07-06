import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * promote_commission_record — 
 */
export default defineModel("promote_commission_record", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    agent_id: label("代理")(listable(searchable(index(t.bigint())))),
    biz_type: label("业务类型")(listable(index(t.string()))),
    biz_id: label("业务ID")(listable(searchable(index(t.bigint())))),
    amount: label("金额")(listable(t.decimal())),
    commission_amount: label("佣金金额")(listable(t.decimal())),
    status: label("状态")(listable(searchable(index(t.string())))),
    settle_order_id: label("结算单")(listable(searchable(nullable(t.bigint())))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
