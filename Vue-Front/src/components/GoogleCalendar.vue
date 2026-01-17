<!--
  Google Calendar Component
  Muestra el calendario de Google integrado
-->
<template>
  <div class="bg-white rounded-lg border border-gray-200">
    <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
      <h2 class="text-xl font-semibold text-[#d63031]">Calendario</h2>
      <button
        v-if="!isAuthenticated"
        @click="handleAuth"
        class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors inline-flex items-center gap-2 text-sm"
      >
        <FontAwesomeIcon :icon="['fas', 'calendar-check']" />
        Conectar Google Calendar
      </button>
    </div>

    <div class="p-6">
      <!-- Configuration Needed State -->
      <div v-if="showConfigNeeded" class="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <FontAwesomeIcon :icon="['fas', 'exclamation-triangle']" class="text-yellow-400 text-2xl" />
          </div>
          <div class="ml-4 flex-1">
            <h3 class="text-lg font-semibold text-yellow-800 mb-2">
              Configuración Requerida
            </h3>
            <p class="text-yellow-700 mb-4">
              Para usar Google Calendar, necesitas configurar las credenciales de API.
            </p>
            
            <div class="bg-white rounded p-4 mb-4 text-sm">
              <p class="font-semibold text-gray-700 mb-2">Variables de entorno faltantes:</p>
              <ul class="list-disc list-inside text-gray-600 space-y-1">
                <li v-for="cred in missingCredentials" :key="cred" class="font-mono text-xs">
                  {{ cred }}
                </li>
              </ul>
            </div>

            <div class="space-y-3 text-sm text-yellow-800">
              <p class="font-semibold">Pasos para configurar:</p>
              <ol class="list-decimal list-inside space-y-2 ml-2">
                <li>Crea un archivo <code class="bg-yellow-100 px-2 py-1 rounded">.env</code> en el directorio Vue-Front</li>
                <li>Obtén las credenciales de <a href="https://console.cloud.google.com/" target="_blank" class="text-blue-600 hover:text-blue-800 underline">Google Cloud Console</a></li>
                <li>Agrega las variables de entorno al archivo .env</li>
                <li>Reinicia el servidor de desarrollo</li>
              </ol>
            </div>

            <div class="mt-4 pt-4 border-t border-yellow-200">
              <a 
                href="#" 
                @click.prevent="openDocumentation"
                class="inline-flex items-center gap-2 text-yellow-800 hover:text-yellow-900 font-semibold"
              >
                <FontAwesomeIcon :icon="['fas', 'book']" />
                Ver guía completa de configuración
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Not Authenticated State -->
      <div v-else-if="!isAuthenticated" class="text-center py-12">
        <div class="text-6xl mb-4 text-gray-300">
          <FontAwesomeIcon :icon="['fas', 'calendar-days']" />
        </div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">Conecta tu Google Calendar</h3>
        <p class="text-gray-500 mb-6">Sincroniza tus materias y eventos con Google Calendar</p>
        <button
          @click="handleAuth"
          class="px-6 py-3 bg-[#d63031] text-white rounded hover:bg-[#c0282a] transition-colors inline-flex items-center gap-2"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Conectar con Google
        </button>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin text-[#d63031] text-4xl mb-3">
          <FontAwesomeIcon :icon="['fas', 'spinner']" />
        </div>
        <p class="text-gray-500">Cargando calendario...</p>
      </div>

      <!-- Calendar Events -->
      <div v-else>
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button
              @click="previousMonth"
              class="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <FontAwesomeIcon :icon="['fas', 'chevron-left']" />
            </button>
            <h3 class="text-lg font-semibold text-gray-800 min-w-[200px] text-center">
              {{ currentMonthName }}
            </h3>
            <button
              @click="nextMonth"
              class="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <FontAwesomeIcon :icon="['fas', 'chevron-right']" />
            </button>
          </div>
          <button
            @click="loadEvents"
            class="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Actualizar"
          >
            <FontAwesomeIcon :icon="['fas', 'rotate']" />
          </button>
        </div>

        <!-- Events List -->
        <div v-if="events.length > 0" class="space-y-2">
          <div
            v-for="event in events"
            :key="event.id"
            class="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#d63031] transition-colors"
          >
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 w-2 h-2 bg-[#d63031] rounded-full mt-2"></div>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-800">{{ event.summary }}</h4>
                <p class="text-sm text-gray-500 mt-1">
                  {{ formatEventDate(event) }}
                </p>
                <p v-if="event.description" class="text-sm text-gray-600 mt-2">
                  {{ event.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-8">
          <div class="text-4xl mb-3 text-gray-300">
            <FontAwesomeIcon :icon="['fas', 'calendar-xmark']" />
          </div>
          <p class="text-gray-500">No hay eventos en este mes</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { googleCalendarService } from '@/services/google-calendar.service'

const isAuthenticated = ref(false)
const loading = ref(false)
const events = ref<any[]>([])
const currentDate = ref(new Date())
const showConfigNeeded = ref(false)
const missingCredentials = ref<string[]>([])
const configError = ref('')

const currentMonthName = computed(() => {
  return currentDate.value.toLocaleDateString('es-ES', { 
    month: 'long', 
    year: 'numeric' 
  })
})

const handleAuth = async () => {
  try {
    loading.value = true
    configError.value = ''
    showConfigNeeded.value = false
    
    // Verificar credenciales primero
    if (!googleCalendarService.hasCredentials()) {
      missingCredentials.value = googleCalendarService.getMissingCredentials()
      showConfigNeeded.value = true
      return
    }
    
    await googleCalendarService.initialize()
    await googleCalendarService.requestAuthorization()
    isAuthenticated.value = googleCalendarService.isAuthenticated()
    if (isAuthenticated.value) {
      await loadEvents()
    }
  } catch (error: any) {
    console.error('Error authenticating with Google:', error)
    configError.value = error.message || 'Error al conectar con Google Calendar'
    
    // Si el error es de credenciales, mostrar la sección de configuración
    if (error.message?.includes('credenciales') || error.message?.includes('client_id')) {
      missingCredentials.value = googleCalendarService.getMissingCredentials()
      showConfigNeeded.value = true
    }
  } finally {
    loading.value = false
  }
}

const loadEvents = async () => {
  loading.value = true
  try {
    const firstDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
    const lastDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0)
    events.value = await googleCalendarService.getEvents(firstDay, lastDay)
  } catch (error) {
    console.error('Error loading events:', error)
  } finally {
    loading.value = false
  }
}

const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
  loadEvents()
}

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
  loadEvents()
}

const formatEventDate = (event: any): string => {
  const start = event.start.dateTime || event.start.date
  const date = new Date(start)
  
  if (event.start.dateTime) {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } else {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}

const openDocumentation = () => {
  // Abrir el archivo de documentación en una nueva pestaña
  const docUrl = '/GOOGLE_CALENDAR_SETUP.md'
  window.open(docUrl, '_blank')
}

onMounted(async () => {
  try {
    // Verificar si las credenciales están configuradas
    if (!googleCalendarService.hasCredentials()) {
      missingCredentials.value = googleCalendarService.getMissingCredentials()
      showConfigNeeded.value = true
      return
    }
    
    await googleCalendarService.initialize()
    isAuthenticated.value = googleCalendarService.isAuthenticated()
    if (isAuthenticated.value) {
      await loadEvents()
    }
  } catch (error: any) {
    console.error('Error initializing calendar:', error)
    if (error.message?.includes('credenciales')) {
      missingCredentials.value = googleCalendarService.getMissingCredentials()
      showConfigNeeded.value = true
    }
  }
})

// Exponer método para recargar eventos (usado desde el padre)
defineExpose({
  loadEvents
})
</script>
