<!--
  Calendario Semanal Component
  Muestra el horario de clases de lunes a sábado
-->
<template>
  <div class="bg-white rounded-lg border border-gray-200">
    <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
      <h2 class="text-xl font-semibold text-[#d63031]">Horario de Clases</h2>
      <div class="flex items-center gap-2">
        <button
          @click="previousWeek"
          class="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          <FontAwesomeIcon :icon="['fas', 'chevron-left']" />
        </button>
        <span class="text-sm font-medium text-gray-700 min-w-[200px] text-center">
          {{ currentWeekLabel }}
        </span>
        <button
          @click="nextWeek"
          class="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          <FontAwesomeIcon :icon="['fas', 'chevron-right']" />
        </button>
      </div>
    </div>

    <div class="p-6">
      <!-- Calendario Semanal -->
      <div class="overflow-x-auto">
        <div class="min-w-[800px]">
          <!-- Header con días -->
          <div class="grid grid-cols-7 gap-2 mb-2">
            <div class="text-center text-xs font-semibold text-gray-500 p-2">Hora</div>
            <div
              v-for="day in weekDays"
              :key="day.value"
              class="text-center p-2 rounded-t-lg"
              :class="isToday(day.date) ? 'bg-[#d63031] text-white' : 'bg-gray-50 text-gray-700'"
            >
              <div class="text-xs font-semibold">{{ day.label }}</div>
              <div class="text-xs" :class="isToday(day.date) ? 'text-white' : 'text-gray-500'">
                {{ formatDate(day.date) }}
              </div>
            </div>
          </div>

          <!-- Filas de horarios -->
          <div class="space-y-1">
            <div
              v-for="hour in hours"
              :key="hour"
              class="grid grid-cols-7 gap-2"
            >
              <!-- Columna de hora -->
              <div class="text-center text-xs font-medium text-gray-600 p-2 border border-gray-200 rounded bg-gray-50">
                {{ hour }}
              </div>

              <!-- Celdas por día -->
              <div
                v-for="day in weekDays"
                :key="`${day.value}-${hour}`"
                class="min-h-[60px] border border-gray-200 rounded p-1 hover:bg-gray-50 transition-colors relative"
              >
                <!-- Clases programadas -->
                <div
                  v-for="classItem in getClassesForSlot(day.value, hour)"
                  :key="classItem.id"
                  v-show="isFirstHourOfClass(classItem, hour)"
                  class="text-xs p-2 rounded mb-1 cursor-pointer hover:shadow-md transition-all absolute top-1 left-1 right-1 z-10"
                  :style="{ 
                    backgroundColor: classItem.color + '20', 
                    borderLeft: '3px solid ' + classItem.color,
                    height: getClassHeight(classItem, hour)
                  }"
                  @click="showClassDetails(classItem)"
                >
                  <div class="font-semibold truncate" :style="{ color: classItem.color }">
                    {{ classItem.course_name }}
                  </div>
                  <div class="text-gray-600 text-xs">
                    {{ classItem.start_time }} - {{ classItem.end_time }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Leyenda -->
      <div class="mt-4 pt-4 border-t border-gray-200">
        <div class="flex flex-wrap gap-3 items-center">
          <span class="text-xs font-semibold text-gray-600">Materias:</span>
          <div
            v-for="course in uniqueCourses"
            :key="course.id"
            class="flex items-center gap-2"
          >
            <div
              class="w-3 h-3 rounded"
              :style="{ backgroundColor: course.color }"
            ></div>
            <span class="text-xs text-gray-700">{{ course.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface ClassSchedule {
  id: string
  course_id: string
  course_name: string
  course_code: string
  day_of_week: number // 1=Lunes, 6=Sábado
  start_time: string
  end_time: string
  color: string
}

const props = defineProps<{
  schedules: ClassSchedule[]
}>()

const currentWeekStart = ref(getMonday(new Date()))

const weekDays = computed(() => {
  const days = []
  const labels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  
  for (let i = 0; i < 6; i++) {
    const date = new Date(currentWeekStart.value)
    date.setDate(date.getDate() + i)
    days.push({
      label: labels[i],
      value: i + 1, // 1-6 para lunes a sábado
      date: date
    })
  }
  
  return days
})

const hours = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00'
]

const currentWeekLabel = computed(() => {
  const start = new Date(currentWeekStart.value)
  const end = new Date(currentWeekStart.value)
  end.setDate(end.getDate() + 5) // Sábado
  
  return `${start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`
})

const uniqueCourses = computed(() => {
  const coursesMap = new Map()
  props.schedules.forEach(schedule => {
    if (!coursesMap.has(schedule.course_id)) {
      coursesMap.set(schedule.course_id, {
        id: schedule.course_id,
        name: schedule.course_name,
        color: schedule.color
      })
    }
  })
  return Array.from(coursesMap.values())
})

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Ajustar para lunes
  return new Date(d.setDate(diff))
}

function previousWeek() {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() - 7)
  currentWeekStart.value = newDate
}

function nextWeek() {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() + 7)
  currentWeekStart.value = newDate
}

function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric' })
}

function getClassesForSlot(dayOfWeek: number, hour: string): ClassSchedule[] {
  return props.schedules.filter(schedule => {
    if (schedule.day_of_week !== dayOfWeek) return false
    
    const slotHour = parseInt(hour.split(':')[0])
    const startHour = parseInt(schedule.start_time.split(':')[0])
    const endHour = parseInt(schedule.end_time.split(':')[0])
    
    // Mostrar la clase si la hora del slot está entre inicio y fin
    return slotHour >= startHour && slotHour < endHour
  })
}

function getClassHeight(schedule: ClassSchedule, currentHour: string): string {
  const currentSlotHour = parseInt(currentHour.split(':')[0])
  const startHour = parseInt(schedule.start_time.split(':')[0])
  const endHour = parseInt(schedule.end_time.split(':')[0])
  
  // Si es la primera hora, calcular cuántas horas ocupa
  if (currentSlotHour === startHour) {
    const duration = endHour - startHour
    return duration > 1 ? `${duration * 60 + (duration - 1) * 4}px` : '60px' // 60px por hora + 4px de gap
  }
  
  return '0px' // Las siguientes horas no muestran la clase (está oculta)
}

function isFirstHourOfClass(schedule: ClassSchedule, currentHour: string): boolean {
  const currentSlotHour = parseInt(currentHour.split(':')[0])
  const startHour = parseInt(schedule.start_time.split(':')[0])
  return currentSlotHour === startHour
}

function showClassDetails(classItem: ClassSchedule) {
  // Emitir evento para mostrar detalles
  console.log('Class details:', classItem)
}
</script>
