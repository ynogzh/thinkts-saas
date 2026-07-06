import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * promote_agent_relation — 
 */
export default defineModel("promote_agent_relation", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    ancestor_agent_id: label("Ancestor Agent Id")(listable(searchable(index(t.bigint())))),
    descendant_agent_id: label("Descendant Agent Id")(listable(searchable(index(t.bigint())))),
    depth: label("深度")(listable(searchable(t.bigint()))),
    created_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
