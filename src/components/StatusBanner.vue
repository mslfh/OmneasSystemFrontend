<template>
  <transition name="fade">
    <q-banner
      v-if="show"
      :class="bannerClass"
      rounded
      dense
    >
      <template v-slot:avatar>
        <q-icon :name="icon" :color="iconColor" />
      </template>
      {{ message }}
      <template v-slot:action v-if="showAction">
        <q-btn
          flat
          :color="actionColor"
          :label="actionLabel"
          @click="$emit('action-click')"
          size="sm"
        />
      </template>
    </q-banner>
  </transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info', // info, success, warning, error
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  },
  message: {
    type: String,
    required: true
  },
  showAction: {
    type: Boolean,
    default: false
  },
  actionLabel: {
    type: String,
    default: '操作'
  }
})

const emit = defineEmits(['action-click'])

const bannerClass = computed(() => {
  const baseClass = 'q-my-sm'
  switch (props.type) {
    case 'success':
      return `${baseClass} bg-green-1 text-green-8`
    case 'warning':
      return `${baseClass} bg-orange-1 text-orange-8`
    case 'error':
      return `${baseClass} bg-red-1 text-red-8`
    default:
      return `${baseClass} bg-blue-1 text-blue-8`
  }
})

const icon = computed(() => {
  switch (props.type) {
    case 'success':
      return 'check_circle'
    case 'warning':
      return 'warning'
    case 'error':
      return 'error'
    default:
      return 'info'
  }
})

const iconColor = computed(() => {
  switch (props.type) {
    case 'success':
      return 'green'
    case 'warning':
      return 'orange'
    case 'error':
      return 'red'
    default:
      return 'blue'
  }
})

const actionColor = computed(() => {
  switch (props.type) {
    case 'success':
      return 'green-8'
    case 'warning':
      return 'orange-8'
    case 'error':
      return 'red-8'
    default:
      return 'blue-8'
  }
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
