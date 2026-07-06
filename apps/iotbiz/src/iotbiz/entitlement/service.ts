import { BaseService, Params } from "thinkts";

export default class EntitlementService extends BaseService {
  @Params({ tenant_id: "int", user_id: "int", package_id: "int", package_order_id: "int" })
  async grantPackage(opts, think) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    if (!opts?.user_id) throw new Error("user_id is required");
    if (!opts?.package_id) throw new Error("package_id is required");
    if (!opts?.package_order_id) throw new Error("package_order_id is required");
    const tenant_id = Number(opts.tenant_id);
    const pkg = await think.service("iotbiz.package.getById", { tenant_id, id: Number(opts.package_id) });
    const quantity = Number(opts.quantity ?? 1);
    const expires_at = pkg.validity_days ? new Date(Date.now() + Number(pkg.validity_days) * 86400000) : null;
    return await this.create({
      tenant_id,
      user_id: Number(opts.user_id),
      package_id: Number(pkg.id),
      package_order_id: Number(opts.package_order_id),
      package_type: String(pkg.package_type),
      granted_amount: (Number(pkg.recharge_amount ?? 0) + Number(pkg.bonus_amount ?? 0)) * quantity,
      used_amount: 0,
      remaining_times: Number(pkg.total_times ?? 0) * quantity,
      remaining_duration_seconds: Number(pkg.total_duration_seconds ?? 0) * quantity,
      expires_at,
      status: "enabled",
    });
  }

  @Params({ tenant_id: "int", user_id: "int", package_id: "int" })
  async consumePackage(opts) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    if (!opts?.user_id) throw new Error("user_id is required");
    if (!opts?.package_id) throw new Error("package_id is required");
    const tenant_id = Number(opts.tenant_id);
    const rows = await this.currentModel().where({ tenant_id, user_id: Number(opts.user_id), package_id: Number(opts.package_id), status: "enabled" }).select();
    const entitlement = rows.find((row) => {
      const expired = row.expires_at ? new Date(String(row.expires_at)).getTime() < Date.now() : false;
      if (expired) return false;
      return Number(row.remaining_times ?? 0) > 0 || Number(row.remaining_duration_seconds ?? 0) > 0 || Number(row.granted_amount ?? 0) > Number(row.used_amount ?? 0);
    });
    if (!entitlement?.id) throw new Error("entitlement unavailable");
  
    const update = { used_amount: Number(entitlement.used_amount ?? 0) + Number(opts.consume_amount ?? 0) };
    if (Number(entitlement.remaining_times ?? 0) > 0) {
      update.remaining_times = Number(entitlement.remaining_times) - Number(opts.consume_times ?? 1);
    }
    if (Number(entitlement.remaining_duration_seconds ?? 0) > 0) {
      const consumeDuration = Number(opts.consume_duration_seconds ?? 0);
      if (consumeDuration <= 0) throw new Error("consume_duration_seconds is required");
      if (Number(entitlement.remaining_duration_seconds) < consumeDuration) throw new Error("entitlement duration insufficient");
      update.remaining_duration_seconds = Number(entitlement.remaining_duration_seconds) - consumeDuration;
    }
    if ((Number(update.remaining_times ?? entitlement.remaining_times ?? 0) <= 0) && (Number(update.remaining_duration_seconds ?? entitlement.remaining_duration_seconds ?? 0) <= 0) && Number(update.used_amount ?? 0) >= Number(entitlement.granted_amount ?? 0)) {
      update.status = "exhausted";
    }
    await this.update({ tenant_id, id: Number(entitlement.id) }, update);
    return await this.findOne({ tenant_id, id: Number(entitlement.id) });
  }

  @Params({ tenant_id: "int", entitlement_id: "int" })
  async restoreConsumedPackage(opts) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    if (!opts?.entitlement_id) throw new Error("entitlement_id is required");
    const tenant_id = Number(opts.tenant_id);
    const entitlement = await this.findOne({ tenant_id, id: Number(opts.entitlement_id) });
    if (!entitlement?.id) throw new Error("entitlement not found");
    const update = {
      used_amount: Math.max(0, Number(entitlement.used_amount ?? 0) - Number(opts.restore_amount ?? 0)),
      remaining_times: Number(entitlement.remaining_times ?? 0) + Number(opts.restore_times ?? 0),
      remaining_duration_seconds: Number(entitlement.remaining_duration_seconds ?? 0) + Number(opts.restore_duration_seconds ?? 0),
      status: "enabled",
    };
    await this.update({ tenant_id, id: Number(entitlement.id) }, update);
    return await this.findOne({ tenant_id, id: Number(entitlement.id) });
  }

  @Params({ tenant_id: "int", package_order_id: "int" })
  async revokeGrantedPackage(opts) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    if (!opts?.package_order_id) throw new Error("package_order_id is required");
    const tenant_id = Number(opts.tenant_id);
    const model = this.currentModel();
    const rows = await model.where({ tenant_id, package_order_id: Number(opts.package_order_id), status: "enabled" }).select();
    for (const row of rows) {
      await this.update({ tenant_id, id: Number(row.id) }, {
        status: "revoked",
        remaining_times: 0,
        remaining_duration_seconds: 0,
        used_amount: Number(row.granted_amount ?? row.used_amount ?? 0),
      });
    }
    return await model.where({ tenant_id, package_order_id: Number(opts.package_order_id) }).select();
  }

}
