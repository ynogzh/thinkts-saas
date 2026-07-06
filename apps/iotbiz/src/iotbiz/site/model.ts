import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * iotbiz_site — 
 */
export default defineModel("iotbiz_site", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    site_no: label("站点编号")(listable(index(t.string()))),
    name: label("名称")(listable(searchable(t.string()))),
    merchant_id: label("商户")(listable(searchable(index(t.bigint())))),
    agent_id: label("代理")(listable(searchable(t.bigint()))),
    address: label("地址")(listable(nullable(t.string()))),
    location_label: label("位置")(listable(nullable(t.string()))),
    latitude: label("纬度")(listable(nullable(t.decimal()))),
    longitude: label("经度")(listable(nullable(t.decimal()))),
    contact_name: label("联系人")(listable(nullable(t.string()))),
    contact_phone: label("联系电话")(listable(nullable(t.string()))),
    device_capacity: label("设备容量")(listable(searchable(t.bigint()))),
    status: label("状态")(listable(searchable(t.string()))),
    metadata_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "notes", label: "备注", type: "string", default: "" }]),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
