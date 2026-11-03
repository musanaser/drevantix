import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'ar'
export type L = { en: string; ar: string }

const KEY = 'drevantix_lang'
let current: Lang = 'en'
export const getLang = () => current

function initialLang(): Lang {
  const q = new URLSearchParams(window.location.search).get('lang')
  if (q === 'ar' || q === 'en') {
    localStorage.setItem(KEY, q)
    return q
  }
  const saved = localStorage.getItem(KEY)
  if (saved === 'ar' || saved === 'en') return saved
  return navigator.language?.startsWith('ar') ? 'ar' : 'en'
}

interface I18n {
  lang: Lang
  dir: 'ltr' | 'rtl'
  isAr: boolean
  setLang: (l: Lang) => void
  toggle: () => void
  /** Pick the string for the active language. */
  t: (en: string, ar: string) => string
  tx: (l: L) => string
}

const Ctx = createContext<I18n | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (current = initialLang()))
  const setLang = useCallback((l: Lang) => {
    current = l
    localStorage.setItem(KEY, l)
    setLangState(l)
  }, [])
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang])
  const value = useMemo<I18n>(
    () => ({
      lang,
      dir: lang === 'ar' ? 'rtl' : 'ltr',
      isAr: lang === 'ar',
      setLang,
      toggle: () => setLang(lang === 'ar' ? 'en' : 'ar'),
      t: (en, ar) => (lang === 'ar' ? ar : en),
      tx: (l) => l[lang],
    }),
    [lang, setLang],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useI18n() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useI18n must be used inside I18nProvider')
  return v
}
