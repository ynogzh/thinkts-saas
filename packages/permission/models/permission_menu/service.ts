import { BaseService, Params } from "thinkts";

function sameMenu(left, right) {
  return ["parent_id", "path", "component", "icon", "permission_code", "sort", "status"]
    .every((key) => (left?.[key] ?? null) === (right?.[key] ?? null));
}


export default class Permission_menuService extends BaseService {
  async createMenu(opts) {
    return await this.service("permission.menu.ensureMenu", opts);
  }

  @Params({ module_code: "int", name: "int" })
  async ensureMenu(opts) {
    if (!opts?.module_code) throw new Error("module_code is required");
    if (!opts?.name) throw new Error("name is required");
  
    const model = this.currentModel();
    model.acl("superadmin", this.ctx);
    const where = { module_code: String(opts.module_code), name: String(opts.name) };
    const payload = {
      module_code: String(opts.module_code),
      parent_id: opts.parent_id ?? null,
      name: String(opts.name),
      path: opts.path ?? null,
      component: opts.component ?? null,
      icon: opts.icon ?? null,
      permission_code: opts.permission_code ?? null,
      sort: opts.sort ?? null,
      status: opts.status ?? "enabled",
    };
  
    const existing = await model.where(where).find();
    if (!existing?.id) {
      const id = await model.add(payload);
      return await model.where({ id }).find();
    }
    if (!sameMenu(existing, payload)) {
      await model.where({ id: existing.id }).update(payload);
      return await model.where({ id: existing.id }).find();
    }
    return existing;
  }

  async permissionCodesByIds(opts) {
    const ids = Array.isArray(opts?.menu_ids) ? opts.menu_ids.map(Number).filter(Boolean) : [];
    if (!ids.length) return [];
  
    const model = this.currentModel();
    model.acl("superadmin", this.ctx);
    const codes = [];
    for (const id of ids) {
      const row = await model.where({ id }).find();
      if (row?.permission_code) codes.push(String(row.permission_code));
    }
    return [...new Set(codes)];
  }

}
