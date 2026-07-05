function normalizeJson(value) {
  if (value === undefined || value === null || value === "") return null;
  return typeof value === "string" ? value : JSON.stringify(value);
}

function requireTemplateId(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.id) throw new Error("id is required");
  return { tenant_id: Number(opts.tenant_id), id: Number(opts.id) };
}

export async function beforeCreate(ctx, data) {
  data.created_at = new Date();
  data.updated_at = new Date();
  data.pricing_json = normalizeJson(data.pricing_json);
  data.start_config_json = normalizeJson(data.start_config_json);
  data.metadata_json = normalizeJson(data.metadata_json);
  return data;
}

export async function beforeUpdate(ctx, id, data) {
  data.updated_at = new Date();
  if ("pricing_json" in data) data.pricing_json = normalizeJson(data.pricing_json);
  if ("start_config_json" in data) data.start_config_json = normalizeJson(data.start_config_json);
  if ("metadata_json" in data) data.metadata_json = normalizeJson(data.metadata_json);
  return data;
}

export async function getById(opts) {
  const where = requireTemplateId(opts);
  const row = await this.findOne(where);
  if (!row?.id) throw new Error("device parameter template not found");
  return row;
}

export async function applyToDevice(opts, think) {
  if (!opts?.device_id) throw new Error("device_id is required");
  const template = await getById.call(this, opts);
  if (template.status !== "enabled") throw new Error("device parameter template is disabled");
  return await think.service("iotbiz.device.applyParamTemplate", {
    tenant_id: Number(opts.tenant_id),
    device_id: Number(opts.device_id),
    template,
  });
}
