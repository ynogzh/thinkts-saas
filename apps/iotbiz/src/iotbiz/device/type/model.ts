import { defineModel, t } from "thinkts";

export default defineModel("iotbiz_device_type", {
  columns: {
    id: t.varchar(255).primary().autoIncrement().required().index(),
    tenant_id: t.varchar(255).required().index(),
    code: t.varchar(255).required(),
    name: t.varchar(255).required(),
    category: t.varchar(255).required(),
    billing_mode: t.varchar(255).required(),
    default_unit_price: t.decimal().required(),
    default_duration_seconds: t.varchar(255).nullable(),
    start_mode: t.varchar(255).required(),
    config_json: t.varchar(255).nullable(),
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
