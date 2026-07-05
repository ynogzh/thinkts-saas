import type { ColumnMeta, TableMeta } from "./generate";

export const BLACKLIST_FIELDS = new Set([
  "password_hash",
  "password",
  "salt",
  "secret",
  "secret_key",
  "token",
  "access_token",
  "refresh_token",
  "deleted_at",
  "is_deleted",
  "delete_time",
  "create_time",
  "update_time",
]);

export const SYSTEM_FIELDS = new Set(["id", "created_at", "updated_at"]);

export const SENSITIVE_PATTERNS = [/password/, /secret/, /token/, /salt/, /credential/, /private_key/];

export function isBlacklisted(name: string): boolean {
  if (BLACKLIST_FIELDS.has(name)) return true;
  return SENSITIVE_PATTERNS.some((p) => p.test(name));
}

export function isSystem(name: string): boolean {
  return SYSTEM_FIELDS.has(name);
}

export function toLabel(str: string): string {
  return str
    .split("_")
    .map((s, i) => (i === 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s))
    .join(" ");
}

export function getTitle(column: ColumnMeta): string {
  if (column.comment && column.comment.trim()) return column.comment.trim();
  return toLabel(column.name);
}

export function parseCommentEnum(comment: string): Array<{ label: string; value: string }> | undefined {
  const match = comment.match(/[:：]\s*([\s\S]+)/);
  if (!match) return undefined;
  const body = match[1];
  const pairs: Array<{ label: string; value: string }> = [];
  const re = /(\d+)\s*[-:=,，]\s*([^,，;；]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    pairs.push({ label: m[2].trim(), value: m[1].trim() });
  }
  if (pairs.length > 0) return pairs;

  const simple = body.match(/['"]([^'"]+)['"]/g);
  if (simple) {
    return simple.map((s) => {
      const v = s.slice(1, -1);
      return { label: v, value: v };
    });
  }
  return undefined;
}

export function extractEnumOptions(column: ColumnMeta): Array<{ label: string; value: string }> | undefined {
  if (column.type === "enum") {
    const m = column.dataType.match(/'([^']+)'/g);
    if (m) {
      const fromComment = parseCommentEnum(column.comment);
      return m.map((raw) => {
        const value = raw.slice(1, -1);
        const label = fromComment?.find((o) => o.value === value)?.label ?? value;
        return { label, value };
      });
    }
  }
  return undefined;
}

function detectBoolean(column: ColumnMeta): boolean {
  const name = column.name;
  if (column.type === "boolean") return true;
  if (/^is_|^has_|^can_|^enable_|^allow_/.test(name)) return true;
  if (name.endsWith("_flag") && column.type === "integer") return true;
  return false;
}

export function inferComponentType(column: ColumnMeta): string {
  const name = column.name;
  if (name.endsWith("_url") || name.endsWith("_avatar") || name.endsWith("_image") || name.endsWith("_logo") || name.endsWith("_cover")) return "image";
  if (name.endsWith("_file") || name.endsWith("_attachment") || name.endsWith("_path")) return "file";
  if (name === "email") return "email";
  if (name === "phone" || name === "mobile" || name === "tel") return "phone";
  if (name === "color" || name.endsWith("_color")) return "colorPicker";
  if (detectBoolean(column)) return "switch";
  if (name.endsWith("_status") || name.endsWith("_state") || name.endsWith("_type") || name.endsWith("_role") || name.endsWith("_level") || name.endsWith("_category")) return "select";
  if (name.endsWith("_count") || name.endsWith("_amount") || name.endsWith("_price") || name.endsWith("_balance") || name.endsWith("_score") || name.endsWith("_num") || name.endsWith("_total") || name === "sort" || name === "sequence" || name === "priority" || name === "weight") return "number";
  if (name.endsWith("_id") && column.fkTable) return "searchSelect";
  if (column.type === "text" || column.type === "json") return "textarea";
  if (column.type === "timestamp" || column.type === "date") return "datetime";
  if (column.type === "enum") return "select";
  if (column.type === "integer" || column.type === "bigInteger" || column.type === "decimal" || column.type === "float") return "number";
  return "input";
}

export function inferSearchComponentType(column: ColumnMeta): string {
  const name = column.name;
  if (name.endsWith("_url") || name.endsWith("_avatar") || name.endsWith("_image")) return "image";
  if (detectBoolean(column)) return "select";
  if (name.endsWith("_status") || name.endsWith("_state") || name.endsWith("_type") || name.endsWith("_role") || name.endsWith("_level") || name.endsWith("_category") || column.type === "enum") return "select";
  if (name.endsWith("_count") || name.endsWith("_amount") || name.endsWith("_price") || name.endsWith("_balance") || name.endsWith("_score") || name.endsWith("_num") || name.endsWith("_total") || column.type === "integer" || column.type === "bigInteger" || column.type === "decimal" || column.type === "float") return "numberRange";
  if (column.type === "timestamp" || column.type === "date") return "daterange";
  return "input";
}

export function listRenderType(column: ColumnMeta): string | undefined {
  const name = column.name;
  if (name.endsWith("_url") || name.endsWith("_avatar") || name.endsWith("_image")) return "image";
  if (detectBoolean(column)) return "boolean";
  if (name.endsWith("_status") || name.endsWith("_state") || name.endsWith("_type") || name.endsWith("_role") || name.endsWith("_level") || name.endsWith("_category")) return "tag";
  if (name.endsWith("_price") || name.endsWith("_amount") || name.endsWith("_balance")) return "money";
  if (column.type === "timestamp" || column.type === "date") return "datetime";
  if (column.type === "enum") return "tag";
  return undefined;
}

