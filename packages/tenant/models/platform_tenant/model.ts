import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * platform_tenant — 
 */
export default defineModel("platform_tenant", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    name: label("名称")(listable(searchable(t.string()))),
    code: label("编码")(listable(searchable(index(unique(t.string()))))),
    status: label("状态")(listable(searchable(t.string()))),
    admin_user_id: label("Admin User Id")(listable(searchable(nullable(t.bigint())))),
    package_id: label("Package Id")(listable(searchable(nullable(t.bigint())))),
    expire_at: label("到期时间")(listable(nullable(t.timestamp()))),
    config_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "notes", label: "备注", type: "string", default: "" }]),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
  },

  access: {},
});
