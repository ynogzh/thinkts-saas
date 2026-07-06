import { defineModel, t, autoIncrement, index, nullable, primary, required } from "thinkts";

export default defineModel("identity_user", {
  columns: {
    id: index(autoIncrement(primary(t.bigint()))),
    tenant_id: index(required(t.bigint())),
    username: nullable(t.string()),
    phone: nullable(t.string()),
    email: nullable(t.string()),
    password_hash: required(t.string()),
    nickname: nullable(t.string()),
    avatar: nullable(t.string()),
    gender: nullable(t.string()),
    user_type: t.string(),
    main_dept_id: nullable(t.bigint()),
    dept_ids_json: nullable(t.string()),
    status: t.string(),
    last_login_at: nullable(t.timestamp()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
    deleted_at: nullable(t.timestamp())
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
