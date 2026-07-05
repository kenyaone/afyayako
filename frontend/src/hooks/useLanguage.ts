import { useState, useEffect } from 'react'
import translations from '../i18n/translations.json'

type Language = 'en' | 'sw'

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    // Get from localStorage or default to English
    const saved = localStorage.getItem('language') as Language | null
    return saved || 'en'
  })

  useEffect(() => {
    // Save to localStorage when changed
    localStorage.setItem('language', language)
  }, [language])

  const t = (key: keyof typeof translations.en): string => {
    return translations[language as keyof typeof translations][key] || key
  }

  return { language, setLanguage, t }
}
