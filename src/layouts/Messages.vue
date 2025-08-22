<template>
  <div>
    <!-- Date Picker Header -->
    <div class="row items-center q-pa-md">
      <q-input
        :model-value="selectedDate"
        type="date"
        filled
        dense
        class="col-grow"
        @update:model-value="onDateChange"
      >
        <template v-slot:prepend>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date :model-value="selectedDate" @update:model-value="onDateChange">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>


    <!-- Loading indicator -->
    <div v-if="loading" class="text-center q-pa-md">
      <q-spinner color="primary" size="2em" />
      <div class="q-mt-sm text-grey-6">Loading messages...</div>
    </div>

    <!-- Messages List -->
    <q-item
      v-else
      style="max-width: 420px"
      v-for="msg in messages"
      :key="msg.id"
      clickable
      v-ripple
      class="q-mb-sm"
    >
      <q-item-section avatar>
        <q-avatar color="primary" text-color="white">
          {{ getInitials(msg.recipient_name) }}
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ msg.recipient_name }}</q-item-label>
        <q-item-label caption class="text-weight-medium">{{ msg.subject }}</q-item-label>
        <q-item-label caption lines="2">{{ msg.content }}</q-item-label>
        <q-item-label caption class="text-grey-6">
          {{ formatDateTime(msg.schedule_time) }}
        </q-item-label>
      </q-item-section>

      <q-item-section side top>
        <div class="column items-end">
          <q-chip
            :color="msg.status === 'sent' ? 'positive' : 'negative'"
            text-color="white"
            dense
            :icon="msg.status === 'sent' ? 'check_circle' : 'error'"
          >
            {{ msg.status }}
          </q-chip>
          <q-item-label caption class="q-mt-xs">
            {{ msg.recipient_phone }}
          </q-item-label>
        </div>
      </q-item-section>
    </q-item>

    <!-- Empty State -->
    <div v-if="!loading && messages.length === 0" class="text-center q-pa-lg text-grey-6">
      <q-icon name="message" size="48px" class="q-mb-md" />
      <div>No messages found for this date</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  selectedDate: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['dateChange']);

// Helper function to get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

// Helper function to format datetime
function formatDateTime(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  return date.toLocaleString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// Handle date change - emit to parent
function onDateChange(newDate: string) {
  emit('dateChange', newDate);
}
</script>

<style scoped>
.q-chip {
  font-size: 0.75rem;
  min-height: 20px;
}

.q-item {
  border-bottom: 1px solid #f0f0f0;
}

.q-item:last-child {
  border-bottom: none;
}
</style>
