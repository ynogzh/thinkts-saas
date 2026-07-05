import { defineModel, t } from "thinkts";

export default defineModel("mall_order", {
  columns: {
    id: t.varchar(255).primary().autoIncrement().required().index(),
    tenant_id: t.varchar(255).required().index(),
    order_no: t.varchar(255).required(),
    user_id: t.varchar(255).required(),
    amount: t.decimal().required(),
    status: t.varchar(255).required(),
    owner_user_id: t.varchar(255).nullable(),
    dept_id: t.varchar(255).nullable(),
    agent_id: t.varchar(255).nullable(),
    channel_id: t.varchar(255).nullable(),
    created_at: t.timestamp().required(),
    updated_at: t.timestamp().required(),
    deleted_at: t.timestamp().nullable(),
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
