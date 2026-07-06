import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("content_category", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    module_code: listable(nullable(t.string())),
    parent_id: listable(nullable(t.bigint())),
    name: label("名称")(searchable(listable(required(t.string())))),
    code: label("编码")(searchable(listable(nullable(index(t.string()))))),
    sort: label("排序")(listable(required(t.bigint()))),
    status: label("状态")(searchable(listable(required(t.string())))),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
