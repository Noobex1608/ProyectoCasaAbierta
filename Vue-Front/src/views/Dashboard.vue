/**
 * Smart Classroom AI - Dashboard View
 * Estilo inspirado en Moodle
 */
<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800">
          ¡Hola, {{ userName }}! 
        </h1>
      </div>

      <!-- Success Message -->
      <div
        v-if="showSuccessMessage"
        class="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg flex items-start gap-3"
      >
        <div class="flex-shrink-0">
          <FontAwesomeIcon :icon="['fas', 'check-circle']" class="text-green-400 text-xl" />
        </div>
        <div class="flex-1">
          <p class="text-green-800 text-sm font-medium">{{ successMessage }}</p>
        </div>
        <button
          @click="showSuccessMessage = false"
          class="flex-shrink-0 text-green-600 hover:text-green-800"
        >
          <FontAwesomeIcon :icon="['fas', 'times']" />
        </button>
      </div>

      <!-- Accesos Rápidos -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <router-link
          to="/students"
          class="bg-white rounded-lg border border-gray-200 p-5 hover:border-[#d63031] hover:shadow-md transition-all group"
        >
          <div class="flex items-center gap-4">
            <div class="h-12 w-12 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xl">
              <FontAwesomeIcon :icon="['fas', 'users']" />
            </div>
            <div>
              <h3 class="font-semibold text-gray-800 group-hover:text-[#d63031]">Gestionar Estudiantes</h3>
              <p class="text-sm text-gray-500">Registrar y administrar</p>
            </div>
          </div>
        </router-link>
        
        <router-link
          to="/classes"
          class="bg-white rounded-lg border border-gray-200 p-5 hover:border-[#d63031] hover:shadow-md transition-all group"
        >
          <div class="flex items-center gap-4">
            <div class="h-12 w-12 rounded-lg bg-green-500 flex items-center justify-center text-white text-xl">
              <FontAwesomeIcon :icon="['fas', 'calendar-days']" />
            </div>
            <div>
              <h3 class="font-semibold text-gray-800 group-hover:text-[#d63031]">Gestionar Clases</h3>
              <p class="text-sm text-gray-500">Crear y administrar sesiones</p>
            </div>
          </div>
        </router-link>

        <router-link
          to="/enrollment"
          class="bg-white rounded-lg border border-gray-200 p-5 hover:border-[#d63031] hover:shadow-md transition-all group"
        >
          <div class="flex items-center gap-4">
            <div class="h-12 w-12 rounded-lg bg-purple-500 flex items-center justify-center text-white text-xl">
              <FontAwesomeIcon :icon="['fas', 'user-plus']" />
            </div>
            <div>
              <h3 class="font-semibold text-gray-800 group-hover:text-[#d63031]">Registro Rápido</h3>
              <p class="text-sm text-gray-500">Registrar nuevo estudiante</p>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Mis Materias Section -->
      <div class="bg-white rounded-lg border border-gray-200 mb-6">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-[#d63031]">Mis Materias</h2>
        </div>
        
        <div class="p-6">
          <!-- Loading State -->
          <LoadingSpinner v-if="loading" text="Cargando materias..." :full-height="false" />

          <!-- Empty State -->
          <div v-else-if="courses.length === 0" class="text-center py-12">
            <div class="text-6xl mb-4 text-gray-300">
              <FontAwesomeIcon :icon="['fas', 'book']" />
            </div>
            <h3 class="text-xl font-semibold text-gray-700 mb-2">No tienes materias registradas</h3>
            <p class="text-gray-500 mb-6">Crea tu primera materia para comenzar a gestionar tus clases</p>
            <button
              @click="showCreateCourseModal = true"
              class="px-6 py-3 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
            >
              <FontAwesomeIcon :icon="['fas', 'plus']" />
              Crear Primera Materia
            </button>
          </div>

          <!-- Courses List -->
          <div v-else>
            <div class="flex justify-between items-center mb-4">
              <div class="flex items-center gap-4">
                <select class="px-3 py-2 border border-gray-300 rounded text-sm text-gray-600 bg-white">
                  <option>Todas las materias</option>
                </select>
              </div>
              <button
                @click="showCreateCourseModal = true"
                class="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors inline-flex items-center gap-2 text-sm"
              >
                <FontAwesomeIcon :icon="['fas', 'plus']" />
                Nueva Materia
              </button>
            </div>

            <!-- Courses Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="course in courses"
                :key="course.id"
                class="group bg-gray-50 border border-gray-200 rounded-lg p-5 hover:border-[#d63031] hover:bg-white transition-all"
              >
                <div class="flex items-start gap-4">
                  <div class="h-12 w-12 rounded-lg bg-[#d63031] flex items-center justify-center text-white text-xl flex-shrink-0">
                    <FontAwesomeIcon :icon="['fas', 'book-open']" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-gray-800 group-hover:text-[#d63031] transition-colors truncate">
                      {{ course.course_name }}
                    </h3>
                    <p class="text-sm text-gray-500 mt-1">{{ course.course_code }}</p>
                    <p v-if="course.description" class="text-sm text-gray-500 mt-2 line-clamp-2">
                      {{ course.description }}
                    </p>
                    <div v-if="course.schedule && course.schedule.length > 0" class="mt-2 flex flex-wrap gap-1">
                      <span
                        v-for="(sched, idx) in course.schedule"
                        :key="idx"
                        class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                      >
                        {{ getDayName(sched.day_of_week) }} {{ sched.start_time }}-{{ sched.end_time }}
                      </span>
                    </div>
                    <!-- Indicador de Google Calendar -->
                    <div v-if="course.schedule && course.schedule.length > 0" class="mt-2">
                      <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded inline-flex items-center gap-1">
                        <FontAwesomeIcon :icon="['fas', 'calendar']" />
                        Horarios configurados
                      </span>
                    </div>
                  </div>
                </div>
                <div class="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between gap-2">
                  <router-link
                    :to="`/courses/${course.id}`"
                    class="text-sm text-gray-500 hover:text-[#d63031] transition-colors"
                  >
                    Ver detalles
                    <FontAwesomeIcon :icon="['fas', 'chevron-right']" class="ml-1" />
                  </router-link>
                  <div class="flex gap-2">
                    <button
                      @click="editCourse(course)"
                      class="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Editar materia"
                    >
                      <FontAwesomeIcon :icon="['fas', 'edit']" class="text-sm" />
                    </button>
                    <button
                      @click="confirmDeleteCourse(course)"
                      class="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar materia"
                    >
                      <FontAwesomeIcon :icon="['fas', 'trash']" class="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendario Semanal -->
      <WeeklyCalendar :schedules="weeklySchedules" />

    </div>

    <!-- Create Course Modal -->
    <div
      v-if="showCreateCourseModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 overflow-y-auto"
      @click.self="showCreateCourseModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 class="text-xl font-semibold text-gray-800">
            {{ isEditMode ? 'Editar Materia' : 'Nueva Materia' }}
          </h2>
        </div>

        <form @submit.prevent="createCourse" class="p-6">
          <div class="space-y-4">
            <!-- Información Básica -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Materia *
              </label>
              <input
                v-model="newCourse.course_name"
                @input="onCourseNameChange"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d63031] focus:border-transparent"
                placeholder="Ej: Matemáticas Avanzadas"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Código <span class="text-xs text-gray-400">(automático)</span>
              </label>
              <input
                v-model="newCourse.course_code"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500"
                placeholder="Ej: MAT-301"
                readonly
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Descripción <span class="text-xs text-gray-400">(opcional)</span>
              </label>
              <textarea
                v-model="newCourse.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d63031] focus:border-transparent resize-none"
                placeholder="Breve descripción de la materia..."
              ></textarea>
            </div>

            <!-- Horarios -->
            <div class="border-t border-gray-200 pt-4">
              <div class="flex justify-between items-center mb-3">
                <label class="block text-sm font-medium text-gray-700">
                  Horarios de Clase
                </label>
                <button
                  type="button"
                  @click="addSchedule"
                  class="text-sm text-[#d63031] hover:text-[#c0282a] font-medium"
                >
                  + Agregar horario
                </button>
              </div>

              <div v-if="newCourse.schedule.length === 0" class="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded">
                Sin horarios definidos. La materia se creará sin calendario.
              </div>

              <div v-else class="space-y-3">
                <div
                  v-for="(schedule, index) in newCourse.schedule"
                  :key="index"
                  class="flex gap-3 items-start p-3 bg-gray-50 rounded border border-gray-200"
                >
                  <div class="flex-1 grid grid-cols-3 gap-3">
                    <!-- Día -->
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-1">
                        Día *
                      </label>
                      <select
                        v-model="schedule.day_of_week"
                        required
                        class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d63031]"
                      >
                        <option :value="1">Lunes</option>
                        <option :value="2">Martes</option>
                        <option :value="3">Miércoles</option>
                        <option :value="4">Jueves</option>
                        <option :value="5">Viernes</option>
                        <option :value="6">Sábado</option>
                      </select>
                    </div>

                    <!-- Hora inicio -->
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-1">
                        Inicio *
                      </label>
                      <input
                        v-model="schedule.start_time"
                        type="time"
                        required
                        class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d63031]"
                      />
                    </div>

                    <!-- Hora fin -->
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-1">
                        Fin *
                      </label>
                      <input
                        v-model="schedule.end_time"
                        type="time"
                        required
                        class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d63031]"
                      />
                    </div>
                  </div>

                  <!-- Botón eliminar -->
                  <button
                    type="button"
                    @click="removeSchedule(index)"
                    class="mt-6 p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar horario"
                  >
                    <FontAwesomeIcon :icon="['fas', 'trash']" class="text-sm" />
                  </button>
                </div>
              </div>

              <!-- Opción de sincronización con Google Calendar -->
              <div v-if="newCourse.schedule.length > 0" class="mt-4 border-t border-gray-200 pt-4">
                <div class="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="sync-google-calendar"
                    v-model="syncWithGoogleCalendar"
                    :disabled="!googleCalendarReady"
                    class="mt-1 h-4 w-4 text-[#d63031] focus:ring-[#d63031] border-gray-300 rounded"
                  />
                  <div class="flex-1">
                    <label for="sync-google-calendar" class="text-sm font-medium text-gray-700 cursor-pointer">
                      Sincronizar con Google Calendar
                    </label>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ googleCalendarReady ? (isEditMode ? 'Se actualizarán los eventos en tu calendario' : 'Los horarios se repetirán cada semana durante 3 meses') : 'Requiere configuración de Google Calendar' }}
                    </p>
                  </div>
                </div>
                
                <!-- Advertencia para edición -->
                <div v-if="isEditMode && syncWithGoogleCalendar" class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div class="flex items-start gap-2">
                    <FontAwesomeIcon :icon="['fas', 'info-circle']" class="text-blue-600 mt-0.5" />
                    <div class="flex-1">
                      <p class="text-sm font-medium text-blue-800">Actualización de calendario</p>
                      <p class="text-xs text-blue-700 mt-1">
                        Los eventos antiguos se eliminarán automáticamente y se crearán nuevos con los horarios actualizados.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Estado de Google Calendar -->
              <div v-if="googleCalendarReady" class="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div class="flex items-center gap-2 text-sm text-emerald-800">
                  <FontAwesomeIcon :icon="['fas', 'calendar-check']" class="text-emerald-600" />
                  <span class="font-medium">Google Calendar conectado</span>
                </div>
                <p class="text-xs text-emerald-700 mt-1">
                  Marca la casilla arriba para sincronizar automáticamente al crear la materia
                </p>
              </div>
              
              <div v-else-if="initializingCalendar" class="mt-3 p-3 bg-sky-50 border border-sky-200 rounded-lg">
                <div class="flex items-center gap-2 text-sm text-sky-800">
                  <FontAwesomeIcon :icon="['fas', 'spinner']" class="text-sky-600 animate-spin" />
                  <span class="font-medium">Inicializando Google Calendar...</span>
                </div>
              </div>
              
              <div v-else class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div class="flex items-center gap-2 text-sm text-amber-800">
                  <FontAwesomeIcon :icon="['fas', 'info-circle']" class="text-amber-600" />
                  <span class="font-medium">Google Calendar no disponible</span>
                </div>
                <p class="text-xs text-amber-700 mt-1">
                  Configura las credenciales de Google Calendar en el archivo .env para habilitar la sincronización
                </p>
              </div>
            </div>
          </div>

          <AlertMessage 
            v-if="createError" 
            type="error" 
            :message="createError" 
            class="mt-4"
          />

          <div class="flex gap-3 mt-6">
            <button
              type="button"
              @click="closeCreateModal"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="creatingCourse"
              class="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {{ creatingCourse ? (isEditMode ? 'Actualizando...' : 'Creando...') : (isEditMode ? 'Actualizar Materia' : 'Crear Materia') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      @click.self="showDeleteConfirm = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-800">Eliminar Materia</h2>
        </div>

        <div class="p-6">
          <p class="text-gray-700 mb-4">
            ¿Estás seguro de que deseas eliminar la materia 
            <span class="font-semibold">{{ courseToDelete?.course_name }}</span>?
          </p>
          <p class="text-sm text-gray-500">
            Esta acción no se puede deshacer. Se eliminarán todos los datos asociados a esta materia.
          </p>
          
          <!-- Advertencia de Google Calendar -->
          <div v-if="courseToDelete?.schedule && courseToDelete.schedule.length > 0 && googleCalendarReady" class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div class="flex items-start gap-2">
              <FontAwesomeIcon :icon="['fas', 'calendar-xmark']" class="text-amber-600 mt-0.5" />
              <div class="flex-1">
                <p class="text-sm font-medium text-amber-800">Eventos de Google Calendar</p>
                <p class="text-xs text-amber-700 mt-1">
                  También se intentará eliminar los eventos de esta materia en tu Google Calendar si existen.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            type="button"
            @click="showDeleteConfirm = false"
            :disabled="deleting"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="deleteCourse"
            :disabled="deleting"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { coursesService } from '@/services/courses.service'
