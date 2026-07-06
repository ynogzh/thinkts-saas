import { type ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Trash2 } from 'lucide-react'

import { DataTableColumnHeader } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { ColumnMeta, FormFieldMeta, TableConfig } from '@/lib/admin-api'

export type ResourceMode = 'create' | 'edit' | 'view' | null

// ── Helpers ────────────────────────────────────────────────

export function rowKey(row: Record<string, unknown>): string {
  return String(row.id ?? row.code ?? row.uuid ?? '')
}

export function normalizeFieldValue(value: unknown): string {
  if (value === undefined || value === null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value, null, 2)
}

export function parseFieldValue(field: FormFieldMeta, value: string): unknown {
  if (field.type === 'number') return value === '' ? null : Number(value)
  if (field.type === 'select' && (field.field === 'tenant_id' || field.field.endsWith('_id')))
    return value === '' ? null : Number(value)
  if (field.type === 'password') return value
  if (field.type === 'json') return value
  return value
}

export function renderCellValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

// ── Field list builder ─────────────────────────────────────

export function buildFieldList(
  config: TableConfig,
  mode: Exclude<ResourceMode, null>,
): FormFieldMeta[] {
  const fields = config.form.groups.flatMap((g) => g.fields)
  if (mode === 'create') return fields.filter((f) => !f.readonly)
  return fields
}

// ── Columns builder ────────────────────────────────────────

export function buildResourceColumns(
  config: TableConfig,
  selectedIds: Set<string>,
  onToggleSelected: (id: string, checked: boolean) => void,
  onView: (row: Record<string, unknown>) => void,
  onEdit: (row: Record<string, unknown>) => void,
  onDelete: (row: Record<string, unknown>) => void,
): Array<ColumnDef<Record<string, unknown>, unknown>> {
  const cols: Array<ColumnDef<Record<string, unknown>, unknown>> = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(checked) => {
            table.toggleAllPageRowsSelected(!!checked)
            for (const row of table.getRowModel().rows) {
              onToggleSelected(rowKey(row.original), !!checked)
            }
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.has(rowKey(row.original))}
          onCheckedChange={(checked) => {
            onToggleSelected(rowKey(row.original), !!checked)
            row.toggleSelected(!!checked)
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ]

  for (const col of config.list.columns) {
    cols.push(buildColumn(col))
  }

  cols.push({
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => onView(row.original)}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(row.original)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    ),
    enableSorting: false,
  })

  return cols
}

function buildColumn(col: ColumnMeta): ColumnDef<Record<string, unknown>, unknown> {
  return {
    accessorKey: col.field,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={col.title ?? col.field} />
    ),
    cell: ({ getValue }) => {
      const val = getValue()
      if (val === null || val === undefined) {
        return <span className="text-muted-foreground text-xs">—</span>
      }
      if (typeof val === 'boolean') {
        return <Badge variant={val ? 'default' : 'secondary'}>{val ? '是' : '否'}</Badge>
      }
      if (col.type === 'datetime' || col.type === 'timestamp') {
        const s = String(val)
        return <span className="text-xs">{s.replace('T', ' ').replace(/\.\d+Z?$/, '')}</span>
      }
      if (col.type === 'status' || col.field.endsWith('status') || col.field.endsWith('_status')) {
        const s = String(val)
        return <Badge variant={s === 'enabled' || s === 'active' ? 'default' : 'secondary'}>{s}</Badge>
      }
      return <span>{renderCellValue(val)}</span>
    },
    enableSorting: col.sortable ?? false,
    size: col.width,
  }
}
