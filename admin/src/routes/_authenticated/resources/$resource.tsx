import { createFileRoute } from '@tanstack/react-router'
import { ResourcePage } from '@/features/resources'

export const Route = createFileRoute('/_authenticated/resources/$resource')({
  component: ResourcePageFn,
})

function ResourcePageFn() {
  const { resource } = Route.useParams()
  return <ResourcePage resource={resource} />
}
