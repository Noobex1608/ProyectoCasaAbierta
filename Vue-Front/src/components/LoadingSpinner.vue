/**
 * LoadingSpinner - Componente de carga reutilizable
 */
<template>
  <div class="flex flex-col justify-center items-center" :class="containerClass">
    <div 
      class="animate-spin rounded-full border-b-2"
      :class="[sizeClass, colorClass]"
    ></div>
    <p v-if="text" class="mt-4 text-gray-500 font-medium">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white' | 'gray'
  text?: string
  fullHeight?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'lg',
  color: 'primary',
  fullHeight: true
})

const sizeClass = computed(() => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }
  return sizes[props.size]
})

const colorClass = computed(() => {
  const colors = {
    primary: 'border-[#b81a16]',
    white: 'border-white',
    gray: 'border-gray-400'
  }
  return colors[props.color]
})

const containerClass = computed(() => {
  return props.fullHeight ? 'h-64' : ''
})
</script>
