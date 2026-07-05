import { existsSync } from "fs";
import { join } from "path";
import type { DBConfig, TableMeta, ColumnMeta, IndexMeta } from "../generate";

export function toLabel(str: string): string {
  return str
    .split("_")
    .map((s, i) => (i === 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s))
    .join(" ");
}

export function tableNameToDslPath(tableName: string): string {
  const parts = tableName.split("_");
  if (parts.length === 1) {
    return ["home", tableName].join("/");
  }
  return parts.join("/");
}

export function validateDslPath(path: string): void {
  if (path.includes("-")) {
    throw new Error(`DSL path must not contain hyphen: ${path}`);
  }
  // Detect pre-composed namespace directories like iotbiz_device/type or operation_campaign/campaign
  const segments = path.split("/");
  for (let i = 0; i < segments.length - 1; i++) {
    if (segments[i].includes("_")) {
      throw new Error(`DSL path has pre-composed namespace directory: ${path}`);
    }
  }
}
export function mapMySQLType(colType: string, dataType: string): { type: string; length?: number; precision?: number; scale?: number } {
  const normalized = dataType.toLowerCase();
  if (normalized === "tinyint" && colType.includes("(1)")) return { type: "boolean" };
  if (normalized === "bigint") return { type: "bigInteger" };
  if (normalized === "int" || normalized === "integer" || normalized === "smallint" || normalized === "mediumint") return { type: "integer" };
  if (normalized === "tinyint") return { type: "integer" };
  if (normalized === "float") return { type: "float" };
  if (normalized === "double") return { type: "decimal", precision: 15, scale: 4 };
  if (normalized === "decimal" || normalized === "numeric") {
    const m = colType.match(/\((\d+),\s*(\d+)\)/);
    return { type: "decimal", precision: m ? Number(m[1]) : 10, scale: m ? Number(m[2]) : 2 };
  }
  if (normalized === "datetime" || normalized === "timestamp") return { type: "timestamp" };
  if (normalized === "date") return { type: "date" };
  if (normalized === "time") return { type: "string", length: 32 };
  if (normalized === "year") return { type: "integer" };
  if (normalized === "json") return { type: "json" };
  if (normalized === "text" || normalized === "mediumtext" || normalized === "longtext") return { type: "text" };
  if (normalized === "blob" || normalized === "mediumblob" || normalized === "longblob") return { type: "text" };
  if (normalized === "enum") return { type: "enum" };
  if (normalized === "set") return { type: "json" };
  if (normalized.includes("char") || normalized === "varchar") {
    const m = colType.match(/\((\d+)\)/);
    return { type: "string", length: m ? Number(m[1]) : 255 };
  }
  return { type: "string" };
}

export function normalizeDefault(value: unknown, type: string): unknown {
  if (value === null || value === undefined) return undefined;
  const str = String(value);
  if (str.toUpperCase() === "CURRENT_TIMESTAMP") return undefined;
  if (type === "boolean") {
    if (str === "1" || str.toLowerCase() === "true") return true;
    if (str === "0" || str.toLowerCase() === "false") return false;
    return undefined;
  }
  if (type === "integer" || type === "bigInteger") {
    const n = Number(str);
    return Number.isNaN(n) ? undefined : n;
  }
  if (type === "decimal" || type === "float") {
    const n = Number(str);
    return Number.isNaN(n) ? undefined : n;
  }
  return str;
}

