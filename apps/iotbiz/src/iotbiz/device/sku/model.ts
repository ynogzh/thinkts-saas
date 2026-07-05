import { defineModel, t } from "thinkts";

export default defineModel("iotbiz_device_sku", {
  columns: {
    id: t.varchar(255).autoIncrement().required(),
    tenant_id: t.varchar(255).required(),
    category_id: t.varchar(255).required(),
    profile_id: t.varchar(255).required(),
    code: t.varchar(255).required(),
    name: t.varchar(255).required(),
    sale_mode: t.varchar(255).required(),
    price: t.decimal().required(),
    original_price: t.decimal().nullable(),
    package_quantity: t.varchar(255).nullable(),
    validity_days: t.varchar(255).nullable(),
    benefits_json: t.varchar(255).nullable(),
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
