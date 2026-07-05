export async function getPrimaryRole(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.user_id) throw new Error("user_id is required");
  const model = this.currentModel();
  model.acl("superadmin", this.ctx);
  return await model.where({ tenant_id: Number(opts.tenant_id), user_id: Number(opts.user_id) }).find();
}

export async function assignUserRole(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.user_id) throw new Error("user_id is required");

  let roleId = opts.role_id ? Number(opts.role_id) : null;
  if (!roleId) {
    const roleCode = String(opts.role_code ?? "").trim();
    if (!roleCode) throw new Error("role_id or role_code is required");
    const role = await this.service("permission.role.getByCode", {
      tenant_id: Number(opts.tenant_id),
      code: roleCode,
    });
    roleId = role?.id ? Number(role.id) : null;
  }
  if (!roleId) {
    throw new Error("role not found");
  }

  const model = this.currentModel();
  model.acl("superadmin", this.ctx);
  const where = { tenant_id: Number(opts.tenant_id), user_id: Number(opts.user_id), role_id: roleId };
  const existing = await model.where(where).find();
  if (existing?.id) return existing;
  const id = await model.add(where);
  return await model.where({ id }).find();
}

export async function assignDefaultRole(opts) {
  const roleCode = String(opts.role_code ?? (opts.user_type === "admin" ? "admin" : "customer"));
  return await this.service("permission.user.role.assignUserRole", {
    tenant_id: Number(opts.tenant_id),
    user_id: Number(opts.user_id),
    role_code: roleCode,
  });
}

function normalizeIds(value, field) {
  if (Array.isArray(value)) return [...new Set(value.map(Number).filter(Boolean))];
  if (typeof value === "string") return [...new Set(value.split(",").map((item) => Number(item.trim())).filter(Boolean))];
  if (value === undefined || value === null) return [];
  throw new Error(`${field} must be an array or comma-separated string`);
}

export async function syncRoleUsers(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.role_id) throw new Error("role_id is required");

  const tenant_id = Number(opts.tenant_id);
  const role_id = Number(opts.role_id);
  const desiredUserIds = normalizeIds(opts.user_ids, "user_ids");
  const desired = new Set(desiredUserIds);
  const model = this.currentModel();
  model.acl("superadmin", this.ctx);

  const existingRows = await model.where({ tenant_id, role_id }).select();
  const existing = new Map(existingRows.map((row) => [Number(row.user_id), row]));

  for (const row of existingRows) {
    if (!desired.has(Number(row.user_id))) await model.where({ id: row.id }).delete();
  }
  for (const user_id of desiredUserIds) {
    if (!existing.has(user_id)) await model.add({ tenant_id, user_id, role_id });
  }

  return {
    role_id,
    user_ids: desiredUserIds,
    rows: await model.where({ tenant_id, role_id }).select(),
  };
}
