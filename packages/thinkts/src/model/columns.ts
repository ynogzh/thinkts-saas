/**
 * DSL type helpers — `t.string()`, `t.bigint()`, etc.
 * Each function returns a `ColumnDefinition` that carries both
 * SQL-level metadata and TypeScript type information.
 */

export interface JsonFieldSchema {
  key: string
  label: string
  type: "string" | "number" | "boolean" | "object"
  default?: unknown
}

export interface ValidationRules {
  maxLength?: number
  pattern?: string
  message?: string
  min?: number
  max?: number
}

export interface ColumnInit {
  columnName?: string
  length?: number
  precision?: number
  scale?: number
  label?: string
  comment?: string
  listable?: boolean
  searchable?: boolean
  filterable?: boolean
  nullable?: boolean
  required?: boolean
  primary?: boolean
  autoIncrement?: boolean
  unique?: boolean
  index?: boolean
  defaultValue?: unknown
  enumValues?: readonly string[]
  /** JSON key schema for interactive editor — only meaningful on `t.json()`. */
  jsonSchema?: JsonFieldSchema[]
  /** Validation rules passed to frontend form. */
  validation?: ValidationRules
}

export interface ColumnDefinition<T = unknown> {
  readonly _sqlType: string
  readonly _tsType?: T
  readonly columnName?: string
  readonly length?: number
  readonly precision?: number
  readonly scale?: number
  readonly primary: boolean
  readonly required: boolean
  readonly unique: boolean
  readonly autoIncrement: boolean
  readonly index: boolean
  readonly nullable: boolean
  readonly enumValues?: readonly string[]
  readonly defaultValue?: unknown
  readonly comment?: string
  readonly label?: string
  readonly listable: boolean
  readonly searchable: boolean
  readonly filterable: boolean
  /** JSON column key schema — describes structure for interactive editor. */
  readonly jsonSchema?: JsonFieldSchema[]
  /** Validation rules for frontend form. */
  readonly validation?: ValidationRules
}

function col<T>(sqlType: string, init?: ColumnInit): ColumnDefinition<T> {
  return {
    _sqlType: sqlType,
    primary: false, required: false, unique: false,
    autoIncrement: false, index: false, nullable: false,
    listable: false, searchable: false, filterable: false,
    ...init,
  }
}

// ── Type helpers ──

export const t = {
  /** VARCHAR(n) */
  string: (length = 255, init?: ColumnInit) =>
    col<string>("varchar", { length, ...init }),

  /** TEXT */
  text: (init?: ColumnInit) =>
    col<string>("text", init),

  /** BIGINT */
  bigint: (columnName?: string) =>
    col<bigint>("bigint", { columnName }),

  /** INT */
  integer: (init?: ColumnInit) =>
    col<number>("int", init),

  /** BOOLEAN / TINYINT(1) */
  boolean: (init?: ColumnInit) =>
    col<boolean>("boolean", init),

  /** DECIMAL(precision, scale) */
  decimal: (precision = 10, scale = 2, init?: ColumnInit) =>
    col<number>("decimal", { precision, scale, ...init }),

  /** TIMESTAMP / DATETIME */
  timestamp: (columnName?: string) =>
    col<Date>("timestamp", { columnName }),

  /** DATE */
  date: (init?: ColumnInit) =>
    col<Date>("date", init),

  /** ENUM(values) */
  enum: <T extends readonly string[]>(values: T, init?: ColumnInit) =>
    col<T[number]>("enum", { enumValues: values, ...init }),

  /** JSON — use `jsonSchema` in init for interactive editor. */
  json: <T = Record<string, unknown>>(init?: ColumnInit) =>
    col<T>("json", init),
}

export function nullable<T>(col: ColumnDefinition<T>): ColumnDefinition<T> {
  return { ...col, nullable: true, required: false }
}
export function required<T>(col: ColumnDefinition<T>): ColumnDefinition<T> {
  return { ...col, required: true, nullable: false }
}
export function optional<T>(col: ColumnDefinition<T>): ColumnDefinition<T> {
  return { ...col, nullable: true, required: false }
}
export function primary<T>(col: ColumnDefinition<T>): ColumnDefinition<T> {
  return { ...col, primary: true, required: true }
}
export function autoIncrement<T>(col: ColumnDefinition<T>): ColumnDefinition<T> {
  return { ...col, autoIncrement: true }
}
export function unique<T>(col: ColumnDefinition<T>): ColumnDefinition<T> {
  return { ...col, unique: true }
}
export function index<T>(col: ColumnDefinition<T>): ColumnDefinition<T> {
  return { ...col, index: true }
}
export function defaultTo<T>(value: T): (col: ColumnDefinition<T>) => ColumnDefinition<T> {
  return (col) => ({ ...col, defaultValue: value })
}
export function defaultNow<T>(col: ColumnDefinition<T>): ColumnDefinition<T> {
  return { ...col, defaultValue: "CURRENT_TIMESTAMP" }
}
export function onUpdateNow<T>(col: ColumnDefinition<T>): ColumnDefinition<T> {
  return { ...col, comment: `${col.comment ?? ""} ON UPDATE CURRENT_TIMESTAMP`.trim() }
}
export function comment<T>(text: string): (col: ColumnDefinition<T>) => ColumnDefinition<T> {
  return (col) => ({ ...col, comment: text })
}
export function label<T>(text: string): (col: ColumnDefinition<T>) => ColumnDefinition<T> {
  return (col) => ({ ...col, label: text, listable: true })
}
export function listable<T>(col: ColumnDefinition<T>): ColumnDefinition<T> {
  return { ...col, listable: true }
}
export function searchable<T>(col: ColumnDefinition<T>): ColumnDefinition<T> {
  return { ...col, searchable: true }
}
export function filterable<T>(col: ColumnDefinition<T>): ColumnDefinition<T> {
  return { ...col, filterable: true }
}

/** Attach JSON key schema for interactive editor. */
export function jsonSchema<T>(col: ColumnDefinition<T>, schema: JsonFieldSchema[]): ColumnDefinition<T> {
  return { ...col, jsonSchema: schema };
}
