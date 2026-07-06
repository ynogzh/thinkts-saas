import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("identity_user", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    username: label("用户名")(searchable(listable(nullable(index(t.string()))))),
    phone: label("手机号")(searchable(listable(nullable(index(t.string()))))),
    email: label("邮箱")(searchable(listable(nullable(index(t.string()))))),
    password_hash: required(t.string()),
    nickname: label("昵称")(searchable(listable(nullable(t.string())))),
    avatar: label("头像")(listable(nullable(t.string()))),
    gender: label("性别")(searchable(listable(nullable(t.string())))),
    user_type: label("用户类型")(searchable(listable(required(t.string())))),
    main_dept_id: listable(nullable(index(t.bigint()))),
    dept_ids_json: nullable(t.json()),
    status: label("状态")(searchable(listable(required(t.string())))),
    last_login_at: label("最后登录")(listable(nullable(t.timestamp()))),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
    deleted_at: nullable(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
    softDelete: true,
  },

  access: {},
});
