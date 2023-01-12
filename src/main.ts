import { createApp } from 'vue'
import 'uno.css'
import { Icon } from '@iconify/vue'
import App from './App.vue'
import { i18n } from './locales'
const app = createApp(App)
app.component('Icon', Icon)
app.use(i18n)
app.mount('#app')
