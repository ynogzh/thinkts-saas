export async function getById(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.id) throw new Error("id is required");
  const model = this.currentModel();
  model.acl("superadmin", this.ctx);
  return await model.where({ id: Number(opts.id), tenant_id: Number(opts.tenant_id) }).find();
}

export async function getByCode(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.code) throw new Error("code is required");
  const model = this.currentModel();
  model.acl("superadmin", this.ctx);
  return await model.where({ tenant_id: Number(opts.tenant_id), code: String(opts.code) }).find();
}

export async function ensureRole(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.code) throw new Error("code is required");
  if (!opts?.name) throw new Error("name is required");
  const model = this.currentModel();
  model.acl("superadmin", this.ctx);
  const where = { tenant_id: Number(opts.tenant_id), code: String(opts.code) };
  const existing = await model.where(where).find();
  const payload = { ...where, name: String(opts.name), status: String(opts.status ?? "enabled") };
  if (!existing?.id) {
    const id = await model.add(payload);
    return await model.where({ id }).find();
  }
  if (existing.name !== payload.name || existing.status !== payload.status) {
    await model.where({ id: existing.id }).update(payload);
    return await model.where({ id: existing.id }).find();
  }
  return existing;
}
