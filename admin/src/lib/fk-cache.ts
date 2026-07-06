import { fetchEntityList } from '@/lib/admin-api'

// Module-level cache: keyed by `${model}:${field}` → Map<id, displayValue>
const displayValueCache = new Map<string, Map<string, string>>()

// In-flight promises to deduplicate concurrent requests for the same (model, field)
const pendingRequests = new Map<string, Promise<void>>()

function cacheKey(model: string, field: string): string {
  return `${model}:${field}`
}

/**
 * Batch-fetch display values for FK references.
 * Checks module-level cache first, only fetches uncached IDs.
 * Merges results into cache. Concurrent calls for the same (model, field)
 * share a single request.
 */
export async function batchFetchDisplayValues(
  model: string,
  field: string,
  ids: (string | number)[],
): Promise<Map<string, string>> {
  const key = cacheKey(model, field)

  let subCache = displayValueCache.get(key)
  if (!subCache) {
    subCache = new Map()
    displayValueCache.set(key, subCache)
  }

  // Filter to only uncached IDs
  const uncached = ids.filter((id) => {
    const sid = String(id)
    return sid !== '' && !subCache!.has(sid)
  })

  if (uncached.length === 0) {
    // All cached — return a merged map of just the requested ids
    const result = new Map<string, string>()
    for (const id of ids) {
      const sid = String(id)
      const val = subCache.get(sid)
      if (val !== undefined) result.set(sid, val)
    }
    return result
  }

  // Deduplicate concurrent requests
  if (pendingRequests.has(key)) {
    await pendingRequests.get(key)
    // Recurse: now everything should be cached
    return batchFetchDisplayValues(model, field, ids)
  }

  const fetchPromise = (async () => {
    try {
      const items = await fetchEntityList({
        model,
        ids: uncached,
        fields: ['id', field],
      })
      for (const item of items) {
        const idVal = item['id']
        const displayVal = item[field]
        if (idVal != null && displayVal != null) {
          subCache!.set(String(idVal), String(displayVal))
        }
      }
    } finally {
      pendingRequests.delete(key)
    }
  })()

  pendingRequests.set(key, fetchPromise)
  await fetchPromise

  const result = new Map<string, string>()
  for (const id of ids) {
    const sid = String(id)
    const val = subCache.get(sid)
    if (val !== undefined) result.set(sid, val)
  }
  return result
}

/** Clear the entire FK cache. Useful for testing or page transitions. */
export function clearFkCache(): void {
  displayValueCache.clear()
  pendingRequests.clear()
}
