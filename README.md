# @leanera/nuxt-i18n

[![npm version](https://img.shields.io/npm/v/@leanera/nuxt-i18n?color=a1b858&label=)](https://www.npmjs.com/package/@leanera/nuxt-i18n)

> [Nuxt 3](https://v3.nuxtjs.org) module for internationalization w/ locale auto-imports & localized routing.

This module's intention is not to provide a full-blown solution for internationalization like @nuxtjs/i18n, but offer a lean, effective and lightweight set of tools to cover your needs.

## Key Features

- 🪡 Integration with [@leanera/vue-i18n](https://github.com/leanera/vue-i18n)
- 🗜 Composable usage with [`useI18n`](#usei18n)
- 🪢 [Auto-importable](#auto-importing--lazy-loading-translations) locale messages (JSON/YAML support)
- 💇‍♀️ [Lazy-loading](#auto-importing--lazy-loading-translations) of translation messages
- 🛣 [Automatic routes generation](#routing--strategies) and custom paths

## Setup

```bash
# pnpm
pnpm add -D @leanera/nuxt-i18n

# npm
npm i -D @leanera/nuxt-i18n
```

## Basic Usage

> [📖 Check out the playground](./playground/)

Add `@leanera/nuxt-i18n` to your `nuxt.confg.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@leanera/nuxt-i18n'],

  i18n: {
    // Module options
  }
})
```

For the most basic setup, add the `locales` and `defaultLocales` module options with a set of translation `messages`:

```ts
export default defineNuxtConfig({
  modules: ['@leanera/nuxt-i18n'],

  i18n: {
    locales: ['en', 'de'],
    defaultLocale: 'en',
    messages: {
      en: { welcome: 'Welcome' },
      de: { welcome: 'Willkommen' }
    }
  }
})
```

Use the globally available `useI18n` composable in your component's `setup` hook:

```vue
<script setup>
const { locale, t } = useI18n()
</script>

<template>
  <div>{{ locale }}</div>
  <p>{{ t('welcome') }}</p>
</template>
```

## Guide

### Routing & Strategies

You can opt-in to override the Nuxt default routes with added locale prefixes to every URL by using one of the built-in routing strategies. By default, the Nuxt routes stay untouched (`no_prefix` strategy).

For example, if your app supports two languages: German and English as the default language, and you have the following pages in your project:

```
└── pages/
    ├── about/
    │   └── index.vue
    └── index.vue
```

This would result in the following routes being generated for the `prefix_except_default` strategy:

<details>
<summary>🎄 Routes Tree</summary>

```ts
[
  {
    path: '/',
    name: 'index___en',
    // ...
  },
  {
    path: '/de/',
    name: 'index___de',
    // ...
  },
  {
    path: '/about',
    name: 'about___en',
    // ...
  },
  {
    path: '/de/about',
    name: 'about___de',
    // ...
  }
]
```

</details>

> ℹ️ Note: Routes for the English version don't have a prefix because it is the default language.

#### Available Strategies

There are 4 supported strategies in total that affect how the app's routes are generated.

<table><tr><td valign="top">

##### `no_prefix` (default)

</td><td width="500px"><br>

With this strategy, routes stay as they are generated by Nuxt. No locale prefix will be added. The locale can be changed without changing the URL.

</td></tr><tr><td valign="top">

##### `prefix_except_default`

</td><td width="500px"><br>

Using this strategy, all of your routes will have a locale prefix added except for the default language.

</td></tr><tr><td valign="top">

##### `prefix`

</td><td width="500px"><br>

With this strategy, all routes will have a locale prefix.

</td></tr><tr><td valign="top">

##### `prefix_and_default`

</td><td width="500px"><br>

This strategy combines both previous strategies behaviours, meaning that you will get URLs with prefixes for every language, but URLs for the default language will also have a non-prefixed version. This could lead to duplicated content. You will have to handle, which URL is preferred when navigating in your app.

</td></tr></table>

#### Configuration

A strategy may be set using the `strategy` module option. Make sure that you have a `defaultLocale` defined in any case.

```ts
export default defineNuxtConfig({
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
  },
})
```

### Auto-Importing & Lazy-Loading Translations

For apps that contain a lot of translated content, it is preferable not to bundle all the messages in the main bundle, but rather lazy-load only the language that the users selected. By defining a directory where translation files are located, locale messages can be dynamically imported when the app loads or when the user switches to another language.

However, you can also benefit from the advantages of auto-import without enabling dynamic imports.

How to enable file-based translations with or without lazy-loading:

- Set the `autoImports` option to `true`.
- Enable dynamic imports by setting the `lazy` option to `true`.
- Optionally, configure the `langDir` option to a directory that contains your translation files. Defaults to `locales`.
- Make sure the `locales` option covers possible languages.

> ℹ️ Translation files must be called the same as their locale. Currently, JSON, JSON5 and YAML are supported.

Example files structure:

```
├── locales/
│   ├── en.json
│   ├── es.json5
│   ├── fr.yaml
└── nuxt.config.js
```

Configuration example:

```ts
export default defineNuxtConfig({
  i18n: {
    locales: ['en', 'es', 'fr'],
    defaultLocale: 'en',
    autoImports: true,
    langDir: 'lang',
  },
})
```

> ℹ️ If you prefer to import file-based translations but don't want to dynamically import them, set the `lazy` module option to `false`.

> ⚠️ The global route middleware to lazy-load translations when switching locales won't run when the `no_prefix` strategy is chosen. Use the `useLazyLocaleSwitch` composable for changing the language, it will load the corresponding translations beforehand.

### Manual Translations

Instead of auto-importing (with or without lazy-loading), you can manually import your translations and merge them into the global locale messages object:

```ts
// Import from JSON or an ES module
import de from './locales/de.json'
import en from './locales/en.json'

export default defineNuxtConfig({
  i18n: {
    messages: {
      de,
      en,
    },
  },
})
```

The locale messages defined above will be passed as the `messages` option when initializing `@leanera/vue-i18n` with `createI18n()`.

## API

### Module Options

```ts
interface ModuleOptions {
  /**
   * List of locales supported by your app
   *
   * @remarks
   * Intended to be an array of string codes, e.g. `['en', 'fr']`
   *
   * @default []
   */
  locales?: string[]

  /**
   * The app's default locale
   *
   * @remarks
   * It's recommended to set this to some locale regardless of the chosen strategy, as it will be used as a fallback locale
   *
   * @default 'en'
   */
  defaultLocale?: string

  /**
   * Directory where your locale files are stored
   *
   * @remarks
   * Expected to be a relative path from the project root
   *
   * @default 'locales'
   */
  langDir?: string

  /**
   * Whether to enable locale auto-importing
   *
   * @remarks
   * When enabled, the module will automatically import all locale files from the `langDir` directory
   *
   * @default false
   */
  langImports?: boolean

  /**
   * Whether to lazy-load locale messages in the client
   *
   * @remarks
   * If enabled, locale messages will be loaded on demand when the user navigates to a route with a different locale
   *
   * This has no effect if the `langImports` option is disabled
   *
   * Note: When `strategy` is set to `no_prefix`, use the `useLazyLocaleSwitch` composable to ensure the translation messages are loaded before switching locales
   *
   * @default false
   */
  lazy?: boolean

  /**
   * The app's default messages
   *
   * @remarks
   * Can be omitted if auto-importing of locales is enabled
   *
   * @default {}
   */
  messages?: LocaleMessages

  /**
   * Routes strategy
   *
   * @remarks
   * Can be set to one of the following:
   *
   * - `no_prefix`: routes won't have a locale prefix
   * - `prefix_except_default`: locale prefix added for every locale except default
   * - `prefix`: locale prefix added for every locale
   * - `prefix_and_default`: locale prefix added for every locale and default
   *
   * @default 'no_prefix'
   */
  strategy?: 'no_prefix' | 'prefix' | 'prefix_except_default' | 'prefix_and_default'

  /**
   * Customize route paths for specific locale
   *
   * @remarks
   * Intended to translate URLs in addition to having them prefixed with the locale code
   *
   * @example
   * pages: {
   *   about: {
   *     en: '/about-us', // Accessible at `/about-us` (no prefix with `prefix_and_default` since it's the default locale)
   *     fr: '/a-propos', // Accessible at `/fr/a-propos`
   *     es: '/sobre'     // Accessible at `/es/sobre`
   *   }
   * }
   * @default {}
   */
  pages?: CustomRoutePages

  /**
   * Custom route overrides for the generated routes
   *
   * @example
   * routeOverrides: {
   *   // Set default locale's index page as the app's root page
   *   '/en': '/',
   * }
   *
   * @default {}
   */
  routeOverrides?: Record<string, string>
}
```

### Composables

#### `useI18n`

Gives access to the current i18n instance.

```ts
declare function useI18n(): UseI18n

interface UseI18n {
  defaultLocale: string
  locale: ComputedRef<string>
  locales: readonly string[]
  messages: LocaleMessages
  t: (key: string, params?: any) => string
  setLocale: (locale: string) => void
  getLocale: () => string
  addMessages: (messages: LocaleMessages) => void
}
```

#### `useRouteLocale`

Returns the current locale based on the route name. Preferred for strategies other than `no_prefix`.

**Types**

```ts
declare function useRouteLocale(): string
```

#### `useLocalePath`

Returns a translated path for a given route. Preferred when working with all routing strategies except `no_prefix`.

**Types**

```ts
declare function useLocalePath(path: string, locale?: string): string
```

**Example**

```ts
const to = useLocalePath(useRoute().fullPath, 'de')
useRouter().push(to)
```

#### `useLazyLocaleSwitch`

Ensures to load the translation messages for the given locale before switching to it. Mostly needed for the `no_prefix` strategy.

**Types**

```ts
declare function useLazyLocaleSwitch(newLocale: string): Promise<void>
```

**Example**

```ts
await useLazyLocaleSwitch('en')
```

## 💻 Development

1. Clone this repository
2. Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable` (use `npm i -g corepack` for Node.js < 16.10)
3. Install dependencies using `pnpm install`
4. Run `pnpm run dev:prepare`
5. Start development server using `pnpm run dev`

## Credits

- [Kazuya Kawaguchi](https://github.com/kazupon) for his work on [@intlify](https://github.com/intlify)'s [vue-i18n-next](https://github.com/intlify/vue-i18n-next), the next v8 alpha of [nuxt-i18n](https://github.com/kazupon/nuxt-i18n) as well as the i18n routing library [vue-i18n-routing](https://github.com/intlify/routing)

## License

[MIT](./LICENSE) License © 2022 [LeanERA GmbH](https://github.com/leanera)
