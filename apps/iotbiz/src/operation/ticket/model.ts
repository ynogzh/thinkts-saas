import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * operation_ticket — 
 */
export default defineModel("operation_ticket", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    user_id: label("用户")(listable(searchable(index(t.bigint())))),
    title: label("标题")(listable(searchable(t.string()))),
    content: label("内容")(listable(nullable(t.text()))),
    status: label("状态")(listable(searchable(index(t.string())))),
    priority: label("Priority")(listable(nullable(t.string()))),
    biz_type: label("业务类型")(listable(index(nullable(t.string())))),
    biz_id: label("业务ID")(listable(searchable(index(nullable(t.bigint()))))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
