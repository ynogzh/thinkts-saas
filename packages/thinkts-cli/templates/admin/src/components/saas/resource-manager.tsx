"use client";

import { flexRender } from "@tanstack/react-table";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";

import { DataTableToolbar, useDataTable } from "@/components/data-table10";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createResourceRecord, deleteResourceRecord, fetchResourceOptions, listResource, updateResourceRecord, uploadResourceFile } from "@/lib/saas-admin/api";
import type { AdminOption, AdminSession, ResourceFieldConfig, ResourcePageConfig, ResourceTableConfig } from "@/lib/saas-admin/types";

import { ResourceFormField } from "./resource-form-field";
import { buildFieldList, buildResourceColumns, normalizeFieldValue, parseFieldValue, type ResourceMode,rowKey } from "./resource-manager-utils";

type ClientResourceConfig = Pick<
  ResourcePageConfig,
  "model" | "title" | "description" | "moduleCode" | "path" | "createPath" | "readOnly" | "defaultValues" | "createExtraFields" | "actionLinks"
>;

interface Props {
  session: AdminSession;
  resource: ClientResourceConfig;
  tableConfig: ResourceTableConfig;
  initialRows: Record<string, unknown>[];
  initialCount: number;
}

interface PageState {
  page: number;
  pageSize: number;
}

