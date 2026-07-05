import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { DynamicTable } from '@/components/dynamic/dynamic-table'
import {
  fetchTableConfig, fetchList, createRecord, updateRecord, deleteRecord,
  type TableConfig,
} from '@/lib/admin-api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DynamicForm } from '@/components/dynamic/dynamic-form'
import { Plus, Loader2 } from 'lucide-react'

interface Props {
  resource: string
}

export function ResourcePage({ resource }: Props) {
  const queryClient = useQueryClient()
  const [page] = useState(1)
  const [pageSize] = useState(20)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | null>(null)

  const configQuery = useQuery<TableConfig>({
    queryKey: ['table-config', resource],
    queryFn: () => fetchTableConfig(resource),
  })

  const listQuery = useQuery({
    queryKey: ['list', resource, page, pageSize],
    queryFn: () => fetchList(resource, { page, pageSize }),
    enabled: !!configQuery.data,
  })

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createRecord(resource, data),
    onSuccess: () => { setDialogOpen(false); queryClient.invalidateQueries({ queryKey: ['list', resource] }) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => updateRecord(resource, id, data),
    onSuccess: () => { setDialogOpen(false); setEditingRecord(null); queryClient.invalidateQueries({ queryKey: ['list', resource] }) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRecord(resource, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['list', resource] }),
  })

  const config = configQuery.data
  const loading = configQuery.isLoading || listQuery.isLoading
  const error = configQuery.error?.message ?? listQuery.error?.message
  const items = (listQuery.data?.items ?? []) as Record<string, unknown>[]

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (editingRecord && config) {
      const pk = editingRecord[config.primaryKey] as string
      await updateMutation.mutateAsync({ id: pk, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const handleEdit = (record: Record<string, unknown>) => {
    setEditingRecord(record)
    setDialogOpen(true)
  }

  const handleDelete = (record: Record<string, unknown>) => {
    if (config && confirm('Delete this record?')) {
      deleteMutation.mutate(record[config.primaryKey] as string)
    }
  }

  const fields = config?.form.groups.flatMap((g) => g.fields) ?? []

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              {config?.title ?? resource}
            </h2>
            <p className='text-muted-foreground'>
              {config?.model ? `Model: ${config.model}` : ''}
            </p>
          </div>
          <Button onClick={() => { setEditingRecord(null); setDialogOpen(true) }}>
            <Plus className='mr-2 h-4 w-4' /> Create
          </Button>
        </div>

        {loading && (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        )}
        {error && <div className='text-center py-12 text-destructive'>Error: {error}</div>}
        {config && !loading && (
          <DynamicTable config={config} data={items} onEdit={handleEdit} onDelete={handleDelete} />
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRecord ? 'Edit' : 'Create'} {config?.title}</DialogTitle>
            </DialogHeader>
            <DynamicForm
              fields={fields}
              initialData={editingRecord ?? undefined}
              onSubmit={handleSubmit}
              loading={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
