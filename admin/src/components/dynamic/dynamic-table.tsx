import { useMemo, useState } from 'react'
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
import { DataTableViewOptions } from '@/components/data-table/view-options'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { TableConfig, ColumnMeta, SearchFieldMeta } from '@/lib/admin-api'

export interface DynamicTableProps {
  config: TableConfig
  data: Record<string, unknown>[]
  loading?: boolean
  total?: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void
  onFilterChange?: (filters: Record<string, string>) => void
  onView?: (row: Record<string, unknown>) => void
  onEdit?: (row: Record<string, unknown>) => void
  onDelete?: (row: Record<string, unknown>) => void
  onAction?: (service: string) => void
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

function renderCellValue(val: unknown, col: ColumnMeta) {
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
  return <span>{String(val)}</span>
}

function buildFacetedFilter(f: SearchFieldMeta) {
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
  page, pageSize, onPageChange, onPageSizeChange,
  onSortChange, onFilterChange, onView, onEdit, onDelete, onAction,
  rowKey = (row) => String(row.id ?? row.code ?? ''),
}: DynamicTableProps) {
  const tableKey = `table-${config.model}`
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => loadVisibility(tableKey))
  const [rowSelection, setRowSelection] = useState({})

  const hasActions = !!(onView || onEdit || onDelete)
  const searchFields = config.search?.fields ?? []
  const facetedFilters = searchFields.filter((f) => f.options?.length).map(buildFacetedFilter).filter(Boolean) as NonNullable<ReturnType<typeof buildFacetedFilter>>[]
  const textFields = searchFields.filter((f) => !f.options?.length).slice(0, 3)  // max 3 text inputs
  const searchKey = textFields[0]?.field

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
        cell: ({ getValue }) => renderCellValue(getValue(), col),
        enableSorting: col.sortable ?? true,
      })
    }
    if (hasActions) {
      cols.push({
        id: 'actions',
        header: '操作',
        cell: ({ row }) => (
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
        ),
        enableSorting: false,
        enableHiding: false,
      })
    }
    return cols
  }, [config, hasActions, onView, onEdit, onDelete])

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
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
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
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
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
