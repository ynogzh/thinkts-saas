export async function getRateForBiz(opts, think) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.agent_id) throw new Error("agent_id is required");
  if (!opts?.biz_type) throw new Error("biz_type is required");
  const tenant_id = Number(opts.tenant_id);
  const agent = await think.service('promote.agent.getById', { tenant_id, id: Number(opts.agent_id) });
  const row = await this.findOne({ tenant_id, biz_type: String(opts.biz_type), level_id: Number(agent.level_id), status: 'enabled' });
  return Number(row?.rate ?? 0);
}
