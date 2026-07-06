'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { setLocale, t as translate } from '@/lib/i18n'

type LocaleContextType = {
  locale: string
  setLang: (locale: string) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LocaleContext = createContext<LocaleContextType>({
  locale: 'zh-CN',
  setLang: () => {},
  t: translate,
})

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState('zh-CN')

  const setLang = useCallback((l: string) => {
    setLocaleState(l)
    setLocale(l)
  }, [])

  return (
    <LocaleContext.Provider value={{ locale, setLang, t: translate }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
