import type { ColumnDefinition } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Cols = Record<string, ColumnDefinition<any>>;

/** Extract the TypeScript row type from column definitions. */
export type RowOf<T extends Cols> = {
  [K in keyof T]: T[K] extends ColumnDefinition<infer V> ? V : never;
};

export interface ModelAcl {
  read?: string[];
  write?: string[];
  delete?: string[];
}

export type BeforeHook<T extends Cols> = (
  data: Partial<RowOf<T>>, ctx: unknown,
) => Partial<RowOf<T>> | Promise<Partial<RowOf<T>>>;

export type AfterHook<T extends Cols> = (
  record: RowOf<T>, ctx: unknown,
) => RowOf<T> | Promise<RowOf<T>>;

export interface ModelHooks<T extends Cols> {
  beforeCreate?: BeforeHook<T>;
  afterCreate?: AfterHook<T>;
  beforeUpdate?: BeforeHook<T>;
  afterUpdate?: AfterHook<T>;
  beforeDelete?: (record: RowOf<T>, ctx: unknown) => void | Promise<void>;
}


export interface ModelSystem {
  /** Auto-add WHERE tenant_id = ? to all queries */
  tenantAware?: boolean;
  /** Soft delete via deleted_at column */
  softDelete?: boolean;
  /** Fields that cannot be edited via CRUD API */
  immutableFields?: string[];
}

export interface ModelDefinition<T extends Cols = Cols> {
  readonly tableName: string;
  readonly columns: T;
  readonly primaryKey: string;
  readonly hooks?: ModelHooks<T>;
  /** System invariants (framework-enforced) */
  readonly system?: ModelSystem;
  /** Default access for business roles (can be overridden via admin) */
  readonly access?: Record<string, string[]>;
}

/**
 * Define a database model with full TypeScript type inference.
 *
 * ```ts
 * const Device = defineModel("iotbiz_device", {
 *   columns: { id: t.bigint(), name: t.string(128) },
 *   hooks: {
 *     beforeCreate(data, ctx) { return data; }, // data is typed
 *   },
 * });
 * type DeviceRow = RowOf<typeof Device.columns>;
 * ```
 */
export function defineModel<T extends Cols>(
  tableName: string,
  def: { columns: T; primaryKey?: string; hooks?: ModelHooks<T>; system?: ModelSystem; access?: Record<string, string[]> },
): ModelDefinition<T> {
  const primaryKey = def.primaryKey
    ?? Object.entries(def.columns).find(([, c]) => c.primary)?.[0]
    ?? "id";
  return { tableName, columns: def.columns, primaryKey, hooks: def.hooks, system: def.system, access: def.access };
}

/**
 * Convert ModelDefinition to internal DSL format with:
 * - modelConfig: column definitions (SQL schema)
 * - tableConfig: admin table UI configuration
 * - accessConfig: default role access
 */
export function toDslConfig<T extends Cols>(model: ModelDefinition<T>): Record<string, unknown> {
  const columns = Object.entries(model.columns).map(([name, col]) => {
    const entry: Record<string, unknown> = {
      name: col.columnName ?? name, type: col._sqlType, label: col.label ?? name,
    };
    if (col.primary) entry.primary = true;
    if (col.required) entry.required = true;
    if (col.nullable) entry.nullable = true;
    if (col.unique) entry.unique = true;
    if (col.autoIncrement) entry.autoIncrement = true;
    if (col.index) entry.index = true;
    if (col.length !== undefined) entry.length = col.length;
    if (col.precision !== undefined) entry.precision = col.precision;
    if (col.scale !== undefined) entry.scale = col.scale;
    if (col.enumValues) entry.enum = col.enumValues;
    if (col.defaultValue !== undefined) entry.default = col.defaultValue;
    if (col.comment) entry.comment = col.comment;
    return entry;
  });
  return {
    name: model.tableName, tableName: model.tableName, primaryKey: model.primaryKey,
    columns, option: { timestamps: true, softDeletes: model.system?.softDelete ?? false },
    // Table UI config — derived from column metadata
    table: {
      title: model.tableName, model: model.tableName,
      list: {
        columns: Object.entries(model.columns)
          .filter(([, c]) => c.listable)
          .map(([name, c]) => ({ field: name, label: c.label ?? name })),
        orderBy: { field: model.primaryKey, direction: "desc" },
      },
      search: {
        fields: Object.entries(model.columns)
          .filter(([, c]) => c.searchable)
          .map(([name, c]) => ({ field: name, label: c.label ?? name })),
      },
    },
    // Access config
    access: model.access ?? {},
    // System invariants
    system: model.system ?? {},
  };
}
