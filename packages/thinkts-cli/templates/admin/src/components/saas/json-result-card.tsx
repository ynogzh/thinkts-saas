"use client";

interface Props {
  data: Record<string, unknown> | null;
}

/**
 * Shared JSON result display — replaces ~8 duplicated
 * `<pre>JSON.stringify(result, null, 2)</pre>` blocks.
 */
export function JsonResultCard({ data }: Props) {
  if (!data) return null;
  return (
    <pre className="overflow-x-auto rounded-2xl border bg-muted/20 p-3 text-xs">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
