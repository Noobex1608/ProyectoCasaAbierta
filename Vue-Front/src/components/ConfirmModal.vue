/**
 * ConfirmModal - Modal de confirmación reutilizable
 */
<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50"
      @click.self="$emit('cancel')"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FontAwesomeIcon 
            v-if="icon" 
            :icon="['fas', icon]" 
            :class="iconColorClass" 
          />
          {{ title }}
        </h2>
        <div class="text-gray-600 mb-6">
          <slot>
            <p>{{ message }}</p>
          </slot>
        </div>
        <div class="flex gap-3">
          <button
            @click="$emit('cancel')"
            class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
          >
            {{ cancelText }}
          </button>
          <button
            @click="$emit('confirm')"
            :disabled="loading"
            class="flex-1 px-4 py-2 rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 inline-flex items-center justify-center gap-2"
            :class="confirmButtonClass"
          >
            <FontAwesomeIcon v-if="loading" :icon="['fas', 'spinner']" class="animate-spin" />
            <FontAwesomeIcon v-else-if="confirmIcon" :icon="['fas', confirmIcon]" />
            {{ loading ? loadingText : confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  show: boolean
  title: string
  message?: string
  icon?: string
  iconColor?: 'warning' | 'danger' | 'info'
  confirmText?: string
  confirmIcon?: string
  cancelText?: string
  loading?: boolean
  loadingText?: string
  variant?: 'danger' | 'primary' | 'warning'
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  loadingText: 'Procesando...',
  variant: 'danger',
  iconColor: 'warning'
})

defineEmits<{
  confirm: []
  cancel: []
}>()

const iconColorClass = computed(() => {
  const colors = {
    warning: 'text-amber-500',
    danger: 'text-red-500',
    info: 'text-blue-500'
  }
  return colors[props.iconColor]
})

const confirmButtonClass = computed(() => {
  const variants = {
    danger: 'bg-red-600 text-white hover:bg-red-700',
    primary: 'bg-[#b81a16] text-white hover:bg-[#9a1512]',
    warning: 'bg-amber-600 text-white hover:bg-amber-700'
  }
  return variants[props.variant]
})
</script>