import { googleCalendarService } from '@/services/google-calendar.service'
import { useAuth } from '@/composables/useAuth'
import type { Course, CourseSchedule } from '@/types'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import AlertMessage from '@/components/AlertMessage.vue'
import WeeklyCalendar from '@/components/WeeklyCalendar.vue'

const { profile } = useAuth()

const loading = ref(true)
const showCreateCourseModal = ref(false)
const creatingCourse = ref(false)
const createError = ref('')
const showSuccessMessage = ref(false)
const successMessage = ref('')
const isEditMode = ref(false)
const editingCourseId = ref<string | null>(null)
const showDeleteConfirm = ref(false)
const courseToDelete = ref<Course | null>(null)
const deleting = ref(false)
const googleCalendarReady = ref(false)
const initializingCalendar = ref(false)
const syncWithGoogleCalendar = ref(false)

const courses = ref<Course[]>([])

const userName = computed(() => {
  if (!profile.value?.full_name) return 'Usuario'
  return profile.value.full_name.split(' ')[0] || 'Usuario'
})

const newCourse = reactive<{
  course_name: string
  course_code: string
  description: string
  schedule: CourseSchedule[]
}>({
  course_name: '',
  course_code: '',
  description: '',
  schedule: []
})

// Generar colores para las materias - Paleta que combina con el tema principal (#d63031)
const courseColors = [
  '#d63031', // Rojo principal
  '#0984e3', // Azul brillante
  '#6c5ce7', // Púrpura
  '#00b894', // Verde esmeralda
  '#e17055', // Coral
  '#fd79a8', // Rosa
  '#fdcb6e', // Amarillo dorado
  '#74b9ff'  // Azul cielo
]

