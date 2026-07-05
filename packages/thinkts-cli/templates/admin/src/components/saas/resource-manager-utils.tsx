import { type Column, type ColumnDef, type Row } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table10";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ResourceFieldConfig, ResourcePageConfig, ResourceTableConfig } from "@/lib/saas-admin/types";

export type ResourceMode = "create" | "edit" | "view" | null;

export type ClientResourceConfig = Pick<
  ResourcePageConfig,
  "model" | "title" | "description" | "moduleCode" | "path" | "createPath" | "readOnly" | "defaultValues" | "createExtraFields" | "actionLinks"
>;

export function rowKey(row: Record<string, unknown>): string {
  return String(row.id ?? row.code ?? row.uuid ?? "");
}

export function normalizeFieldValue(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value, null, 2);
}

export function parseFieldValue(field: ResourceFieldConfig, value: string): unknown {
  if (field.type === "number") return value === "" ? null : Number(value);
  if (field.type === "select" && (field.field === "tenant_id" || field.field.endsWith("_id"))) {
    return value === "" ? null : Number(value);
  }
  if (field.type === "password") return value;
  if (field.type === "json" || (field.type === "textarea" && field.field.endsWith("_json"))) return value;
  return value;
}

function formatCellValue(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(formatCellValue).join(", ");
  return JSON.stringify(value);
}

export function renderCellValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) return <span className="text-muted-foreground">-</span>;
  if (typeof value === "boolean") {
    return value ? <Badge variant="default">是</Badge> : <Badge variant="secondary">否</Badge>;
  }
  if (typeof value === "number") return value;
  return formatCellValue(value);
}

export function buildFieldList(tableConfig: ResourceTableConfig, resource: ClientResourceConfig, mode: Exclude<ResourceMode, null>): ResourceFieldConfig[] {
  const groups = tableConfig.form?.groups ?? [];
  const allFields = groups.flatMap((group) => group.fields);
  const formWithModes = tableConfig.form as ResourceTableConfig["form"] & { modes?: Record<string, { fields?: string[] }> } | undefined;
  const modeFields = formWithModes?.modes?.[mode]?.fields ?? allFields.map((field) => field.field);
  const filtered = allFields.filter((field) => modeFields.includes(field.field));
  return mode === "create" && resource.createExtraFields?.length ? [...filtered, ...resource.createExtraFields.map((field) => ({ field, title: field, type: "text" } as ResourceFieldConfig))] : filtered;
}

export function buildResourceColumns(
  tableConfig: ResourceTableConfig,
  resource: ClientResourceConfig,
  selectedIds: Set<string>,
  onToggleSelected: (id: string, checked: boolean) => void,
  onView: (row: Record<string, unknown>) => void,
  onEdit: (row: Record<string, unknown>) => void,
  onDelete: (row: Record<string, unknown>) => void,
): Array<ColumnDef<Record<string, unknown>, unknown>> {
  const columns: Array<ColumnDef<Record<string, unknown>, unknown>> = [
    {
      id: "select",
      header: ({ table }: { table: { getIsAllPageRowsSelected: () => boolean; getIsSomePageRowsSelected: () => boolean; toggleAllPageRowsSelected: (value: boolean) => void } }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: { row: Row<Record<string, unknown>> }) => {
        const id = rowKey(row.original);
        return (
          <Checkbox
            checked={selectedIds.has(id)}
            onCheckedChange={(value) => onToggleSelected(id, !!value)}
            aria-label={`Select row ${id}`}
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];

  for (const field of tableConfig.columns ?? []) {
    columns.push({
      accessorKey: field.field,
      header: ({ column }: { column: Column<Record<string, unknown>, unknown> }) => (
        <DataTableColumnHeader column={column} title={field.title} />
      ),
      cell: ({ row }: { row: Row<Record<string, unknown>> }) => renderCellValue(row.original[field.field]),
    });
  }

  if (!resource.readOnly) {
    columns.push({
      id: "actions",
      header: "操作",
      cell: ({ row }: { row: Row<Record<string, unknown>> }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => onView(row.original)} aria-label="查看">
            <Eye className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)} aria-label="编辑">
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(row.original)} aria-label="删除">
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    });
  }

  return columns;
}
