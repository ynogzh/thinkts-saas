import type { ThinkContext } from "../types";
import { BaseService, bindServiceContext } from "../service";
import type { DslModelEntry, DslServiceEntry, ServiceHookName, DslAclEntry } from "./registry";
import type { AclConfig, AclRule } from "../acl";

/**
 * DSL helpers: hooks, CRUD utilities, timestamp defaults, and ACL config builder.
 */

function normalizeJson(val: unknown): unknown {
  if (val === undefined || val === null || val === "") return null;
  if (typeof val === "string") return val; // already a string
  return JSON.stringify(val);
}

/** Built-in hooks — always run before user hooks. */
const BUILT_IN_HOOKS: Partial<Record<ServiceHookName, (data: Record<string, unknown>, modelEntry: DslModelEntry) => void>> = {
  beforeCreate(data, modelEntry) {
    const now = new Date();
    if ("created_at" in data) data.created_at = now;
    if ("updated_at" in data) data.updated_at = now;
    applyJsonNormalize(data, modelEntry);
  },
  beforeUpdate(data, modelEntry) {
    if ("updated_at" in data) data.updated_at = new Date();
    applyJsonNormalize(data, modelEntry);
  },
  beforeDelete(record, modelEntry) {
    if (modelEntry.dsl.option?.softDeletes && "deleted_at" in record) {
      (record as Record<string, unknown>).deleted_at = new Date();
    }
  },
};

function applyJsonNormalize(data: Record<string, unknown>, modelEntry: DslModelEntry) {
  for (const col of modelEntry.dsl.columns) {
    if (col.type === "json" && col.name in data) {
      data[col.name] = normalizeJson(data[col.name]);
    }
  }
}

export async function callDslHook<T>(
  ctx: ThinkContext,
  modelEntry: DslModelEntry,
  serviceEntry: DslServiceEntry | undefined,
  name: ServiceHookName,
  payload: T,
  ...extras: unknown[]
): Promise<T> {
  const data = payload as Record<string, unknown>;
  // Built-in hooks ALWAYS run first
  const builtIn = BUILT_IN_HOOKS[name];
  if (builtIn && typeof data === "object" && data && !Array.isArray(data)) {
    builtIn(data, modelEntry);
  }
  // Then user hook
  const hook = serviceEntry?.hooks[name] as
    | ((ctx: ThinkContext, ...args: unknown[]) => T | Promise<T> | undefined | void)
    | undefined;
  if (hook) {
    const serviceContext = bindServiceContext(new BaseService(), ctx, {
      servicePath: modelEntry.path,
      serviceModelName: modelEntry.name,
    });
    const result = await hook.call(serviceContext, ctx, ...extras, payload);
    return result === undefined ? payload : (result as T);
  }
  return payload;
}

export function normalizeListResult(result: unknown): Record<string, unknown> {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return { count: 0, totalPages: 0, pageSize: 20, currentPage: 1, data: [] };
  }
  const r = result as Record<string, unknown>;
  return {
    count: Number(r.count ?? 0),
    totalPages: Number(r.totalPages ?? r.totalPage ?? 0),
    pageSize: Number(r.pageSize ?? r.page_size ?? r.limit ?? 20),
    currentPage: Number(r.currentPage ?? r.current_page ?? r.page ?? 1),
    data: Array.isArray(r.data) ? r.data : [],
  };
}

export function pickWritable(
  columns: DslModelEntry["dsl"]["columns"],
  data: Record<string, unknown>,
): Record<string, unknown> {
  const writable = new Set(columns.map((c) => c.name));
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (writable.has(key)) result[key] = value;
  }
  return result;
}

export function applyDefaults(
  columns: DslModelEntry["dsl"]["columns"],
  data: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...data };
  for (const col of columns) {
    if (result[col.name] === undefined && col.default !== undefined) {
      result[col.name] = typeof col.default === "function" ? col.default() : col.default;
    }
  }
  return result;
}

export function buildAclConfig(
  entry: DslModelEntry,
  aclEntry?: DslAclEntry,
): AclConfig {
  const config: AclConfig = {};
  if (!aclEntry) return config;
  for (const [role, rules] of Object.entries(aclEntry)) {
    const rule: AclRule = {};
    if (rules.allow) rule.allow = rules.allow;
    if (rules.deny) rule.deny = rules.deny;
    if (rules.readable) rule.readable = rules.readable;
    if (rules.writable) rule.writable = rules.writable;
    config[`${entry.name}:${role}`] = rule;
  }
  return config;
}
