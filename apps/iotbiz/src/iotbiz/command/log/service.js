export async function createCommandLog(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.device_id) throw new Error("device_id is required");
  if (!opts?.command_type) throw new Error("command_type is required");
  return await this.create({
    tenant_id: Number(opts.tenant_id),
    device_id: Number(opts.device_id),
    session_id: opts.session_id ? Number(opts.session_id) : null,
    command_type: String(opts.command_type),
    request_payload_json: opts.request_payload_json ?? null,
    response_payload_json: opts.response_payload_json ?? null,
    status: opts.status ?? "pending",
  });
}
