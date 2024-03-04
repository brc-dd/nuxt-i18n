import {
  addRouteMiddleware,
  defineNuxtPlugin,
  navigateTo,
  useCookie,
  useRequestHeaders,
  useState
} from '#imports'
import { getLocaleFromRoute } from './utils'
import { options } from '#build/i18n'

const clean = (str: string) => str.split('-')[0].trim().toLowerCase()

export default defineNuxtPlugin({
  name: 'nuxt-i18n-plugin',
  enforce: 'pre',
  async setup() {
    // Add route middleware to load locale messages for the target route
    addRouteMiddleware(
      'nuxt-i18n-middleware',
      async (to) => {
        if (to.path === '/' && !useCookie('i18n_redirected').value) {
          const headerLocale = (
            useRequestHeaders(['accept-language'])['accept-language'] || ''
          )
            .split(',')
            .map((l) => clean(l.split(';')[0]))
            .filter((l) => options.locales.includes(l))[0]

          const browserLocale
            = typeof document !== 'undefined'
              ? navigator.languages
                .map(clean)
                .filter((l) => options.locales.includes(l))[0]
                || (options.locales.includes(clean(navigator.language))
                  ? clean(navigator.language)
                  : '')
              : ''

          const locale = headerLocale || browserLocale
          if (locale && locale !== options.defaultLocale) {
            return navigateTo(`/${locale}`)
          }
        }

        const targetLocale = getLocaleFromRoute(to) || options.defaultLocale
        if (targetLocale && options.locales.includes(targetLocale)) {
          useState<string>('locale').value = targetLocale
        }
      },
      { global: true }
    )
  }
})
