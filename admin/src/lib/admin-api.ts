const API_BASE = import.meta.env.VITE_API_BASE ?? ''

// ── Types ──────────────────────────────────────────────────

export interface MenuNode {
  key: string
  label: string
  icon: string
  children?: MenuNode[]
}

export interface TableMeta {
  name: string
  title: string
  model: string
}

export interface ColumnMeta {
  field: string
  title: string
  width?: number
  sortable?: boolean
  type?: string
}

export interface SearchFieldMeta {
  field: string
  label: string
  type?: string
  operator?: string
  options?: Array<{ label: string; value: unknown }>
}

export interface FormFieldMeta {
  field: string
  label: string
  type?: string
  required?: boolean
  readonly?: boolean
  options?: Array<{ label: string; value: unknown }>
  optionsSource?: { model: string; labelField: string; valueField: string }
  span?: number
  placeholder?: string
  description?: string
  accept?: string
  default?: unknown
}

export interface FormGroupMeta {
  title?: string
  columns?: number
  fields: FormFieldMeta[]
}

export interface TableConfig {
  title: string
  model: string
  primaryKey: string
  list: {
    columns: ColumnMeta[]
    pageSize: number
    orderBy?: { field: string; direction: 'asc' | 'desc' }
  }
  search: {
    fields: SearchFieldMeta[]
    showCount: number
  }
  form: {
    groups: FormGroupMeta[]
  }
  jsonSchema?: Record<string, Array<{ key: string; label: string; type: string; default?: unknown }>>
  uiActions?: Array<{ label: string; service: string; icon?: string }>
}

export interface ListResult {
  items: unknown[]
  total: number
  page: number
  pageSize: number
}

export interface ActionResponse {
  data?: unknown
  errno?: number
  errmsg?: string
}

// ── HTTP helpers ───────────────────────────────────────────

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    let message = `Request failed: ${res.status} ${res.statusText}`
    try {
      const body = await res.json()
      if (body?.errmsg) message = body.errmsg
      else if (body?.message) message = body.message
    } catch { /* ignore */ }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

// ── Menus ──────────────────────────────────────────────────

export async function fetchMenus(): Promise<MenuNode[]> {
  const data = await request<{ menus: MenuNode[] }>(`${API_BASE}/admin/api/menus`)
  return data.menus ?? []
}

// ── Tables ─────────────────────────────────────────────────

export async function fetchTables(): Promise<TableMeta[]> {
  const data = await request<{ tables: TableMeta[] }>(`${API_BASE}/admin/api/tables`)
  return data.tables ?? []
}

// ── Table config ───────────────────────────────────────────

export async function fetchTableConfig(model: string): Promise<TableConfig> {
  const data = await request<{ table: TableConfig }>(
    `${API_BASE}/admin/api/tables/${encodeURIComponent(model)}`,
  )
  return data.table
}

// ── List / search ──────────────────────────────────────────

export async function fetchList(
  model: string,
  params: Record<string, unknown> = {},
): Promise<ListResult> {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== '') searchParams.set(key, String(value))
  }
  const qs = searchParams.toString()
  const data = await request<{ list: { items: unknown[]; total: number; currentPage: number; pageSize: number } }>(
    `${API_BASE}/admin/api/tables/${encodeURIComponent(model)}/data${qs ? `?${qs}` : ''}`,
  )
  return {
    items: data.list.items ?? [],
    total: data.list.total ?? 0,
    page: data.list.page ?? 1,
    pageSize: data.list.pageSize ?? 20,
  }
}

// ── Record CRUD ────────────────────────────────────────────

export async function fetchRecord(model: string, id: string): Promise<Record<string, unknown>> {
  const data = await request<{ data: Record<string, unknown> }>(
    `${API_BASE}/admin/api/forms/${encodeURIComponent(model)}/${id}`,
  )
  return data.data ?? {}
}

export async function createRecord(
  model: string,
  body: Record<string, unknown>,
): Promise<ActionResponse> {
  return request<ActionResponse>(
    `${API_BASE}/admin/api/actions/${encodeURIComponent(model)}/create`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )
}

export async function updateRecord(
  model: string,
  id: string | number,
  body: Record<string, unknown>,
): Promise<ActionResponse> {
  return request<ActionResponse>(
    `${API_BASE}/admin/api/actions/${encodeURIComponent(model)}/${id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )
}

export async function deleteRecord(model: string, id: string | number): Promise<void> {
  await request<void>(
    `${API_BASE}/admin/api/actions/${encodeURIComponent(model)}/${id}`,
    { method: 'DELETE' },
  )
}

export async function batchDeleteRecords(model: string, ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => deleteRecord(model, id)))
}

// ── Options (select fields) ────────────────────────────────

export interface OptionItem {
  label: string
  value: unknown
}

export async function fetchOptions(
  model: string,
  labelField: string,
  valueField: string,
): Promise<OptionItem[]> {
  const data = await request<{ list: { items: Record<string, unknown>[] } }>(
    `${API_BASE}/admin/api/tables/${encodeURIComponent(model)}/data?page=1&pageSize=1000`,
  )
  return (data.list?.items ?? []).map((item) => ({
    label: String(item[labelField] ?? ''),
    value: item[valueField],
  }))
}

// ── File upload ────────────────────────────────────────────

export async function uploadFile(file: File): Promise<{ url: string }> {
  const formData = new FormData()
  formData.append('file', file)
  const data = await request<{ file_url: string }>(
    `${API_BASE}/admin/api/upload`,
    { method: 'POST', body: formData },
  )
  return { url: data.file_url }
}
