import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * channel_channel — 
 */
export default defineModel("channel_channel", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    name: label("名称")(listable(searchable(t.string()))),
    code: label("编码")(listable(searchable(index(t.string())))),
    type: label("类型")(listable(t.string())),
    owner_user_id: label("Owner User Id")(listable(searchable(nullable(t.bigint())))),
    status: label("状态")(listable(searchable(t.string()))),
    config_json: jsonSchema(nullable(t.json()), [jsonSchema(t.json(), [{ key: "notes", label: "备注", type: "string", default: "" }])]),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
