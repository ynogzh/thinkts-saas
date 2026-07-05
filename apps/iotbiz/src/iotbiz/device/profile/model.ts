import { defineModel, t } from "thinkts";

export default defineModel("iotbiz_device_profile", {
  columns: {
    id: t.varchar(255).autoIncrement().required(),
    tenant_id: t.varchar(255).required(),
    category_id: t.varchar(255).required(),
    code: t.varchar(255).required(),
    name: t.varchar(255).required(),
    start_mode: t.varchar(255).required(),
    billing_mode: t.varchar(255).required(),
    unit_price: t.decimal().required(),
    duration_seconds: t.varchar(255).nullable(),
    fault_threshold_json: t.varchar(255).nullable(),
    start_command_json: t.varchar(255).nullable(),
    status_json: t.varchar(255).nullable(),
    extra_json: t.varchar(255).nullable(),
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
