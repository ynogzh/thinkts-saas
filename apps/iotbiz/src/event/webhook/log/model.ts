import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * event_webhook_log — 
 */
export default defineModel("event_webhook_log", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    event_code: label("Event Code")(listable(index(t.string()))),
    target_url: label("Target Url")(listable(t.string())),
    payload: label("Payload")(listable(nullable(t.json()))),
    response: label("Response")(listable(nullable(t.text()))),
    status: label("状态")(listable(searchable(t.string()))),
    retry_count: label("Retry Count")(listable(searchable(t.bigint()))),
    created_at: index(t.timestamp())
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
