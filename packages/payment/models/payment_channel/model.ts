import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * payment_channel — 
 */
export default defineModel("payment_channel", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    channel_code: label("渠道编码")(listable(index(t.string()))),
    channel_name: label("渠道名称")(listable(t.string())),
    provider: label("Provider")(listable(t.string())),
    config_json: t.json(),  // jsonSchema(t.json(), [{ key: "notes", label: "备注", type: "string", default: "" }]),
    status: label("状态")(listable(searchable(t.string()))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
