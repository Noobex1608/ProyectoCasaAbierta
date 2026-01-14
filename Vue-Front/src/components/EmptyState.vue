/**
 * EmptyState - Componente para estados vacíos
 */
<template>
  <div class="bg-white rounded-lg shadow-md p-12 text-center">
    <div class="mb-6" :class="iconColorClass">
      <FontAwesomeIcon :icon="['fas', icon]" :class="iconSizeClass" />
    </div>
    <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ title }}</h2>
    <p class="text-gray-600 mb-6">{{ description }}</p>
    <slot name="action">
      <button
        v-if="actionText"
        @click="$emit('action')"
        class="px-8 py-4 bg-[#b81a16] text-white text-lg rounded-lg hover:bg-[#9a1512] transition-colors shadow-lg hover:shadow-xl inline-flex items-center gap-2"
      >
        <FontAwesomeIcon v-if="actionIcon" :icon="['fas', actionIcon]" />
        {{ actionText }}
      </button>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  icon?: string
  iconSize?: 'md' | 'lg' | 'xl'
  iconColor?: 'gray' | 'primary' | 'purple' | 'blue'
  title: string
  description: string
  actionText?: string
  actionIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'inbox',
  iconSize: 'xl',
  iconColor: 'gray'
})

defineEmits<{
  action: []
}>()

const iconSizeClass = computed(() => {
  const sizes = {
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-8xl'
  }
  return sizes[props.iconSize]
})

const iconColorClass = computed(() => {
  const colors = {
    gray: 'text-gray-300',
    primary: 'text-[#b81a16]',
    purple: 'text-purple-300',
    blue: 'text-blue-300'
  }
  return colors[props.iconColor]
})
</script>
