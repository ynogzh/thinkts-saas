import { defineModel, t, autoIncrement, index, nullable, primary, required } from "thinkts";

export default defineModel("content_article", {
  columns: {
    id: index(autoIncrement(primary(t.bigint()))),
    tenant_id: index(required(t.bigint())),
    module_code: nullable(t.string()),
    category_id: nullable(t.bigint()),
    title: required(t.string()),
    content: nullable(t.text()),
    status: t.string(),
    created_by: nullable(t.bigint()),
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
