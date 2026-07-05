import { createContext, useContext, useState, type ReactNode } from 'react'
import en, { type TranslationKey } from '../i18n/en'
import sw from '../i18n/sw'

type Lang = 'en' | 'sw'
const dicts: Record<Lang, Record<string, any>> = { en, sw }

interface I18nCtx {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TranslationKey) => any
}

const I18nContext = createContext<I18nCtx>({
  lang: 'en',
  setLang: () => {},
  t: k => en[k],
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const stored = (localStorage.getItem('lang') as Lang) || 'en'
  const [lang, setLangState] = useState<Lang>(stored)

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('lang', l)
  }

  const t = (key: TranslationKey) => dicts[lang][key] ?? en[key]

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
}

export const useT = () => useContext(I18nContext)