// Horarios para el calendario semanal
const weeklySchedules = computed(() => {
  const schedules: any[] = []
  courses.value.forEach((course, index) => {
    const color = courseColors[index % courseColors.length]
    if (course.schedule && course.schedule.length > 0) {
      course.schedule.forEach(schedule => {
        schedules.push({
          id: `${course.id}-${schedule.day_of_week}`,
          course_id: course.id,
          course_name: course.course_name,
          course_code: course.course_code,
          day_of_week: schedule.day_of_week,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          color: color
        })
      })
    }
  })
  return schedules
})

const initializeGoogleCalendar = async () => {
  if (initializingCalendar.value || googleCalendarReady.value) return
  
  initializingCalendar.value = true
  try {
    // Verificar si tiene credenciales configuradas
    if (!googleCalendarService.hasCredentials()) {
      console.warn('Google Calendar no configurado. Configura VITE_GOOGLE_API_KEY y VITE_GOOGLE_CLIENT_ID en .env')
      return
    }
    
    // Inicializar Google Calendar API
    await googleCalendarService.initialize()
    await googleCalendarService.initializeAuthClient()
    googleCalendarReady.value = true
    console.log('✅ Google Calendar inicializado correctamente')
  } catch (error) {
    console.error('Error al inicializar Google Calendar:', error)
    googleCalendarReady.value = false
  } finally {
    initializingCalendar.value = false
  }
}

