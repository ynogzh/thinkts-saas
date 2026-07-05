import { defineModel, t } from "thinkts";

export default defineModel("iotbiz_device_usage_record", {
  columns: {
    id: t.varchar(255).autoIncrement().required(),
    tenant_id: t.varchar(255).required(),
    user_id: t.varchar(255).required(),
    device_id: t.varchar(255).required(),
    category_id: t.varchar(255).required(),
    session_id: t.varchar(255).required(),
    sku_id: t.varchar(255).nullable(),
    usage_type: t.varchar(255).required(),
    amount: t.decimal().required(),
    started_at: t.timestamp().required(),
    finished_at: t.timestamp().nullable(),
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
