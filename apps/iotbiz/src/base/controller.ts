import { BaseController } from "thinkts";
import { AppModel } from "./model";
import { extractAuth, type AuthInfo } from "./types";

/**
 * Resource CRUD controller.
 * Provides standard create/update/delete/get/list/page/search actions
 * for any table-backed resource.
 */
export default class CrudController extends BaseController {
  /** Resolve the model for the current request context table. */
  protected getModel(name?: string): AppModel {
    const m = this.model(name) as unknown as AppModel;
    if (typeof (m as any).acl === "function") {
      const auth = extractAuth(this.ctx);
      (m as any).acl(auth.role, this.ctx);
    }
    return m;
  }

  protected get auth(): AuthInfo {
    return extractAuth(this.ctx);
  }

  /** Create a new record. */
  async createAction(opts: Record<string, unknown>) {
    const m = this.getModel();
    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(opts)) {
      if (key !== "id" && key !== "created_at" && key !== "updated_at") {
        data[key] = value;
      }
    }
    const id = await m.add(data);
    const record = await m.find(id);
    return this.success({ data: record });
  }

  /** Update existing record(s) by id or ids. */
  async updateAction(opts: Record<string, unknown>) {
    const m = this.getModel();
    const pkField = await m.getPk();
    const ids = opts.ids;
    const pk = opts[pkField];
    const { [pkField]: _, ids: __, created_at, updated_at, ...data } = opts;
    if (Array.isArray(ids) && ids.length > 0) {
      await m.where({ [pkField]: ["IN", ids] }).update(data);
    } else if (pk) {
      await m.where({ [pkField]: pk }).update(data);
    } else {
      return this.fail(400, `Missing ${pkField} or ids`);
    }
    return this.success({ data: {} });
  }

  /** Delete record(s) by id or ids. */
  async deleteAction(opts: Record<string, unknown>) {
    const m = this.getModel();
    const pkField = await m.getPk();
    const ids = opts.ids;
    const pk = opts[pkField];
    if (Array.isArray(ids) && ids.length > 0) {
      await m.where({ [pkField]: ["IN", ids] }).delete();
    } else if (pk) {
      await m.where({ [pkField]: pk }).delete();
    } else {
      return this.fail(400, `Missing ${pkField} or ids`);
    }
    return this.success({ data: {} });
  }

  /** Get single record by id. */
  async getAction(opts: Record<string, unknown>) {
    const m = this.getModel();
    const pkField = await m.getPk();
    const pk = opts[pkField];
    if (!pk) return this.fail(400, `Missing ${pkField}`);
    const record = await m.find(pk);
    return this.success({ data: record });
  }

  /** List all records (no pagination). */
  async listAction(opts: Record<string, unknown> = {}) {
    const m = this.getModel();
    const order = String(opts._order ?? opts.orderBy ?? "id");
    const sort = String(opts._sort ?? opts.sort ?? "desc");
    const records = await m.order(`${order} ${sort}`).select();
    return this.success({ data: records });
  }

  /** Paginated list with optional search. */
  async pageAction(opts: Record<string, unknown>) {
    const m = this.getModel();
    const pkField = await m.getPk();
    const page = Math.max(1, parseInt(String(opts.page ?? 1), 10) || 1);
    const pageSize = Math.min(500, Math.max(1, parseInt(String(opts.pageSize ?? 10), 10) || 10));
    const order = String(opts._order ?? opts.orderBy ?? pkField);
    const sort = String(opts._sort ?? opts.sort ?? "desc");

    const where: Record<string, unknown> = {};
    const skip = new Set(["page", "pageSize", "_order", "_sort", "orderBy", "sort"]);
    for (const [key, value] of Object.entries(opts)) {
      if (skip.has(key)) continue;
      if (value !== undefined && value !== null && value !== "") {
        where[key] = value;
      }
    }

    const total = await m.where(where).count();
    const records = await m.where(where).order(`${order} ${sort}`).page(page, pageSize);

    return this.success({
      data: records,
      pagination: {
        page, pageSize,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / pageSize),
      },
    });
  }

  /** Admin schema — returns field metadata for table configuration. */
  async schemaAction() {
    const m = this.getModel();
    const fields = await m.getAdminFields();
    return this.success({ data: fields });
  }
}
