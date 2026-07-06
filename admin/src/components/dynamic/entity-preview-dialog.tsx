import { useEffect, useState } from 'react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchEntityDetail, type ColumnMeta } from '@/lib/admin-api'

export interface EntityPreviewDialogProps {
  model: string
  id: number | string
  open: boolean
  onOpenChange: (open: boolean) => void
  columns?: ColumnMeta[]
}

export function EntityPreviewDialog({
  model,
  id,
  open,
  onOpenChange,
  columns,
}: EntityPreviewDialogProps) {
  const [entity, setEntity] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setEntity(null)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchEntityDetail(model, id)
      .then((data) => {
        if (cancelled) return
        setEntity(data)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load entity')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [model, id, open])

  // Build label lookup from column definitions
  const labelByField: Record<string, string> = {}
  if (columns) {
    for (const col of columns) {
      labelByField[col.field] = col.title ?? col.field
    }
  }

  // Fields to display — prefer column order, fall back to sorted keys
  const displayFields = columns
    ? columns.map((c) => c.field)
    : entity
      ? Object.keys(entity).sort()
      : []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col w-full sm:max-w-lg'>
        <SheetHeader className='text-start'>
          <SheetTitle>
            {model} — {String(id)}
          </SheetTitle>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto px-4 py-4'>
          {loading && (
            <div className='space-y-3'>
              <Skeleton className='h-5 w-full' />
              <Skeleton className='h-5 w-3/4' />
              <Skeleton className='h-5 w-5/6' />
              <Skeleton className='h-5 w-2/3' />
              <Skeleton className='h-5 w-full' />
            </div>
          )}

          {error && (
            <div className='text-destructive text-sm py-4'>
              {error}
            </div>
          )}

          {!loading && !error && entity && (
            <dl className='space-y-3'>
              {displayFields.map((field) => {
                const val = entity[field]
                const displayVal =
                  val === null || val === undefined
                    ? '—'
                    : typeof val === 'boolean'
                      ? (val ? '是' : '否')
                      : String(val)
                const label = labelByField[field] ?? field
                return (
                  <div key={field} className='flex gap-4 text-sm'>
                    <dt className='w-32 shrink-0 text-muted-foreground truncate'>
                      {label}
                    </dt>
                    <dd className='flex-1 break-words'>{displayVal}</dd>
                  </div>
                )
              })}
            </dl>
          )}

          {!loading && !error && !entity && (
            <div className='text-muted-foreground text-sm py-4'>
              No data available.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
