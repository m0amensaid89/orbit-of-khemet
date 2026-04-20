'use client'
import { useState, useEffect } from 'react'

export type Lang = 'en' | 'ar'

export function useLanguage(): [Lang, (lang: Lang) => void] {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const stored = localStorage.getItem('orbit_lang') as Lang
    if (stored === 'ar' || stored === 'en') setLangState(stored)

    const handler = (e: Event) => {
      const customE = e as CustomEvent<Lang>
      setLangState(customE.detail)
    }
    window.addEventListener('orbit_lang_change', handler)
    return () => window.removeEventListener('orbit_lang_change', handler)
  }, [])

  const setLang = (l: Lang) => {
    localStorage.setItem('orbit_lang', l)
    setLangState(l)
    window.dispatchEvent(new CustomEvent<Lang>('orbit_lang_change', { detail: l }))
  }

  return [lang, setLang]
}
