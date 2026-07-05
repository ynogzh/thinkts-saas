import type { AdminField } from "./types";

interface ColumnMeta {
  COLUMN_NAME: string;
  COLUMN_TYPE: string;
  IS_NULLABLE: string;
  COLUMN_DEFAULT: unknown | null;
  COLUMN_COMMENT: string;
  CHARACTER_MAXIMUM_LENGTH: number | null;
  NUMERIC_PRECISION: number | null;
  NUMERIC_SCALE: number | null;
  DATA_TYPE: string;
  COLUMN_KEY: string;
  EXTRA: string;
}

interface FKMeta {
  COLUMN_NAME: string;
  REFERENCED_TABLE_NAME: string;
  REFERENCED_COLUMN_NAME: string;
}

function toLabel(field: string): string {
  return field.split("_").map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w)).join(" ");
}

function mapType(col: ColumnMeta): string {
  const dt = col.DATA_TYPE.toLowerCase();
  const type = col.COLUMN_TYPE.toLowerCase();
  if (type.startsWith("enum") || type.startsWith("set")) return "select";
  if (dt === "tinyint" && type.match(/\(1\)/)) return "boolean";
  if (dt === "json") return "json";
  if (["datetime", "timestamp"].includes(dt)) return "datetime";
  if (dt === "date") return "date";
  if (["int", "bigint", "tinyint", "smallint", "mediumint"].includes(dt)) return "number";
  if (["decimal", "numeric", "float", "double"].includes(dt)) return "number";
  if (["text", "mediumtext", "longtext", "varchar", "char"].includes(dt)) return "text";
  return "text";
}

function parseEnumOptions(type: string): string[] | undefined {
  const m = type.match(/enum\(([^)]+)\)/i) ?? type.match(/set\(([^)]+)\)/i);
  if (!m) return undefined;
  return m[1].split(",").map(s => s.trim().replace(/^'|'$/g, ""));
}

function searchMeta(col: ColumnMeta): { searchType?: string; operators?: string[]; searchOptions?: string[] } {
  const dt = col.DATA_TYPE.toLowerCase();
  const fn = col.COLUMN_NAME.toLowerCase();
  const type = col.COLUMN_TYPE.toLowerCase();
  const enumOpts = parseEnumOptions(col.COLUMN_TYPE);
  if (enumOpts) return { searchType: "select", operators: ["eq"], searchOptions: enumOpts };
  if ((dt === "tinyint" && type.match(/\(1\)/)) || dt === "bit" || /^(is_|has_|can_|enable_)/.test(fn))
    return { searchType: "boolean", operators: ["eq"] };
  if (dt === "date") return { searchType: "date", operators: ["eq", "gt", "lt", "between"] };
  if (["datetime", "timestamp"].includes(dt)) return { searchType: "datetime", operators: ["eq", "gt", "lt", "between"] };
  if (["int", "bigint", "tinyint", "smallint", "mediumint", "decimal", "numeric", "float", "double"].includes(dt))
    return { searchType: "number", operators: ["eq", "gt", "lt", "gte", "lte", "between"] };
  if (dt === "json") return { searchType: "text", operators: ["like"] };
  return { searchType: "text", operators: ["eq", "like"] };
}

function lengthMeta(col: ColumnMeta): { maxLength?: number; precision?: number; scale?: number } {
  const m = col.COLUMN_TYPE.match(/\((\d+)(?:,(\d+))?\)/);
  if (!m) return {};
  if (["decimal", "numeric", "float", "double"].includes(col.DATA_TYPE.toLowerCase()) && m[2])
    return { precision: parseInt(m[1], 10), scale: parseInt(m[2], 10) };
  return { maxLength: parseInt(m[1], 10) };
}

function intRange(col: ColumnMeta): { min?: number; max?: number } {
  const dt = col.DATA_TYPE.toLowerCase();
  const unsigned = col.COLUMN_TYPE.toLowerCase().includes("unsigned");
  const ranges: Record<string, [number, number]> = {
    tinyint: unsigned ? [0, 255] : [-128, 127],
    smallint: unsigned ? [0, 65535] : [-32768, 32767],
    mediumint: unsigned ? [0, 16777215] : [-8388608, 8388607],
    int: unsigned ? [0, 4294967295] : [-2147483648, 2147483647],
    bigint: unsigned ? [0, 9223372036854775807] : [-9223372036854775808, 9223372036854775807],
  };
  const [min, max] = ranges[dt] ?? [undefined, undefined];
  return { min, max };
}

export async function introspectAdminFields(
  db: { query: (sql: string) => Promise<Record<string, unknown>[]> },
  table: string,
): Promise<AdminField[]> {
  const cols = await db.query(
    `SELECT COLUMN_NAME,COLUMN_TYPE,IS_NULLABLE,COLUMN_DEFAULT,COLUMN_COMMENT,CHARACTER_MAXIMUM_LENGTH,NUMERIC_PRECISION,NUMERIC_SCALE,DATA_TYPE,COLUMN_KEY,EXTRA FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? ORDER BY ORDINAL_POSITION`,
    [table],
  ) as unknown as ColumnMeta[];

  const fks = await db.query(
    `SELECT COLUMN_NAME,REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND REFERENCED_TABLE_NAME IS NOT NULL`,
    [table],
  ) as unknown as FKMeta[];
  const fkMap = new Map<string, FKMeta>();
  for (const fk of fks) fkMap.set(fk.COLUMN_NAME, fk);

  return cols.map(col => {
    const isPk = col.COLUMN_KEY === "PRI";
    const nullable = col.IS_NULLABLE === "YES";
    const fk = fkMap.get(col.COLUMN_NAME);
    const search = searchMeta(col);
    const len = lengthMeta(col);
    const range = intRange(col);

    return {
      field: col.COLUMN_NAME,
      label: col.COLUMN_COMMENT || toLabel(col.COLUMN_NAME),
      type: mapType(col),
      listable: true,
      searchable: !isPk && col.DATA_TYPE !== "json",
      editable: !isPk && col.EXTRA !== "auto_increment" && !["created_at", "updated_at"].includes(col.COLUMN_NAME),
      required: !nullable && col.COLUMN_DEFAULT === null && !isPk && !["created_at", "updated_at"].includes(col.COLUMN_NAME),
      min: range.min,
      max: range.max,
      maxLength: len.maxLength,
      precision: len.precision,
      scale: len.scale,
      default: col.COLUMN_DEFAULT,
      comment: col.COLUMN_COMMENT,
      isPk,
      searchType: search.searchType,
      searchOptions: search.searchOptions,
      operators: search.operators,
      fkTable: fk?.REFERENCED_TABLE_NAME,
      fkColumn: fk?.REFERENCED_COLUMN_NAME,
    };
  });
}
