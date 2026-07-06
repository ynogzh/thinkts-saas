import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("promote_agent_relation", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    ancestor_agent_id: listable(required(index(t.bigint()))),
    descendant_agent_id: listable(required(index(t.bigint()))),
    depth: listable(required(t.bigint())),
    created_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
