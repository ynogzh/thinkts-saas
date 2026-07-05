import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { listTables, loadDbConfig } from "./generate/db-utils";
import { generateModelJson, generateTableJson, generateServiceTs, generateModelTs, generateTableTs, generateAclJson } from "./generate/codegen";
export interface TableMeta {
  name: string;
  columns: ColumnMeta[];
  indexes: IndexMeta[];
  comment?: string;
}

export interface ColumnMeta {
  name: string;
  type: string;
  dataType: string;
  nullable: boolean;
  defaultValue: unknown;
  length?: number;
  precision?: number;
  scale?: number;
  isPrimary: boolean;
  isUnique: boolean;
  isIndex: boolean;
  autoIncrement: boolean;
  comment: string;
  fkTable?: string;
  fkColumn?: string;
}

export interface IndexMeta {
  name: string;
  columns: string[];
  unique: boolean;
}

export function tableNameToDslPath(tableName: string): string {
  const parts = tableName.split("_");
  if (parts.length === 1) return ["home", tableName].join("/");
  return parts.join("/");
}

export function validateDslPath(path: string): void {
  if (path.includes("-")) {
    throw new Error(`DSL path must not contain hyphen: ${path}`);
  }
  const segments = path.split("/");
  for (let i = 0; i < segments.length - 1; i++) {
    if (segments[i].includes("_")) {
      throw new Error(`DSL path has pre-composed namespace directory: ${path}`);
    }
  }
}

export async function generateFromDB(rootPath: string, _useJs = false): Promise<void> {
  const dbConfig = await loadDbConfig(rootPath);
  const tables = await listTables(dbConfig);
  if (tables.length === 0) {
    console.log("No tables found in database.");
    return;
  }
  console.log(`Found ${tables.length} tables`);
  for (const table of tables) {
    const dslPath = tableNameToDslPath(table.name);
    validateDslPath(dslPath);
    const dir = join(rootPath, "src", dslPath);
    mkdirSync(dir, { recursive: true });

    // model.ts — single source of truth (columns, hooks, system, access)
    writeFileSync(join(dir, "model.ts"), generateModelTs(table));

    // service.ts — business logic (extends BaseService)
    writeFileSync(join(dir, "service.ts"), generateServiceTs());

    console.log(`Generated: src/${dslPath}/`);
  }
  console.log("Done. Restart the server to load new DSL routes.");
}
