import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  flexRender, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel, useReactTable,
} from '@tanstack/react-table'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import type { TableConfig } from '@/lib/admin-api'

interface Props {
  config: TableConfig
  data: Record<string, unknown>[]
  onEdit?: (record: Record<string, unknown>) => void
  onDelete?: (record: Record<string, unknown>) => void
}

export function DynamicTable({ config, data, onEdit, onDelete }: Props) {
  const hasActions = !!(onEdit || onDelete)

  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(() => {
    const cols = config.list.columns.map((col) => ({
      accessorKey: col.field,
      header: col.title ?? col.field,
      cell: ({ getValue }: { getValue: () => unknown }) => {
        const val = getValue()
        if (val === null || val === undefined) return <span className='text-muted-foreground'>—</span>
        if (typeof val === 'object') return <span className='text-xs font-mono'>{JSON.stringify(val)}</span>
        return <span>{String(val)}</span>
      },
      enableSorting: col.sortable ?? false,
    }))

    if (hasActions) {
      cols.push({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            {onEdit && (
              <Button variant='ghost' size='icon' onClick={() => onEdit(row.original)}>
                <Pencil className='h-4 w-4' />
              </Button>
            )}
            {onDelete && (
              <Button variant='ghost' size='icon' onClick={() => onDelete(row.original)}>
                <Trash2 className='h-4 w-4 text-destructive' />
              </Button>
            )}
          </div>
        ),
        enableSorting: false,
      })
    }

    return cols
  }, [config, hasActions, onEdit, onDelete])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: config.list.pageSize } },
  })

  return (
    <div className='flex flex-col gap-4'>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No results.
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
