import type { ColumnDefinition } from "./columns";

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

export interface ModelUIAction {
  label: string
  service: string
  icon?: string
}

export interface ModelUIConfig {
  actions?: ModelUIAction[]
  displayField?: string
}

export interface ModelSystem {
  tenantAware?: boolean;
  softDelete?: boolean;
  immutableFields?: string[];
}

export interface ModelDefinition<T extends Cols = Cols> {
  readonly tableName: string;
  readonly columns: T;
  readonly primaryKey: string;
  readonly hooks?: ModelHooks<T>;
  readonly system?: ModelSystem;
  readonly access?: Record<string, string[]>;
  readonly ui?: ModelUIConfig;
}

/**
 * Define a database model with full TypeScript type inference.
 */
export function defineModel<T extends Cols>(
  tableName: string,
  def: {
    columns: T; primaryKey?: string;
    hooks?: ModelHooks<T>; system?: ModelSystem;
    access?: Record<string, string[]>; ui?: ModelUIConfig;
  },
): ModelDefinition<T> {
  const primaryKey = def.primaryKey
    ?? Object.entries(def.columns).find(([, c]) => c.primary)?.[0]
    ?? "id";
  return { tableName, columns: def.columns, primaryKey, hooks: def.hooks, system: def.system, access: def.access, ui: def.ui };
}

/**
 * Convert ModelDefinition to internal DSL format.
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

  const hasExplicit = Object.values(model.columns).some((col) => col.listable);
  const hasSearchable = Object.values(model.columns).some((col) => col.searchable);

  return {
    name: model.tableName, tableName: model.tableName, primaryKey: model.primaryKey,
    columns, option: { timestamps: true, softDeletes: model.system?.softDelete ?? false },
    // Table UI config
    table: {
      title: model.tableName, model: model.tableName,
      list: {
        columns: Object.entries(model.columns)
          .filter(([, c]) => hasExplicit ? c.listable : true)
          .map(([name, c]) => ({ field: name, title: c.label ?? name })),
        orderBy: { field: model.primaryKey, direction: "desc" },
      },
      search: {
        fields: Object.entries(model.columns)
          .filter(([name, c]) => hasSearchable ? c.searchable : !["id", "created_at", "updated_at", "deleted_at"].includes(name))
          .map(([name, c]) => ({ field: name, title: c.label ?? name })),
      },
      form: {
        groups: [{
          title: "基本信息",
          fields: Object.entries(model.columns)
            .filter(([name]) => !["id", "created_at", "updated_at", "deleted_at"].includes(name))
            .map(([name, c]) => ({ field: name, title: c.label ?? name, required: c.required, type: c._sqlType })),
        }],
      },
    },
    access: model.access ?? {},
    system: model.system ?? {},
    // Extract JSON schemas from column definitions
    jsonSchema: Object.fromEntries(
      Object.entries(model.columns)
        .filter(([, c]) => c.jsonSchema?.length)
        .map(([name, c]) => [name, c.jsonSchema]),
    ),
    ui: model.ui ?? {},
  };
}
