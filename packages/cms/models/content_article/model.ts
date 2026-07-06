import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("content_article", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    module_code: listable(nullable(t.string())),
    category_id: listable(nullable(index(t.bigint()))),
    title: label("标题")(searchable(listable(required(t.string())))),
    content: listable(nullable(t.text())),
    status: label("状态")(searchable(listable(required(index(t.string()))))),
    created_by: listable(nullable(t.bigint())),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
