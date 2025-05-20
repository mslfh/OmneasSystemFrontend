<template>
  <div class="q-mt-md">
    <q-btn label="All" flat color="grey">
      <q-badge color="blue-4" text-color="white" floating>
        {{ customerHistory.length }}
      </q-badge>
    </q-btn>
    <q-btn label="No show" flat color="grey ">
      <q-badge color="deep-orange-4" text-color="white" floating>
        {{ customerHistory.filter(event => event.status === 'pending').length }}
      </q-badge>
    </q-btn>
    <q-timeline class="q-pa-none" color="">
      <q-timeline-entry
        v-for="event in customerHistory"
        :key="event.id"
        :color="
          event.status === 'finished'
            ? 'teal-4'
            : event.status === 'pending'
            ? 'red-8'
            : 'blue-3'
        "
      >
        <div class="text-grey-8">
          <div class="row text-weight-medium">
            <div class="col-9">
              {{
                event.services[0].service_title +
                " | " +
                event.services[0].service_duration +
                " Min"
              }}
            </div>
            <div class="text-grey">
              ${{ event.services[0].service_price }}
            </div>
          </div>
          <div>{{ event.services[0].customer_name }}</div>
          <div>Therapist: {{ event.services[0].staff_name }}</div>
          <div class="text-grey" v-if="event.comments">
            Notes: {{ event.comments }}
          </div>
        </div>
        <template v-slot:subtitle>
          <div class="row q-pa-none">
            <q-lable
              class="col-8 text-subtitle2 text-weight-bold"
              >{{ event.booking_time.slice(0, 16) }}</q-lable
            >
            <q-chip
              size="12px"
              outline
              dense
              :color="
                event.status === 'finished'
                  ? 'teal-4'
                  : event.status === 'pending'
                  ? 'red-8'
                  : 'blue-5'
              "
              :label="event.status"
              text-color="white"
              class="q-mr-sm"
            />
          </div>
        </template>
      </q-timeline-entry>
    </q-timeline>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
const props = defineProps({
  customerHistory: {
    type: Array,
    required: true
  }
});
</script>
