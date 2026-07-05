import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import type { FormFieldMeta } from '@/lib/admin-api'

export interface DynamicFormProps {
  fields: FormFieldMeta[]
  initialData?: Record<string, unknown>
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  loading?: boolean
}

export function DynamicForm({ fields, initialData, onSubmit, loading }: DynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData ?? {})

  // Reset when initialData changes (e.g. switching from create to edit mode)
  useEffect(() => {
    setFormData(initialData ?? {})
  }, [initialData])

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function renderField(f: FormFieldMeta) {
    const val = formData[f.field]
    const fieldType = f.type ?? 'text'

    switch (fieldType) {
      case 'textarea':
        return (
          <Textarea
            id={f.field}
            value={String(val ?? '')}
            onChange={(e) => handleChange(f.field, e.target.value)}
            required={f.required}
          />
        )
      case 'number':
        return (
          <Input
            id={f.field}
            type='number'
            value={val !== undefined ? String(val) : ''}
            onChange={(e) => handleChange(f.field, e.target.value ? Number(e.target.value) : '')}
            required={f.required}
          />
        )
      case 'select':
        return (
          <Select
            value={String(val ?? '')}
            onValueChange={(v) => handleChange(f.field, v)}
          >
            <SelectTrigger id={f.field}>
              <SelectValue placeholder={`Select ${f.label}`} />
            </SelectTrigger>
            <SelectContent>
              {(f.options ?? []).map((opt) => (
                <SelectItem key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'date':
        return (
          <Input
            id={f.field}
            type='date'
            value={String(val ?? '')}
            onChange={(e) => handleChange(f.field, e.target.value)}
            required={f.required}
          />
        )
      case 'switch':
        return (
          <div className='flex items-center gap-2'>
            <Switch
              id={f.field}
              checked={Boolean(val)}
              onCheckedChange={(v) => handleChange(f.field, v)}
            />
            <Label htmlFor={f.field} className='cursor-pointer'>
              {val ? 'Yes' : 'No'}
            </Label>
          </div>
        )
      default:
        return (
          <Input
            id={f.field}
            value={String(val ?? '')}
            onChange={(e) => handleChange(f.field, e.target.value)}
            required={f.required}
          />
        )
    }
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); void onSubmit(formData) }}
      className='space-y-4'
    >
      {fields.map((f) => (
        <div key={f.field} className='space-y-1'>
          {f.type !== 'switch' && <Label htmlFor={f.field}>{f.label}</Label>}
          {renderField(f)}
        </div>
      ))}
      <Button type='submit' disabled={loading}>
        {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
        Submit
      </Button>
    </form>
  )
}
