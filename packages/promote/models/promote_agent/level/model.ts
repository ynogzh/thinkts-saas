import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * promote_agent_level — 
 */
export default defineModel("promote_agent_level", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    name: label("名称")(listable(searchable(t.string()))),
    level: label("等级")(listable(searchable(index(t.bigint())))),
    commission_rate: label("佣金率")(listable(t.decimal())),
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
