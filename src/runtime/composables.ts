import {
  type ComputedRef,
  computed,
  reloadNuxtApp,
  useCookie,
  useRoute,
  useState
} from '#imports'
import { type Lang, options } from '#build/i18n'

export type { Lang }

export type Translations<T> = {
  [key in Lang]: T extends Record<string, any> ? T : never
}

export interface Locale {
  locale: ComputedRef<Lang>
  setLocale(
    locale: Lang,
    options?: { reload?: boolean; skipLocalization?: boolean }
  ): void
  localizePath(path: string, locale?: Lang): string
}

export interface LocaleTranslate<T> extends Locale {
  t: T
}

export function useLocale(): Locale
export function useLocale<T>(
  translations: Translations<T>
): LocaleTranslate<Translations<T>[Lang]>
export function useLocale<T>(
  translations?: Translations<T>
): Locale | LocaleTranslate<Translations<T>[Lang]> {
  const locale = useState<Lang>('locale')

  const t = translations?.[locale.value]

  function setLocale(
    newLocale: Lang,
    { reload = true, skipLocalization = false } = {}
  ) {
    const route = useRoute()
    if (locale.value === newLocale) { return }
    useCookie('i18n_redirected').value = newLocale
    locale.value = newLocale
    if (reload) {
      if (skipLocalization) {
        reloadNuxtApp({ force: true })
      } else {
        reloadNuxtApp({
          path: localizePath(route.fullPath, newLocale),
          force: true
        })
      }
    }
  }

  function localizePath(path: string, targetLocale?: Lang) {
    targetLocale = targetLocale || locale.value
    const parts = path.replace(/^\//, '').split('/')
    options.locales.includes(parts[0]) && parts.shift()
    parts.unshift(targetLocale === options.defaultLocale ? '' : targetLocale)
    return parts.join('/').replace(/^\/?/, '/')
  }

  return {
    locale: computed(() => locale.value),
    setLocale,
    localizePath,
    t: t || {} as any
  }
}
