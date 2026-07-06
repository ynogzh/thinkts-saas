import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * promote_agent — 
 */
export default defineModel("promote_agent", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    user_id: label("用户")(listable(searchable(index(t.bigint())))),
    agent_no: label("代理编号")(listable(searchable(index(t.string())))),
    level_id: label("等级")(listable(searchable(t.bigint()))),
    parent_agent_id: label("上级代理")(listable(searchable(index(nullable(t.bigint()))))),
    channel_id: label("渠道")(listable(searchable(nullable(t.bigint())))),
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
