import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("platform_tenant", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    name: label("名称")(searchable(listable(required(t.string())))),
    code: label("编码")(searchable(listable(required(index(t.string()))))),
    status: label("状态")(searchable(listable(required(t.string())))),
    admin_user_id: listable(nullable(t.bigint())),
    package_id: listable(nullable(t.bigint())),
    expire_at: label("到期时间")(listable(nullable(t.timestamp()))),
    config_json: nullable(t.json()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {},

  access: {},
});
