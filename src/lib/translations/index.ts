import { en } from "./en"
import { ar } from "./ar"
import type { Lang } from "@/hooks/useLanguage"

export type Translations = typeof en

export function useTranslations(lang: Lang): Translations {
  return lang === "ar" ? (ar as unknown as Translations) : en
}

export { en, ar }
