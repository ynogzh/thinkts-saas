export async function ensureScope(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.role_id) throw new Error("role_id is required");
  if (!opts?.scope_type) throw new Error("scope_type is required");

  const model = this.currentModel();
  model.acl("superadmin", this.ctx);
  const where = {
    tenant_id: Number(opts.tenant_id),
    role_id: Number(opts.role_id),
    resource_code: String(opts.resource_code ?? "*"),
  };
  const payload = {
    tenant_id: Number(opts.tenant_id),
    role_id: Number(opts.role_id),
    module_code: String(opts.module_code ?? "*"),
    resource_code: String(opts.resource_code ?? "*"),
    scope_type: String(opts.scope_type),
    scope_value_json: opts.scope_value_json ?? null,
  };
  const existing = await model.where(where).find();
  if (!existing?.id) {
    const id = await model.add(payload);
    return await model.where({ id }).find();
  }
  await model.where({ id: existing.id }).update(payload);
  return await model.where({ id: existing.id }).find();
}
