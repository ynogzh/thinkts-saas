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

export function ResourceFormField({
  field, mode, value, options, loadingOptions, pending, onChange, onUpload,
}: Props) {
  const placeholder = field.placeholder ?? `请输入${field.label}`
  const readOnly = field.readonly ?? false

  return (
    <div className='space-y-1.5'>
      <Label>{field.label}</Label>

      {mode === 'view' ? (
        <div className='min-h-9 rounded-md border bg-muted/50 px-3 py-1.5 text-sm'>{value || '—'}</div>
      ) : field.type === 'textarea' || field.type === 'json' ? (
        <Textarea value={value} onChange={(e) => onChange(field.field, e.target.value)} rows={field.type === 'json' ? 6 : 3} placeholder={placeholder} />
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
        <div className='flex items-center gap-2 pt-0.5'>
          <Switch checked={value === 'true' || value === '1'} onCheckedChange={(c) => onChange(field.field, String(c))} disabled={readOnly || pending} />
          <span className='text-sm text-muted-foreground'>{value === 'true' || value === '1' ? '是' : '否'}</span>
        </div>
      ) : field.type === 'file' || field.type === 'image' ? (
        <div className='space-y-1.5'>
          <Input value={value} onChange={(e) => onChange(field.field, e.target.value)} readOnly={readOnly} placeholder={placeholder} />
          {mode !== 'view' && onUpload && (
            <Input type='file' accept={field.accept ?? (field.type === 'image' ? 'image/*' : undefined)} disabled={pending || readOnly}
              onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; await onUpload(field, file); e.currentTarget.value = '' }} />
          )}
        </div>
      ) : (
        <Input
          type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'password' ? 'password' : 'text'}
          value={value} onChange={(e) => onChange(field.field, e.target.value)}
          readOnly={readOnly} placeholder={placeholder}
        />
      )}
    </div>
  )
}
