import { defineModel, t } from "thinkts";

export default defineModel("iotbiz_param_template", {
  columns: {
    id: t.varchar(255).primary().autoIncrement().required().index(),
    tenant_id: t.varchar(255).required().index(),
    code: t.varchar(255).required(),
    name: t.varchar(255).required(),
    type_id: t.varchar(255).nullable(),
    start_mode: t.varchar(255).required(),
    pricing_json: t.varchar(255).nullable(),
    start_config_json: t.varchar(255).nullable(),
    metadata_json: t.varchar(255).nullable(),
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
