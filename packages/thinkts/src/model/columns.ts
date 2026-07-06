/**
 * DSL type helpers — `t.string()`, `t.bigint()`, etc.
 * Each function returns a `ColumnDefinition` that carries both
 * SQL-level metadata and TypeScript type information.
 */

export interface JsonFieldSchema {
  key: string;
  label: string;
  type: "string" | "number" | "boolean" | "object";
  default?: unknown;
}

export interface ColumnDefinition<T = unknown> {
  readonly _sqlType: string;
  readonly _tsType?: T;
  readonly columnName?: string;
  readonly length?: number;
  readonly precision?: number;
  readonly scale?: number;
  readonly primary: boolean;
  readonly required: boolean;
  readonly unique: boolean;
  readonly autoIncrement: boolean;
  readonly index: boolean;
  readonly nullable: boolean;
  readonly enumValues?: readonly string[];
  readonly defaultValue?: unknown;
  readonly comment?: string;
  readonly label?: string;
  readonly listable: boolean;
  readonly searchable: boolean;
  readonly filterable: boolean;
  /** JSON column key schema — describes structure for interactive editor. */
  readonly jsonSchema?: JsonFieldSchema[];
}
function col<T>(sqlType: string, init?: ColumnInit): ColumnDefinition<T> {
  return {
    _sqlType: sqlType,
    primary: false, required: false, unique: false,
    autoIncrement: false, index: false, nullable: false,
    listable: false, searchable: false, filterable: false,
    ...init,
  };
}

// ── Type helpers ──

export const t = {
  /** VARCHAR(n) — maps to TypeScript string */
  string: (length = 255, init?: ColumnInit) =>
    col<string>("varchar", { length, ...init }),

  /** TEXT — maps to TypeScript string */
  text: (init?: ColumnInit) =>
    col<string>("text", init),

  /** BIGINT — maps to TypeScript bigint/number */
  bigint: (columnName?: string) =>
    col<bigint>("bigint", { columnName }),

  /** INT — maps to TypeScript number */
  integer: (init?: ColumnInit) =>
    col<number>("int", init),

  /** BOOLEAN / TINYINT(1) — maps to TypeScript boolean */
  boolean: (init?: ColumnInit) =>
    col<boolean>("boolean", init),

  /** DECIMAL(precision, scale) — maps to TypeScript number */
  decimal: (precision = 10, scale = 2, init?: ColumnInit) =>
    col<number>("decimal", { precision, scale, ...init }),

  /** TIMESTAMP / DATETIME — maps to TypeScript Date */
  timestamp: (columnName?: string) =>
    col<Date>("timestamp", { columnName }),

  /** DATE — maps to TypeScript Date */
  date: (init?: ColumnInit) =>
    col<Date>("date", init),

  /** ENUM(values) — maps to TypeScript union */
  enum: <T extends readonly string[]>(values: T, init?: ColumnInit) =>
    col<T[number]>("enum", { enumValues: values, ...init }),

  /** JSON — maps to TypeScript Record/object */
  json: <T = Record<string, unknown>>(init?: ColumnInit) =>
    col<T>("json", init),
};

export function nullable<T>(col: ColumnDefinition<T>): ColumnDefinition<T> {
  return { ...col, nullable: true, required: false };
}
export function required<T>(col: ColumnDefinition<T>): ColumnDefinition<T> {
  return { ...col, required: true, nullable: false };
}

/** Make a column nullable */
export function optional<T>(col: ColumnDefinition<T>): ColumnDefinition<T> {
  return { ...col, nullable: true, required: false };
}

/** Mark as primary key */
export function primary<T>(col: ColumnDefinition<T>): ColumnDefinition<T> {
  return { ...col, primary: true, required: true };
}

/** Auto-increment (for PK) */
export function autoIncrement<T>(col: ColumnDefinition<T>): ColumnDefinition<T> {
  return { ...col, autoIncrement: true };
}

/** Add UNIQUE constraint */
export function unique<T>(col: ColumnDefinition<T>): ColumnDefinition<T> {
  return { ...col, unique: true };
}

/** Add INDEX */
export function index<T>(col: ColumnDefinition<T>): ColumnDefinition<T> {
  return { ...col, index: true };
}

/** Set default value */
export function defaultTo<T>(value: T): (col: ColumnDefinition<T>) => ColumnDefinition<T> {
  return (col) => ({ ...col, defaultValue: value });
}

/** Set default to CURRENT_TIMESTAMP */
export function defaultNow<T>(col: ColumnDefinition<T>): ColumnDefinition<T> {
  return { ...col, defaultValue: "CURRENT_TIMESTAMP" };
}

/** Set ON UPDATE CURRENT_TIMESTAMP */
export function onUpdateNow<T>(col: ColumnDefinition<T>): ColumnDefinition<T> {
  return { ...col, comment: `${col.comment ?? ""} ON UPDATE CURRENT_TIMESTAMP`.trim() };
}

/** Add column comment */
export function comment<T>(text: string): (col: ColumnDefinition<T>) => ColumnDefinition<T> {
  return (col) => ({ ...col, comment: text });
}

/** Admin UI label */
export function label<T>(text: string): (col: ColumnDefinition<T>) => ColumnDefinition<T> {
  return (col) => ({ ...col, label: text, listable: true });
}

/** Show in list table */
export function listable<T>(col: ColumnDefinition<T>): ColumnDefinition<T> {
  return { ...col, listable: true };
}

/** Show in search fields */
export function searchable<T>(col: ColumnDefinition<T>): ColumnDefinition<T> {
  return { ...col, searchable: true };
}

/** Show in filter dropdown */
export function filterable<T>(col: ColumnDefinition<T>): ColumnDefinition<T> {
  return { ...col, filterable: true };
}

/** Attach JSON key schema for interactive editor. */
export function jsonSchema<T>(col: ColumnDefinition<T>, schema: JsonFieldSchema[]): ColumnDefinition<T> {
  return { ...col, jsonSchema: schema };
}
