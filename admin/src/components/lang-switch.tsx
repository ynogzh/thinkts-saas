'use client'

import { useLocale } from '@/context/locale-provider'
import { Button } from '@/components/ui/button'

export function LangSwitch() {
  const { locale, setLang } = useLocale()
  const next = locale === 'zh-CN' ? 'en-US' : 'zh-CN'
  const label = locale === 'zh-CN' ? 'EN' : '中'

  return (
    <Button variant='ghost' size='sm' className='h-8 px-2 text-xs font-medium'
      onClick={() => setLang(next)}>
      {label}
    </Button>
  )
}
