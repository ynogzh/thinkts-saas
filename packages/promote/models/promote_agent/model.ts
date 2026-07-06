import { defineModel, t, autoIncrement, index, nullable, primary, required } from "thinkts";

export default defineModel("promote_agent", {
  columns: {
    id: index(autoIncrement(primary(t.bigint()))),
    tenant_id: index(required(t.bigint())),
    user_id: required(t.bigint()),
    agent_no: required(t.string()),
    level_id: required(t.bigint()),
    parent_agent_id: nullable(t.bigint()),
    channel_id: nullable(t.bigint()),
    status: t.string(),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp())
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
