export async function createCommissionRecord(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.agent_id) throw new Error("agent_id is required");
  if (opts?.amount === undefined) throw new Error("amount is required");
  if (!opts?.biz_type) throw new Error("biz_type is required");
  if (opts?.biz_id === undefined || opts?.biz_id === null) throw new Error("biz_id is required");
  return await this.create({
    tenant_id: Number(opts.tenant_id),
    agent_id: Number(opts.agent_id),
    biz_type: String(opts.biz_type),
    biz_id: Number(opts.biz_id),
    amount: Number(opts.amount),
    commission_amount: Number(opts.amount),
    status: opts.status ?? "pending",
    settle_order_id: opts.settle_order_id == null ? null : Number(opts.settle_order_id),
  });
}

export async function reverseByBiz(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.biz_type) throw new Error("biz_type is required");
  if (opts?.biz_id === undefined || opts?.biz_id === null) throw new Error("biz_id is required");
  const tenant_id = Number(opts.tenant_id);
  const model = this.currentModel();
  const rows = await model.where({ tenant_id, biz_type: String(opts.biz_type), biz_id: Number(opts.biz_id) }).select();
  const updates = [];
  for (const row of rows) {
    if (String(row.status) === "reversed") continue;
    await this.update({ tenant_id, id: Number(row.id) }, { status: "reversed", updated_at: new Date() });
    updates.push(await this.findOne({ tenant_id, id: Number(row.id) }));
  }
  return updates;
}
