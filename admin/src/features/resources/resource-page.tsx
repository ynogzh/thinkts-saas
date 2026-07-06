'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { Loader2, Plus, RefreshCw, Search, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { ResourceFormField } from '@/components/dynamic/resource-form-field'
import { JsonKeyValueEditor } from '@/components/dynamic/json-key-value-editor'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  type TableConfig, type FormFieldMeta,
  fetchTableConfig, fetchList,
  createRecord, updateRecord, deleteRecord, batchDeleteRecords,
  fetchOptions, uploadFile, type OptionItem,
} from '@/lib/admin-api'
import {
  buildFieldList,
  normalizeFieldValue, parseFieldValue, rowKey, renderCellValue,
  type ResourceMode,
} from '@/lib/resource-manager-utils'

// ── Types ──

interface PageState { page: number; pageSize: number }

// ── Component ──

interface Props { resource: string }

export function ResourcePage({ resource }: Props) {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [pageState, setPageState] = useState<PageState>({ page: 1, pageSize: 20 })
  const [mode, setMode] = useState<ResourceMode>(null)
  const [currentRow, setCurrentRow] = useState<Record<string, unknown> | null>(null)
  const [fieldOptions, setFieldOptions] = useState<Record<string, OptionItem[]>>({})
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [searchField, setSearchField] = useState<string>('')
  const [searchValue, setSearchValue] = useState<string>('')

  // ── Data ──

  const configQuery = useQuery<TableConfig>({
    queryKey: ['table-config', resource],
    queryFn: () => fetchTableConfig(resource),
  })
  const listQuery = useQuery({
    queryKey: ['list', resource, pageState, filters],
    queryFn: () =>
      fetchList(resource, {
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
  const totalPages = Math.max(1, Math.ceil(total / pageState.pageSize))

  // ── Mutations ──

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createRecord(resource, data),
    onSuccess: () => { closeDialog(); refresh() },
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => updateRecord(resource, id, data),
    onSuccess: () => { closeDialog(); refresh() },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRecord(resource, id),
    onSuccess: () => refresh(),
  })

  // ── Fields ──

  const searchFields = config?.search?.fields ?? []
  const activeFields = useMemo(() => (mode && config ? buildFieldList(config, mode) : []), [mode, config])

  // ── Helpers ──

  function refresh() { startTransition(async () => { await queryClient.invalidateQueries({ queryKey: ['list', resource] }); setSelectedIds(new Set()) }) }

  function applySearch() {
    const f: Record<string, string> = {}
    if (searchField && searchValue) f[searchField] = searchValue
    setFilters(f)
    startTransition(async () => { setPageState((p) => ({ ...p, page: 1 })); await queryClient.invalidateQueries({ queryKey: ['list', resource] }) })
  }

  function resetSearch() {
    setSearchField('')
    setSearchValue('')
    setFilters({})
    startTransition(async () => { setPageState((p) => ({ ...p, page: 1 })); await queryClient.invalidateQueries({ queryKey: ['list', resource] }) })
  }

  function goPage(nextPage: number) {
    startTransition(async () => { setPageState((p) => ({ ...p, page: nextPage })); await queryClient.invalidateQueries({ queryKey: ['list', resource] }) })
  }
  function changePageSize(size: number) {
    startTransition(async () => { setPageState({ page: 1, pageSize: size }); await queryClient.invalidateQueries({ queryKey: ['list', resource] }) })
  }

  // ── Selection ──

  function toggleSelectAll(checked: boolean) {
    setSelectedIds(checked ? new Set(items.map(rowKey)) : new Set())
  }
  function toggleSelected(id: string) {
    setSelectedIds((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  // ── Dialog ──

  function openDialog(nextMode: Exclude<ResourceMode, null>, row?: Record<string, unknown>) {
    if (!config) return
    setError(null)
    setCurrentRow(row ?? null)
    const fields = buildFieldList(config, nextMode)
    const values: Record<string, string> = {}
    for (const field of fields) {
      values[field.field] = normalizeFieldValue(row?.[field.field] ?? field.default ?? '')
    }
    setFormValues(values)
    setMode(nextMode)
  }

  function closeDialog() { setMode(null); setCurrentRow(null); setFormValues({}); setError(null) }

  // ── Delete ──

  function handleDelete(row: Record<string, unknown>) {
    const id = rowKey(row)
    if (!id || !window.confirm(`确认删除 #${id} ?`)) return
    deleteMutation.mutate(id)
  }

  function handleBatchDelete() {
    if (selectedIds.size === 0) return
    if (!window.confirm(`确认批量删除 ${selectedIds.size} 条记录？`)) return
    startTransition(async () => {
      try { setError(null); await batchDeleteRecords(resource, [...selectedIds]); await refresh() }
      catch (e) { setError(e instanceof Error ? e.message : '批量删除失败') }
    })
  }

  // ── Form ──

  function updateField(field: string, value: string) { setFormValues((c) => ({ ...c, [field]: value })) }

  async function handleFileUpload(field: FormFieldMeta, file: File) {
    try { setError(null); const { url } = await uploadFile(file); updateField(field.field, url) }
    catch (e) { setError(e instanceof Error ? e.message : '上传失败') }
  }

  function handleSubmit() {
    if (!mode || mode === 'view' || !config) return
    const fields = buildFieldList(config, mode)
    const payload: Record<string, unknown> = {}
    for (const field of fields) {
      const rawValue = formValues[field.field] ?? ''
      if (rawValue === '' && !field.required) continue
      payload[field.field] = parseFieldValue(field, rawValue)
    }
    if (mode === 'create') createMutation.mutate(payload)
    else if (currentRow) { const id = rowKey(currentRow); if (id) updateMutation.mutate({ id, data: payload }) }
  }

  // ── Options ──

  useEffect(() => {
    if (!mode || mode === 'view' || !config) return
    const pendingFields = activeFields.filter((f) => f.optionsSource && !(f.field in fieldOptions))
    if (!pendingFields.length) return
    let cancelled = false
    void Promise.all(
      pendingFields.map(async (f) => {
        if (!f.optionsSource) return null
        const opts = await fetchOptions(f.optionsSource.model, f.optionsSource.labelField, f.optionsSource.valueField)
        return [f.field, opts] as const
      }),
    ).then((entries) => { if (!cancelled) setFieldOptions((c) => ({ ...c, ...Object.fromEntries(entries.filter(Boolean)) })) })
    return () => { cancelled = true }
  }, [activeFields, fieldOptions, mode, config])

  // ── Cell render ──

  function renderCell(value: unknown, colType?: string, colField?: string) {
    if (value === null || value === undefined) return <span className="text-muted-foreground text-xs">—</span>
    if (typeof value === 'boolean') return <Badge variant={value ? 'default' : 'secondary'}>{value ? '是' : '否'}</Badge>
    if (colType === 'datetime' || colType === 'timestamp') {
      const s = String(value); return <span className="text-xs">{s.replace('T', ' ').replace(/\.\d+Z?$/, '')}</span>
    }
    if (colType === 'status' || colField?.endsWith('status') || colField?.endsWith('_status')) {
      const s = String(value); return <Badge variant={s === 'enabled' || s === 'active' ? 'default' : 'secondary'}>{s}</Badge>
    }
    return <span>{renderCellValue(value)}</span>
  }

  // ── Loading / Error ──

  if (!config && loading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full rounded-xl" /></div>
  if (!config && fetchError) return <Alert variant="destructive"><AlertDescription>{fetchError}</AlertDescription></Alert>
  if (!config) return null

  const listColumns = config.list.columns
  const allSelected = items.length > 0 && items.every((item) => selectedIds.has(rowKey(item)))
  const someSelected = items.some((item) => selectedIds.has(rowKey(item)))

  // ── Render ──

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{config.title}</CardTitle>
          <CardDescription className="text-xs">{config.model}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(error || fetchError) && <Alert variant="destructive"><AlertDescription>{error ?? fetchError}</AlertDescription></Alert>}

          {/* Compact search bar */}
          {searchFields.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue placeholder="选择字段" />
                </SelectTrigger>
                <SelectContent>
                  {searchFields.map((f) => (
                    <SelectItem key={f.field} value={f.field}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                className="h-8 flex-1 min-w-[160px] text-xs"
                value={searchValue}
                placeholder={searchField ? `输入 ${searchFields.find((f) => f.field === searchField)?.label ?? ''} 筛选` : '请先选择查询字段'}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') applySearch() }}
                disabled={!searchField}
              />
              <Button size="sm" className="h-8 text-xs" onClick={applySearch} disabled={!searchField}>
                <Search className="mr-1 size-3" />查询
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={resetSearch}>
                <X className="mr-1 size-3" />重置
              </Button>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">共 {total} 条，第 {pageState.page}/{totalPages} 页</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {selectedIds.size > 0 && (
                <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={handleBatchDelete} disabled={pending}>
                  删除 {selectedIds.size} 条
                </Button>
              )}
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={refresh} disabled={pending}>
                {pending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <RefreshCw className="mr-1 size-3" />}刷新
              </Button>
              <Button size="sm" className="h-7 text-xs" onClick={() => openDialog('create')}>
                <Plus className="mr-1 size-3" />新增
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">
                    <input type="checkbox" className="size-3.5 rounded"
                      checked={allSelected}
                      ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected }}
                      onChange={(e) => toggleSelectAll(e.target.checked)} />
                  </TableHead>
                  {listColumns.map((col) => (
                    <TableHead key={col.field} className="text-xs py-2">{col.title ?? col.field}</TableHead>
                  ))}
                  <TableHead className="w-20 text-xs py-2">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={listColumns.length + 2} className="h-16 text-center"><Loader2 className="mx-auto size-4 animate-spin text-muted-foreground" /></TableCell></TableRow>
                ) : items.length === 0 ? (
                  <TableRow><TableCell colSpan={listColumns.length + 2} className="h-16 text-center text-xs text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : (
                  items.map((item) => {
                    const id = rowKey(item)
                    return (
                      <TableRow key={id}>
                        <TableCell className="py-1.5"><input type="checkbox" className="size-3.5 rounded" checked={selectedIds.has(id)} onChange={() => toggleSelected(id)} /></TableCell>
                        {listColumns.map((col) => (
                          <TableCell key={col.field} className="py-1.5 text-xs">{renderCell(item[col.field], col.type, col.field)}</TableCell>
                        ))}
                        <TableCell className="py-1.5">
                          <div className="flex items-center gap-0.5">
                            <Button variant="ghost" size="icon" className="size-6" onClick={() => openDialog('view', item)}><svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></Button>
                            <Button variant="ghost" size="icon" className="size-6" onClick={() => openDialog('edit', item)}><svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></Button>
                            <Button variant="ghost" size="icon" className="size-6" onClick={() => handleDelete(item)}><svg className="size-3.5 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>每页</span>
              <Select value={String(pageState.pageSize)} onValueChange={(v) => changePageSize(Number(v))}>
                <SelectTrigger className="h-7 w-[64px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{[10, 20, 50, 100].map((s) => (<SelectItem key={s} value={String(s)}>{s}</SelectItem>))}</SelectContent>
              </Select>
              <span>条</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-7 text-xs px-2" disabled={pageState.page <= 1 || pending} onClick={() => goPage(pageState.page - 1)}>上一页</Button>
              <span className="text-xs text-muted-foreground px-1">{pageState.page}/{totalPages}</span>
              <Button variant="outline" size="sm" className="h-7 text-xs px-2" disabled={pageState.page >= totalPages || pending} onClick={() => goPage(pageState.page + 1)}>下一页</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compact Sheet */}
      <Sheet open={Boolean(mode)} onOpenChange={(open) => (open ? undefined : closeDialog())}>
        <SheetContent side="right" className="w-full sm:max-w-lg lg:max-w-2xl overflow-y-auto">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-base">
              {mode === 'create' ? `新增${config.title}` : mode === 'edit' ? `编辑${config.title}` : `${config.title}详情`}
            </SheetTitle>
            <SheetDescription className="text-xs">{config.model}</SheetDescription>
          </SheetHeader>

          <div className="space-y-3 py-3">
            {activeFields.map((field) => {
              // JSON field: render key-value editor if schema available
              const isJson = field.type === 'json' || field.field.endsWith('_json')
              const schema = config.jsonSchema?.[field.field]

              if (isJson && schema && mode !== 'view') {
                return (
                  <div key={field.field} className="space-y-1.5">
                    <JsonKeyValueEditor
                      schema={schema}
                      value={formValues[field.field] ?? ''}
                      onChange={(v) => updateField(field.field, v)}
                      disabled={mode === 'view'}
                    />
                  </div>
                )
              }

              return (
                <ResourceFormField
                  key={field.field}
                  field={field}
                  mode={mode ?? 'view'}
                  value={formValues[field.field] ?? ''}
                  options={fieldOptions[field.field]}
                  loadingOptions={!!(field.optionsSource && !(field.field in fieldOptions))}
                  pending={pending}
                  onChange={updateField}
                  onUpload={handleFileUpload}
                />
              )
            })}
          </div>

          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

          <SheetFooter className="flex-row gap-2 pt-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={closeDialog}>关闭</Button>
            {mode !== 'view' && (
              <Button size="sm" className="h-8 text-xs" onClick={handleSubmit} disabled={pending || createMutation.isPending || updateMutation.isPending}>
                {(pending || createMutation.isPending || updateMutation.isPending) ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}保存
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
