import { Loader2 } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import type { FormFieldMeta, OptionItem } from '@/lib/admin-api'
import { cn } from '@/lib/utils'

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

function inputType(field: FormFieldMeta): string {
  if (field.type === 'number') return 'number'
  if (field.type === 'password') return 'password'
  if (field.type === 'email') return 'email'
  if (field.type === 'datetime' || field.type === 'timestamp') return 'datetime-local'
  return 'text'
}

export function ResourceFormField({
  field, mode, value, options, loadingOptions, pending, onChange, onUpload,
}: Props) {
  const span = field.span ?? 1
  const description = field.description
  const placeholder = field.placeholder ?? `请输入${field.label}`
  const readOnly = field.readonly ?? false

  return (
    <div className={cn('space-y-1.5', span === 2 && 'md:col-span-2')}>
      <Label htmlFor={field.field} className="text-xs">{field.label}</Label>

      {mode === 'view' ? (
        <div className="min-h-10 rounded-md border bg-muted/30 px-3 py-2 text-sm">
          {value || '—'}
        </div>
      ) : field.type === 'textarea' || field.type === 'json' ? (
        <Textarea
          id={field.field}
          value={value}
          onChange={(e) => onChange(field.field, e.target.value)}
          rows={field.type === 'json' ? 8 : 4}
          placeholder={placeholder}
        />
      ) : field.type === 'select' ? (
        <Select
          value={value}
          onValueChange={(nextValue) => onChange(field.field, nextValue)}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                loadingOptions
                  ? `加载${field.label}...`
                  : placeholder
              }
            />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? options ?? []).map((opt) => (
              <SelectItem key={`${field.field}-${opt.value}`} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.type === 'boolean' ? (
        <div className="flex items-center gap-3 pt-1">
          <Switch
            id={field.field}
            checked={value === 'true' || value === '1'}
            onCheckedChange={(checked) => onChange(field.field, String(checked))}
            disabled={readOnly || pending}
          />
          <Label htmlFor={field.field} className="text-sm text-muted-foreground">
            {value === 'true' || value === '1' ? '是' : '否'}
          </Label>
        </div>
      ) : field.type === 'file' || field.type === 'image' ? (
        <div className="space-y-2">
          <Input
            id={field.field}
            value={value}
            onChange={(e) => onChange(field.field, e.target.value)}
            readOnly={readOnly}
            placeholder={placeholder}
          />
          {mode !== 'view' && onUpload && (
            <>
              <Input
                type="file"
                accept={field.accept ?? (field.type === 'image' ? 'image/*' : undefined)}
                disabled={pending || readOnly}
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  await onUpload(field, file)
                  e.currentTarget.value = ''
                }}
              />
              {pending ? (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" />
                  上传中...
                </p>
              ) : null}
            </>
          )}
        </div>
      ) : (
        <Input
          id={field.field}
          type={inputType(field)}
          value={value}
          onChange={(e) => onChange(field.field, e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
        />
      )}
    </div>
  )
}