const loadDashboardData = async () => {
  loading.value = true
  try {
    courses.value = await coursesService.getMyCourses()
  } catch (error) {
    console.error('Error loading courses:', error)
  } finally {
    loading.value = false
  }
}

const generateCourseCode = (courseName: string): string => {
  if (!courseName) return ''
  
  const words = courseName.trim().toUpperCase().split(/\s+/).filter(w => w.length > 0)
  
  if (words.length === 0) return ''
  
  let abbreviation = ''
  if (words.length === 1) {
    abbreviation = words[0]?.substring(0, 3) || 'CUR'
  } else if (words.length === 2) {
    abbreviation = (words[0]?.substring(0, 2) || '') + (words[1]?.substring(0, 2) || '')
  } else {
    abbreviation = words.slice(0, 3).map(w => w?.[0] || '').join('')
  }
  
  const randomNum = Math.floor(100 + Math.random() * 900)
  
  return `${abbreviation}-${randomNum}`
}

const onCourseNameChange = () => {
  if (newCourse.course_name && !newCourse.course_code) {
    newCourse.course_code = generateCourseCode(newCourse.course_name)
  }
}

const addSchedule = () => {
  newCourse.schedule.push({
    day_of_week: 1,
    start_time: '08:00',
    end_time: '10:00'
  })
}

