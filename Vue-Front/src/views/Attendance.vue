/**
 * Smart Classroom AI - Attendance View
 * Toma de asistencia con reconocimiento facial automático
 */
<template>
  <div class="min-h-screen bg-gray-50">

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Toma de Asistencia"
        icon="clipboard-check"
        icon-color="green"
      />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Camera Section -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FontAwesomeIcon :icon="['fas', 'camera']" class="text-[#b81a16]" />
                Verificacion Facial Automatica
              </h2>
              <select
                v-model="selectedClassId"
                @change="onClassChange"
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b81a16]"
              >
                <option value="">{{ activeClasses.length === 0 ? 'No hay clases disponibles' : 'Seleccionar clase...' }}</option>
                <option v-for="classItem in activeClasses" :key="classItem.id" :value="classItem.id">
                  {{ classItem.class_name }} {{ getClassStatusLabel(classItem) }}
                </option>
              </select>
            </div>

            <div class="relative bg-gray-900 rounded-lg overflow-hidden mb-4" style="aspect-ratio: 16/9;">
              <video
                ref="videoRef"
                autoplay
                playsinline
                class="w-full h-full object-cover"
                style="transform: scaleX(1);"
              ></video>
              
              <div v-if="verifying" class="absolute inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center">
                <div class="text-center text-white">
                  <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                  <p class="font-semibold">Verificando estudiante...</p>
                </div>
              </div>

              <div v-if="autoVerificationEnabled && isCameraActive" class="absolute top-4 right-4">
                <span class="inline-flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg shadow-lg">
                  <span class="relative flex h-3 w-3">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                  Verificación automática activa
                </span>
              </div>
            </div>

            <div class="flex gap-3">
              <button
                v-if="!isCameraActive"
                @click="startCamera"
                :disabled="!selectedClassId"
                class="flex-1 px-4 py-3 bg-[#b81a16] text-white rounded-lg hover:bg-[#9a1512] transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon :icon="['fas', 'camera']" />
                Iniciar Verificación Automática
              </button>
              
              <button
                v-if="isCameraActive"
                @click="stopCamera"
                class="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon :icon="['fas', 'stop']" />
                Detener Verificación
              </button>
            </div>

            <div v-if="lastVerification" class="mt-4 p-4 rounded-lg" :class="getResultClass()">
              <p class="font-semibold" :class="getTextClass()">
                {{ getResultMessage() }}
              </p>
              <p v-if="lastVerification.success && lastVerification.student_name" class="text-sm mt-1" :class="getTextClass()">
                Estudiante: {{ lastVerification.student_name }} (Confianza: {{ Math.round(lastVerification.confidence * 100) }}%)
              </p>
              <p v-if="lastVerification.already_registered" class="text-sm mt-2 text-yellow-700 font-medium inline-flex items-center gap-1">
                <FontAwesomeIcon :icon="['fas', 'circle-info']" />
                La asistencia fue registrada previamente a las {{ formatTime(lastVerification.timestamp) }}
              </p>
              <div v-if="detectedEmotion" class="mt-2 p-2 bg-purple-50 rounded border-l-2 border-purple-400">
                <p class="text-sm font-medium text-purple-700">
                  {{ getEmotionEmoji(detectedEmotion.emotion) }} Emoción: <span class="font-bold">{{ getEmotionName(detectedEmotion.emotion) }}</span>
                  <span class="text-xs">({{ Math.round(detectedEmotion.confidence * 100) }}%)</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Students List -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FontAwesomeIcon :icon="['fas', 'users']" class="text-[#b81a16]" />
            Lista de Estudiantes
          </h2>
          
          <div v-if="!selectedClassId" class="text-center text-gray-500 py-8">
            <FontAwesomeIcon :icon="['fas', 'arrow-up']" class="text-4xl mb-2" />
            <p>Selecciona una clase</p>
          </div>

          <div v-else-if="loadingStudents" class="text-center text-gray-500 py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b81a16] mx-auto mb-2"></div>
            <p class="text-sm">Cargando estudiantes...</p>
          </div>

          <div v-else-if="enrolledStudents.length === 0" class="text-center text-gray-500 py-8">
            <FontAwesomeIcon :icon="['fas', 'user-slash']" class="text-4xl mb-2" />
            <p>No hay estudiantes inscritos</p>
          </div>

          <div v-else class="space-y-2 max-h-[600px] overflow-y-auto">
            <div
              v-for="student in enrolledStudents"
              :key="student.student_id"
              class="p-3 rounded-lg border-2 transition-all duration-300"
              :class="getStudentCardClass(student.student_id)"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-gray-900 truncate">{{ student.name }}</p>
                  <p class="text-xs text-gray-600 mt-0.5">{{ student.student_id }}</p>
                </div>
                <div class="ml-2">
                  <FontAwesomeIcon 
                    v-if="isStudentPresent(student.student_id)"
                    :icon="['fas', 'circle-check']" 
                    class="text-2xl"
                    :class="getStudentStatus(student.student_id) === 'late' ? 'text-orange-500' : 'text-green-500'"
                  />
                  <FontAwesomeIcon 
                    v-else
                    :icon="['fas', 'circle']" 
                    class="text-2xl text-gray-300"
                  />
                </div>
              </div>
              <div v-if="isStudentPresent(student.student_id)" class="mt-2 pt-2 border-t border-gray-200">
                <p class="text-xs" :class="getStudentStatus(student.student_id) === 'late' ? 'text-orange-600' : 'text-green-600'">
                  <FontAwesomeIcon :icon="['fas', 'clock']" class="mr-1" />
                  {{ getStudentAttendanceTime(student.student_id) }}
                  <span v-if="getStudentStatus(student.student_id) === 'late'" class="ml-1 font-semibold">- ATRASADO</span>
                </p>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Presente:</span>
              <span class="font-bold text-green-600">{{ presentCount }} / {{ enrolledStudents.length }}</span>
            </div>
            <div class="mt-1 flex items-center justify-between text-sm">
              <span class="text-gray-600">Ausente:</span>
              <span class="font-bold text-gray-500">{{ enrolledStudents.length - presentCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { classesService } from '@/services/classes.service'
import { attendanceService } from '@/services/attendance.service'
import { emotionsService } from '@/services/emotions.service'
import { enrollmentService } from '@/services/enrollment.service'
import type { ClassSession, AttendanceRecord, Student } from '@/types'
import PageHeader from '@/components/PageHeader.vue'

const route = useRoute()

const videoRef = ref<HTMLVideoElement | null>(null)
const isCameraActive = ref(false)
const mediaStream = ref<MediaStream | null>(null)
const verifying = ref(false)
const lastVerification = ref<any>(null)
const autoVerificationEnabled = ref(false)
const verificationIntervalId = ref<number | null>(null)

const activeClasses = ref<ClassSession[]>([])
const selectedClassId = ref<number | string>('')
const attendanceRecords = ref<AttendanceRecord[]>([])
const enrolledStudents = ref<Student[]>([])
const loadingStudents = ref(false)
const detectedEmotion = ref<{emotion: string, confidence: number} | null>(null)

const presentCount = computed(() => {
  return attendanceRecords.value.length
})

const isStudentPresent = (studentId: string): boolean => {
  return attendanceRecords.value.some(record => record.student_id.toString() === studentId)
}

const getStudentStatus = (studentId: string): string => {
  const record = attendanceRecords.value.find(r => r.student_id.toString() === studentId)
  // AttendanceRecord no tiene status, siempre retornar 'present' si existe
  return record ? 'present' : 'absent'
}

const getStudentAttendanceTime = (studentId: string): string => {
  const record = attendanceRecords.value.find(r => r.student_id.toString() === studentId)
  return record ? formatTime(record.timestamp) : ''
}

const getStudentCardClass = (studentId: string): string => {
  if (isStudentPresent(studentId)) {
    const status = getStudentStatus(studentId)
    if (status === 'late') {
      return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300'
    }
    return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
  }
  return 'bg-white border-gray-200'
}

const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: 'user', 
        width: { ideal: 640 },  // Reducir resolución para mejor rendimiento
        height: { ideal: 480 }
      }
    })
    
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      mediaStream.value = stream
      isCameraActive.value = true
      
      // Iniciar verificación automática
      startAutoVerification()
    }
  } catch (error) {
    console.error('Error accessing camera:', error)
    alert('No se pudo acceder a la cámara')
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
  stopAutoVerification()
}

