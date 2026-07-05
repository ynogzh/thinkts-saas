import { defineModel, t } from "thinkts";

export default defineModel("iotbiz_merchant", {
  columns: {
    id: t.varchar(255).primary().autoIncrement().required().index(),
    tenant_id: t.varchar(255).required().index(),
    merchant_no: t.varchar(255).required(),
    name: t.varchar(255).required(),
    agent_id: t.varchar(255).required(),
    contact_user_id: t.varchar(255).nullable(),
    contact_name: t.varchar(255).nullable(),
    contact_phone: t.varchar(255).nullable(),
    merchant_share_rate: t.decimal().required(),
    settlement_cycle: t.varchar(255).required(),
    signed_at: t.timestamp().nullable(),
    status: t.varchar(255).required(),
    extra_json: t.varchar(255).nullable(),
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
