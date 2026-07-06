'use client'

import { useState, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface JsonFieldDef {
  key: string
  label: string
  type: string
  default?: unknown
}

interface KeyValueEntry {
  id: string
  key: string
  value: string
  type: string
}

interface Props {
  schema?: JsonFieldDef[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

/** Parse JSON string → key-value entries, applying schema defaults. */
function parseJson(value: string, schema?: JsonFieldDef[]): KeyValueEntry[] {
  let obj: Record<string, unknown> = {}
  try { obj = JSON.parse(value || '{}') } catch { /* ignore */ }
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return []

  // Apply schema: ensure all defined keys exist with defaults
  if (schema) {
    for (const def of schema) {
      if (!(def.key in obj)) obj[def.key] = def.default
    }
  }

  return Object.entries(obj).map(([key, val], i) => {
    const def = schema?.find((d) => d.key === key)
    return {
      id: `${key}-${i}`,
      key,
      value: val === null || val === undefined ? '' : typeof val === 'object' ? JSON.stringify(val) : String(val),
      type: def?.type ?? (typeof val === 'number' ? 'number' : typeof val === 'boolean' ? 'boolean' : 'string'),
    }
  })
}

/** Serialize entries → JSON string. */
function serializeJson(entries: KeyValueEntry[]): string {
  const obj: Record<string, unknown> = {}
  for (const entry of entries) {
    if (!entry.key.trim()) continue
    if (entry.type === 'number') obj[entry.key] = entry.value === '' ? null : Number(entry.value)
    else if (entry.type === 'boolean') obj[entry.key] = entry.value === 'true'
    else obj[entry.key] = entry.value
  }
  return JSON.stringify(obj)
}

export function JsonKeyValueEditor({ schema, value, onChange, disabled }: Props) {
  const [entries, setEntries] = useState<KeyValueEntry[]>(() => parseJson(value, schema))

  const emit = useCallback(
    (next: KeyValueEntry[]) => {
      setEntries(next)
      onChange(serializeJson(next))
    },
    [onChange],
  )

  function updateEntry(id: string, field: 'key' | 'value' | 'type', val: string) {
    const next = entries.map((e) => {
      if (e.id !== id) return e
      const updated = { ...e, [field]: val }
      if (field === 'type' && val === 'boolean') updated.value = 'false'
      if (field === 'type' && val === 'number') updated.value = ''
      return updated
    })
    emit(next)
  }

  function removeEntry(id: string) {
    emit(entries.filter((e) => e.id !== id))
  }

  function addEntry() {
    const def = schema?.find((d) => !entries.some((e) => e.key === d.key))
    const newEntry: KeyValueEntry = {
      id: `new-${Date.now()}`,
      key: def?.key ?? '',
      value: def?.default != null ? String(def.default) : '',
      type: def?.type ?? 'string',
    }
    emit([...entries, newEntry])
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">键值对</Label>
        {!disabled && (
          <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={addEntry}>
            <Plus className="mr-1 size-3" />添加
          </Button>
        )}
      </div>
      <div className="space-y-1.5">
        {entries.map((entry) => {
          const def = schema?.find((d) => d.key === entry.key)
          return (
            <div key={entry.id} className="flex items-center gap-1.5">
              <Input
                className="h-7 w-[30%] text-xs font-mono"
                value={entry.key}
                placeholder="key"
                readOnly={!!def || disabled}
                onChange={(e) => updateEntry(entry.id, 'key', e.target.value)}
              />
              {entry.type === 'boolean' ? (
                <div className="flex h-7 items-center gap-2 px-2">
                  <Switch
                    checked={entry.value === 'true'}
                    onCheckedChange={(checked) => updateEntry(entry.id, 'value', String(checked))}
                    disabled={disabled}
                  />
                  <span className="text-xs text-muted-foreground">{entry.value === 'true' ? '是' : '否'}</span>
                </div>
              ) : (
                <Input
                  className="h-7 flex-1 text-xs font-mono"
                  value={entry.value}
                  placeholder={entry.type === 'number' ? '0' : 'value'}
                  type={entry.type === 'number' ? 'number' : 'text'}
                  onChange={(e) => updateEntry(entry.id, 'value', e.target.value)}
                  disabled={disabled}
                />
              )}
              <Select value={entry.type} onValueChange={(v) => updateEntry(entry.id, 'type', v)} disabled={!!def || disabled}>
                <SelectTrigger className="h-7 w-[72px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">文本</SelectItem>
                  <SelectItem value="number">数字</SelectItem>
                  <SelectItem value="boolean">布尔</SelectItem>
                </SelectContent>
              </Select>
              {!def && !disabled && (
                <Button type="button" variant="ghost" size="icon" className="size-6 shrink-0" onClick={() => removeEntry(entry.id)}>
                  <Trash2 className="size-3 text-destructive" />
                </Button>
              )}
            </div>
          )
        })}
        {entries.length === 0 && <p className="text-xs text-muted-foreground py-1">暂无条目，点击"添加"新增。</p>}
      </div>
    </div>
  )
}
