'use client'

import { useState, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface JsonFieldDef {
  key: string
  label: string
}

interface KeyValueEntry {
  id: string
  key: string
  value: string
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

  // Ensure all schema-defined keys exist
  if (schema) {
    for (const def of schema) {
      if (!(def.key in obj)) obj[def.key] = null
    }
  }

  return Object.entries(obj).map(([key, val], i) => ({
    id: `${key}-${i}`,
    key,
    value: val === null || val === undefined ? '' : typeof val === 'object' ? JSON.stringify(val) : String(val),
  }))
}

/** Serialize entries → JSON string, preserving original types. */
function serializeJson(entries: KeyValueEntry[]): string {
  const obj: Record<string, unknown> = {}
  for (const entry of entries) {
    if (!entry.key.trim()) continue
    const v = entry.value.trim()
    if (v === '') { obj[entry.key] = null; continue }
    // Preserve boolean
    if (v === 'true') { obj[entry.key] = true; continue }
    if (v === 'false') { obj[entry.key] = false; continue }
    // Preserve number
    if (/^-?\d+(\.\d+)?$/.test(v) && v.length < 16) { obj[entry.key] = Number(v); continue }
    obj[entry.key] = v
  }
  return JSON.stringify(obj)
}

export function JsonKeyValueEditor({ schema, value, onChange, disabled }: Props) {
  const [entries, setEntries] = useState<KeyValueEntry[]>(() => parseJson(value, schema))

  const emit = useCallback(
    (next: KeyValueEntry[]) => { setEntries(next); onChange(serializeJson(next)) },
    [onChange],
  )

  function updateEntry(id: string, field: 'key' | 'value', val: string) {
    emit(entries.map((e) => (e.id === id ? { ...e, [field]: val } : e)))
  }

  function removeEntry(id: string) { emit(entries.filter((e) => e.id !== id)) }

  function addEntry() {
    const def = schema?.find((d) => !entries.some((e) => e.key === d.key))
    emit([...entries, { id: `new-${Date.now()}`, key: def?.key ?? '', value: '' }])
  }

  return (
    <div className='space-y-1.5'>
      <div className='flex items-center justify-between'>
        <Label className='text-xs text-muted-foreground'>键值对</Label>
        {!disabled && (
          <Button type='button' variant='ghost' size='sm' className='h-6 px-2 text-xs' onClick={addEntry}>
            <Plus className='mr-1 size-3' />添加
          </Button>
        )}
      </div>
      <div className='space-y-1'>
        {entries.map((entry) => {
          const def = schema?.find((d) => d.key === entry.key)
          return (
            <div key={entry.id} className='flex items-center gap-1.5'>
              <Input
                className='h-8 w-[35%] text-xs font-mono'
                value={entry.key}
                placeholder='key'
                readOnly={!!def || disabled}
                onChange={(e) => updateEntry(entry.id, 'key', e.target.value)}
              />
              <Input
                className='h-8 flex-1 text-xs font-mono'
                value={entry.value}
                placeholder='value'
                onChange={(e) => updateEntry(entry.id, 'value', e.target.value)}
                disabled={disabled}
              />
              {!def && !disabled && (
                <Button type='button' variant='ghost' size='icon' className='size-6 shrink-0' onClick={() => removeEntry(entry.id)}>
                  <Trash2 className='size-3 text-destructive' />
                </Button>
              )}
            </div>
          )
        })}
        {entries.length === 0 && <p className='text-xs text-muted-foreground py-1'>暂无条目，点击"添加"新增。</p>}
      </div>
    </div>
  )
}
