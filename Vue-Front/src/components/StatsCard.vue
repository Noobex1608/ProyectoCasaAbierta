/**
 * StatsCard - Tarjeta de estadísticas reutilizable
 */
<template>
  <div class="bg-white rounded-lg shadow-md p-6" :class="borderClass">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-600">{{ label }}</p>
        <p class="text-3xl font-bold text-gray-900 mt-2">
          {{ value }}
          <span v-if="suffix" class="text-lg font-normal text-gray-500">{{ suffix }}</span>
        </p>
      </div>
      <div :class="['text-4xl', iconColorClass]">
        <FontAwesomeIcon :icon="['fas', icon]" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  value: string | number
  suffix?: string
  icon: string
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'orange'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue'
})

const borderClass = computed(() => {
  const colors = {
    blue: 'border-l-4 border-blue-500',
    green: 'border-l-4 border-green-500',
    yellow: 'border-l-4 border-yellow-500',
    purple: 'border-l-4 border-purple-500',
    red: 'border-l-4 border-red-500',
    orange: 'border-l-4 border-orange-500'
  }
  return colors[props.color]
})

const iconColorClass = computed(() => {
  const colors = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    purple: 'text-purple-500',
    red: 'text-red-500',
    orange: 'text-orange-500'
  }
  return colors[props.color]
})
</script>
