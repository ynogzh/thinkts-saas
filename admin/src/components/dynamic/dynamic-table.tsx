import { useMemo, useState, useEffect } from 'react'
import {
  type ColumnDef, type ColumnFiltersState,
  type SortingState, type VisibilityState,
  flexRender, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel, useReactTable,
} from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { DataTablePagination } from '@/components/data-table/pagination'
import { DataTableToolbar } from '@/components/data-table/toolbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { TableConfig, ColumnMeta, SearchFieldMeta } from '@/lib/admin-api'
import { ReferenceCell } from '@/components/dynamic/reference-cell'
import { clearFkCache } from '@/lib/fk-cache'

export interface DynamicTableProps {
  config: TableConfig
  data: Record<string, unknown>[]
  loading?: boolean
  total?: number
  page: number
  pageSize: number
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void
  onFilterChange?: (filters: Record<string, string>) => void
  onView?: (row: Record<string, unknown>) => void
  onEdit?: (row: Record<string, unknown>) => void
  onDelete?: (row: Record<string, unknown>) => void
  onAction?: (service: string) => void
  onInlineEdit?: (row: Record<string, unknown>, field: string, value: string) => void
  onBatchAction?: (service: string, selectedIds: string[]) => void
  rowKey?: (row: Record<string, unknown>) => string
}

const LS_KEY = 'thinkts-admin-column-visibility'

function loadVisibility(tableKey: string): Record<string, boolean> {
  try {
    const stored = localStorage.getItem(LS_KEY)
    if (stored) return JSON.parse(stored)[tableKey] ?? {}
  } catch { /* ignore */ }
  return {}
}

function saveVisibility(tableKey: string, visibility: VisibilityState) {
  try {
    const stored = localStorage.getItem(LS_KEY)
    const all = stored ? JSON.parse(stored) : {}
    all[tableKey] = visibility
    localStorage.setItem(LS_KEY, JSON.stringify(all))
  } catch { /* ignore */ }
}

function renderCellValue(val: unknown, col: ColumnMeta, row?: Record<string, unknown>) {
  if (val === null || val === undefined) return <span className='text-muted-foreground text-xs'>—</span>
  if (typeof val === 'boolean') return <Badge variant={val ? 'default' : 'secondary'}>{val ? '是' : '否'}</Badge>
  if (col.type === 'datetime' || col.type === 'timestamp') {
    const s = String(val)
    return <span className='text-xs'>{s.replace('T', ' ').replace(/\.\d+Z?$/, '')}</span>
  }
  if (col.type === 'status' || col.field?.endsWith('status') || col.field?.endsWith('_status')) {
    const s = String(val)
    return <Badge variant={s === 'enabled' || s === 'active' ? 'default' : 'secondary'}>{s}</Badge>
  }
  if (col.displayField && row) {
    const displayKey = `${col.field.replace(/_id$/, '')}_${col.displayField}`
    const displayVal = row[displayKey]
    if (displayVal) return <span className='text-sm'>{String(displayVal)}</span>
  }
  return <span>{String(val)}</span>
}