const removeSchedule = (index: number) => {
  newCourse.schedule.splice(index, 1)
}

const validateScheduleTime = (schedule: CourseSchedule): boolean => {
  const [startHour, startMin] = schedule.start_time.split(':').map(Number)
  const [endHour, endMin] = schedule.end_time.split(':').map(Number)
  
  if (startHour === undefined || startMin === undefined || endHour === undefined || endMin === undefined) {
    return false
  }
  
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  
  return endMinutes > startMinutes
}

const getDayName = (dayOfWeek: number): string => {
  const days = ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  return days[dayOfWeek] || ''
}

const closeCreateModal = () => {
  showCreateCourseModal.value = false
  isEditMode.value = false
  editingCourseId.value = null
  newCourse.course_name = ''
  newCourse.course_code = ''
  newCourse.description = ''
  newCourse.schedule = []
  createError.value = ''
  syncWithGoogleCalendar.value = false
}

const editCourse = (course: Course) => {
  isEditMode.value = true
  editingCourseId.value = course.id
  newCourse.course_name = course.course_name
  newCourse.course_code = course.course_code
  newCourse.description = course.description || ''
  newCourse.schedule = course.schedule ? [...course.schedule] : []
  
  // Por defecto, no marcar sincronización (el usuario puede habilitarla si quiere actualizar)
  syncWithGoogleCalendar.value = false
  
  showCreateCourseModal.value = true
}

const confirmDeleteCourse = (course: Course) => {
  courseToDelete.value = course
  showDeleteConfirm.value = true
}

const deleteCourse = async () => {
  if (!courseToDelete.value) return
  
  deleting.value = true
  try {
    // Intentar eliminar eventos de Google Calendar (si existen)
    if (googleCalendarReady.value) {
      try {
        console.log('🗑️ Eliminando eventos de Google Calendar...')
        
        // Si no está autenticado, solicitar autorización
        if (!googleCalendarService.isAuthenticated()) {
          await googleCalendarService.requestAuthorization()
        }
        
        await googleCalendarService.deleteCourseEvents(courseToDelete.value.course_code)
        console.log('✅ Eventos eliminados de Google Calendar')
      } catch (error) {
        console.error('Error eliminando eventos de Google Calendar:', error)
        // Continuar con la eliminación de la materia aunque falle la eliminación del calendario
      }
    }
    
    // Eliminar la materia de la base de datos
    await coursesService.deleteCourse(courseToDelete.value.id)
    await loadDashboardData()
    showDeleteConfirm.value = false
    courseToDelete.value = null
    
    successMessage.value = '✅ Materia eliminada correctamente'
    showSuccessMessage.value = true
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 5000)
  } catch (error: any) {
    console.error('Error deleting course:', error)
    createError.value = error.message || 'Error al eliminar la materia'
  } finally {
    deleting.value = false
  }
}

