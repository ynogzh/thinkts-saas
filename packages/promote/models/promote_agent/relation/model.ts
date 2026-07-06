import { defineModel, t, autoIncrement, index, primary, required } from "thinkts";

export default defineModel("promote_agent_relation", {
  columns: {
    id: index(autoIncrement(primary(t.bigint()))),
    tenant_id: index(required(t.bigint())),
    ancestor_agent_id: required(t.bigint()),
    descendant_agent_id: required(t.bigint()),
    depth: required(t.integer()),
    created_at: required(t.timestamp())
  },

  hooks: {},

  system: {},

  access: {
    "superadmin": {"allow":["select","find","add","update","delete"]},
    "admin": {"allow":["select","find","add","update","delete"]},
    "user": {"allow":["select","find"],"writable":[],"deny":["add","update","delete"]},
    "guest": {"allow":["select","find"],"writable":[],"deny":["add","update","delete"]}
  },
});