const startAutoVerification = () => {
  autoVerificationEnabled.value = true
  // Verificar cada 5 segundos automáticamente (aumentado para mejor rendimiento)
  verificationIntervalId.value = window.setInterval(() => {
    if (!verifying.value && isCameraActive.value && selectedClassId.value) {
      captureAndVerify()
    }
  }, 5000)
}

const stopAutoVerification = () => {
  autoVerificationEnabled.value = false
  if (verificationIntervalId.value) {
    clearInterval(verificationIntervalId.value)
    verificationIntervalId.value = null
  }
}

const captureAndVerify = async () => {
  if (!videoRef.value || !selectedClassId.value || verifying.value) return

  verifying.value = true
  detectedEmotion.value = null

  try {
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.value.videoWidth
    canvas.height = videoRef.value.videoHeight
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('No se pudo obtener el contexto del canvas')
    }

    ctx.drawImage(videoRef.value, 0, 0)
    
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b)
        else reject(new Error('Error al capturar imagen'))
      }, 'image/jpeg', 0.7)  // Reducir calidad a 0.7 para mejor rendimiento
    })

    const formData = new FormData()
    formData.append('image', blob, 'capture.jpg')
    formData.append('class_id', selectedClassId.value.toString())

    console.log('📸 Verificando asistencia para clase:', selectedClassId.value)
    
    const result = await attendanceService.verifyAttendance(formData)
    
    console.log('✅ Resultado verificación:', result)

    if (result.success) {
      lastVerification.value = result
      await loadAttendanceRecords()
      
      // Capturar emoción si la asistencia fue exitosa y tenemos student_id
      if (result.student_id) {
        try {
          console.log('🎭 Capturando emoción para estudiante:', result.student_id)
          
          const emotionFormData = new FormData()
          emotionFormData.append('image', blob, 'emotion.jpg')
          emotionFormData.append('student_id', result.student_id.toString())
          emotionFormData.append('class_id', selectedClassId.value.toString())
          
          const emotionResult = await emotionsService.analyzeEmotion(emotionFormData)
          console.log('✅ Emoción detectada:', emotionResult)
          
          if (emotionResult?.emotions && emotionResult.emotions.length > 0) {
            const firstEmotion = emotionResult.emotions[0]
            if (firstEmotion) {
              detectedEmotion.value = {
                emotion: firstEmotion.emotion,
                confidence: firstEmotion.confidence
              }
            }
          }
        } catch (emotionError) {
          console.error('❌ Error capturando emoción:', emotionError)
        }
      }
    } else {
      lastVerification.value = {
        success: false,
        message: result.message || 'No se pudo verificar la asistencia'
      }
    }
  } catch (error: any) {
    console.error('❌ Error en verificación:', error)
    lastVerification.value = {
      success: false,
      message: error.response?.data?.detail || 'Error en la verificación'
    }
  } finally {
    verifying.value = false
  }
}

