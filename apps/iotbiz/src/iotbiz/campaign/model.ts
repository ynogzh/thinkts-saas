import { defineModel, t } from "thinkts";

export default defineModel("iotbiz_campaign", {
  columns: {
    id: t.varchar(255).primary().autoIncrement().required().index(),
    tenant_id: t.varchar(255).required().index(),
    code: t.varchar(255).required(),
    name: t.varchar(255).required(),
    campaign_type: t.varchar(255).required(),
    scene_code: t.varchar(255).nullable(),
    device_scope_json: t.varchar(255).nullable(),
    package_scope_json: t.varchar(255).nullable(),
    coupon_template_id: t.varchar(255).nullable(),
    start_at: t.timestamp().nullable(),
    end_at: t.timestamp().nullable(),
    rule_json: t.varchar(255).nullable(),
    status: t.varchar(255).required(),
    published_at: t.timestamp().nullable(),
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
