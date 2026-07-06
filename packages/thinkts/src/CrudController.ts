import type { ThinkContext } from "./types";
import type { Model } from "./model.ts";

/**
 * Generic CRUD controller.
 * Usage: `export default class MyController extends CrudController {}`
 */
export class CrudController {
  ctx: ThinkContext;

  constructor(ctx: ThinkContext) {
    this.ctx = ctx;
  }

  protected model(name?: string, config?: Record<string, unknown>): Model {
    const think = this.ctx.think;
    const modelConfig = think.config("model", {}) as Record<string, unknown>;
    const n = name ?? (this.constructor as unknown as Record<string, unknown>).modelName as string ?? "";
    return think.model(n, { ...modelConfig, ...config, _aclCtx: this.ctx });
  }

  protected success(data: unknown) { return { errno: 0, data }; }
  protected fail(errno: number, errmsg: string) { return { errno, errmsg }; }

  async createAction(opts: Record<string, unknown>) {
    const m = this.model();
    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(opts)) {
      if (key !== "id" && key !== "created_at" && key !== "updated_at") data[key] = value;
    }
    const record = await m.create(data);
    return this.success({ data: record });
  }

  async updateAction(opts: Record<string, unknown>) {
    const m = this.model();
    const pk = opts.id ?? opts.ids;
    const { id, ids, created_at, updated_at, ...data } = opts;
    if (Array.isArray(pk)) {
      await m.where({ id: ["IN", pk] } as unknown as Record<string, unknown>).update(data);
    } else if (pk != null) {
      await m.where({ id: pk } as unknown as Record<string, unknown>).update(data);
    } else {
      return this.fail(400, "Missing id or ids");
    }
    return this.success({ data: {} });
  }

  async deleteAction(opts: Record<string, unknown>) {
    const m = this.model();
    const pk = opts.id ?? opts.ids;
    if (Array.isArray(pk)) {
      await m.where({ id: ["IN", pk] } as unknown as Record<string, unknown>).delete();
    } else if (pk != null) {
      await m.where({ id: pk } as unknown as Record<string, unknown>).delete();
    } else {
      return this.fail(400, "Missing id or ids");
    }
    return this.success({ data: {} });
  }

  async getAction(opts: Record<string, unknown>) {
    const m = this.model();
    const pk = opts.id;
    if (pk == null) return this.fail(400, "Missing id");
    const record = await m.where({ id: pk } as unknown as Record<string, unknown>).find();
    return this.success({ data: record });
  }

  async listAction(opts: Record<string, unknown> = {}) {
    const m = this.model();
    const order = String(opts._order ?? "id");
    const sort = String(opts._sort ?? "desc");
    const records = await m.order(`${order} ${sort}`).select();
    return this.success({ data: records });
  }

  async pageAction(opts: Record<string, unknown>) {
    const m = this.model();
    const page = Math.max(1, parseInt(String(opts.page ?? 1), 10) || 1);
    const pageSize = Math.min(500, Math.max(1, parseInt(String(opts.pageSize ?? 10), 10) || 10));
    const order = String(opts._order ?? "id");
    const sort = String(opts._sort ?? "desc");

    const where: Record<string, unknown> = {};
    const skip = new Set(["page", "pageSize", "_order", "_sort"]);
    for (const [key, value] of Object.entries(opts)) {
      if (skip.has(key)) continue;
      if (value !== undefined && value !== null && value !== "") where[key] = value;
    }

    const total = await m.where(where).count();
    const records = await m.where(where).order(`${order} ${sort}`).page(page, pageSize);

    return this.success({
      data: records,
      pagination: { page, pageSize, total: Number(total), totalPages: Math.ceil(Number(total) / pageSize) },
    });
  }
}
