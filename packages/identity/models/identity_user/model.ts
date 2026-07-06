import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * identity_user — 
 */
export default defineModel("identity_user", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    username: label("用户名")(listable(searchable(index(nullable(t.string()))))),
    phone: label("手机号")(listable(searchable(index(nullable(t.string()))))),
    email: label("邮箱")(listable(searchable(index(nullable(t.string()))))),
    password_hash: t.string(),
    nickname: label("昵称")(listable(searchable(nullable(t.string())))),
    avatar: label("头像")(listable(nullable(t.string()))),
    gender: label("性别")(listable(searchable(nullable(t.string())))),
    user_type: label("用户类型")(listable(searchable(t.string()))),
    main_dept_id: label("主部门")(listable(searchable(index(nullable(t.bigint()))))),
    dept_ids_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "notes", label: "部门列表", type: "string", default: "" }]),
    status: label("状态")(listable(searchable(t.string()))),
    last_login_at: label("最后登录")(listable(nullable(t.timestamp()))),
    created_at: t.timestamp(),
    updated_at: t.timestamp(),
    deleted_at: nullable(t.timestamp())
  },

  hooks: {},

  system: {
    tenantAware: true,
    softDelete: true,
  },

  access: {},
});
