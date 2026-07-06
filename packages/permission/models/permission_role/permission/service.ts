import { BaseService, Params } from "thinkts";

function normalizeCodes(value, field) {
  if (Array.isArray(value)) return [...new Set(value.map((item) => String(item).trim()).filter(Boolean))];
  if (typeof value === "string") return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
  if (value === undefined || value === null) return [];
  throw new Error(`${field} must be an array or comma-separated string`);
}

function normalizeIds(value) {
  if (Array.isArray(value)) return [...new Set(value.map(Number).filter(Boolean))];
  if (typeof value === "string") return [...new Set(value.split(",").map((item) => Number(item.trim())).filter(Boolean))];
  return [];
}


export default class PermissionService extends BaseService {
  @Params({ tenant_id: "int", role_id: "int" })
  async syncRolePermissions(opts) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    if (!opts?.role_id) throw new Error("role_id is required");
  
    const tenant_id = Number(opts.tenant_id);
    const role_id = Number(opts.role_id);
    const directCodes = normalizeCodes(opts.permission_codes, "permission_codes");
    const menuIds = normalizeIds(opts.menu_ids);
    const menuCodes = menuIds.length ? await this.service("permission.menu.permissionCodesByIds", { menu_ids: menuIds }) : [];
    const permissionCodes = [...new Set([...directCodes, ...menuCodes].map((code) => String(code).trim()).filter(Boolean))];
    const desired = new Set(permissionCodes);
    const model = this.currentModel();
    model.acl("superadmin", this.ctx);
  
    const existingRows = await model.where({ tenant_id, role_id }).select();
    const existing = new Map(existingRows.map((row) => [String(row.permission_code), row]));
  
    for (const row of existingRows) {
      if (!desired.has(String(row.permission_code))) await model.where({ id: row.id }).delete();
    }
    for (const permission_code of permissionCodes) {
      if (!existing.has(permission_code)) await model.add({ tenant_id, role_id, permission_code });
    }
  
    return {
      role_id,
      permission_codes: permissionCodes,
      rows: await model.where({ tenant_id, role_id }).select(),
    };
  }

}
