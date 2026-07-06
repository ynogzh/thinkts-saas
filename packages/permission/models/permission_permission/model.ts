import { defineModel, t, autoIncrement, index, nullable, primary, required, unique } from "thinkts";

export default defineModel("permission_permission", {
  columns: {
    id: index(autoIncrement(primary(t.bigint()))),
    module_code: index(required(t.string())),
    code: index(unique(required(t.string()))),
    name: required(t.string()),
    type: required(t.string()),
    parent_code: nullable(t.string()),
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
