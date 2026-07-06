import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * event_webhook_config — 
 */
export default defineModel("event_webhook_config", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    module_code: label("模块编码")(listable(nullable(t.string()))),
    event_code: label("Event Code")(listable(index(t.string()))),
    target_url: label("Target Url")(listable(t.string())),
    secret: label("Secret")(listable(nullable(t.string()))),
    status: label("状态")(listable(searchable(index(t.string())))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
