import { BaseService, Params } from "thinkts";

export default class Promote_agentService extends BaseService {
  @Params({ tenant_id: "int", id: "int" })
  async getById(opts) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    if (!opts?.id) throw new Error("id is required");
    const row = await this.findOne({ tenant_id: Number(opts.tenant_id), id: Number(opts.id) });
    if (!row?.id) throw new Error("agent not found");
    return row;
  }

  @Params({ tenant_id: "int" })
  async workbench(opts, think) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    const tenant_id = Number(opts.tenant_id);
    const agents = await this.list({ tenant_id });
    const merchantWorkbench = await think.service("iotbiz.merchant.workbench", { tenant_id });
    const deviceOverview = await think.service("iotbiz.device.relationOverview", {
      tenant_id,
      relation_type: "agent",
    });
    const shareOverview = await think.service("iotbiz.revenue.share.receiverOverview", {
      tenant_id,
      receiver_type: "agent",
    });
    const commissionRows = await this.model("promote_commission_record").where({ tenant_id }).select();
  
    const merchantCountByAgent = new Map();
    for (const merchant of merchantWorkbench.rows ?? []) {
      const agentId = Number(merchant.agent_id ?? 0);
      merchantCountByAgent.set(agentId, Number(merchantCountByAgent.get(agentId) ?? 0) + 1);
    }
    const deviceRows = new Map((deviceOverview.rows ?? []).map((row) => [Number(row.relation_id), row]));
    const shareRows = new Map((shareOverview.rows ?? []).map((row) => [Number(row.receiver_id), row]));
    const commissionByAgent = new Map();
    for (const record of commissionRows) {
      const agentId = Number(record.agent_id ?? 0);
      if (!agentId) continue;
      commissionByAgent.set(agentId, Number((Number(commissionByAgent.get(agentId) ?? 0) + Number(record.amount ?? 0)).toFixed(2)));
    }
  
    const rows = agents.map((agent) => {
      const agentId = Number(agent.id);
      const deviceRow = deviceRows.get(agentId);
      const shareRow = shareRows.get(agentId);
      return {
        id: agentId,
        agent_no: agent.agent_no,
        user_id: Number(agent.user_id),
        level_id: Number(agent.level_id),
        parent_agent_id: agent.parent_agent_id == null ? null : Number(agent.parent_agent_id),
        status: agent.status,
        merchant_count: Number(merchantCountByAgent.get(agentId) ?? 0),
        total_devices: Number(deviceRow?.total_devices ?? 0),
        online_devices: Number(deviceRow?.online_devices ?? 0),
        total_sessions: Number(deviceRow?.total_sessions ?? 0),
        total_revenue: Number(deviceRow?.total_revenue ?? 0),
        pending_share: Number(shareRow?.pending_share ?? 0),
        settled_share: Number(shareRow?.settled_share ?? 0),
        total_commission: Number(commissionByAgent.get(agentId) ?? 0),
      };
    }).sort((left, right) => right.total_revenue - left.total_revenue);
  
    return {
      total_agents: rows.length,
      active_agents: rows.filter((row) => String(row.status) === "enabled").length,
      rows,
    };
  }

}
