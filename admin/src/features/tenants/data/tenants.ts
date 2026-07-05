import { z } from 'zod'

export const tenantSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  status: z.string(),
  packageId: z.number().optional(),
  expireAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Tenant = z.infer<typeof tenantSchema>

export const tenants: Tenant[] = [
  {
    id: 1, code: 'demo', name: 'Demo Tenant',
    status: 'enabled', packageId: 1,
    expireAt: '2027-12-31',
    createdAt: '2024-01-15T08:00:00Z', updatedAt: '2024-06-01T10:00:00Z',
  },
  {
    id: 2, code: 'acme', name: 'Acme Corporation',
    status: 'enabled',
    createdAt: '2024-02-01T08:00:00Z', updatedAt: '2024-06-15T10:00:00Z',
  },
  {
    id: 3, code: 'globex', name: 'Globex Industries',
    status: 'enabled', packageId: 2,
    expireAt: '2025-06-01',
    createdAt: '2024-03-01T08:00:00Z', updatedAt: '2024-07-01T10:00:00Z',
  },
  {
    id: 4, code: 'initech', name: 'Initech',
    status: 'disabled',
    createdAt: '2024-04-01T08:00:00Z', updatedAt: '2024-08-01T10:00:00Z',
  },
  {
    id: 5, code: 'umbrella', name: 'Umbrella Corp',
    status: 'enabled', packageId: 3,
    expireAt: '2026-12-31',
    createdAt: '2024-05-01T08:00:00Z', updatedAt: '2024-09-01T10:00:00Z',
  },
]

export const statuses = [
  { label: 'Enabled', value: 'enabled', icon: undefined },
  { label: 'Disabled', value: 'disabled', icon: undefined },
] as const
