import { defineModel, t } from "thinkts";

export default defineModel("iotbiz_device", {
  columns: {
    id: t.varchar(255).primary().autoIncrement().required().index(),
    tenant_id: t.varchar(255).required().index(),
    device_no: t.varchar(255).required(),
    name: t.varchar(255).required(),
    merchant_id: t.varchar(255).required(),
    agent_id: t.varchar(255).required(),
    type_id: t.varchar(255).required(),
    location_label: t.varchar(255).nullable(),
    online_status: t.varchar(255).required(),
    start_mode: t.varchar(255).required(),
    pricing_json: t.varchar(255).nullable(),
    start_config_json: t.varchar(255).nullable(),
    last_heartbeat_at: t.timestamp().nullable(),
    last_start_at: t.timestamp().nullable(),
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
