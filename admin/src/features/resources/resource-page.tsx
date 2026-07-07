import { useEffect, useMemo, useState, useTransition } from 'react'
import { Download, Loader2, Plus, RefreshCw } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { DynamicTable } from '@/components/dynamic/dynamic-table'
import { ResourceFormField } from '@/components/dynamic/resource-form-field'
import { Button } from '@/components/ui/button'
import { JsonKeyValueEditor } from '@/components/dynamic/json-key-value-editor'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  type TableConfig, type FormFieldMeta,
  fetchTableConfig, fetchList,
  createRecord, updateRecord, deleteRecord,
  fetchOptions, uploadFile, type OptionItem,
} from '@/lib/admin-api'
import {
  buildFieldList, normalizeFieldValue, parseFieldValue, rowKey,
  type ResourceMode,
} from '@/lib/resource-manager-utils'

interface Props { resource: string }

export function ResourcePage({ resource }: Props) {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [pageState, setPageState] = useState({ page: 1, pageSize: 20 })
  const [mode, setMode] = useState<ResourceMode>(null)
  const [currentRow, setCurrentRow] = useState<Record<string, unknown> | null>(null)
  const [fieldOptions, setFieldOptions] = useState<Record<string, OptionItem[]>>({})
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const configQuery = useQuery<TableConfig>({
    queryKey: ['table-config', resource],
    queryFn: () => fetchTableConfig(resource),
  })
  const listQuery = useQuery({
    queryKey: ['list', resource, pageState, filters],
    queryFn: () => fetchList(resource, {
      page: pageState.page, pageSize: pageState.pageSize,
      ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '')),
    }),
    enabled: !!configQuery.data,
  })

  const config = configQuery.data
  const loading = configQuery.isLoading || listQuery.isLoading
  const fetchError = configQuery.error?.message ?? listQuery.error?.message
  const items = (listQuery.data?.items ?? []) as Record<string, unknown>[]
  const total = listQuery.data?.total ?? 0

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createRecord(resource, data),
    onSuccess: () => { closeDialog(); refresh() },
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => updateRecord(resource, id, data),
    onSuccess: () => { closeDialog(); refresh() },
  })
  const deleteMutation = useMutation({ mutationFn: (id: string) => deleteRecord(resource, id), onSuccess: () => refresh() })

  const activeFields = useMemo(() => (mode && config ? buildFieldList(config, mode) : []), [mode, config])

  function refresh() { startTransition(async () => { await queryClient.invalidateQueries({ queryKey: ['list', resource] }) }) }

  function openDialog(nextMode: Exclude<ResourceMode, null>, row?: Record<string, unknown>) {
    if (!config) return; setError(null); setCurrentRow(row ?? null)
    const fields = buildFieldList(config, nextMode)
    const values: Record<string, string> = {}
    for (const field of fields) values[field.field] = normalizeFieldValue(row?.[field.field] ?? field.default ?? '')
    setFormValues(values); setMode(nextMode)
  }
  function closeDialog() { setMode(null); setCurrentRow(null); setFormValues({}); setError(null) }

  function handleDelete(row: Record<string, unknown>) {
    const id = rowKey(row); if (!id) return
    if (!window.confirm(`确认删除 #${id} ?`)) return
    deleteMutation.mutate(id)
  }

  function updateField(field: string, value: string) { setFormValues((c) => ({ ...c, [field]: value })) }
  async function handleFileUpload(field: FormFieldMeta, file: File) {
    try { setError(null); const { url } = await uploadFile(file); updateField(field.field, url) } catch (e) { setError(e instanceof Error ? e.message : '上传失败') }
  }
  function handleSubmit() {
    if (!mode || mode === 'view' || !config) return
    const fields = buildFieldList(config, mode)
    const payload: Record<string, unknown> = {}
    for (const field of fields) { const rv = formValues[field.field] ?? ''; if (rv === '' && !field.required) continue; payload[field.field] = parseFieldValue(field, rv) }
    if (mode === 'create') createMutation.mutate(payload)
    else if (currentRow) { const id = rowKey(currentRow); if (id) updateMutation.mutate({ id, data: payload }) }
  }

  function handleExportCsv() {
    if (!config) return
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(filters)) { if (v) params.set(k, v) }
    window.open(`/admin/api/tables/${encodeURIComponent(resource)}/export?${params.toString()}`, '_blank')
  }

  useEffect(() => {
    if (!mode || mode === 'view' || !config) return
    const pendingFields = activeFields.filter((f) => f.optionsSource && !(f.field in fieldOptions))
    if (!pendingFields.length) return; let c = false
    void Promise.all(pendingFields.map(async (f) => { if (!f.optionsSource) return null; const o = await fetchOptions(f.optionsSource.model, f.optionsSource.labelField, f.optionsSource.valueField); return [f.field, o] as const }))
      .then((e) => { if (!c) setFieldOptions((cur) => ({ ...cur, ...Object.fromEntries((e.filter(Boolean) as [string, OptionItem[]][])) })) })
    return () => { c = true }
  }, [activeFields, fieldOptions, mode, config])

  if (!config && loading) return <div className='space-y-6'><Skeleton className='h-8 w-48' /><Skeleton className='h-64 w-full rounded-xl' /></div>
  if (!config && fetchError) return <Alert variant='destructive'><AlertDescription>{fetchError}</AlertDescription></Alert>
  if (!config) return null

  const formGroups = config.form?.groups ?? []
  const hasMultipleGroups = formGroups.length > 1

  return (
    <>
      <Header />

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>{config.title}</h2>
            <p className='text-muted-foreground'>{config.model}</p>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' onClick={handleExportCsv}>
              <Download className='mr-1 size-3' />导出
            </Button>
            <Button variant='outline' size='sm' onClick={refresh} disabled={pending}>
              {pending ? <Loader2 className='mr-1 size-3 animate-spin' /> : <RefreshCw className='mr-1 size-3' />}
              刷新
            </Button>
            <Button size='sm' onClick={() => openDialog('create')}>
              <Plus className='mr-1 size-3' />新增
            </Button>
          </div>
        </div>

        {(error || fetchError) && <Alert variant='destructive'><AlertDescription>{error ?? fetchError}</AlertDescription></Alert>}

        <DynamicTable
          config={config}
          data={items}
          loading={loading}
          total={total}
          page={pageState.page}
          pageSize={pageState.pageSize}
          onFilterChange={(f) => { setFilters(f); startTransition(async () => { setPageState((p) => ({ ...p, page: 1 })); await queryClient.invalidateQueries({ queryKey: ['list', resource] }) }) }}
          onView={(row) => openDialog('view', row)}
          onEdit={(row) => openDialog('edit', row)}
          onDelete={(row) => handleDelete(row)}
          rowKey={rowKey}
        />
      </Main>

      <Sheet open={Boolean(mode)} onOpenChange={(open) => (open ? undefined : closeDialog())}>
        <SheetContent className='flex flex-col'>
          <SheetHeader className='text-start'>
            <SheetTitle>{mode === 'create' ? `新增${config.title}` : mode === 'edit' ? `编辑${config.title}` : `${config.title}详情`}</SheetTitle>
            <SheetDescription>{mode === 'create' ? '创建新记录。' : mode === 'edit' ? '修改记录信息。' : '查看记录详情。'}</SheetDescription>
          </SheetHeader>
          <form id='resource-form' onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className='flex-1 space-y-6 overflow-y-auto px-4'>
            {hasMultipleGroups ? (
              <Tabs defaultValue='0' className='w-full'>
                <TabsList className='w-full'>
                  {formGroups.map((g, i) => (
                    <TabsTrigger key={i} value={String(i)} className='flex-1'>{g.title ?? `分组${i + 1}`}</TabsTrigger>
                  ))}
                </TabsList>
                {formGroups.map((g, gi) => (
                  <TabsContent key={gi} value={String(gi)} className='space-y-4'>
                    {g.fields.map((field) => {
                      const isJson = field.type === 'json' || field.field.endsWith('_json')
                      const schema = config.jsonSchema?.[field.field]
                      if (isJson && schema && mode !== 'view') {
                        return (
                          <div key={field.field}>
                            <Label>{field.label}</Label>
                            <JsonKeyValueEditor schema={schema} value={formValues[field.field] ?? ''} onChange={(v) => updateField(field.field, v)} />
                          </div>
                        )
                      }
                      return <ResourceFormField key={field.field} field={field} mode={mode ?? 'view'} value={formValues[field.field] ?? ''} options={fieldOptions[field.field]} loadingOptions={!!(field.optionsSource && !(field.field in fieldOptions))} pending={pending} onChange={updateField} onUpload={handleFileUpload} />
                    })}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              activeFields.map((field) => {
                const isJson = field.type === 'json' || field.field.endsWith('_json')
                const schema = config.jsonSchema?.[field.field]
                if (isJson && schema && mode !== 'view') {
                  return (
                    <div key={field.field}>
                      <Label>{field.label}</Label>
                      <JsonKeyValueEditor schema={schema} value={formValues[field.field] ?? ''} onChange={(v) => updateField(field.field, v)} />
                    </div>
                  )
                }
                return <ResourceFormField key={field.field} field={field} mode={mode ?? 'view'} value={formValues[field.field] ?? ''} options={fieldOptions[field.field]} loadingOptions={!!(field.optionsSource && !(field.field in fieldOptions))} pending={pending} onChange={updateField} onUpload={handleFileUpload} />
              })
            )}
          </form>
          {error && <Alert variant='destructive'><AlertDescription>{error}</AlertDescription></Alert>}
          <SheetFooter className='gap-2'>
            <Button variant='outline' size='sm' onClick={closeDialog}>关闭</Button>
            {mode !== 'view' && <Button size='sm' type='submit' form='resource-form' disabled={pending || createMutation.isPending || updateMutation.isPending}>{(pending || createMutation.isPending || updateMutation.isPending) ? <Loader2 className='mr-1 size-3 animate-spin' /> : null}保存</Button>}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
