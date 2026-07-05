import { defineModel, t, primary, autoIncrement, unique, required, nullable, label, listable } from "thinkts";

// DSL version of platform_tenant — replaces model.json + table.json + acl.json
export default defineModel("platform_tenant", {
  columns: {
    id: primary(autoIncrement(t.bigint())),
    code: label("编码")(required(unique(t.string(64)))),
    name: label("名称")(required(listable(t.string(128)))),
    status: label("状态")(listable(t.string(32))),
    admin_user_id: nullable(t.bigint("admin_user_id")),
    package_id: nullable(t.bigint("package_id")),
    expire_at: label("到期")(nullable(t.timestamp("expire_at"))),
    config_json: nullable(t.json("config_json")),
    created_at: required(t.timestamp("created_at")),
    updated_at: required(t.timestamp("updated_at")),
  },

  system: {
    softDelete: false,
  },

  access: {
    operator: ["select", "find", "add", "update", "delete"],
    merchant: ["select", "find"],
  },
});
