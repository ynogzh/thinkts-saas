import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * channel_invite_code — 
 */
export default defineModel("channel_invite_code", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    code: label("编码")(listable(searchable(index(t.string())))),
    owner_type: label("Owner Type")(listable(t.string())),
    owner_id: label("Owner Id")(listable(searchable(t.bigint()))),
    channel_id: label("渠道")(listable(searchable(nullable(t.bigint())))),
    status: label("状态")(listable(searchable(t.string()))),
    expire_at: label("到期时间")(listable(nullable(t.timestamp()))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
