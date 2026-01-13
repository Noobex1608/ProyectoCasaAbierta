/**
 * Smart Classroom AI - Dashboard View
 */
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Simplified Navbar -->
    <nav class="bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo y Brand -->
          <div class="flex items-center space-x-2">
            <span class="text-3xl">🎓</span>
            <span class="text-xl font-bold text-indigo-600 hidden sm:block">
              Smart Classroom AI
            </span>
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <div class="hidden sm:flex items-center space-x-2">
              <div class="text-right">
                <p class="text-sm font-medium text-gray-700">
                  {{ userProfile?.full_name || 'Carlos Valencia' }}
                </p>
                <p class="text-xs text-gray-500">{{ userProfile?.email || 'valenciamendozacarlos5@gmail.com' }}</p>
              </div>
              <div class="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                CV
              </div>
            </div>
            
            <button
              @click="handleLogout"
              class="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          📚 Mis Materias
        </h1>
        <p class="mt-2 text-sm text-gray-600">
          Selecciona una materia para ver su dashboard y gestionar clases
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>

      <!-- Courses Grid -->
      <div v-else>
        <!-- Empty State -->
        <div v-if="courses.length === 0" class="bg-white rounded-lg shadow-md p-12 text-center">
          <div class="text-8xl mb-6">📚</div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">No tienes materias registradas</h2>
          <p class="text-gray-600 mb-6">Crea tu primera materia para comenzar a gestionar tus clases y estudiantes</p>
          <button
            @click="showCreateCourseModal = true"
            class="px-8 py-4 bg-indigo-600 text-white text-lg rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
          >
            ➕ Crear Primera Materia
          </button>
        </div>

        <!-- Courses List -->
        <div v-else>
          <div class="flex justify-between items-center mb-6">
            <p class="text-gray-600">{{ courses.length }} materia{{ courses.length !== 1 ? 's' : '' }} registrada{{ courses.length !== 1 ? 's' : '' }}</p>
            <button
              @click="showCreateCourseModal = true"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              ➕ Nueva Materia
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <router-link
              v-for="course in courses"
              :key="course.id"
              :to="`/courses/${course.id}`"
              class="group block p-6 bg-white rounded-xl shadow-md border-2 border-transparent hover:border-indigo-400 transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div class="flex items-start justify-between mb-4">
                <div class="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-lg">
                  📖
                </div>
                <span class="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                  {{ course.course_code }}
                </span>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {{ course.course_name }}
              </h3>
              <p v-if="course.description" class="text-sm text-gray-600 mb-4 line-clamp-2">
                {{ course.description }}
              </p>
              <div class="flex items-center text-indigo-600 text-sm font-medium">
                <span>Ver dashboard de la materia</span>
                <span class="ml-2 group-hover:translate-x-1 transition-transform">→</span>
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
        <h2 class="text-2xl font-bold text-gray-900 mb-4">📚 Nueva Materia/Curso</h2>

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
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              <p class="text-xs text-gray-500 mt-1">
                El código se genera automáticamente a partir del nombre de la materia
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                v-model="newCourse.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Breve descripción de la materia..."
              ></textarea>
            </div>
          </div>

          <div v-if="createError" class="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded">
            <p class="text-sm text-red-700">{{ createError }}</p>
          </div>

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
              class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
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
import { useRouter } from 'vue-router'
import { coursesService } from '@/services/courses.service'
import type { Course } from '@/types'

const router = useRouter()
const loading = ref(true)
const showCreateCourseModal = ref(false)
const creatingCourse = ref(false)
const createError = ref('')
const userProfile = ref<any>(null)

const courses = ref<Course[]>([])

const newCourse = reactive({
  course_name: '',
  course_code: '',
  description: ''
})

// Auto-generar código de curso basado en el nombre
const generateCourseCode = (courseName: string): string => {
  if (!courseName) return ''
  
  // Dividir el nombre en palabras
  const words = courseName.trim().toUpperCase().split(/\s+/).filter(w => w.length > 0)
  
  if (words.length === 0) return ''
  
  // Tomar primeras 2-3 letras de cada palabra
  let abbreviation = ''
  if (words.length === 1) {
    // Una palabra: tomar las primeras 3 letras
    abbreviation = words[0]?.substring(0, 3) || 'CUR'
  } else if (words.length === 2) {
    // Dos palabras: tomar 2 letras de cada una
    abbreviation = (words[0]?.substring(0, 2) || '') + (words[1]?.substring(0, 2) || '')
  } else {
    // Tres o más palabras: tomar la primera letra de cada una de las 3 primeras
    abbreviation = words.slice(0, 3).map(w => w?.[0] || '').join('')
  }
  
  // Generar número aleatorio de 3 dígitos
  const randomNum = Math.floor(100 + Math.random() * 900)
  
  return `${abbreviation}-${randomNum}`
}

// Actualizar código cuando cambia el nombre
const onCourseNameChange = () => {
  if (newCourse.course_name && !newCourse.course_code) {
    newCourse.course_code = generateCourseCode(newCourse.course_name)
  }
}

const loadDashboardData = async () => {
  loading.value = true
  
  try {
    // Load courses only
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

const handleLogout = async () => {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    try {
      const { supabase } = await import('@/services/supabase')
      await supabase.auth.signOut()
      router.push('/login')
    } catch {
      // Error signing out
    }
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>
