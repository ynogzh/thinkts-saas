import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * content_article — 
 */
export default defineModel("content_article", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    module_code: label("模块编码")(listable(nullable(t.string()))),
    category_id: label("分类")(listable(searchable(index(nullable(t.bigint()))))),
    title: label("标题")(listable(searchable(t.string()))),
    content: label("内容")(listable(nullable(t.text()))),
    status: label("状态")(listable(searchable(index(t.string())))),
    created_by: label("Created By")(listable(searchable(nullable(t.bigint())))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
