import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { DynamicTable } from '@/components/dynamic/dynamic-table'
import { fetchTableConfig, fetchList, type TableConfig } from '@/lib/admin-api'

interface Props {
  resource: string
}

export function ResourcePage({ resource }: Props) {
  const [config, setConfig] = useState<TableConfig | null>(null)
  const [data, setData] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([fetchTableConfig(resource), fetchList(resource)])
      .then(([cfg, list]) => {
        setConfig(cfg)
        setData(list.items ?? [])
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [resource])

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            {config?.title ?? resource}
          </h2>
          <p className='text-muted-foreground'>
            {config?.model ? `Model: ${config.model}` : ''}
          </p>
        </div>

        {loading && <div className='text-center py-12 text-muted-foreground'>Loading...</div>}
        {error && <div className='text-center py-12 text-destructive'>Error: {error}</div>}
        {config && !loading && <DynamicTable config={config} data={data} />}
      </Main>
    </>
  )
}
