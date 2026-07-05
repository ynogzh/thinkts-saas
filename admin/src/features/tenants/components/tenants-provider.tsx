import { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { Tenant } from './tenants'
import { tenants as initialTenants } from './tenants'

interface TenantsContextType {
  open: string | null
  setOpen: (str: string | null) => void
  currentRow: Tenant | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Tenant | null>>
  tenants: Tenant[]
  setTenants: React.Dispatch<React.SetStateAction<Tenant[]>>
}

export const TenantsContext = React.createContext<TenantsContextType | null>(null)

import React from 'react'

interface Props {
  children: React.ReactNode
}

export function TenantsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<TenantsContextType['open']>(null)
  const [currentRow, setCurrentRow] = useState<Tenant | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants)

  return (
    <TenantsContext value={{ open, setOpen, currentRow, setCurrentRow, tenants, setTenants }}>
      {children}
    </TenantsContext>
  )
}
