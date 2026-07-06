import { BaseService, Params } from "thinkts";

export default class TemplateService extends BaseService {
  @Params({ tenant_id: "int", id: "int" })
  async getById(opts: { tenant_id: number; id: number }) {
    const row = await this.findOne({ tenant_id: opts.tenant_id, id: opts.id });
    if (!row?.id) throw new Error("device parameter template not found");
    return row;
  }

  @Params({ tenant_id: "int", device_id: "int" })
  async applyToDevice(opts: { tenant_id: number; device_id: number; id: number }, think: any) {
    const template = await this.getById(opts);
    if (template.status !== "enabled") throw new Error("device parameter template is disabled");
    return think.service("iotbiz.device.applyParamTemplate", {
      tenant_id: opts.tenant_id,
      device_id: opts.device_id,
      template,
    });
  }
}
