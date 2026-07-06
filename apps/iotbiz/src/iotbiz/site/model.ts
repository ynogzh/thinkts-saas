import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("iotbiz_site", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    site_no: label("站点编号")(searchable(listable(required(index(t.string()))))),
    name: label("名称")(searchable(listable(required(t.string())))),
    merchant_id: label("商户")(searchable(listable(required(index(t.bigint()))))),
    agent_id: label("代理")(listable(required(t.bigint()))),
    address: listable(nullable(t.string())),
    location_label: listable(nullable(t.string())),
    latitude: listable(nullable(t.string())),
    longitude: listable(nullable(t.string())),
    contact_name: listable(nullable(t.string())),
    contact_phone: listable(nullable(t.string())),
    device_capacity: listable(required(t.bigint())),
    status: label("状态")(searchable(listable(required(t.string())))),
    metadata_json: nullable(t.json()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
