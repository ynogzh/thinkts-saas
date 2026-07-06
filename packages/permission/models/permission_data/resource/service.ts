import { BaseService, Params } from "thinkts";

export default class ResourceService extends BaseService {
  @Params({ module_code: "int", resource_code: "int", resource_name: "int" })
  async ensureResource(opts) {
    if (!opts?.module_code) throw new Error("module_code is required");
    if (!opts?.resource_code) throw new Error("resource_code is required");
    if (!opts?.resource_name) throw new Error("resource_name is required");
  
    const model = this.currentModel();
    model.acl("superadmin", this.ctx);
    const where = {
      module_code: String(opts.module_code),
      resource_code: String(opts.resource_code),
    };
    const payload = {
      ...where,
      resource_name: String(opts.resource_name),
      tenant_field: opts.tenant_field ?? null,
      owner_field: opts.owner_field ?? null,
      dept_field: opts.dept_field ?? null,
      agent_field: opts.agent_field ?? null,
      region_field: opts.region_field ?? null,
    };
    const existing = await model.where(where).find();
    if (!existing?.id) {
      const id = await model.add(payload);
      return await model.where({ id }).find();
    }
    await model.where({ id: existing.id }).update(payload);
    return await model.where({ id: existing.id }).find();
  }

}
