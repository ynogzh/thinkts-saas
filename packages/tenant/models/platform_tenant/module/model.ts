import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("platform_tenant_module", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    module_code: listable(required(index(t.string()))),
    status: label("状态")(searchable(listable(required(t.string())))),
    expire_at: label("到期时间")(listable(nullable(t.timestamp()))),
    limit_json: nullable(t.json()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
