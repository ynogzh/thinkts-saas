import type { ThinkContext } from "../types";
import type { DslAppData, DslModelEntry, DslTableEntry, TableColumnDSL } from "./registry";
import type { ColumnDSL } from "./registry";

// ── Response types ──

export interface MenuNode {
  key: string;
  label: string;
  icon: string;
  children?: MenuNode[];
}

export interface TableMeta {
  name: string;
  title: string;
  model: string;
}

export interface ColumnMeta {
  field: string;
  title: string;
  width?: number;
  sortable?: boolean;
  type?: string;
}

export interface SearchFieldMeta {
  field: string;
  label: string;
  type?: string;
  operator?: string;
  options?: Array<{ label: string; value: unknown }>;
}

export interface FormFieldMeta {
  field: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: Array<{ label: string; value: unknown }>;
}

export interface FormGroupMeta {
  title?: string;
  columns?: number;
  fields: FormFieldMeta[];
}

export interface TableConfig {
  title: string;
  model: string;
  primaryKey: string;
  list: {
    columns: ColumnMeta[];
    pageSize: number;
    orderBy?: { field: string; direction: "asc" | "desc" };
  };
  search: {
    fields: SearchFieldMeta[];
    showCount: number;
  };
  form: {
    groups: FormGroupMeta[];
  };
}

