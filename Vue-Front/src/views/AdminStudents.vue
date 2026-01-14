/**
 * Smart Classroom AI - Admin Students View
 * Vista de Administrador/Secretaria para gestionar estudiantes
 */
<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <PageHeader
        title="Gestion de Estudiantes"
        icon="users"
        description="Registra y administra los estudiantes del sistema"
      />

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          label="Total Estudiantes"
          :value="students.length"
          icon="users"
          color="red"
        />
        <StatsCard
          label="Con Foto Registrada"
          :value="studentsWithPhoto"
          icon="camera"
          color="green"
        />
        <StatsCard
          label="Registrados Hoy"
          :value="registeredToday"
          icon="calendar-days"
          color="purple"
        />
      </div>

      <!-- Actions Bar -->
      <div class="bg-white rounded-xl shadow-md p-4 mb-6">
        <div class="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div class="flex-1 w-full sm:w-auto">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por nombre o cedula..."
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b81a16]"
            />
          </div>
          <div class="flex gap-3">
            <button
              @click="loadStudents"
              class="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors inline-flex items-center gap-2"
            >
              <FontAwesomeIcon :icon="['fas', 'arrows-rotate']" />
              Actualizar
            </button>
            <button
              @click="showRegisterModal = true"
              class="px-6 py-2 bg-[#b81a16] text-white rounded-lg hover:bg-[#9a1512] transition-colors font-medium inline-flex items-center gap-2"
            >
              <FontAwesomeIcon :icon="['fas', 'plus']" />
              Registrar Estudiante
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <LoadingSpinner v-if="loading" />

      <!-- Empty State -->
      <EmptyState
        v-else-if="filteredStudents.length === 0 && !searchQuery"
        icon="book"
        title="No hay estudiantes registrados"
        description="Comienza registrando el primer estudiante del sistema"
        action-text="Registrar Primer Estudiante"
        action-icon="plus"
        @action="showRegisterModal = true"
      />

      <!-- No Results -->
      <EmptyState
        v-else-if="filteredStudents.length === 0 && searchQuery"
        icon="magnifying-glass"
        icon-size="lg"
        title="No se encontraron resultados"
        description="Intenta con otra busqueda"
      />

      <!-- Students Table -->
      <div v-else class="bg-white rounded-xl shadow-md overflow-hidden">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Estudiante
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Cédula
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Email
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Estado
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Fecha Registro
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr v-for="student in filteredStudents" :key="student.student_id" class="hover:bg-slate-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden">
                    <img v-if="student.photo_url" :src="student.photo_url" :alt="student.name" class="w-full h-full object-cover" />
                    <span v-else>{{ getInitials(student.name) }}</span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-slate-900">{{ student.name }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-slate-900 font-mono">{{ student.student_id }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-slate-600">{{ student.email || 'No especificado' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1"
                  :class="student.has_embedding ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                >
                  <FontAwesomeIcon :icon="['fas', student.has_embedding ? 'circle-check' : 'triangle-exclamation']" />
                  {{ student.has_embedding ? 'Completo' : 'Sin foto' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                {{ formatDate(student.enrolled_at || student.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="confirmDelete(student)"
                  class="text-red-600 hover:text-red-900 ml-3 inline-flex items-center gap-1"
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

    <!-- Modal: Registrar Estudiante -->
    <div
      v-if="showRegisterModal"
      class="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center p-4 z-50"
      @click.self="showRegisterModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-0 overflow-hidden">
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h2 class="text-2xl font-bold text-white flex items-center gap-2">
            <FontAwesomeIcon :icon="['fas', 'plus']" />
            Registrar Nuevo Estudiante
          </h2>
          <p class="text-blue-100 text-sm">Complete los datos y capture la foto del estudiante</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          <!-- Camera Section -->
          <div>
            <h3 class="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <FontAwesomeIcon :icon="['fas', 'camera']" class="text-[#b81a16]" />
              Captura de Rostro
            </h3>
            
            <div class="relative bg-slate-900 rounded-xl overflow-hidden mb-4" style="aspect-ratio: 4/3;">
              <video
                v-if="!capturedPhoto"
                ref="videoRef"
                autoplay
                playsinline
                class="w-full h-full object-cover"
              ></video>
              <img
                v-else
                :src="capturedPhoto"
                alt="Captured photo"
                class="w-full h-full object-cover"
              />
              
              <div v-if="!capturedPhoto && !isCameraActive" class="absolute inset-0 flex items-center justify-center">
                <button
                  @click="startCamera"
                  class="px-6 py-3 bg-[#b81a16] text-white rounded-lg hover:bg-[#9a1512] inline-flex items-center gap-2"
                >
                  <FontAwesomeIcon :icon="['fas', 'camera']" />
                  Activar Camara
                </button>
              </div>
            </div>

            <div class="flex gap-3">
              <button
                v-if="isCameraActive && !capturedPhoto"
                @click="capturePhoto"
                class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon :icon="['fas', 'camera']" />
                Capturar
              </button>
              <button
                v-if="capturedPhoto"
                @click="retakePhoto"
                class="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 inline-flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon :icon="['fas', 'arrows-rotate']" />
                Tomar Otra
              </button>
              <button
                v-if="isCameraActive"
                @click="stopCamera"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <FontAwesomeIcon :icon="['fas', 'stop']" />
              </button>
            </div>
          </div>

          <!-- Form Section -->
          <div>
            <h3 class="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <FontAwesomeIcon :icon="['fas', 'file-pen']" class="text-[#b81a16]" />
              Datos del Estudiante
            </h3>
            
            <form @submit.prevent="handleRegister" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Cédula *</label>
                <input
                  v-model="formData.studentId"
                  type="text"
                  required
                  maxlength="10"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b81a16]"
                  placeholder="Ej: 0102345678"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  v-model="formData.fullName"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b81a16]"
                  placeholder="Ej: Juan Pérez García"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico *</label>
                <input
                  v-model="formData.email"
                  type="email"
                  required
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b81a16]"
                  placeholder="estudiante@email.com"
                />
              </div>

              <div v-if="errorMessage" class="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                <p class="text-sm text-red-700">{{ errorMessage }}</p>
              </div>

              <div v-if="successMessage" class="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                <p class="text-sm text-green-700">{{ successMessage }}</p>
              </div>

              <!-- Status -->
              <div class="p-3 bg-slate-50 rounded-lg">
                <div class="flex items-center gap-2 text-sm">
                  <FontAwesomeIcon 
                    :icon="['fas', capturedPhoto ? 'circle-check' : 'pause']" 
                    :class="capturedPhoto ? 'text-green-600' : 'text-slate-400'" 
                  />
                  <span class="text-slate-600">Foto capturada</span>
                </div>
                <div class="flex items-center gap-2 text-sm mt-1">
                  <FontAwesomeIcon 
                    :icon="['fas', formData.studentId && formData.fullName && formData.email ? 'circle-check' : 'pause']" 
                    :class="formData.studentId && formData.fullName && formData.email ? 'text-green-600' : 'text-slate-400'" 
                  />
                  <span class="text-slate-600">Datos completos</span>
                </div>
              </div>

              <div class="flex gap-3 pt-4">
                <button
                  type="button"
                  @click="closeRegisterModal"
                  class="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  :disabled="!capturedPhoto || isSubmitting"
                  class="flex-1 px-4 py-3 bg-[#b81a16] text-white rounded-lg hover:bg-[#9a1512] font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon v-if="!isSubmitting" :icon="['fas', 'circle-check']" />
                  {{ isSubmitting ? 'Registrando...' : 'Registrar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Confirmar Eliminación -->
    <ConfirmModal
      :show="!!studentToDelete"
      title="Confirmar Eliminacion"
      icon="triangle-exclamation"
      icon-color="warning"
      confirm-text="Eliminar"
      confirm-icon="trash"
      :loading="deleting"
      loading-text="Eliminando..."
      @confirm="deleteStudent"
      @cancel="studentToDelete = null"
    >
      <p class="mb-4">
        Estas seguro de eliminar a <strong>{{ studentToDelete?.name }}</strong>?
      </p>
      <p class="text-red-600 text-sm">
        Esta accion eliminara al estudiante de todas las materias y no se puede deshacer.
      </p>
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { enrollmentService } from '@/services/enrollment.service'
import type { Student } from '@/types'
import PageHeader from '@/components/PageHeader.vue'
import StatsCard from '@/components/StatsCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

// State
const loading = ref(true)
const students = ref<Student[]>([])
const searchQuery = ref('')
const showRegisterModal = ref(false)
const studentToDelete = ref<Student | null>(null)
const deleting = ref(false)

// Camera state
const videoRef = ref<HTMLVideoElement | null>(null)
const isCameraActive = ref(false)
const capturedPhoto = ref<string | null>(null)
const mediaStream = ref<MediaStream | null>(null)

// Form state
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const formData = reactive({
  studentId: '',
  fullName: '',
  email: ''
})

// Computed
const filteredStudents = computed(() => {
  if (!searchQuery.value) return students.value
  const query = searchQuery.value.toLowerCase()
  return students.value.filter(s =>
    s.name?.toLowerCase().includes(query) ||
    s.student_id?.toLowerCase().includes(query)
  )
})

const studentsWithPhoto = computed(() => {
  return students.value.filter(s => s.has_embedding).length
})

const registeredToday = computed(() => {
  const today = new Date().toDateString()
  return students.value.filter(s => {
    const date = new Date(s.enrolled_at || s.created_at || '').toDateString()
    return date === today
  }).length
})

// Methods
const loadStudents = async () => {
  loading.value = true
  try {
    students.value = await enrollmentService.getStudents()
  } catch {
    // Error loading students
  } finally {
    loading.value = false
  }
}

const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: 1280, height: 720 },
      audio: false
    })
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      mediaStream.value = stream
      isCameraActive.value = true
    }
  } catch {
    errorMessage.value = 'No se pudo acceder a la cámara'
  }
}

const stopCamera = () => {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach(track => track.stop())
    mediaStream.value = null
  }
  if (videoRef.value) {
    videoRef.value.srcObject = null
  }
  isCameraActive.value = false
}

