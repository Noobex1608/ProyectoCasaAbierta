/**
 * AlertMessage - Componente de alertas reutilizable
 */
<template>
  <div 
    v-if="show" 
    class="p-4 rounded-lg border-l-4"
    :class="alertClass"
  >
    <div class="flex items-start gap-3">
      <FontAwesomeIcon 
        :icon="['fas', computedIcon]" 
        class="mt-0.5"
        :class="iconClass" 
      />
      <div class="flex-1">
        <p v-if="title" class="font-semibold mb-1" :class="textClass">{{ title }}</p>
        <p class="text-sm" :class="textClass">
          <slot>{{ message }}</slot>
        </p>
      </div>
      <button 
        v-if="dismissible" 
        @click="$emit('dismiss')"
        class="text-gray-400 hover:text-gray-600"
      >
        <FontAwesomeIcon :icon="['fas', 'xmark']" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  show?: boolean
  type?: 'success' | 'error' | 'warning' | 'info'
  message?: string
  title?: string
  icon?: string
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: true,
  type: 'info',
  dismissible: false
})

defineEmits<{
  dismiss: []
}>()

const alertClass = computed(() => {
  const classes = {
    success: 'bg-green-50 border-green-500',
    error: 'bg-red-50 border-red-500',
    warning: 'bg-yellow-50 border-yellow-500',
    info: 'bg-blue-50 border-blue-500'
  }
  return classes[props.type]
})

const iconClass = computed(() => {
  const classes = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  }
  return classes[props.type]
})

const textClass = computed(() => {
  const classes = {
    success: 'text-green-700',
    error: 'text-red-700',
    warning: 'text-yellow-700',
    info: 'text-blue-700'
  }
  return classes[props.type]
})

const computedIcon = computed(() => {
  if (props.icon) return props.icon
  const icons = {
    success: 'circle-check',
    error: 'circle-exclamation',
    warning: 'triangle-exclamation',
    info: 'circle-info'
  }
  return icons[props.type]
})
</script>
