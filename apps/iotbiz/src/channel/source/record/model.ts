import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * channel_source_record — 
 */
export default defineModel("channel_source_record", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    channel_id: label("渠道")(listable(searchable(index(nullable(t.bigint()))))),
    user_id: label("用户")(listable(searchable(index(nullable(t.bigint()))))),
    biz_type: label("业务类型")(listable(nullable(t.string()))),
    biz_id: label("业务ID")(listable(searchable(nullable(t.bigint())))),
    source_url: label("Source Url")(listable(nullable(t.string()))),
    referer: label("Referer")(listable(nullable(t.string()))),
    utm_json: jsonSchema(nullable(t.json()), [jsonSchema(t.json(), [{ key: "notes", label: "Utm Json", type: "string", default: "" }])]),
    created_at: index(t.timestamp())
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
