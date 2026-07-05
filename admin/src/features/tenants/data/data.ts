import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import type { Tenant } from './tenants'
import { statuses } from './tenants'

export const columns: ColumnDef<Tenant>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => <span className='font-mono text-sm'>{row.getValue('code')}</span>,
    enableSorting: true,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <span className='font-medium'>{row.getValue('name')}</span>,
    enableSorting: true,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge variant={status === 'enabled' ? 'default' : 'secondary'}>
          {status}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'packageId',
    header: 'Package',
    cell: ({ row }) => <span>{row.getValue('packageId') ?? '—'}</span>,
    enableSorting: true,
  },
  {
    accessorKey: 'expireAt',
    header: 'Expires',
    cell: ({ row }) => {
      const val = row.getValue('expireAt') as string | undefined
      return <span>{val ?? '—'}</span>
    },
    enableSorting: true,
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => <span>{row.getValue<string>('createdAt').slice(0, 10)}</span>,
    enableSorting: true,
  },
]

export const filterFields = [
  {
    label: 'Status',
    value: 'status',
    options: statuses.map(({ label, value }) => ({ label, value })),
  },
]
