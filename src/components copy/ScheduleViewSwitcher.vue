<template>
  <div class="view-switcher-container">
    <q-btn-toggle
      v-model="currentView"
      flat
      unelevated
      toggle-color="primary"
      color="transparent"
      text-color="grey-6"
      :options="viewOptions"
      @update:model-value="handleViewChange"
      class="view-toggle"
      :class="{ 'loading': isChanging }"
    >
    </q-btn-toggle>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const currentView = ref('month')
const isChanging = ref(false)

// Responsive options for mobile
const viewOptions = computed(() => {
  return [
    { label: 'Month', value: 'month' },
    { label: 'Week', value: 'week' },
    { label: 'Day', value: 'day' }
  ]
})

// Initialize current view based on route name
const initializeView = () => {
  if (route.name === 'AdminSchedule') {
    currentView.value = 'month'
  } else if (route.name === 'AdminScheduleWeek') {
    currentView.value = 'week'
  } else if (route.name === 'AdminScheduleDay') {
    currentView.value = 'day'
  }
}

// Handle view change with loading state
const handleViewChange = async (newView: string) => {
  if (isChanging.value) return

  let routeName = ''

  switch (newView) {
    case 'month':
      routeName = 'AdminSchedule'
      break
    case 'week':
      routeName = 'AdminScheduleWeek'
      break
    case 'day':
      routeName = 'AdminScheduleDay'
      break
  }

  if (routeName && route.name !== routeName) {
    isChanging.value = true
    try {
      await router.push({ name: routeName })
    } finally {
      // Add a small delay to show the loading state
      setTimeout(() => {
        isChanging.value = false
      }, 300)
    }
  }
}

// Watch for route changes to update current view
watch(() => route.name, () => {
  initializeView()
}, { immediate: true })
</script>

<style scoped>
.view-switcher-container {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}

.view-toggle {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 2px;
  border: 1px solid #e0e0e0;
}

.view-toggle :deep(.q-btn-toggle__wrapper) {
  border-radius: 6px;
  overflow: hidden;
}

.view-toggle :deep(.q-btn) {
  min-height: 32px;
  padding: 6px 16px;
  font-weight: 500;
  font-size: 13px;
  border-radius: 6px;
  margin: 0;
  transition: all 0.2s ease;
  background: transparent;
  color: #666;
}

.view-toggle :deep(.q-btn--active) {
  background: white !important;
  color: #7c7efd !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-weight: 600;
}

.view-toggle :deep(.q-btn:hover:not(.q-btn--active)) {
  background: rgba(255, 255, 255, 0.5);
}

.view-toggle.loading {
  opacity: 0.7;
  pointer-events: none;
}
</style>
