import { defineModel, t } from "thinkts";

export default defineModel("iotbiz_entitlement", {
  columns: {
    id: t.varchar(255).primary().autoIncrement().required().index(),
    tenant_id: t.varchar(255).required().index(),
    user_id: t.varchar(255).required(),
    package_id: t.varchar(255).required(),
    package_order_id: t.varchar(255).required(),
    package_type: t.varchar(255).required(),
    granted_amount: t.decimal().required(),
    used_amount: t.decimal().required(),
    remaining_times: t.varchar(255).required(),
    remaining_duration_seconds: t.varchar(255).required(),
    expires_at: t.timestamp().nullable(),
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
