/**
 * Smart Classroom AI - Main Entry Point
 */
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { useAuth } from './composables/useAuth'

// FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'

// Agregar todos los iconos solid a la libreria
library.add(fas)

const app = createApp(App)

// Registrar el componente globalmente
app.component('FontAwesomeIcon', FontAwesomeIcon)

// Initialize authentication before mounting
const { initAuth } = useAuth()

initAuth().then(() => {
  app.use(router)
  app.mount('#app')
})