const onClassChange = async () => {
  lastVerification.value = null
  detectedEmotion.value = null
  await loadEnrolledStudents()
  await loadAttendanceRecords()
}

const loadActiveClasses = async () => {
  try {
    // Cargar todas las clases con su estado dinámico
    const allClasses = await classesService.getClasses()
    console.log('📚 Clases cargadas:', allClasses)
    
    // Filtrar clases activas basándose en el campo is_active o status que envía el backend
    const activeClassesList = allClasses.filter((c: any) => {
      // Si el backend envía is_active, usarlo
      if (c.hasOwnProperty('is_active')) {
        return c.is_active === true
      }
      // Si el backend envía status, usarlo
      if (c.hasOwnProperty('status')) {
        return c.status === 'active'
      }
      // Fallback: verificar manualmente
      if (!c.end_time || !c.start_time) return false
      const now = new Date()
      const startTime = new Date(c.start_time)
      const endTime = new Date(c.end_time)
      return startTime <= now && now < endTime
    })
    
    console.log('📊 Clases activas:', activeClassesList.length)
    
    // Mostrar clases activas si hay, si no, mostrar todas
    if (activeClassesList.length > 0) {
      activeClasses.value = activeClassesList
    } else {
      console.log('⚠️ No hay clases activas en este momento, mostrando todas las clases')
      activeClasses.value = allClasses
    }
    
    console.log('📊 Clases disponibles para asistencia:', activeClasses.value.length)
    
    if (route.query.class_id) {
      selectedClassId.value = Number(route.query.class_id)
      await onClassChange()
    } else if (activeClasses.value.length > 0 && activeClasses.value[0]) {
      selectedClassId.value = activeClasses.value[0].id
      await onClassChange()
    }
  } catch (error) {
    console.error('❌ Error loading classes:', error)
  }
}

