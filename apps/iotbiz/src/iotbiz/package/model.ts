import { defineModel, t } from "thinkts";

export default defineModel("iotbiz_package", {
  columns: {
    id: t.varchar(255).primary().autoIncrement().required().index(),
    tenant_id: t.varchar(255).required().index(),
    code: t.varchar(255).required(),
    name: t.varchar(255).required(),
    package_type: t.varchar(255).required(),
    sale_price: t.decimal().required(),
    recharge_amount: t.decimal().nullable(),
    bonus_amount: t.decimal().required(),
    total_times: t.varchar(255).nullable(),
    total_duration_seconds: t.varchar(255).nullable(),
    validity_days: t.varchar(255).nullable(),
    device_type_scope_json: t.varchar(255).nullable(),
    benefits_json: t.varchar(255).nullable(),
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
