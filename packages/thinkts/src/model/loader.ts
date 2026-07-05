import { readdirSync, statSync, existsSync, readFileSync } from "fs";
import { join, basename } from "path";
export type {
  DslAppData,
  DslModelEntry,
  DslServiceEntry,
  DslTableEntry,
  DslAclEntry,
} from "./registry";
import type {
  ModelDSL,
  ServiceHooks,
  TableDSL,
  AclDSL,
  DataResourceMeta,
  DslAppData,
  DslModelEntry,
} from "./registry";
import { toDslConfig } from "./define";
import type { ModelDefinition } from "./define";

const LIFECYCLE_HOOKS: Record<string, boolean> = {
  beforeCreate: true, afterCreate: true,
  beforeUpdate: true, afterUpdate: true,
  beforeDelete: true, afterDelete: true,
  beforeFind: true, afterFind: true,
  afterGet: true, beforeList: true, afterList: true,
};

function tryImport<T>(path: string): T | undefined {
  if (!existsSync(path)) return undefined;
  try {
    delete require.cache[require.resolve(path)];
    const mod = require(path);
    return (mod.default ?? mod) as T;
  } catch (err) {
    console.warn(`Failed to import ${path}:`, err);
    return undefined;
  }
}

function tryReadJSON<T>(path: string): T | undefined {
  if (!existsSync(path)) return undefined;
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as T;
  } catch (err) {
    console.warn(`Failed to read JSON ${path}:`, err);
    return undefined;
  }
}

import { join, basename } from "path";
import { toDslConfig } from "./define";
import type { ModelDefinition } from "./define";

function loadModelDSL(dir: string): ModelDSL | undefined {
  // Prefer TS (defineModel), then JS, then JSON
  const tsValue = tryImport<ModelDefinition | ModelDSL>(join(dir, "model.ts"));
  if (tsValue) return resolveModelImport(tsValue);
  const jsValue = tryImport<ModelDSL>(join(dir, "model.js"));
  if (jsValue) return resolveModelImport(jsValue);
  return tryReadJSON<ModelDSL>(join(dir, "model.json"));
}

function resolveModelImport(value: ModelDefinition | ModelDSL | Record<string, unknown>): ModelDSL | undefined {
  // defineModel export — has tableName + columns (not _sqlType)
  if (typeof value === "object" && "tableName" in value && "columns" in value) {
    return toDslConfig(value as ModelDefinition) as unknown as ModelDSL;
  }
  return value as ModelDSL;
}

function loadServiceHooks(dir: string): ServiceHooks {
  const jsPath = join(dir, "service.js");
  return tryImport<ServiceHooks>(jsPath) ?? {};
}

/** Extract non-lifecycle exports from service.js as API route definitions. */
function loadApiRoutes(name: string, path: string, hooks: ServiceHooks): Array<{
  method: string; path: string; handler: string;
}> | undefined {
  const routes: Array<{ method: string; path: string; handler: string }> = [];
  for (const key of Object.keys(hooks)) {
    if (LIFECYCLE_HOOKS[key]) continue;
    if (typeof hooks[key] !== "function") continue;
    // Auto-register non-hook exports as POST routes
    routes.push({
      method: "POST",
      path: `/${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`,
      handler: `service.${key}`,
    });
  }
  return routes.length > 0 ? routes : undefined;
}

function loadTableDSL(dir: string): TableDSL | undefined {
  const jsPath = join(dir, "table.js");
  const jsonPath = join(dir, "table.json");
  return tryImport<TableDSL>(jsPath) ?? tryReadJSON<TableDSL>(jsonPath);
}

function loadAclDSL(dir: string): AclDSL | undefined {
  const jsValue = tryImport<AclDSL | ((ctx: unknown) => unknown)>(join(dir, "acl.js"));
  if (jsValue) {
    if (typeof jsValue === "function") return { rules: jsValue } as unknown as AclDSL;
    return jsValue;
  }
  return tryReadJSON<AclDSL>(join(dir, "acl.json"));
}

function modelNameFromDir(dir: string, srcPath: string): string {
  return dir.slice(srcPath.length).replace(/^\/+/, "").replace(/\/+/g, "_");
}

export function loadDslAppData(srcPath: string): DslAppData {
  const result: DslAppData = {
    models: {}, services: {}, tables: {}, acls: {}, apis: {}, dataResources: {},
  };
  if (!existsSync(srcPath)) return result;

  function scan(dir: string) {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const entryPath = join(dir, entry);
      if (statSync(entryPath).isDirectory()) scan(entryPath);
    }

    const dsl = loadModelDSL(dir);
    if (!dsl) return;

    // model.ts can embed table config — extract table name
    const embeddedTableName = (dsl as Record<string, unknown>).tableName as string | undefined;
    const name = dsl.table && typeof dsl.table === "string" ? dsl.table
      : embeddedTableName || modelNameFromDir(dir, srcPath);
    const tableName = typeof dsl.table === "string" ? dsl.table
      : embeddedTableName || basename(dir);

    if (dsl.dataResource) {
      result.dataResources[dsl.dataResource.resourceCode ?? name] = {
        resourceCode: dsl.dataResource.resourceCode ?? name,
        modelName: name,
        ...dsl.dataResource,
      };
    }

    const hooks = loadServiceHooks(dir);
    if (Object.keys(hooks).length > 0) {
      result.services[name] = { name, path: dir, hooks };

      // Auto-register non-hook service exports as API routes
      const apiRoutes = loadApiRoutes(name, dir, hooks);
      if (apiRoutes) {
        result.apis[name] = { name, path: dir, routes: apiRoutes };
      }
    }

    // Table: prefer model.ts embedded, fall back to table.json
    const embeddedTable = (dsl as Record<string, unknown>).table as Record<string, unknown> | undefined;
    result.tables[name] = embeddedTable
      ? { name, path: dir, table: embeddedTable as TableDSL }
      : (loadTableDSL(dir) ? { name, path: dir, table: loadTableDSL(dir)! } : { name, path: dir, table: { title: name, model: tableName } });

    // ACL: prefer model.ts embedded access, fall back to acl.json
    const embeddedAccess = (dsl as Record<string, unknown>).access as Record<string, string[]> | undefined;
    if (embeddedAccess && Object.keys(embeddedAccess).length > 0) {
      result.acls[name] = { name, path: dir,
        acl: { roles: Object.keys(embeddedAccess), rules: { "*": embeddedAccess } } as unknown as AclDSL };
    } else {
      const acl = loadAclDSL(dir);
      if (acl) result.acls[name] = { name, path: dir, acl };
    }
  }

  scan(srcPath);
  return result;
}
