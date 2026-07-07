import { RESOURCE_CATALOG } from './resource-catalog'

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
  displayField?: string
  refModel?: string
  /** If false, render FK as plain text (no link/dialog). */
  linkable?: boolean
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
  /** Validation rules from backend model definition. */
  validation?: {
    maxLength?: number
    pattern?: string
    message?: string
    min?: number
    max?: number
  }
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
  /** Batch operations on selected rows. */
  batchActions?: Array<{ label: string; service: string; icon?: string }>
}

export interface ListResult {
  items: Record<string, unknown>[]
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

/** Convert model name (e.g. "identity_user") to framework route path (e.g. "/identity/user"). */
function modelPath(model: string): string {
  const parts = model.split('_')
  if (parts.length === 1) return `/${parts[0]}`
  return `/${parts[0]}/${parts.slice(1).join('/')}`
}

// ── Menus ──────────────────────────────────────────────────

export async function fetchMenus(): Promise<MenuNode[]> {
  // Menus are built from the resource catalog client-side.
  const groups: Record<string, MenuNode> = {}
  for (const model of Object.keys(RESOURCE_CATALOG)) {
    const meta = RESOURCE_CATALOG[model]
    const module = model.split('_')[0]
    const label = meta.label
    const group = groups[module]
    const node: MenuNode = {
      key: `/resources/${model}`,
      label,
      icon: meta.icon,
    }
    if (group) {
      group.children = group.children ?? []
      group.children.push(node)
      continue
    }
    groups[module] = {
      key: module,
      label: module[0].toUpperCase() + module.slice(1),
      icon: 'Folder',
      children: [node],
    }
  }
  return Object.values(groups)
}

// ── Tables ─────────────────────────────────────────────────

export async function fetchTables(): Promise<TableMeta[]> {
  return Object.keys(RESOURCE_CATALOG).map((k) => ({
    name: k,
    title: RESOURCE_CATALOG[k].label,
    model: k,
  }))
}

// ── Table config ───────────────────────────────────────────

export async function fetchTableConfig(model: string): Promise<TableConfig> {
  const data = await request<{ data: TableConfig }>(
    `${API_BASE}${modelPath(model)}/config`,
  )
  return data.data
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
  const data = await request<{ data: unknown[]; total: number; page: number; pageSize: number }>(
    `${API_BASE}${modelPath(model)}/page${qs ? `?${qs}` : ''}`,
  )
  return {
    items: (data.data ?? []) as Record<string, unknown>[],
    total: data.total ?? 0,
    page: data.page ?? 1,
    pageSize: data.pageSize ?? 20,
  }
}

// ── Record CRUD ────────────────────────────────────────────

export async function fetchRecord(model: string, id: string): Promise<Record<string, unknown>> {
  const data = await request<{ data: Record<string, unknown> }>(
    `${API_BASE}${modelPath(model)}/get/${encodeURIComponent(id)}`,
  )
  return data.data ?? {}
}

export async function createRecord(
  model: string,
  body: Record<string, unknown>,
): Promise<ActionResponse> {
  return request<ActionResponse>(
    `${API_BASE}${modelPath(model)}/create`,
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
    `${API_BASE}${modelPath(model)}/update/${encodeURIComponent(String(id))}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )
}

export async function deleteRecord(model: string, id: string | number): Promise<void> {
  await request<void>(
    `${API_BASE}${modelPath(model)}/delete/${encodeURIComponent(String(id))}`,
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
  const data = await request<{ data: unknown[] }>(
    `${API_BASE}${modelPath(model)}/page?page=1&pageSize=1000`,
  )
  return ((data.data ?? []) as Record<string, unknown>[]).map((item) => ({
    label: String(item[labelField] ?? ''),
    value: item[valueField],
  }))
}

// ── File upload ────────────────────────────────────────────

export async function uploadFile(file: File): Promise<{ url: string }> {
  const formData = new FormData()
  formData.append('file', file)
  const data = await request<{ file_url: string }>(
    `${API_BASE}/open/upload`,
    { method: 'POST', body: formData },
  )
  return { url: data.file_url }
}

// ── Entity / FK lookup ──────────────────────────────────────

export interface EntityListRequest {
  model: string
  ids: (string | number)[]
  fields: string[]
}

export interface EntityListResponse {
  data: Record<string, unknown>[]
}

export interface BatchLookupRequest {
  lookups: Array<{
    model: string
    ids: (string | number)[]
    field: string
  }>
}

export interface BatchLookupResponse {
  [model: string]: Record<string, string>
}

/** Fetch entity detail by model and id. */
export async function fetchEntityDetail(
  model: string,
  id: string | number,
): Promise<Record<string, unknown>> {
  const data = await request<{ data: Record<string, unknown> | null }>(
    `${API_BASE}${modelPath(model)}/get/${encodeURIComponent(String(id))}`,
  )
  if (!data.data) throw new Error('Entity not found')
  return data.data
}

/** Fetch a list of entities for a given model, filtered by ids. */
export async function fetchEntityList(
  body: EntityListRequest,
): Promise<Record<string, unknown>[]> {
  const data = await request<{ data: unknown[] }>(
    `${API_BASE}${modelPath(body.model)}/page?page=1&pageSize=1000`,
  )
  const allItems = (data.data ?? []) as Record<string, unknown>[]
  const idSet = new Set(body.ids.map(String))
  const filtered = allItems.filter((item) => idSet.has(String(item.id)))
  if (body.fields && body.fields.length > 0) {
    return filtered.map((r) => {
      const picked: Record<string, unknown> = {}
      for (const f of body.fields) {
        if (f in r) picked[f] = r[f]
      }
      return picked
    })
  }
  return filtered
}

/** Batch lookup display values for multiple models in one request. */
export async function batchLookup(
  body: BatchLookupRequest,
): Promise<BatchLookupResponse> {
  const result: BatchLookupResponse = {}
  for (const entry of body.lookups) {
    const items = await fetchEntityList({
      model: entry.model,
      ids: entry.ids,
      fields: ['id', entry.field],
    })
    const map: Record<string, string> = {}
    for (const item of items) {
      map[String(item.id)] = String(item[entry.field] ?? item.id)
    }
    result[entry.model] = map
  }
  return result
}
