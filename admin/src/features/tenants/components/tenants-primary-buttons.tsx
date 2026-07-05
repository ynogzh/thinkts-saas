import { useContext } from 'react'
import { Button } from '@/components/ui/button'
import { IconPlus } from '@tabler/icons-react'
import { TenantsContext } from './tenants-provider'

export function TenantsPrimaryButtons() {
  const context = useContext(TenantsContext)
  if (!context) throw new Error('TenantsPrimaryButtons must be used within TenantsProvider')
  const { setOpen } = context

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <IconPlus size={18} />
        <span>Add Tenant</span>
      </Button>
    </div>
  )
}
