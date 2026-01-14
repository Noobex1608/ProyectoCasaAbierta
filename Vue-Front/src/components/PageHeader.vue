/**
 * PageHeader - Header de página reutilizable
 */
<template>
  <div class="mb-8" :class="{ 'flex justify-between items-center': hasAction }">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
        <FontAwesomeIcon :icon="['fas', icon]" :class="iconColorClass" />
        {{ title }}
      </h1>
      <p v-if="description" class="mt-2 text-sm text-gray-600">
        {{ description }}
      </p>
    </div>
    <slot name="action"></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

interface Props {
  title: string
  icon: string
  iconColor?: 'primary' | 'green' | 'purple' | 'blue' | 'yellow'
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: 'primary'
})

const slots = useSlots()

const hasAction = computed(() => !!slots.action)

const iconColorClass = computed(() => {
  const colors = {
    primary: 'text-[#b81a16]',
    green: 'text-green-600',
    purple: 'text-purple-600',
    blue: 'text-blue-600',
    yellow: 'text-yellow-600'
  }
  return colors[props.iconColor]
})
</script>
