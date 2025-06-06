<template>
  <div class="q-mt-md">
    <q-btn label="All" flat color="grey">
      <q-badge color="blue-4" text-color="white" floating>
        {{ customerHistory.length }}
      </q-badge>
    </q-btn>
    <q-btn label="No show" flat color="grey ">
      <q-badge color="deep-orange-4" text-color="white" floating>
        {{ customerHistory.filter((event) => event.type === "no_show").length }}
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
            <div class="col-9">* {{ event.services[0].service_title }}</div>
            <div class="text-grey">${{ event.services[0].service_price }}</div>
          </div>
          <div>
            *
            {{ event.services[0].customer_name + ", " + event.customer_phone }}
          </div>
          <div>* Therapist : {{ event.services[0].staff_name }}

             <q-badge
              outline
              size="12px"
              dense
              :color="
                event.type === 'no_show'
                  ? 'red-4'
                  : event.type === 'break'
                  ? 'grey-4'
                  : event.type === 'assigned'
                  ? 'green-4'
                  : 'deep-orange-3'
              "
              :label="event.type"
            />
          </div>
          <div class="row q-pa-none">
            <span>
              * Duration: {{ event.actual_start_time ? event.actual_start_time.slice(10, 16) : '' }} ~
              {{ event.actual_end_time ? event.actual_end_time.slice(10, 16) : '' }}
            </span>
          </div>
          <div
            class="text-grey"
            v-if="event.comments"
            style="white-space: pre-wrap; word-break: break-all"
          >
            Notes: {{ event.comments }}
          </div>
          <q-separator class="q-my-sm" color="grey-3" style="height: 1px" />
        </div>
        <template v-slot:subtitle>
          <div class="row q-pa-none">
            <q-lable class="col-8 text-subtitle2 text-weight-bold">{{
              event.booking_time.slice(0, 16)
            }}</q-lable>
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
import { onMounted } from "vue";
const props = defineProps({
  customerHistory: {
    type: Array,
    required: true,
  },
});
onMounted(() => {
  console.log("Customer History:", props.customerHistory);
});
</script>
