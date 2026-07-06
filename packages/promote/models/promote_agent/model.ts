import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("promote_agent", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    user_id: label("用户")(searchable(listable(required(index(t.bigint()))))),
    agent_no: label("代理编号")(searchable(listable(required(index(t.string()))))),
    level_id: listable(required(t.bigint())),
    parent_agent_id: listable(nullable(index(t.bigint()))),
    channel_id: label("渠道")(listable(nullable(t.bigint()))),
    status: label("状态")(searchable(listable(required(t.string())))),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
