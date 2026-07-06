import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * event_record — 
 */
export default defineModel("event_record", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    module_code: label("模块编码")(listable(t.string())),
    event_code: label("Event Code")(listable(index(t.string()))),
    biz_type: label("业务类型")(listable(index(nullable(t.string())))),
    biz_id: label("业务ID")(listable(searchable(index(nullable(t.bigint()))))),
    payload_json: jsonSchema(nullable(t.json()), [jsonSchema(t.json(), [{ key: "notes", label: "Payload Json", type: "string", default: "" }])]),
    status: label("状态")(listable(searchable(index(t.string())))),
    consume_count: label("Consume Count")(listable(searchable(t.bigint()))),
    last_error: label("Last Error")(listable(nullable(t.text()))),
    next_retry_at: label("Next Retry At")(listable(nullable(t.timestamp()))),
    created_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
