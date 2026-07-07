import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import type { FormFieldMeta, OptionItem } from '@/lib/admin-api'

interface Props {
  field: FormFieldMeta
  mode: 'create' | 'edit' | 'view'
  value: string
  options?: OptionItem[]
  loadingOptions?: boolean
  pending?: boolean
  onChange: (field: string, value: string) => void
  onUpload?: (field: FormFieldMeta, file: File) => Promise<void>
}

function validate(field: FormFieldMeta, value: string): string | null {
  const v = field.validation
  if (!v) return null
  if (v.maxLength && value.length > v.maxLength) return v.message ?? `最多 ${v.maxLength} 个字符`
  if (v.pattern && value && !new RegExp(v.pattern).test(value)) return v.message ?? '格式不正确'
  if (v.min !== undefined && Number(value) < v.min) return v.message ?? `最小值为 ${v.min}`
  if (v.max !== undefined && Number(value) > v.max) return v.message ?? `最大值为 ${v.max}`
  return null
}

export function ResourceFormField({
  field, mode, value, options, loadingOptions, pending, onChange, onUpload,
}: Props) {
  const [touched, setTouched] = useState(false)
  const placeholder = field.placeholder ?? `请输入${field.label}`
  const readOnly = field.readonly ?? false
  const isRequired = field.required ?? false
  const err = touched ? validate(field, value) : null
  const v = field.validation

  function inputProps(extra?: Record<string, unknown>) {
    const p: Record<string, unknown> = {
      value, readOnly,
      placeholder,
      className: 'col-span-4',
      onBlur: () => setTouched(true),
      ...extra,
    }
    if (v?.maxLength) p.maxLength = v.maxLength
    if (v?.pattern) p.pattern = v.pattern
    if (field.type === 'number') {
      if (v?.min !== undefined) p.min = v.min
      if (v?.max !== undefined) p.max = v.max
    }
    return p
  }

  return (
    <div className='grid grid-cols-6 items-center gap-x-4 gap-y-1'>
      <Label className='col-span-2 text-end'>
        {isRequired && <span className='text-destructive mr-0.5'>*</span>}
        {field.label}
      </Label>
      <div className='col-span-4 space-y-1'>
        {mode === 'view' ? (
          <div className='min-h-9 rounded-md border bg-muted/50 px-3 py-1.5 text-sm'>{value || '—'}</div>
        ) : field.type === 'textarea' || field.type === 'json' ? (
          <Textarea
            {...inputProps()}
            onChange={(e) => onChange(field.field, e.target.value)}
            rows={field.type === 'json' ? 6 : 3}
          />
        ) : field.type === 'select' ? (
          <Select value={value} onValueChange={(v) => onChange(field.field, v)}>
            <SelectTrigger>
              <SelectValue placeholder={loadingOptions ? '加载...' : placeholder} />
            </SelectTrigger>
            <SelectContent>
              {(field.options ?? options ?? []).map((opt) => (
                <SelectItem key={String(opt.value)} value={String(opt.value)}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : field.type === 'boolean' ? (
          <div className='flex items-center gap-2'>
            <Switch checked={value === 'true' || value === '1'} onCheckedChange={(c) => onChange(field.field, String(c))} disabled={readOnly || pending} />
            <span className='text-sm text-muted-foreground'>{value === 'true' || value === '1' ? '是' : '否'}</span>
          </div>
        ) : field.type === 'file' || field.type === 'image' ? (
          <div className='space-y-1.5'>
            <Input {...inputProps()} onChange={(e) => onChange(field.field, e.target.value)} />
            {onUpload && (
              <Input type='file' accept={field.accept ?? (field.type === 'image' ? 'image/*' : undefined)} disabled={pending || readOnly}
                onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; await onUpload(field, file); e.currentTarget.value = '' }} />
            )}
          </div>
        ) : (
          <Input
            type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'password' ? 'password' : 'text'}
            {...inputProps()}
            onChange={(e) => onChange(field.field, e.target.value)}
          />
        )}
        {err && <p className='text-xs text-destructive'>{err}</p>}
        {v?.maxLength && mode !== 'view' && (
          <p className='text-xs text-muted-foreground text-right'>{value.length}/{v.maxLength}</p>
        )}
      </div>
    </div>
  )
}
