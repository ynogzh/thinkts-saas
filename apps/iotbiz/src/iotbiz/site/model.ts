import { defineModel, t } from "thinkts";

export default defineModel("iotbiz_site", {
  columns: {
    id: t.varchar(255).primary().autoIncrement().required().index(),
    tenant_id: t.varchar(255).required().index(),
    site_no: t.varchar(255).required(),
    name: t.varchar(255).required(),
    merchant_id: t.varchar(255).required(),
    agent_id: t.varchar(255).required(),
    address: t.varchar(255).nullable(),
    location_label: t.varchar(255).nullable(),
    latitude: t.decimal().nullable(),
    longitude: t.decimal().nullable(),
    contact_name: t.varchar(255).nullable(),
    contact_phone: t.varchar(255).nullable(),
    device_capacity: t.varchar(255).required(),
    status: t.varchar(255).required(),
    metadata_json: t.varchar(255).nullable(),
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
