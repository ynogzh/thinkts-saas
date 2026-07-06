import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("permission_menu", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    module_code: listable(required(index(t.string()))),
    parent_id: listable(nullable(index(t.bigint()))),
    name: label("名称")(searchable(listable(required(t.string())))),
    path: listable(nullable(t.string())),
    component: listable(nullable(t.string())),
    icon: listable(nullable(t.string())),
    permission_code: listable(nullable(t.string())),
    sort: label("排序")(listable(required(t.bigint()))),
    status: label("状态")(searchable(listable(required(t.string())))),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {},

  access: {},
});
