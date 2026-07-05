const API_BASE = import.meta.env.VITE_API_BASE ?? ''

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
  options?: Array<{ label: string; value: unknown }>
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
}

export interface ListResult {
  items: unknown[]
  total: number
  page: number
  pageSize: number
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    let message = `Request failed: ${res.status} ${res.statusText}`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
      else if (body?.message) message = body.message
    } catch { /* ignore */ }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

export async function fetchMenus(): Promise<MenuNode[]> {
  const data = await request<{ menus: MenuNode[] }>(`${API_BASE}/admin/api/menus`)
  return data.menus
}

export async function fetchTables(): Promise<TableMeta[]> {
  const data = await request<{ tables: TableMeta[] }>(`${API_BASE}/admin/api/tables`)
  return data.tables
}

export async function fetchTableConfig(model: string): Promise<TableConfig> {
  const data = await request<{ table: TableConfig }>(
    `${API_BASE}/admin/api/tables/${encodeURIComponent(model)}`,
  )
  return data.table
}

export async function fetchList(
  model: string,
  params?: Record<string, unknown>,
): Promise<ListResult> {
  const search = new URLSearchParams()
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        search.set(key, String(value))
      }
    }
  }
  const query = search.toString()
  const url = `${API_BASE}/admin/api/tables/${encodeURIComponent(model)}/data${query ? `?${query}` : ''}`
  const data = await request<{ list: ListResult }>(url)
  return data.list
}

export async function fetchRecord(model: string, id: string): Promise<unknown> {
  const data = await request<{ data: unknown }>(
    `${API_BASE}/admin/api/forms/${encodeURIComponent(model)}/${encodeURIComponent(id)}`,
  )
  return data.data
}

export async function createRecord(
  model: string,
  data: Record<string, unknown>,
): Promise<unknown> {
  const res = await request<{ data: unknown }>(
    `${API_BASE}/admin/api/actions/${encodeURIComponent(model)}/create`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  )
  return res.data
}

export async function updateRecord(
  model: string,
  id: string,
  data: Record<string, unknown>,
): Promise<unknown> {
  const res = await request<{ data: unknown }>(
    `${API_BASE}/admin/api/actions/${encodeURIComponent(model)}/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  )
  return res.data
}

export async function deleteRecord(model: string, id: string): Promise<void> {
  await request<unknown>(`${API_BASE}/admin/api/actions/${encodeURIComponent(model)}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
