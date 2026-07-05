function now() {
  return new Date();
}

function normalizeJson(value) {
  if (value === undefined || value === null || value === "") return null;
  return typeof value === "string" ? value : JSON.stringify(value);
}

function requireCampaignId(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.id) throw new Error("id is required");
  return { tenant_id: Number(opts.tenant_id), id: Number(opts.id) };
}

export async function beforeCreate(ctx, data) {
  data.created_at = new Date();
  data.updated_at = new Date();
  data.device_scope_json = normalizeJson(data.device_scope_json);
  data.package_scope_json = normalizeJson(data.package_scope_json);
  data.rule_json = normalizeJson(data.rule_json);
  return data;
}

export async function beforeUpdate(ctx, id, data) {
  data.updated_at = new Date();
  if ("device_scope_json" in data) data.device_scope_json = normalizeJson(data.device_scope_json);
  if ("package_scope_json" in data) data.package_scope_json = normalizeJson(data.package_scope_json);
  if ("rule_json" in data) data.rule_json = normalizeJson(data.rule_json);
  return data;
}

export async function getById(opts) {
  const where = requireCampaignId(opts);
  const row = await this.findOne(where);
  if (!row?.id) throw new Error("campaign not found");
  return row;
}

export async function publishCampaign(opts) {
  const where = requireCampaignId(opts);
  const row = await getById.call(this, where);
  if (row.status === "archived") throw new Error("archived campaign cannot be published");
  await this.update(where, { status: "active", published_at: now() });
  return await getById.call(this, where);
}

export async function pauseCampaign(opts) {
  const where = requireCampaignId(opts);
  await getById.call(this, where);
  await this.update(where, { status: "paused" });
  return await getById.call(this, where);
}

export async function activeCampaigns(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  const tenant_id = Number(opts.tenant_id);
  const scene_code = opts?.scene_code ? String(opts.scene_code) : undefined;
  const rows = await this.list(scene_code ? { tenant_id, status: "active", scene_code } : { tenant_id, status: "active" });
  const current = Date.now();
  return rows.filter((row) => {
    const starts = row.start_at ? new Date(row.start_at).getTime() : 0;
    const ends = row.end_at ? new Date(row.end_at).getTime() : Number.POSITIVE_INFINITY;
    return starts <= current && ends >= current;
  });
}
