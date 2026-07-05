export async function getById(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.id) throw new Error("id is required");
  const row = await this.findOne({ tenant_id: Number(opts.tenant_id), id: Number(opts.id) });
  if (!row?.id) throw new Error("member package not found");
  return row;
}