export function columnWidth(column: ColumnMeta): number {
  const name = column.name;
  if (column.isPrimary) return 80;
  if (name.endsWith("_url") || name.endsWith("_avatar") || name.endsWith("_image")) return 120;
  if (detectBoolean(column) || name.endsWith("_status") || name.endsWith("_type")) return 100;
  if (column.type === "integer" || column.type === "bigInteger") return 80;
  if (name === "display_name" || name === "name" || name === "title" || name.endsWith("_name") || name.endsWith("_title")) return 200;
  return 160;
}

function isReadOnlyTable(tableName: string): boolean {
  const suffixes = ["_log", "_logs", "_history", "_histories", "_record", "_records", "_audit", "_trace"];
  return suffixes.some((s) => tableName.endsWith(s)) || /_stats?_|_report_|_daily$|_monthly$|_yearly$/.test(tableName);
}

export function listColumnsFor(table: TableMeta): Array<Record<string, unknown>> {
  const candidates = table.columns.filter((c) => !isBlacklisted(c.name));
  const scored = candidates.map((c) => {
    const name = c.name;
    let score = 0;
    if (c.isPrimary) score += 1;
    if (c.comment) score += 5;
    if (name === "name" || name === "title" || name === "display_name" || name.endsWith("_name") || name.endsWith("_title")) score += 10;
    if (name.endsWith("_status") || name.endsWith("_type") || name.endsWith("_state")) score += 8;
    if (name === "phone" || name === "email") score += 6;
    if (isSystem(name)) score -= 5;
    if (c.type === "json" || c.type === "text") score -= 3;
    return { c, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const selected = scored.slice(0, 8).map((s) => s.c);
  const primary = table.columns.find((c) => c.isPrimary);
  if (selected.length === 0 && primary) selected.push(primary);

  return selected.map((c) => {
    const render = listRenderType(c);
    const col: Record<string, unknown> = {
      field: c.name,
      title: getTitle(c),
      width: columnWidth(c),
    };
    if (render) col.render = render;
    return col;
  });
}

export function searchFieldsFor(table: TableMeta): Array<Record<string, unknown>> {
  const candidates = table.columns.filter((c) => !isBlacklisted(c.name) && !isSystem(c.name));
  const scored = candidates.map((c) => {
    const name = c.name;
    let score = 0;
    if (name.endsWith("_status") || name.endsWith("_state") || name.endsWith("_type") || name.endsWith("_role") || name.endsWith("_level")) score += 10;
    if (name === "name" || name === "title" || name === "display_name" || name.endsWith("_name")) score += 8;
    if (name === "phone" || name === "email") score += 7;
    if (c.type === "enum") score += 6;
    if (detectBoolean(c)) score += 5;
    if (c.type === "timestamp" || c.type === "date") score += 3;
    return { c, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const selected = scored.slice(0, 4).map((s) => s.c);

  return selected.map((c) => {
    const type = inferSearchComponentType(c);
    const field: Record<string, unknown> = { field: c.name, title: getTitle(c), type };
    const options = extractEnumOptions(c);
    if (options) field.options = options;
    if (detectBoolean(c)) {
      field.options = [
        { label: "全部", value: "" },
        { label: "是", value: 1 },
        { label: "否", value: 0 },
      ];
    }
    return field;
  });
}

export function formFieldsFor(table: TableMeta): Array<Record<string, unknown>> {
  return table.columns
    .filter((c) => !isBlacklisted(c.name) && !c.autoIncrement && !isSystem(c.name))
    .map((c) => {
      const type = inferComponentType(c);
      const field: Record<string, unknown> = { field: c.name, title: getTitle(c), type };
      const options = extractEnumOptions(c);
      if (options) field.options = options;
      if (!c.nullable && c.defaultValue === undefined && !c.isPrimary) field.required = true;
      if (type === "textarea" || type === "editor") field.span = 2;
      return field;
    });
}

export function generateTableJson(table: TableMeta, tableComment?: string): string {
  const primaryKey = table.columns.find((c) => c.isPrimary)?.name ?? "id";
  const listColumns = listColumnsFor(table);
  const searchFields = searchFieldsFor(table);
  const formFields = formFieldsFor(table);
  const readOnly = isReadOnlyTable(table.name);

  const tableJson: Record<string, unknown> = {
    title: tableComment && tableComment.trim() ? tableComment.trim() : `${toLabel(table.name)}管理`,
    model: table.name,
    list: {
      columns: listColumns,
      orderBy: { field: primaryKey, direction: "desc" as const },
      pageSize: readOnly ? 50 : 20,
      rowActions: readOnly ? [{ type: "view", title: "查看" }] : [
        { type: "view", title: "查看" },
        { type: "edit", title: "编辑" },
        { type: "delete", title: "删除", confirm: "确认删除？" },
      ],
      headerActions: readOnly ? [] : [{ type: "create", title: `新增${toLabel(table.name)}`, icon: "plus" }],
    },
    search: {
      fields: searchFields,
      showCount: Math.min(searchFields.length, 3),
    },
    form: {
      groups: [{ title: "基本信息", columns: 2, fields: formFields }],
      modes: {
        create: { fields: formFields.map((f) => f.field as string) },
        edit: { fields: formFields.map((f) => f.field as string) },
        view: { fields: table.columns.filter((c) => !isBlacklisted(c.name)).map((c) => c.name) },
      },
    },
  };
  return JSON.stringify(tableJson, null, 2);
}
