import { defineModel, t } from "thinkts";

export default defineModel("iotbiz_command_log", {
  columns: {
    id: t.varchar(255).primary().autoIncrement().required().index(),
    tenant_id: t.varchar(255).required().index(),
    device_id: t.varchar(255).required(),
    session_id: t.varchar(255).nullable(),
    command_type: t.varchar(255).required(),
    request_payload_json: t.varchar(255).nullable(),
    response_payload_json: t.varchar(255).nullable(),
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