export async function listTablesMySQL(config: DBConfig): Promise<TableMeta[]> {
  const { SQL } = await import("bun");
  const url = config.url ?? `mysql://${config.user ?? "root"}:${config.password ?? ""}@${config.host ?? "localhost"}:${config.port ?? 3306}/${config.database}`;
  const sql = new SQL(url);
  const tables = (await sql`SHOW TABLES`) as Array<Record<string, string>>;
  const result: TableMeta[] = [];
  for (const row of tables) {
    const tableName = Object.values(row)[0];
    const columns = (await sql`SHOW FULL COLUMNS FROM ${sql(tableName)}`) as Array<{
      Field: string;
      Type: string;
      Collation: string | null;
      Null: string;
      Key: string;
      Default: unknown;
      Extra: string;
      Privileges: string;
      Comment: string;
    }>;
    const indexes = (await sql`SHOW INDEX FROM ${sql(tableName)}`) as Array<{
      Key_name: string;
      Column_name: string;
      Non_unique: number;
    }>;
    const indexMap = new Map<string, { columns: string[]; unique: boolean }>();
    for (const idx of indexes) {
      const name = idx.Key_name;
      const existing = indexMap.get(name) ?? { columns: [], unique: name === "PRIMARY" || idx.Non_unique === 0 };
      existing.columns.push(idx.Column_name);
      indexMap.set(name, existing);
    }

    const fks = (await sql`SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ${tableName} AND REFERENCED_TABLE_NAME IS NOT NULL`) as Array<{
      COLUMN_NAME: string;
      REFERENCED_TABLE_NAME: string;
      REFERENCED_COLUMN_NAME: string;
    }>;
    const fkMap = new Map(fks.map((fk) => [fk.COLUMN_NAME, { table: fk.REFERENCED_TABLE_NAME, column: fk.REFERENCED_COLUMN_NAME }]));

    const tableCommentRow = (await sql`SELECT TABLE_COMMENT FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ${tableName}`) as Array<{ TABLE_COMMENT: string }>;
    const tableComment = tableCommentRow[0]?.TABLE_COMMENT ?? "";

    const columnList: ColumnMeta[] = columns.map((c) => {
      const { type, length, precision, scale } = mapMySQLType(c.Type, c.Type.split("(")[0] ?? c.Type);
      const fk = fkMap.get(c.Field);
      return {
        name: c.Field,
        type,
        dataType: c.Type,
        nullable: c.Null === "YES",
        defaultValue: normalizeDefault(c.Default, type),
        length,
        precision,
        scale,
        isPrimary: c.Key === "PRI",
        isUnique: c.Key === "UNI",
        isIndex: c.Key === "MUL" || c.Key === "UNI" || c.Key === "PRI",
        autoIncrement: c.Extra.toLowerCase().includes("auto_increment"),
        comment: c.Comment ?? "",
        fkTable: fk?.table,
        fkColumn: fk?.column,
      };
    });
    result.push({
      name: tableName,
      columns: columnList,
      indexes: Array.from(indexMap.entries())
        .filter(([name]) => name !== "PRIMARY")
        .map(([name, meta]) => ({ name, columns: meta.columns, unique: meta.unique })),
      comment: tableComment,
    });
  }
  await sql.close();
  return result;
}
export async function listTablesSQLite(config: DBConfig): Promise<TableMeta[]> {
  const { Database } = await import("bun:sqlite");
  const db = new Database(config.path ?? "data.sqlite");
  const tables = db
    .query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_migrations'")
    .all() as Array<{ name: string }>;
  const result: TableMeta[] = [];
  for (const { name: tableName } of tables) {
    const columns = db.query(`PRAGMA table_info(${tableName})`).all() as Array<{
      name: string;
      type: string;
      notnull: number;
      dflt_value: unknown;
      pk: number;
    }>;
    const indexList = db.query(`PRAGMA index_list(${tableName})`).all() as Array<{ name: string; unique: number }>;
    const indexes: IndexMeta[] = [];
    for (const idx of indexList) {
      const cols = db.query(`PRAGMA index_info(${idx.name})`).all() as Array<{ name: string }>;
      indexes.push({ name: idx.name, columns: cols.map((c) => c.name), unique: idx.unique === 1 });
    }
    const columnList: ColumnMeta[] = columns.map((c) => {
      const { type, length, precision, scale } = mapMySQLType(c.type, c.type.split("(")[0] ?? c.type);
      return {
        name: c.name,
        type,
        dataType: c.type,
        nullable: c.notnull === 0,
        defaultValue: normalizeDefault(c.dflt_value, type),
        length,
        precision,
        scale,
        isPrimary: c.pk === 1,
        isUnique: false,
        isIndex: false,
        autoIncrement: c.pk === 1 && type === "integer",
        comment: "",
      };
    });
    result.push({ name: tableName, columns: columnList, indexes });
  }
  db.close();
  return result;
}

export async function listTables(config: DBConfig): Promise<TableMeta[]> {
  if (config.adapter === "sqlite") return listTablesSQLite(config);
  if (config.adapter === "mysql" || config.adapter === "postgresql") return listTablesMySQL(config);
  throw new Error(`Unsupported adapter: ${config.adapter}`);
}
export async function loadDbConfig(rootPath: string): Promise<DBConfig> {
  const configPath = join(rootPath, "config/adapter.ts");
  if (!existsSync(configPath)) {
    throw new Error("No config/adapter.ts found. Run 'thinkts new' first.");
  }
  const mod = await import(configPath);
  const adapterConfig = mod.default ?? mod;
  const dbConfig = adapterConfig.model ?? {};
  if (!dbConfig.adapter) {
    throw new Error("No database adapter configured in config/adapter.ts");
  }
  return dbConfig as DBConfig;
}
