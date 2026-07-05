const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export interface TableConfig {
  title: string
  model: string
  list?: { columns: Array<{ title: string; field: string; width?: number; sortable?: boolean }>; pageSize?: number }
  search?: { fields: Array<{ field: string; label: string; type?: string }>; showCount?: number }
  form?: { groups: Array<{ title?: string; fields: Array<{ field: string; label: string; type?: string; required?: boolean; options?: Array<{ label: string; value: unknown }> }> }>; modes?: Record<string, unknown> }
  rowActions?: Array<{ type: string; label: string; action?: string; confirm?: boolean }>
  headerActions?: Array<{ type: string; label: string; action?: string }>
}

export interface TableInfo {
  name: string
  title: string
  model: string
}

/** Fetch all available tables for sidebar navigation. */
export async function fetchTables(): Promise<TableInfo[]> {
  const res = await fetch(`${API_BASE}/admin/api/tables`)
  const json = await res.json()
  if (json.errno !== 0) throw new Error(json.errmsg ?? 'Failed to fetch tables')
  return json.data.tables
}

/** Fetch table config for a specific model. */
export async function fetchTableConfig(model: string): Promise<TableConfig> {
  const res = await fetch(`${API_BASE}/${model}/table`)
  const json = await res.json()
  if (json.errno !== 0) throw new Error(json.errmsg ?? 'Failed to fetch table config')
  return json.data
}

/** Fetch list data for a model. */
export async function fetchList(model: string, params?: Record<string, unknown>): Promise<{ items: unknown[]; total: number }> {
  const searchParams = new URLSearchParams()
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') searchParams.set(k, String(v))
    }
  }
  const res = await fetch(`${API_BASE}/${model}/list?${searchParams}`)
  const json = await res.json()
  if (json.errno !== 0) throw new Error(json.errmsg ?? 'Failed to fetch list')
  return json.data
}