const createCourse = async () => {
  if (!newCourse.course_name || !newCourse.course_code) return

  // Validar horarios
  if (newCourse.schedule.length > 0) {
    for (const schedule of newCourse.schedule) {
      if (!validateScheduleTime(schedule)) {
        createError.value = 'La hora de fin debe ser mayor que la hora de inicio'
        return
      }
    }
  }

  creatingCourse.value = true
  createError.value = ''
  showSuccessMessage.value = false

  try {
    if (isEditMode.value && editingCourseId.value) {
      // Editar materia existente
      await coursesService.updateCourse(editingCourseId.value, {
        course_name: newCourse.course_name,
        course_code: newCourse.course_code,
        description: newCourse.description || undefined,
        schedule: newCourse.schedule.length > 0 ? newCourse.schedule : undefined
      })
      
      // Actualizar en Google Calendar si está habilitado
      let calendarUpdated = false
      let calendarError = null
      
      if (syncWithGoogleCalendar.value && googleCalendarReady.value && newCourse.schedule.length > 0) {
        try {
          // Si no está autenticado, solicitar autorización
          if (!googleCalendarService.isAuthenticated()) {
            console.log('Solicitando autorización de Google Calendar...')
            await googleCalendarService.requestAuthorization()
          }
          
          // Actualizar eventos en Google Calendar (elimina antiguos y crea nuevos)
          console.log('Actualizando eventos en Google Calendar...')
          await googleCalendarService.updateCourseEvents({
            course_name: newCourse.course_name,
            course_code: newCourse.course_code,
            description: newCourse.description || undefined,
            schedule: newCourse.schedule
          })
          calendarUpdated = true
          console.log('✅ Eventos actualizados en Google Calendar (antiguos eliminados)')
        } catch (error: any) {
          console.error('Error actualizando eventos en calendar:', error)
          calendarError = error
        }
      }
      
      // Mensaje de éxito según el resultado
      if (calendarUpdated) {
        successMessage.value = `✅ Materia actualizada y sincronizada con Google Calendar`
      } else if (syncWithGoogleCalendar.value && calendarError) {
        successMessage.value = '✅ Materia actualizada. Error al sincronizar con Google Calendar.'
      } else {
        successMessage.value = '✅ Materia actualizada correctamente'
      }
    } else {
      // Crear nueva materia
      const createdCourse = await coursesService.createCourse({
        course_name: newCourse.course_name,
        course_code: newCourse.course_code,
        description: newCourse.description || undefined,
        schedule: newCourse.schedule.length > 0 ? newCourse.schedule : undefined
      })

      let calendarSynced = false
      let calendarError = null

      // Intentar crear eventos recurrentes en Google Calendar solo si el usuario lo desea
      if (syncWithGoogleCalendar.value && googleCalendarReady.value && newCourse.schedule.length > 0) {
        try {
          // Si no está autenticado, solicitar autorización
          if (!googleCalendarService.isAuthenticated()) {
            console.log('Solicitando autorización de Google Calendar...')
            await googleCalendarService.requestAuthorization()
          }
          
          // Crear eventos en Google Calendar
          console.log('Creando eventos en Google Calendar...')
          await googleCalendarService.createCourseEvent({
            course_name: newCourse.course_name,
            course_code: newCourse.course_code,
            description: newCourse.description || undefined,
            schedule: newCourse.schedule
          })
          calendarSynced = true
          console.log('✅ Eventos creados en Google Calendar')
        } catch (error: any) {
          console.error('Error creating calendar event:', error)
          calendarError = error
        }
      }

      // Mensaje de éxito según el resultado de la sincronización
      if (calendarSynced) {
        successMessage.value = `✅ Materia creada y sincronizada con Google Calendar (${newCourse.schedule.length} horario${newCourse.schedule.length > 1 ? 's' : ''})`
      } else if (!syncWithGoogleCalendar.value) {
        successMessage.value = '✅ Materia creada sin sincronización con Google Calendar.'
      } else if (!googleCalendarReady.value) {
        successMessage.value = '✅ Materia creada. Google Calendar no está configurado.'
      } else if (newCourse.schedule.length === 0) {
        successMessage.value = '✅ Materia creada sin horarios.'
      } else if (calendarError) {
        successMessage.value = '✅ Materia creada. Error al sincronizar con Google Calendar. Verifica tu conexión e intenta sincronizar manualmente.'
      } else {
        successMessage.value = '✅ Materia creada. Para sincronizar con Google Calendar, autoriza el acceso.'
      }
    }

    await loadDashboardData()
    closeCreateModal()
    
    showSuccessMessage.value = true
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 5000)
  } catch (error: any) {
    createError.value = error.message || 'Error al guardar la materia'
  } finally {
    creatingCourse.value = false
  }
}

onMounted(async () => {
  // Inicializar Google Calendar en paralelo con la carga de datos
  await Promise.all([
    loadDashboardData(),
    initializeGoogleCalendar()
  ])
})
</script>
