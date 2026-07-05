import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TenantsDialogs } from './components/tenants-dialogs'
import { TenantsPrimaryButtons } from './components/tenants-primary-buttons'
import { TenantsProvider } from './components/tenants-provider'
import { TenantsTable } from './components/tenants-table'

export function Tenants() {
  return (
    <TenantsProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Tenants</h2>
            <p className='text-muted-foreground'>
              Manage tenants and their module assignments.
            </p>
          </div>
          <TenantsPrimaryButtons />
        </div>
        <TenantsTable />
      </Main>

      <TenantsDialogs />
    </TenantsProvider>
  )
}