const capturePhoto = () => {
  if (!videoRef.value) return
  const canvas = document.createElement('canvas')
  canvas.width = videoRef.value.videoWidth
  canvas.height = videoRef.value.videoHeight
  const context = canvas.getContext('2d')
  if (context) {
    context.drawImage(videoRef.value, 0, 0)
    capturedPhoto.value = canvas.toDataURL('image/jpeg', 0.9)
    stopCamera()
  }
}

const retakePhoto = () => {
  capturedPhoto.value = null
  errorMessage.value = ''
  successMessage.value = ''
  startCamera()
}

const closeRegisterModal = () => {
  stopCamera()
  capturedPhoto.value = null
  formData.studentId = ''
  formData.fullName = ''
  formData.email = ''
  errorMessage.value = ''
  successMessage.value = ''
  showRegisterModal.value = false
}

const handleRegister = async () => {
  if (!capturedPhoto.value) {
    errorMessage.value = 'Debes capturar una foto primero'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await fetch(capturedPhoto.value)
    const blob = await response.blob()
    const file = new File([blob], 'student-photo.jpg', { type: 'image/jpeg' })

    const result = await enrollmentService.enrollStudent({
      student_id: formData.studentId,
      name: formData.fullName,
      email: formData.email,
      image: file
    })

    if (result.success) {
      successMessage.value = '¡Estudiante registrado exitosamente!'
      await loadStudents()
      setTimeout(() => {
        closeRegisterModal()
      }, 1500)
    } else {
      throw new Error(result.message || 'Error en el registro')
    }
  } catch (error: any) {
    errorMessage.value = error.response?.data?.detail || error.message || 'Error al registrar'
  } finally {
    isSubmitting.value = false
  }
}

const confirmDelete = (student: Student) => {
  studentToDelete.value = student
}

const deleteStudent = async () => {
  if (!studentToDelete.value) return
  deleting.value = true
  try {
    await enrollmentService.deleteStudent(studentToDelete.value.student_id)
    students.value = students.value.filter(s => s.student_id !== studentToDelete.value!.student_id)
    studentToDelete.value = null
  } catch {
    alert('Error al eliminar el estudiante')
  } finally {
    deleting.value = false
  }
}

const getInitials = (name: string) => {
  const names = name?.split(' ').filter(n => n.length > 0) || []
  if (names.length === 0) return 'U'
  return names.length > 1
    ? (names[0]?.[0] || '') + (names[1]?.[0] || '')
    : (names[0]?.[0] || 'U')
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A'
  return new Intl.DateTimeFormat('es-EC', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(dateString))
}

onMounted(() => {
  loadStudents()
})

onUnmounted(() => {
  stopCamera()
})
</script>
