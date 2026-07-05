import { defineModel, t } from "thinkts";

export default defineModel("iotbiz_revenue_share", {
  columns: {
    id: t.varchar(255).primary().autoIncrement().required().index(),
    tenant_id: t.varchar(255).required().index(),
    biz_type: t.varchar(255).required(),
    biz_id: t.varchar(255).required(),
    session_id: t.varchar(255).required(),
    trade_order_id: t.varchar(255).required(),
    receiver_type: t.varchar(255).required(),
    receiver_id: t.varchar(255).nullable(),
    rule_type: t.varchar(255).required(),
    rate: t.decimal().required(),
    amount: t.decimal().required(),
    settle_order_id: t.varchar(255).nullable(),
    status: t.varchar(255).required(),
    created_at: t.timestamp().required(),
    updated_at: t.timestamp().required(),
  },

  hooks: {
    // beforeCreate(data, ctx) { return data; },
  },

  system: {
    // tenantAware: true,
  },

  access: {
    // admin: { create: true, read: true, update: true, delete: true },
  },
});