function InlineEditCell({ value, field, row, onSave }: {
  value: string | number | null
  field: string
  row: Record<string, unknown>
  onSave?: (row: Record<string, unknown>, field: string, value: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(value ?? ''))

  if (!onSave || editing === false) {
    return (
      <span onDoubleClick={() => { setEditing(true); setEditValue(String(value ?? '')) }} className='cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1'>
        {String(value ?? '')}
      </span>
    )
  }

  return (
    <Input
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={() => { setEditing(false); if (editValue !== String(value ?? '')) onSave(row, field, editValue) }}
      onKeyDown={(e) => { if (e.key === 'Enter') { setEditing(false); if (editValue !== String(value ?? '')) onSave(row, field, editValue) } if (e.key === 'Escape') setEditing(false) }}
      className='h-7 text-sm'
      autoFocus
    />
  )
}

interface FacetedFilterDef {
  columnId: string
  title: string
  options: Array<{ label: string; value: string }>
}

function buildFacetedFilter(f: SearchFieldMeta): FacetedFilterDef | undefined {
  if (!f.options?.length) return undefined
  return {
    columnId: f.field,
    title: f.label,
    options: f.options.map((o) => ({
      label: o.label,
      value: String(o.value),
    })),
  }
}
export function DynamicTable({
  config, data, loading, total = 0,
  page, pageSize, 
  onSortChange, onFilterChange, onView, onEdit, onDelete, onAction, onInlineEdit, onBatchAction,
  rowKey = (row) => String(row.id ?? row.code ?? ''),
}: DynamicTableProps) {
  const tableKey = `table-${config.model}`
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => loadVisibility(tableKey))

  const hasActions = !!(onView || onEdit || onDelete)
  const searchFields = config.search?.fields ?? []
  const facetedFilters = searchFields.filter((f) => f.options?.length).map(buildFacetedFilter).filter(Boolean) as FacetedFilterDef[]
  const textFields = searchFields.filter((f) => !f.options?.length).slice(0, 3)
  const searchKey = textFields[0]?.field

  // Collect FK reference IDs per column for batch fetching
  const fkIdsByColumn = useMemo(() => {
    const byCol: Record<string, (string | number)[]> = {}
    const fkCols = config.list.columns.filter((c) => c.refModel)
    if (fkCols.length === 0) return byCol
    for (const col of fkCols) {
      const ids: (string | number)[] = []
      for (const row of data) {
        const val = row[col.field]
        if (val != null) ids.push(val as string | number)
      }
      byCol[col.field] = [...new Set(ids.map((id) => String(id)))].map((s) => (/^\d+$/.test(s) ? Number(s) : s))
    }
    return byCol
  }, [config, data])

  // Clear FK cache on data change (page navigation / filter change)
  useEffect(() => {
    clearFkCache()
  }, [data])

  const columns: ColumnDef<Record<string, unknown>>[] = useMemo(() => {
    const cols: ColumnDef<Record<string, unknown>>[] = [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ]
    for (const col of config.list.columns) {
      cols.push({
        accessorKey: col.field,
        header: ({ column }) => <DataTableColumnHeader column={column} title={col.title ?? col.field} />,
        cell: ({ getValue, row }) => {
          const val = getValue() as string | number | null
          if (col.refModel && col.displayField) {
            return (
              <div className='max-w-[180px] truncate'>
                <ReferenceCell
                  value={val}
                  model={col.refModel}
                  displayField={col.displayField}
                  allPageIds={fkIdsByColumn[col.field]}
                  linkable={col.linkable}
                />
              </div>
            )
          }
          const isFk = col.refModel
          const isStatus = col.type === 'status' || col.field?.endsWith('_status')
          const isBool = col.type === 'boolean'
          const isDt = col.type === 'datetime' || col.type === 'timestamp'
          const canInlineEdit = onInlineEdit && !isFk && !isStatus && !isBool && !isDt

          if (canInlineEdit) {
            return (
              <div className='max-w-[180px] truncate'>
                <InlineEditCell value={val} field={col.field} row={row.original} onSave={onInlineEdit} />
              </div>
            )
          }

          return <div className='max-w-[180px] truncate'>{renderCellValue(val, col, row.original)}</div>
        },
        enableSorting: col.sortable ?? true,
      })
    }
    if (hasActions) {
      cols.push({
        id: 'actions',
        header: () => <div className='text-right'>操作</div>,
        cell: ({ row }) => (
          <div className='flex justify-end'>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'>
                  <DotsHorizontalIcon className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-32'>
                {onView && <DropdownMenuItem onClick={() => onView(row.original)}>查看</DropdownMenuItem>}
                {onEdit && <DropdownMenuItem onClick={() => onEdit(row.original)}>编辑</DropdownMenuItem>}
                {onDelete && <DropdownMenuItem className='text-destructive' onClick={() => onDelete(row.original)}>删除</DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      })
    }
    return cols
  }, [config, hasActions, onView, onEdit, onDelete, onInlineEdit, fkIdsByColumn])

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => rowKey(row),
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      setSorting(next)
      if (onSortChange && next.length > 0) {
        onSortChange(next[0].id, next[0].desc ? 'desc' : 'asc')
      }
    },
    onColumnFiltersChange: (updater) => {
      const next = typeof updater === 'function' ? updater(columnFilters) : updater
      setColumnFilters(next)
      const filters: Record<string, string> = {}
      for (const f of next) {
        if (typeof f.value === 'string') filters[f.id] = f.value
        else if (Array.isArray(f.value)) filters[f.id] = f.value.join(',')
      }
      onFilterChange?.(filters)
    },
    onColumnVisibilityChange: (updater) => {
      const next = typeof updater === 'function' ? updater(columnVisibility) : updater
      setColumnVisibility(next)
      saveVisibility(tableKey, next as VisibilityState)
    },
    onRowSelectionChange: setRowSelection,
    onPaginationChange: () => {}, // manual
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting, columnFilters, columnVisibility, rowSelection, pagination: { pageIndex: page - 1, pageSize } },
  })
  return (
    <div className='space-y-4'>
      {config.batchActions && config.batchActions.length > 0 && Object.keys(rowSelection).length > 0 && (
        <div className='flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2'>
          <span className='text-sm text-muted-foreground mr-2'>已选 {Object.keys(rowSelection).length} 条</span>
          {config.batchActions.map((act) => (
            <Button key={act.label} variant='outline' size='sm'
              onClick={() => {
                const ids = Object.keys(rowSelection)
                onBatchAction?.(act.service, ids)
              }}>
              {act.label}
            </Button>
          ))}
        </div>
      )}
      {config.uiActions && config.uiActions.length > 0 && (
        <div className='flex items-center gap-2'>
          {config.uiActions.map((act) => (
            <Button key={act.label} variant='outline' size='sm'
              onClick={() => onAction?.(act.service)}>
              {act.label}
            </Button>
          ))}
        </div>
      )}
      <DataTableToolbar table={table} textFields={textFields} searchKey={searchKey} filters={facetedFilters} searchPlaceholder="筛选" />
      <div className='flex items-center justify-between'>
        <span className='text-sm text-muted-foreground'>共 {total} 条记录</span>
      </div>
      <div className='rounded-md border overflow-x-auto'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSelect = header.column.id === 'select'
                  const isActions = header.column.id === 'actions'
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}
                      className={isSelect ? 'sticky left-0 z-10 bg-background' : isActions ? 'sticky right-0 z-10 bg-background' : ''}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center text-muted-foreground'>
                  加载中...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => {
                    const isSelect = cell.column.id === 'select'
                    const isActions = cell.column.id === 'actions'
                    return (
                      <TableCell key={cell.id}
                        className={isSelect ? 'sticky left-0 z-10 bg-background' : isActions ? 'sticky right-0 z-10 bg-background' : ''}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center text-muted-foreground'>
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
