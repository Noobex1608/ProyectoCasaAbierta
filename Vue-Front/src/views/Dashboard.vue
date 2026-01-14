/**
 * Smart Classroom AI - Dashboard View
 */
<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <PageHeader
        title="Mis Materias"
        icon="book"
        description="Selecciona una materia para ver su dashboard y gestionar clases"
      />

      <!-- Loading State -->
      <LoadingSpinner v-if="loading" text="Cargando materias..." />

      <!-- Courses Grid -->
      <div v-else>
        <!-- Empty State -->
        <EmptyState
          v-if="courses.length === 0"
          icon="book"
          title="No tienes materias registradas"
          description="Crea tu primera materia para comenzar a gestionar tus clases y estudiantes"
          action-text="Crear Primera Materia"
          action-icon="plus"
          @action="showCreateCourseModal = true"
        />

        <!-- Courses List -->
        <div v-else>
          <div class="flex justify-between items-center mb-6">
            <p class="text-gray-600">{{ courses.length }} materia{{ courses.length !== 1 ? 's' : '' }} registrada{{ courses.length !== 1 ? 's' : '' }}</p>
            <button
              @click="showCreateCourseModal = true"
              class="px-4 py-2 bg-[#b81a16] text-white rounded-lg hover:bg-[#9a1512] transition-colors inline-flex items-center gap-2"
            >
              <FontAwesomeIcon :icon="['fas', 'plus']" />
              Nueva Materia
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <router-link
              v-for="course in courses"
              :key="course.id"
              :to="`/courses/${course.id}`"
              class="group block p-6 bg-white rounded-xl shadow-md border-transparent hover:border-[#b81a16] transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div class="flex items-start justify-between mb-4">
                <div class="h-14 w-14 rounded-xl bg-gradient-to-br from-[#b81a16] to-[#9a1512] flex items-center justify-center text-white text-2xl shadow-lg">
                  <FontAwesomeIcon :icon="['fas', 'book-open']" />
                </div>
                <span class="px-3 py-1 bg-red-100 text-[#b81a16] text-sm font-medium rounded-full">
                  {{ course.course_code }}
                </span>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2 transition-colors">
                {{ course.course_name }}
              </h3>
              <p v-if="course.description" class="text-sm text-gray-600 mb-4 line-clamp-2">
                {{ course.description }}
              </p>
              <div class="flex items-center text-sm font-medium">
                <span>Ver dashboard de la materia</span>
                <FontAwesomeIcon :icon="['fas', 'arrow-right']" class="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Course Modal -->
    <div
      v-if="showCreateCourseModal"
      class="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50"
      @click.self="showCreateCourseModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FontAwesomeIcon :icon="['fas', 'book']" class="text-[#b81a16]" />
          Nueva Materia/Curso
        </h2>

        <form @submit.prevent="createCourse">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Materia *
              </label>
              <input
                v-model="newCourse.course_name"
                @input="onCourseNameChange"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b81a16]"
                placeholder="Ej: Matemáticas Avanzadas"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Código de la Materia * <span class="text-xs text-gray-500">(se genera automáticamente)</span>
              </label>
              <input
                v-model="newCourse.course_code"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                placeholder="Ej: MAT-301"
                readonly
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                v-model="newCourse.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b81a16]"
                placeholder="Breve descripción de la materia..."
              ></textarea>
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
              @click="showCreateCourseModal = false"
              class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="creatingCourse"
              class="flex-1 px-4 py-2 bg-[#b81a16] text-white rounded-lg hover:bg-[#9a1512] disabled:opacity-50"
            >
              {{ creatingCourse ? 'Creando...' : 'Crear Materia' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { coursesService } from '@/services/courses.service'
import type { Course } from '@/types'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import AlertMessage from '@/components/AlertMessage.vue'

const loading = ref(true)
const showCreateCourseModal = ref(false)
const creatingCourse = ref(false)
const createError = ref('')

const courses = ref<Course[]>([])

const newCourse = reactive({
  course_name: '',
  course_code: '',
  description: ''
})

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

const loadDashboardData = async () => {
  loading.value = true
  
  try {
    courses.value = await coursesService.getMyCourses()
  } catch {
    // Error loading data
  } finally {
    loading.value = false
  }
}

const createCourse = async () => {
  if (!newCourse.course_name || !newCourse.course_code) return

  creatingCourse.value = true
  createError.value = ''

  try {
    await coursesService.createCourse({
      course_name: newCourse.course_name,
      course_code: newCourse.course_code,
      description: newCourse.description || undefined
    })

    await loadDashboardData()
    
    showCreateCourseModal.value = false
    newCourse.course_name = ''
    newCourse.course_code = ''
    newCourse.description = ''
  } catch (error: any) {
    createError.value = error.message || 'Error al crear la materia'
  } finally {
    creatingCourse.value = false
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>
