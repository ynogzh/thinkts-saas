import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * platform_package — 
 */
export default defineModel("platform_package", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    name: label("名称")(listable(searchable(t.string()))),
    code: label("编码")(listable(searchable(index(unique(t.string()))))),
    price: label("单价")(listable(t.decimal())),
    user_limit: label("User Limit")(listable(searchable(nullable(t.bigint())))),
    storage_limit: label("Storage Limit")(listable(searchable(nullable(t.bigint())))),
    module_codes_json: jsonSchema(nullable(t.json()), [jsonSchema(t.json(), [{ key: "notes", label: "Module Codes Json", type: "string", default: "" }])]),
    status: label("状态")(listable(searchable(t.string()))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
  },

  access: {},
});
