/**
 * Smart Classroom AI - Classes Management View
 */
<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <PageHeader
        title="Gestion de Clases"
        icon="calendar-days"
        description="Crea y administra sesiones de clase"
      >
        <template #action>
          <button
            @click="showCreateModal = true"
            class="px-6 py-3 bg-[#b81a16] text-white rounded-lg hover:bg-[#9a1512] transition-colors duration-200 font-medium flex items-center gap-2"
          >
            <FontAwesomeIcon :icon="['fas', 'plus']" />
            Nueva Clase
          </button>
        </template>
      </PageHeader>

      <!-- Loading State -->
      <LoadingSpinner v-if="loading" />

      <!-- Empty State -->
      <EmptyState
        v-else-if="classes.length === 0"
        icon="book"
        title="No hay clases creadas"
        description="Crea tu primera sesion de clase"
        action-text="Nueva Clase"
        action-icon="plus"
        @action="showCreateModal = true"
      />

      <!-- Classes List -->
      <div v-else class="space-y-6">
        <!-- Active Classes -->
        <div v-if="activeClasses.length > 0">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FontAwesomeIcon :icon="['fas', 'circle']" class="text-green-500 text-sm" />
            Clases Activas
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="classItem in activeClasses"
              :key="classItem.id"
              class="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-green-500 hover:shadow-lg transition-shadow duration-200"
            >
              <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                  <h3 class="text-lg font-bold text-gray-900">{{ classItem.class_name }}</h3>
                  <span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                    En curso
                  </span>
                </div>

                <div class="space-y-2 text-sm text-gray-600 mb-4">
                  <p class="flex items-center gap-2">
                    <FontAwesomeIcon :icon="['fas', 'calendar-days']" class="text-gray-400 w-4" />
                    Inicio: {{ formatDateTime(classItem.start_time) }}
                  </p>
                  <p class="flex items-center gap-2">
                    <FontAwesomeIcon :icon="['fas', 'stopwatch']" class="text-gray-400 w-4" />
                    Duracion: {{ getDuration(classItem.start_time, classItem.end_time || '') }}
                  </p>
                  <p class="flex items-center gap-2">
                    <FontAwesomeIcon :icon="['fas', 'id-card']" class="text-gray-400 w-4" />
                    ID: {{ classItem.id }}
                  </p>
                </div>

                <div class="flex gap-2">
                  <router-link
                    :to="`/attendance?class_id=${classItem.id}`"
                    class="flex-1 px-3 py-2 bg-indigo-50 text-[#b81a16] rounded-lg hover:bg-red-100 transition-colors duration-200 text-sm font-medium text-center inline-flex items-center justify-center gap-1"
                  >
                    <FontAwesomeIcon :icon="['fas', 'circle-check']" />
                    Asistencia
                  </router-link>
                  <router-link
                    :to="`/emotions?class_id=${classItem.id}`"
                    class="flex-1 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors duration-200 text-sm font-medium text-center inline-flex items-center justify-center gap-1"
                  >
                    <FontAwesomeIcon :icon="['fas', 'face-smile']" />
                    Emociones
                  </router-link>
                </div>

                <button
                  @click="confirmEndClass(classItem)"
                  class="w-full mt-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 text-sm font-medium inline-flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon :icon="['fas', 'stop']" />
                  Finalizar Clase
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Past Classes -->
        <div v-if="pastClasses.length > 0">
          <h2 class="text-xl font-bold text-gray-900 mb-4 mt-8 flex items-center gap-2">
            <FontAwesomeIcon :icon="['fas', 'book']" class="text-gray-500" />
            Clases Finalizadas
          </h2>
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clase
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inicio
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fin
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duración
                    </th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="classItem in pastClasses" :key="classItem.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ classItem.class_name }}</div>
                      <div class="text-xs text-gray-500">ID: {{ classItem.id }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {{ formatDateTime(classItem.start_time) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {{ formatDateTime(classItem.end_time!) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {{ getClassDuration(classItem.start_time, classItem.end_time!) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        @click="confirmDeleteClass(classItem)"
                        class="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                      >
                        <FontAwesomeIcon :icon="['fas', 'trash']" />
                        Eliminar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Class Modal -->
      <div
        v-if="showCreateModal"
        class="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50"
        @click.self="showCreateModal = false"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FontAwesomeIcon :icon="['fas', 'calendar-plus']" class="text-[#b81a16]" />
            Nueva Sesión de Clase
          </h2>

          <form @submit.prevent="createClass">
            <!-- Nombre de la Sesión -->
            <div class="mb-4">
              <label for="className" class="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Sesión <span class="text-red-500">*</span>
              </label>
              <input
                id="className"
                v-model="newClassName"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b81a16]"
                placeholder="Ej: Clase de Introducción"
              />
            </div>

            <!-- Nota informativa -->
            <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p class="text-sm text-blue-700">
                ℹ️ Para crear clases con estudiantes específicos, usa el botón "Iniciar Sesión" desde la vista de cada curso.
              </p>
            </div>

            <!-- Fecha -->
            <div class="mb-4">
              <label for="classDate" class="block text-sm font-medium text-gray-700 mb-2">
                Fecha <span class="text-red-500">*</span>
              </label>
              <input
                id="classDate"
                v-model="newClassDate"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b81a16]"
              />
            </div>

            <!-- Hora de Inicio -->
            <div class="mb-4">
              <label for="startTime" class="block text-sm font-medium text-gray-700 mb-2">
                Hora de Inicio <span class="text-red-500">*</span>
              </label>
              <input
                id="startTime"
                v-model="newStartTime"
                type="time"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b81a16]"
              />
            </div>

            <!-- Hora de Fin -->
            <div class="mb-4">
              <label for="endTime" class="block text-sm font-medium text-gray-700 mb-2">
                Hora de Fin <span class="text-red-500">*</span>
              </label>
              <input
                id="endTime"
                v-model="newEndTime"
                type="time"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b81a16]"
              />
            </div>

            <AlertMessage 
              v-if="createError" 
              type="error" 
              :message="createError" 
              class="mb-4"
            />

            <div class="flex gap-3">
              <button
                type="button"
                @click="showCreateModal = false"
                class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="creating"
                class="flex-1 px-4 py-2 bg-[#b81a16] text-white rounded-lg hover:bg-[#9a1512] transition-colors duration-200 font-medium disabled:opacity-50"
              >
                {{ creating ? 'Creando...' : 'Crear Sesión' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- End Class Confirmation Modal -->
      <ConfirmModal
        :show="!!classToEnd"
        title="Finalizar Clase"
        confirm-text="Finalizar"
        :loading="ending"
        loading-text="Finalizando..."
        variant="warning"
        @confirm="endClass"
        @cancel="classToEnd = null"
      >
        <p>
          ¿Estás seguro de que deseas finalizar la clase <strong>{{ classToEnd?.class_name }}</strong>?
        </p>
      </ConfirmModal>

      <!-- Delete Class Confirmation Modal -->
      <ConfirmModal
        :show="!!classToDelete"
        title="Eliminar Clase"
        icon="triangle-exclamation"
        icon-color="warning"
        confirm-text="Eliminar"
        confirm-icon="trash"
        :loading="deleting"
        loading-text="Eliminando..."
        @confirm="deleteClass"
        @cancel="classToDelete = null"
      >
        <p>
          ¿Estás seguro de que deseas eliminar la clase <strong>{{ classToDelete?.class_name }}</strong>?
          Esta acción no se puede deshacer.
        </p>
      </ConfirmModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { classesService } from '@/services/classes.service'
import type { ClassSession } from '@/types'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import AlertMessage from '@/components/AlertMessage.vue'

const loading = ref(true)
const classes = ref<ClassSession[]>([])
const showCreateModal = ref(false)
const newClassName = ref('')
// Inicializar con fecha y hora actual
const today = new Date()
const newClassDate = ref(today.toISOString().split('T')[0])
const newStartTime = ref(today.toTimeString().slice(0, 5))
const newEndTime = ref('')
const creating = ref(false)
const createError = ref('')
const classToEnd = ref<ClassSession | null>(null)
const ending = ref(false)
const classToDelete = ref<ClassSession | null>(null)
const deleting = ref(false)

const activeClasses = computed(() => {
  // Una clase está activa si el backend la marca como activa
  // o si el backend no envía el campo is_active, usar la lógica local
  const now = new Date()
  
  return classes.value.filter(c => {
    // Si el backend envía is_active, usarlo (prioridad)
    if (c.hasOwnProperty('is_active')) {
      return c.is_active === true
    }
    // Si el backend envía status, usarlo
    if (c.hasOwnProperty('status')) {
      return c.status === 'active'
    }
    // Fallback: verificar manualmente con fechas
    if (!c.end_time || !c.start_time) return false
    
    const startTime = new Date(c.start_time)
    const endTime = new Date(c.end_time)
    
    // La clase está activa si: inicio <= ahora < fin
    const isActive = startTime <= now && now < endTime
    console.log(`Clase ${c.class_name}: inicio=${startTime.toISOString()}, fin=${endTime.toISOString()}, ahora=${now.toISOString()}, activa=${isActive}`)
    
    return isActive
  })
})

const pastClasses = computed(() => {
  // Una clase está finalizada si el backend la marca como no activa
  const now = new Date()
  
  return classes.value.filter(c => {
    // Si el backend envía is_active, usarlo (prioridad)
    if (c.hasOwnProperty('is_active')) {
      return c.is_active === false
    }
    // Si el backend envía status, usarlo
    if (c.hasOwnProperty('status')) {
      return c.status === 'finished'
    }
    // Fallback: verificar manualmente
    if (!c.end_time || !c.start_time) return true
    
    const endTime = new Date(c.end_time)
    
    // La clase está finalizada si: ahora >= fin
    return now >= endTime
  }).reverse()
})

const loadClasses = async () => {
  loading.value = true
  try {
    classes.value = await classesService.getClasses()
  } catch {
    // Error loading classes
  } finally {
    loading.value = false
  }
}

const createClass = async () => {
  if (!newClassName.value.trim() || !newClassDate.value || !newStartTime.value || !newEndTime.value) {
    createError.value = 'Por favor completa todos los campos'
    return
  }

  // Validar que la hora de fin sea posterior a la hora de inicio
  const start = new Date(`${newClassDate.value}T${newStartTime.value}`)
  const end = new Date(`${newClassDate.value}T${newEndTime.value}`)
  
  if (end <= start) {
    createError.value = 'La hora de fin debe ser posterior a la hora de inicio'
    return
  }

  creating.value = true
  createError.value = ''

  try {
    // Clase general sin curso específico
    await classesService.createClass({ 
      class_name: newClassName.value,
      session_date: newClassDate.value,
      start_time: newStartTime.value,
      end_time: newEndTime.value
    })
    await loadClasses()
    showCreateModal.value = false
    // Limpiar formulario y resetear a valores por defecto
    newClassName.value = ''
    const now = new Date()
    newClassDate.value = now.toISOString().split('T')[0]
    newStartTime.value = now.toTimeString().slice(0, 5)
    newEndTime.value = ''
  } catch (error: any) {
    createError.value = error.response?.data?.detail || 'Error al crear la clase'
  } finally {
    creating.value = false
  }
}

const confirmEndClass = (classItem: ClassSession) => {
  console.log('🔚 Solicitando finalizar clase:', classItem)
  classToEnd.value = classItem
}

const endClass = async () => {
  if (!classToEnd.value) return

  ending.value = true
  try {
    if (!classToEnd.value.class_id) {
      throw new Error('ID de clase no válido')
    }
    console.log('⏱️ Finalizando clase:', classToEnd.value.class_id)
    const result = await classesService.endClass(classToEnd.value.class_id)
    console.log('✅ Clase finalizada:', result)
    
    // Pequeño delay para asegurar que la BD se actualizó
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Recargar lista de clases
    await loadClasses()
    classToEnd.value = null
  } catch (error: any) {
    console.error('❌ Error al finalizar clase:', error)
    const errorMsg = error.response?.data?.detail || error.message || 'Error al finalizar la clase'
    alert(`Error: ${errorMsg}`)
  } finally {
    ending.value = false
  }
}

const confirmDeleteClass = (classItem: ClassSession) => {
  classToDelete.value = classItem
}

const deleteClass = async () => {
  if (!classToDelete.value) return

  deleting.value = true
  try {
    if (!classToDelete.value.class_id) {
      throw new Error('ID de clase no válido')
    }
    await classesService.deleteClass(classToDelete.value.class_id)
    classes.value = classes.value.filter(c => c.class_id !== classToDelete.value!.class_id)
    classToDelete.value = null
  } catch {
    alert('Error al eliminar la clase')
  } finally {
    deleting.value = false
  }
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const getDuration = (startTime: string, endTime?: string) => {
  const start = new Date(startTime)
  const end = endTime ? new Date(endTime) : new Date()
  const diff = end.getTime() - start.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours}h ${mins}min`
  }
  return `${minutes} min`
}

const getClassDuration = (startTime: string, endTime: string) => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const diff = end.getTime() - start.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours}h ${mins}min`
  }
  return `${minutes} min`
}

onMounted(() => {
  loadClasses()
})
</script>
