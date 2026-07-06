import { defineModel, t, autoIncrement, index, nullable, primary, required } from "thinkts";

export default defineModel("identity_dept", {
  columns: {
    id: index(autoIncrement(primary(t.bigint()))),
    tenant_id: index(required(t.bigint())),
    parent_id: nullable(t.bigint()),
    name: required(t.string()),
    code: nullable(t.string()),
    path: nullable(t.string()),
    sort: t.integer(),
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
    "guest": {"allow":["select","find","add","update","delete"],"writable":null,"readable":null}
  },
});
