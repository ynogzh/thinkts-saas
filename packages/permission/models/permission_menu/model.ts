import { defineModel, t, autoIncrement, index, nullable, primary, required } from "thinkts";

export default defineModel("permission_menu", {
  columns: {
    id: index(autoIncrement(primary(t.bigint()))),
    module_code: index(required(t.string())),
    parent_id: nullable(t.bigint()),
    name: required(t.string()),
    path: nullable(t.string()),
    component: nullable(t.string()),
    icon: nullable(t.string()),
    permission_code: nullable(t.string()),
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
