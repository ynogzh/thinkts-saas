import { useState, useEffect } from 'react'
import { batchFetchDisplayValues } from '@/lib/fk-cache'
import { EntityPreviewDialog } from '@/components/dynamic/entity-preview-dialog'

interface ReferenceCellProps {
  value: number | string | null
  model: string
  displayField: string
  /** All FK ids on the current page for this model+field, used for batch fetching. */
  allPageIds?: (string | number)[]
}

export function ReferenceCell({
  value,
  model,
  displayField,
  allPageIds,
}: ReferenceCellProps) {
  const [displayText, setDisplayText] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    if (value == null) {
      setDisplayText(null)
      return
    }

    const ids = allPageIds ?? [value]
    let cancelled = false

    batchFetchDisplayValues(model, displayField, ids).then((lookup) => {
      if (cancelled) return
      setDisplayText(lookup.get(String(value)) ?? String(value))
    })

    return () => { cancelled = true }
  }, [value, model, displayField, allPageIds])

  if (value == null) return <span className='text-muted-foreground text-xs'>—</span>

  return (
    <>
      <button
        type='button'
        className='text-blue-600 hover:underline cursor-pointer text-sm text-left truncate max-w-full'
        onClick={() => setPreviewOpen(true)}
      >
        {displayText ?? String(value)}
      </button>
      <EntityPreviewDialog
        model={model}
        id={value}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </>
  )
}