const loadEnrolledStudents = async () => {
  if (!selectedClassId.value) {
    enrolledStudents.value = []
    return
  }

  loadingStudents.value = true
  try {
    // Buscar la clase seleccionada para obtener su course_id
    const selectedClass = activeClasses.value.find(c => c.id === Number(selectedClassId.value))
    
    console.log('🔍 Clase seleccionada:', selectedClass)
    console.log('🔍 Course ID:', selectedClass?.course_id)
    console.log('🔍 Metadata:', selectedClass?.metadata)
    
    if (selectedClass?.course_id) {
      // Cargar solo estudiantes inscritos en el curso de esta clase
      console.log('📚 Cargando estudiantes del curso:', selectedClass.course_id)
      enrolledStudents.value = await enrollmentService.getCourseStudents(selectedClass.course_id)
      console.log('📚 Estudiantes del curso cargados:', enrolledStudents.value.length)
    } else {
      // Si no hay course_id, cargar todos los estudiantes (fallback)
      console.log('⚠️ Clase sin course_id, cargando todos los estudiantes')
      enrolledStudents.value = await enrollmentService.getStudents()
      console.log('📚 Estudiantes cargados:', enrolledStudents.value.length)
    }
  } catch (error) {
    console.error('Error loading students:', error)
    enrolledStudents.value = []
  } finally {
    loadingStudents.value = false
  }
}

const loadAttendanceRecords = async () => {
  if (!selectedClassId.value) return

  try {
    attendanceRecords.value = await attendanceService.getClassAttendance(Number(selectedClassId.value))
    console.log('📋 Registros de asistencia:', attendanceRecords.value.length)
  } catch (error) {
    console.error('Error loading records:', error)
  }
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date)
}

// Emotion helper functions
const getEmotionEmoji = (emotion: string): string => {
  const emojis: Record<string, string> = {
    'happy': '😊',
    'sad': '😢',
    'angry': '😠',
    'surprise': '😮',
    'fear': '😨',
    'disgust': '🤢',
    'neutral': '😐'
  }
  return emojis[emotion?.toLowerCase()] || '😶'
}

const getEmotionName = (emotion: string): string => {
  const names: Record<string, string> = {
    'happy': 'Feliz',
    'sad': 'Triste',
    'angry': 'Enojado',
    'surprise': 'Sorprendido',
    'fear': 'Miedo',
    'disgust': 'Disgusto',
    'neutral': 'Neutral'
  }
  return names[emotion?.toLowerCase()] || emotion
}

const getResultClass = () => {
  if (!lastVerification.value) return ''
  if (!lastVerification.value.success) return 'bg-red-50 border-l-4 border-red-500'
  if (lastVerification.value.already_registered) return 'bg-yellow-50 border-l-4 border-yellow-500'
  if (lastVerification.value.status === 'late') return 'bg-orange-50 border-l-4 border-orange-500'
  return 'bg-green-50 border-l-4 border-green-500'
}

const getTextClass = () => {
  if (!lastVerification.value) return ''
  if (!lastVerification.value.success) return 'text-red-700'
  if (lastVerification.value.already_registered) return 'text-yellow-700'
  if (lastVerification.value.status === 'late') return 'text-orange-700'
  return 'text-green-700'
}

const getResultMessage = () => {
  if (!lastVerification.value) return ''
  if (!lastVerification.value.success) return lastVerification.value.message || 'Estudiante no reconocido'
  if (lastVerification.value.already_registered) return '⚠️ Asistencia ya registrada anteriormente'
  if (lastVerification.value.status === 'late') return '⏰ Asistencia registrada - ATRASADO'
  return '✅ Asistencia registrada - Presente'
}

const getClassStatusLabel = (classItem: any): string => {
  // Verificar si el backend envió el estado
  if (classItem.is_active === true || classItem.status === 'active') {
    return '(Activa)'
  }
  if (classItem.is_active === false || classItem.status === 'finished') {
    return '(Finalizada)'
  }
  // Fallback: verificar manualmente
  if (!classItem.end_time || !classItem.start_time) return '(Estado desconocido)'
  const now = new Date()
  const startTime = new Date(classItem.start_time)
  const endTime = new Date(classItem.end_time)
  if (startTime <= now && now < endTime) {
    return '(Activa)'
  }
  return '(Finalizada)'
}

onMounted(async () => {
  await loadActiveClasses()
})

onUnmounted(() => {
  stopCamera()
})
</script>
