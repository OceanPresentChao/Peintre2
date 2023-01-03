import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  legacy: false, // you must set `false`, to use Composition API
  locale: 'en', // set locale
  fallbackLocale: 'en', // set fallback locale
  messages: {
    en: {
      msg: 'This is I18n',
    },
    zh: {
      msg: '这是I18n',
    },
  }, // set locale messages
  // If you need to specify other options, you can set other options
  // ...
})

export { i18n }
