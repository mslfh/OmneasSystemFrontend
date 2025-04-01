<template>
  <q-page class="q-pa-sm bg-white">
    <AdminAppointmentNavigationBar
      :title="currentDate"
      @today="onToday"
      @prev="onPrev"
      @next="onNext"
    />
    <q-calendar-day
      ref="calendar"
      v-model="selectedDate"
      bordered
      animated
      style="height: 600px"
      :interval-minutes="15"
      :interval-height="28"
      @change="onChange"
      @moved="onMoved"
      @click-date="onClickDate"
    >
      <template #day-body="{ scope: { timestamp, timeStartPos, timeDurationHeight } }">
        <template v-for="event in (eventsMap[formatDate(timestamp.date)] || [])" :key="event.id">
          <div
            v-if="event.time"
            class="my-event"
            :class="badgeClasses(event)"
            :style="badgeStyles(event, timeStartPos, timeDurationHeight)"
            @click="openEventDialog(event)"
          >
            <div class="title q-calendar__ellipsis">
              {{ event.customer }}
              <q-tooltip>{{ event.time + ' - ' + event.details }}</q-tooltip>
            </div>
          </div>
        </template>
      </template>
    </q-calendar-day>

    <q-dialog v-model="eventDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Appointment Details</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="selectedEvent.customer" label="Customer" readonly filled />
          <q-input v-model="selectedEvent.time" label="Time" readonly filled />
          <q-input v-model="selectedEvent.status" label="Status" readonly filled />
          <q-input v-model="selectedEvent.services" label="Services" readonly filled />
          <q-input v-model="selectedEvent.comments" label="Comments" readonly filled />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" @click="closeEventDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { api } from "boot/axios";
import { QCalendarDay, today } from "@quasar/quasar-ui-qcalendar";
import AdminAppointmentNavigationBar from "src/components/AdminAppointmentNavigationBar.vue";

const calendar = ref(null);
const selectedDate = ref(formatDate(today())); // Ensure selectedDate is in 'YYYY-MM-DD' format
const events = ref([]);
const eventDialog = ref(false);
const selectedEvent = ref({});

const eventsMap = computed(() => {
  const map = {};
  console.log("Processing events for eventsMap:", events.value); // Debugging log for events array
  events.value.forEach((event) => {
    if (!event.date) {
      console.error("Event missing date:", event); // Debugging log for missing date
    } else {
      const formattedDate = formatDate(event.date); // Ensure date is formatted
      console.log(`Adding event to map for date ${formattedDate}:`, event); // Debugging log for each event
      (map[formattedDate] = map[formattedDate] || []).push(event);
    }
  });
  console.log("Computed Events Map after processing:", map); // Debugging log for eventsMap
  console.log("Computed Events Map Keys after processing:", Object.keys(map)); // Debugging log for eventsMap keys
  return map;
});

const currentDate = computed(() => {
  const date = new Date(selectedDate.value);
  return date.toLocaleString("default", { month: "long", year: "numeric", day: "numeric" });
});

async function fetchAppointments() {
  try {
    const response = await api.get("/api/appointments");

    // Ensure that booking_time is split correctly and formatted
    const fetchedEvents = response.data.map((appointment) => {
      if (!appointment.booking_time) {
        console.error("Missing booking_time for appointment:", appointment);
        return null; // Skip invalid entries
      }

      const [date, time] = appointment.booking_time.split(" "); // Extract date and time
      const formattedDate = formatDate(date); // Ensure 'YYYY-MM-DD' format
      return {
        id: appointment.id,
        customer: `${appointment.customer_first_name} ${appointment.customer_last_name}`,
        date: formattedDate, // Ensure proper format
        time: time,
        status: appointment.status,
        services: appointment.services.map((s) => s.service_title).join(", "),
        comments: appointment.customer_comments || "No comments",
        details: `Phone: ${appointment.customer_phone}, Email: ${appointment.customer_email}`,
      };
    }).filter(event => event !== null); // Remove any null values from faulty data

    console.log("Fetched Events:", fetchedEvents); // Debugging log
    events.value = fetchedEvents; // Assign correctly formatted events
  } catch (error) {
    console.error("Error fetching appointments:", error);
  }
}

function badgeClasses(event) {
  return {
    "text-white bg-blue": true,
    "rounded-border": true,
  };
}

function badgeStyles(event, timeStartPos, timeDurationHeight) {
  const styles = {};
  if (timeStartPos && timeDurationHeight) {
    styles.top = timeStartPos(event.time) + "px";
    styles.height = timeDurationHeight(60) + "px"; // Assuming 1-hour duration for simplicity
  }
  styles["align-items"] = "flex-start";
  return styles;
}

function openEventDialog(event) {
  selectedEvent.value = { ...event };
  eventDialog.value = true;
}

function closeEventDialog() {
  eventDialog.value = false;
  selectedEvent.value = {};
}

function onMoved(data) {
  console.info("onMoved", data);
}

function onChange(data) {
  console.info("onChange", data);
  console.log("Events for Start Date:", eventsMap.value[data.start] || []); // Debugging log for events on start date
}

function onClickDate(data) {
  console.info("onClickDate", data);
  const formattedDate = formatDate(data);
  console.log("Selected Date:", selectedDate.value); // Debugging log for selectedDate
  console.log("Formatted Clicked Date:", formattedDate); // Debugging log for formatted clicked date
  console.log("Events for Date:", eventsMap.value[formattedDate] || []); // Debugging log for events on clicked date
}

function onToday() {
  selectedDate.value = formatDate(today()); // Format selectedDate when setting to today
}

function onPrev() {
  calendar.value.move(-1);
  selectedDate.value = formatDate(calendar.value.timestamp.start); // Format selectedDate after moving
}

function onNext() {
  calendar.value.move(1);
  selectedDate.value = formatDate(calendar.value.timestamp.start); // Format selectedDate after moving
}

function formatDate(date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    console.error("Invalid date passed to formatDate:", date);
    return null;
  }
  return d.toISOString().split("T")[0]; // Returns 'YYYY-MM-DD'
}


onMounted(() => {
  fetchAppointments().then(() => {
    console.log("Appointments fetched:", events.value); // Debugging log for fetched events
  });
});


</script>

<style>
.my-event {
  position: absolute;
  font-size: 12px;
  justify-content: center;
  margin: 0 1px;
  text-overflow: ellipsis;
  overflow: hidden;
  cursor: pointer;
}

.title {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.text-white {
  color: white;
}

.bg-blue {
  background: blue;
}

.rounded-border {
  border-radius: 2px;
}

abbr.tooltip {
  text-decoration: none;
}
</style>