export function ResourceManager({ session, resource, tableConfig, initialRows, initialCount }: Props) {
  const [rows, setRows] = useState(initialRows);
  const [count, setCount] = useState(initialCount);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [pageState, setPageState] = useState<PageState>({ page: 1, pageSize: tableConfig.list?.pageSize ?? 20 });
  const [mode, setMode] = useState<ResourceMode>(null);
  const [currentRow, setCurrentRow] = useState<Record<string, unknown> | null>(null);
  const [fieldOptions, setFieldOptions] = useState<Record<string, AdminOption[] | undefined>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const searchFields = tableConfig.search?.fields ?? [];
  const totalPages = Math.max(1, Math.ceil(count / pageState.pageSize));
  const activeFields = useMemo(() => (mode ? buildFieldList(tableConfig, resource, mode) : []), [mode, resource, tableConfig]);

  const columns = buildResourceColumns(
    tableConfig,
    resource,
    selectedIds,
    toggleSelected,
    (row) => openDialog("view", row),
    (row) => openDialog("edit", row),
    (row) => handleDelete(row),
  );

  const { table } = useDataTable({
    data: rows,
    columns,
    getRowId: (row) => rowKey(row) || Math.random().toString(36),
  });

  function toggleSelected(id: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function openDialog(nextMode: Exclude<ResourceMode, null>, row?: Record<string, unknown>) {
    setError(null);
    setCurrentRow(row ?? null);
    const fields = buildFieldList(tableConfig, resource, nextMode);
    const values: Record<string, string> = {};
    for (const field of fields) {
      const fallback = field.field === "tenant_id" ? session.user.tenant_id : resource.defaultValues?.[field.field] ?? "";
      values[field.field] = normalizeFieldValue(row?.[field.field] ?? fallback);
    }
    setFormValues(values);
    setMode(nextMode);
  }

  function closeDialog() {
    setMode(null);
    setCurrentRow(null);
    setFormValues({});
    setError(null);
  }

  async function refreshRows(next: Partial<PageState> = {}, nextFilters = filters) {
    const page = next.page ?? pageState.page;
    const pageSize = next.pageSize ?? pageState.pageSize;
    const payload = await listResource(resource.path, session, { page, pageSize, ...nextFilters });
    setRows(payload.data.data ?? []);
    setCount(Number(payload.data.count ?? 0));
    setPageState({ page: Number(payload.data.currentPage ?? page), pageSize: Number(payload.data.pageSize ?? pageSize) });
    setSelectedIds(new Set());
  }

  function handleDelete(row: Record<string, unknown>) {
    const id = row.id;
    if (!id) return;
    if (!window.confirm(`确认删除 ${resource.title} #${String(id)} ?`)) return;
    startTransition(async () => {
      try {
        setError(null);
        await deleteResourceRecord(resource.path, id as string | number, session);
        await refreshRows();
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : "删除失败");
      }
    });
  }

  function handleBatchDelete() {
    if (selectedIds.size === 0 || !window.confirm(`确认批量删除 ${selectedIds.size} 条${resource.title}记录？`)) return;
    startTransition(async () => {
      try {
        setError(null);
        await Promise.all([...selectedIds].map((id) => deleteResourceRecord(resource.path, id, session)));
        await refreshRows();
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : "批量删除失败");
      }
    });
  }

  function updateField(field: string, value: string) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  async function handleFileUpload(field: ResourceFieldConfig, file: File) {
    try {
      setError(null);
      const payload = await uploadResourceFile(session, file);
      updateField(field.field, payload.file_url);
      if ("file_name" in formValues) updateField("file_name", file.name);
      if ("file_type" in formValues) updateField("file_type", file.type || "application/octet-stream");
      if ("file_size" in formValues) updateField("file_size", String(file.size));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "上传失败");
    }
  }

  function buildPayload(fields: ResourceFieldConfig[]): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      const rawValue = formValues[field.field] ?? "";
      if (rawValue === "" && !field.required) continue;
      payload[field.field] = parseFieldValue(field, rawValue);
    }
    if (("tenant_id" in formValues || fields.some((field) => field.field === "tenant_id")) && payload.tenant_id == null) {
      payload.tenant_id = session.user.tenant_id;
    }
    return payload;
  }

  function handleSubmit() {
    if (!mode || mode === "view") return;
    const fields = buildFieldList(tableConfig, resource, mode);
    startTransition(async () => {
      try {
        setError(null);
        const payload = buildPayload(fields);
        if (mode === "create") await createResourceRecord(resource.path, session, payload, resource.createPath);
        else if (currentRow?.id) await updateResourceRecord(resource.path, currentRow.id as string | number, session, payload);
        await refreshRows();
        closeDialog();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "保存失败");
      }
    });
  }

  useEffect(() => {
    if (!mode || mode === "view") return;
    const pendingFields = activeFields.filter((field) => field.optionsSource && !(field.field in fieldOptions));
    if (!pendingFields.length) return;
    let cancelled = false;
    void Promise.all(pendingFields.map(async (field) => [field.field, await fetchResourceOptions(session, field.optionsSource!)] as const))
      .then((entries) => {
        if (!cancelled) setFieldOptions((current) => ({ ...current, ...Object.fromEntries(entries) }));
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "加载关联选项失败");
      });
    return () => { cancelled = true; };
  }, [activeFields, fieldOptions, mode, session]);

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <CardTitle>{resource.title}</CardTitle>
            <CardDescription>{resource.description}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {resource.actionLinks?.map((action) => (
              <Button key={`${resource.path}-${action.href}`} asChild variant={action.variant ?? "outline"}><a href={action.href}>{action.label}</a></Button>
            ))}
            <Button variant="outline" onClick={() => startTransition(async () => await refreshRows())} disabled={pending}>{pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCw className="mr-2 size-4" />}刷新</Button>
            {!resource.readOnly ? <Button onClick={() => openDialog("create")}><Plus className="mr-2 size-4" />新增</Button> : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
          {searchFields.length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {searchFields.map((field) => (
                <div key={field.field} className="space-y-2">
                  <Label htmlFor={`filter-${field.field}`}>{field.title}</Label>
                  <Input id={`filter-${field.field}`} value={filters[field.field] ?? ""} placeholder={`筛选 ${field.title}`} onChange={(event) => setFilters((current) => ({ ...current, [field.field]: event.target.value }))} />
                </div>
              ))}
              <div className="flex items-end gap-2">
                <Button onClick={() => startTransition(async () => await refreshRows({ page: 1 }))}>查询</Button>
                <Button variant="outline" onClick={() => { setFilters({}); startTransition(async () => await refreshRows({ page: 1 }, {})); }}>重置</Button>
              </div>
            </div>
          ) : null}
          <DataTableToolbar table={table}>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>共 {count} 条记录，第 {pageState.page} / {totalPages} 页。</span>
              {selectedIds.size ? <Button size="sm" variant="destructive" onClick={handleBatchDelete} disabled={pending}>批量删除 {selectedIds.size} 条</Button> : null}
            </div>
          </DataTableToolbar>
          <div className="rounded-2xl border"><Table><TableHeader>{table.getHeaderGroups().map((headerGroup) => <TableRow key={headerGroup.id}>{headerGroup.headers.map((header) => <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>)}</TableRow>)}</TableHeader><TableBody>{table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <TableRow key={row.id}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>) : <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">暂无数据</TableCell></TableRow>}</TableBody></Table></div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><span>每页</span><Select value={String(pageState.pageSize)} onValueChange={(value) => startTransition(async () => await refreshRows({ page: 1, pageSize: Number(value) }))}><SelectTrigger className="h-8 w-[88px]"><SelectValue /></SelectTrigger><SelectContent>{[10, 20, 50, 100].map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent></Select><span>条</span></div>
            <div className="flex items-center gap-2"><Button variant="outline" disabled={pageState.page <= 1 || pending} onClick={() => startTransition(async () => await refreshRows({ page: pageState.page - 1 }))}>上一页</Button><Button variant="outline" disabled={pageState.page >= totalPages || pending} onClick={() => startTransition(async () => await refreshRows({ page: pageState.page + 1 }))}>下一页</Button></div>
          </div>
        </CardContent>
      </Card>
      <Sheet open={Boolean(mode)} onOpenChange={(open) => (open ? undefined : closeDialog())}>
        <SheetContent side="right" className="w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl overflow-y-auto">
          <SheetHeader><SheetTitle>{mode === "create" ? `新增${resource.title}` : mode === "edit" ? `编辑${resource.title}` : `${resource.title}详情`}</SheetTitle><SheetDescription>{resource.description}</SheetDescription></SheetHeader>
          <div className="grid gap-4 md:grid-cols-2">
            {mode ? activeFields.map((field) => <ResourceFormField key={field.field} field={field} mode={mode} value={formValues[field.field] ?? ""} options={fieldOptions[field.field]} loadingOptions={field.optionsSource && !(field.field in fieldOptions)} pending={pending} onChange={updateField} onUpload={handleFileUpload} />) : null}
          </div>
          {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
          <SheetFooter className="flex-col sm:flex-row gap-2"><Button variant="outline" onClick={closeDialog}>关闭</Button>{mode !== "view" ? <Button onClick={handleSubmit} disabled={pending}>{pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}保存</Button> : null}</SheetFooter>
      </SheetContent>
    </Sheet>
    </div>
  );
}
