import { BaseService, Params } from "thinkts";

function buildSettleNo() {
  return `TS${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
}


export default class OrderService extends BaseService {
  @Params({ tenant_id: "int" })
  async listByTenant(opts) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    return await this.list({ tenant_id: Number(opts.tenant_id) });
  }

  @Params({ tenant_id: "int", receiver_type: "int" })
  async createSettlementOrder(opts) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    if (!opts?.receiver_type) throw new Error("receiver_type is required");
    if (opts?.amount === undefined) throw new Error("amount is required");
    return await this.create({
      tenant_id: Number(opts.tenant_id),
      settle_no: String(opts.settle_no || buildSettleNo()),
      settle_type: String(opts.settle_type ?? 'shared_device'),
      receiver_type: String(opts.receiver_type),
      receiver_id: opts.receiver_id == null ? null : Number(opts.receiver_id),
      amount: Number(opts.amount),
      status: opts.status ?? 'pending',
      settled_at: opts.settled_at ?? new Date(),
    });
  }

  @Params({ tenant_id: "int", id: "int" })
  async getById(opts) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    if (!opts?.id) throw new Error("id is required");
    const row = await this.findOne({ tenant_id: Number(opts.tenant_id), id: Number(opts.id) });
    if (!row?.id) throw new Error("settlement order not found");
    return row;
  }

  async markProcessing(opts) {
    const row = await this.service("trade.settle.order.getById", opts);
    if (String(row.status) === "paid") throw new Error("paid settlement can not return to processing");
    await this.update({ tenant_id: Number(row.tenant_id), id: Number(row.id) }, {
      status: "processing",
      updated_at: new Date(),
    });
    return await this.findOne({ tenant_id: Number(row.tenant_id), id: Number(row.id) });
  }

  async markPaid(opts) {
    const row = await this.service("trade.settle.order.getById", opts);
    if (String(row.status) === "failed") throw new Error("failed settlement can not mark paid");
    await this.update({ tenant_id: Number(row.tenant_id), id: Number(row.id) }, {
      status: "paid",
      settled_at: row.settled_at ?? new Date(),
      updated_at: new Date(),
    });
    return await this.findOne({ tenant_id: Number(row.tenant_id), id: Number(row.id) });
  }

  async markFailed(opts) {
    const row = await this.service("trade.settle.order.getById", opts);
    if (String(row.status) === "paid") throw new Error("paid settlement can not fail");
    const tenant_id = Number(row.tenant_id);
    const settleOrderId = Number(row.id);
    const shares = await this.service("iotbiz.revenue.share.listBySettleOrder", { tenant_id, settle_order_id: settleOrderId });
    await this.service("iotbiz.revenue.share.restoreBySettleOrder", { tenant_id, settle_order_id: settleOrderId });
    await this.update({ tenant_id, id: settleOrderId }, {
      status: "failed",
      updated_at: new Date(),
    });
    return {
      settlement: await this.findOne({ tenant_id, id: settleOrderId }),
      restored_shares: shares.length,
    };
  }

  @Params({ tenant_id: "int" })
  async payoutRecords(opts) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    const tenant_id = Number(opts.tenant_id);
    const status = opts?.status ? String(opts.status) : null;
    const rows = await this.list({ tenant_id });
    const filtered = rows.filter((row) => {
      const current = String(row.status ?? "pending");
      if (!status) return current === "processing" || current === "paid";
      return current === status;
    });
    return {
      total_amount: Number(filtered.reduce((sum, row) => sum + Number(row.amount ?? 0), 0).toFixed(2)),
      rows: filtered.sort((left, right) => String(right.updated_at ?? "").localeCompare(String(left.updated_at ?? ""))),
    };
  }

  @Params({ tenant_id: "int" })
  async reconciliationOverview(opts) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    const tenant_id = Number(opts.tenant_id);
    const settlements = await this.list({ tenant_id });
    const shares = await this.service("iotbiz.revenue.share.listAllByTenant", { tenant_id });
    const rows = settlements.map((settlement) => {
      const linkedShares = shares.filter((share) => Number(share.settle_order_id ?? 0) === Number(settlement.id));
      const shareAmount = Number(linkedShares.reduce((sum, share) => sum + Number(share.amount ?? 0), 0).toFixed(2));
      const orderAmount = Number(settlement.amount ?? 0);
      return {
        settlement,
        share_count: linkedShares.length,
        share_amount: shareAmount,
        order_amount: orderAmount,
        diff_amount: Number((orderAmount - shareAmount).toFixed(2)),
        reconciled: Math.abs(orderAmount - shareAmount) < 0.01,
      };
    });
    return {
      rows: rows.sort((left, right) => String(right.settlement.updated_at ?? "").localeCompare(String(left.settlement.updated_at ?? ""))),
      mismatched: rows.filter((row) => !row.reconciled).length,
    };
  }

}
