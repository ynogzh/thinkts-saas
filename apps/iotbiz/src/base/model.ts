import { Model } from "thinkts";
import type { AdminField } from "./types";
import { introspectAdminFields } from "./schema";

/**
 * Base model with admin schema introspection.
 * Extends ThinkTS Model with table-level metadata discovery.
 */
export class AppModel extends Model {
  private _adminFieldsCache?: AdminField[];

  /** Introspect and return admin field metadata for this model's table. */
  async getAdminFields(): Promise<AdminField[]> {
    if (this._adminFieldsCache) return this._adminFieldsCache;
    this._adminFieldsCache = await introspectAdminFields(this.db as any, this.tableName);
    return this._adminFieldsCache;
  }

  /** Clear cached admin fields (call after DDL changes). */
  clearAdminCache(): void {
    this._adminFieldsCache = undefined;
  }
}