export interface ListResponse {
  items: Record<string, unknown>[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SingleResponse {
  data: Record<string, unknown> | null;
}

export interface OkResponse {
  ok: boolean;
}

const ICON_MAP: Record<string, string> = {
  tenant: "Building",
  identity: "Users",
  permission: "Shield",
  trade: "ShoppingCart",
  payment: "CreditCard",
  promote: "Megaphone",
  cms: "FileText",
  system: "Settings",
};

function moduleIcon(name: string): string {
  return ICON_MAP[name] ?? "Folder";
}

function columnType(col: ColumnDSL): string {
  if (col.options?.length) return "select";
  switch (col.type) {
    case "bigint": case "int": case "integer": case "tinyint": case "smallint": case "float": case "double": case "decimal":
      return "number";
    case "timestamp": case "datetime": case "date":
      return "date";
    case "text": case "longtext": case "mediumtext":
      return "textarea";
    case "boolean": case "tinyint(1)":
      return "switch";
    default:
      return "text";
  }
}

function resolveColType(field: string, cols: ColumnDSL[]): string {
  return columnType(cols.find((c) => c.name === field) ?? { name: field, type: "varchar" });
}

function buildTableConfig(entry: DslTableEntry, modelEntry: DslModelEntry): TableConfig {
  const { table } = entry;
  const rawColumns = table.list?.columns ?? modelEntry.dsl.columns.map((c) => ({
    field: c.name,
    title: c.label ?? c.name,
    sortable: true,
  }));
  const colMetas: ColumnMeta[] = rawColumns.map((tc) => ({
    field: tc.field,
    title: tc.title,
    width: "width" in tc ? (tc as TableColumnDSL).width : undefined,
    sortable: tc.sortable ?? false,
    type: resolveColType(tc.field, modelEntry.dsl.columns),
  }));

  const searchFields: SearchFieldMeta[] = (table.search?.fields ?? []).map((sf) => ({
    field: sf.field,
    label: sf.title,
    type: sf.type,
    operator: sf.operator,
    options: sf.options,
  }));

  const formGroups: FormGroupMeta[] = (table.form?.groups ?? []).map((g) => ({
    title: g.title,
    columns: g.columns,
    fields: (g.fields ?? []).map((f) => ({
      field: f.field,
      label: f.title,
      type: f.type,
      required: f.required ?? false,
      options: f.options,
    })),
  }));

  const orderBy = table.list?.orderBy;
  return {
    title: table.title,
    model: table.model,
    primaryKey: modelEntry.dsl.primaryKey ?? "id",
    list: {
      columns: colMetas,
      pageSize: table.list?.pageSize ?? 20,
      orderBy: orderBy ? { field: orderBy.field, direction: orderBy.direction ?? "desc" } : undefined,
    },
    search: {
      fields: searchFields,
      showCount: table.search?.showCount ?? 4,
    },
    form: { groups: formGroups },
  };
}

// ── Handler factory ──

export interface AdminHandlers {
  menusAction(ctx: ThinkContext): Promise<{ menus: MenuNode[] }>;
  tablesAction(): { tables: TableMeta[] };
  tableConfigAction(model: string): { table: TableConfig } | { error: string };
  listAction(ctx: ThinkContext, model: string): Promise<{ list: ListResponse }>;
  formConfigAction(model: string): { form: FormGroupMeta[] } | { error: string };
  getRecordAction(ctx: ThinkContext, model: string, id: string): Promise<{ data: Record<string, unknown> | null }>;
  createAction(ctx: ThinkContext, model: string): Promise<{ data: Record<string, unknown> }>;
  updateAction(ctx: ThinkContext, model: string, id: string): Promise<{ data: Record<string, unknown> }>;
  deleteAction(ctx: ThinkContext, model: string, id: string): Promise<{ ok: boolean }>;
}

export function createAdminApiHandlers(dslData: DslAppData): AdminHandlers {
  const modelEntries = Object.values(dslData.models);
  const tableEntries = Object.values(dslData.tables);

  // Model lookup (name may include prefix like "tenant_platform_tenant")
  function findModel(name: string): DslModelEntry | undefined {
    return dslData.models[name] ?? modelEntries.find((e) => e.name === name || e.name.endsWith(`_${name}`));
  }

  function findTable(name: string): DslTableEntry | undefined {
    return dslData.tables[name] ?? tableEntries.find((e) => e.name === name || e.name.endsWith(`_${name}`));
  }

  // ── menus ──

  function buildMenuTree(): MenuNode[] {
    const modules: Record<string, DslTableEntry[]> = {};
    for (const entry of tableEntries) {
      const mod = entry.name.split("_")[0] ?? "system";
      (modules[mod] ??= []).push(entry);
    }

    const nodes: MenuNode[] = [];
    for (const [mod, entries] of Object.entries(modules)) {
      const children: MenuNode[] = entries.map((e) => ({
        key: `/resources/${e.name}`,
        label: e.table.title ?? e.name,
        icon: "Table",
      }));
      nodes.push({
        key: `/${mod}`,
        label: mod.charAt(0).toUpperCase() + mod.slice(1),
        icon: moduleIcon(mod),
        children,
      });
    }
    return nodes;
  }

  // ── tables list ──

  function buildTablesList(): TableMeta[] {
    return tableEntries.map((e) => ({
      name: e.name,
      title: e.table.title ?? e.name,
      model: e.table.model ?? e.name,
    }));
  }

  // ── Handlers ──

  async function menusAction(_ctx: ThinkContext): Promise<{ menus: MenuNode[] }> {
    return { menus: buildMenuTree() };
  }

  function tablesAction(): { tables: TableMeta[] } {
    return { tables: buildTablesList() };
  }

  function tableConfigAction(model: string): { table: TableConfig } | { error: string } {
    const entry = findTable(model);
    if (!entry) return { error: `Table not found: ${model}` };
    const modelEntry = findModel(entry.table.model ?? entry.name);
    if (!modelEntry) return { error: `Model not found for table: ${model}` };
    return { table: buildTableConfig(entry, modelEntry) };
  }

  async function listAction(ctx: ThinkContext, model: string): Promise<{ list: ListResponse }> {
    const modelEntry = findModel(model);
    if (!modelEntry) throw new Error(`Model not found: ${model}`);

    const url = new URL(ctx.request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 20);
    const where: Record<string, unknown> = {};

    // Collect filter params from search fields
    const tableEntry = findTable(model);
    if (tableEntry?.table.search?.fields) {
      for (const sf of tableEntry.table.search.fields) {
        const val = url.searchParams.get(sf.field);
        if (val) where[sf.field] = val;
      }
    }

    const m = ctx.think.model(modelEntry.name, { _aclCtx: ctx });
    let query = m.where(where);
    const sort = url.searchParams.get("sort");
    const order = url.searchParams.get("order") ?? "desc";
    if (sort) query = query.order(`${sort} ${order}`);

    const raw = await query.page(page, pageSize).countSelect();
    return {
      list: {
        items: (raw.data ?? []) as Record<string, unknown>[],
        total: Number(raw.total ?? 0),
        page,
        pageSize,
      },
    };
  }

  function formConfigAction(model: string): { form: FormGroupMeta[] } | { error: string } {
    const entry = findTable(model);
    if (!entry) return { error: `Table not found: ${model}` };
    const groups = (entry.table.form?.groups ?? []).map((g) => ({
      title: g.title,
      columns: g.columns,
      fields: (g.fields ?? []).map((f) => ({
        field: f.field,
        label: f.title,
        type: f.type,
        required: f.required ?? false,
        options: f.options,
      })),
    }));
    return { form: groups };
  }

  async function getRecordAction(ctx: ThinkContext, model: string, id: string): Promise<{ data: Record<string, unknown> | null }> {
    const modelEntry = findModel(model);
    if (!modelEntry) throw new Error(`Model not found: ${model}`);
    const pk = modelEntry.dsl.primaryKey ?? "id";
    const m = ctx.think.model(modelEntry.name, { _aclCtx: ctx });
    const record = await m.where({ [pk]: id }).find();
    return { data: record as Record<string, unknown> | null };
  }

  async function createAction(ctx: ThinkContext, model: string): Promise<{ data: Record<string, unknown> }> {
    const modelEntry = findModel(model);
    if (!modelEntry) throw new Error(`Model not found: ${model}`);
    const body = (ctx.body as Record<string, unknown>) ?? {};
    const m = ctx.think.model(modelEntry.name, { _aclCtx: ctx });
    const record = await m.add(body);
    return { data: record as Record<string, unknown> };
  }

  async function updateAction(ctx: ThinkContext, model: string, id: string): Promise<{ data: Record<string, unknown> }> {
    const modelEntry = findModel(model);
    if (!modelEntry) throw new Error(`Model not found: ${model}`);
    const body = (ctx.body as Record<string, unknown>) ?? {};
    const pk = modelEntry.dsl.primaryKey ?? "id";
    const m = ctx.think.model(modelEntry.name, { _aclCtx: ctx });
    await m.where({ [pk]: id }).update(body);
    const record = await m.where({ [pk]: id }).find();
    return { data: record as Record<string, unknown> };
  }

  async function deleteAction(ctx: ThinkContext, model: string, id: string): Promise<{ ok: boolean }> {
    const modelEntry = findModel(model);
    if (!modelEntry) throw new Error(`Model not found: ${model}`);
    const pk = modelEntry.dsl.primaryKey ?? "id";
    const m = ctx.think.model(modelEntry.name, { _aclCtx: ctx });
    await m.where({ [pk]: id }).delete();
    return { ok: true };
  }

  return {
    menusAction,
    tablesAction,
    tableConfigAction,
    listAction,
    formConfigAction,
    getRecordAction,
    createAction,
    updateAction,
    deleteAction,
  };
}
