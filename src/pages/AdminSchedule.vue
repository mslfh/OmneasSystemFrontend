<template>
  <q-page class="q-pa-sm bg-white">
    <q-btn
      label="Set Staff Schedule"
      color="primary"
      @click="openScheduleDialog"
    />
    <div class="text-h6 q-my-md text-center">
      {{ currentMonth }}
    </div>
    <navigation-bar @today="onToday" @prev="onPrev" @next="onNext" />
    <!-- Display current month -->

    <q-calendar-month
      ref="calendar"
      v-model="selectedDate"
      animated
      bordered
      show-day-of-year-label
      focusable
      hoverable
      no-active-date
      :day-min-height="140"
      :day-height="10"
      @change="onChange"
      @moved="onMoved"
      @click-date="onClickDate"
      @click-day="onClickDay"
    >
      <template #day="{ scope: { timestamp } }">
        <template v-for="event in eventsMap[timestamp.date]" :key="event.id">
          <div
            :class="badgeClasses(event)"
            class="my-event"
            @click="openEventDialog(event)"
          >
            <abbr :title="event.details" class="tooltip">
              <div>Staff: {{ event.title }}</div>
              <div>Time: {{ event.time }}</div>
              <div>Status: {{ event.status }}</div>
              <div>Remark: {{ event.remark }}</div>
            </abbr>
          </div>
        </template>
      </template>
    </q-calendar-month>

    <q-dialog v-model="scheduleDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Set Staff Schedule</div>
        </q-card-section>
        <q-card-section>
          <q-select
            v-model="selectedStaff"
            :options="staffList"
            option-label="name"
            option-value="id"
            label="Select Staff"
            dense
          />
          <q-input
            v-model="schedule.break_start_time"
            filled
            type="time"
            label="Break Start Time"
          />
          <q-input
            v-model="schedule.break_end_time"
            filled
            type="time"
            label="Break End Time"
          />
          <q-date v-model="schedule.work_date" range label="Work Date Range" />
          <q-range
            class="q-mt-xl"
            v-model="timeRangeModel"
            color="green"
            :inner-min="8"
            :inner-max="18"
            markers
            :marker-labels="timeMarkerLabels"
            label-always
            :left-label-value="minTimeLabel"
            :right-label-value="maxTimeLabel"
            switch-label-side
            switch-marker-labels-side
            :min="8"
            :max="18"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="primary"
            @click="closeScheduleDialog"
          />
          <q-btn flat label="Save" color="primary" @click="saveSchedule" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Event Details Dialog -->
    <q-dialog v-model="eventDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Event Details</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="selectedEvent.title"
            label="Staff"
            readonly
            filled
          />
          <q-input
            v-model="selectedEvent.start_time"
            filled
            type="time"
            label="Start Time"
          />
          <q-input
            v-model="selectedEvent.end_time"
            filled
            type="time"
            label="End Time"
          />
          <q-option-group
            v-model="selectedEvent.status"
            label="Status"
            :options="[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]"
            inline
          />
          <q-input v-model="selectedEvent.remark" label="Remark" filled />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="primary"
            @click="closeEventDialog"
          />
          <q-btn flat label="Delete" color="negative" @click="deleteEvent" />
          <q-btn flat label="Save" color="primary" @click="updateEvent" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { QCalendarMonth, today } from "@quasar/quasar-ui-qcalendar";
import { ref, computed, onMounted } from "vue";
import { api } from "boot/axios";
import NavigationBar from "src/components/NavigationBar.vue"; // Import NavigationBar

const calendar = ref(null); // Ensure this is initialized as null
const selectedDate = ref(today());
const events = ref([]);
const scheduleDialog = ref(false);
const staffList = ref([]);
const selectedStaff = ref(null);
const schedule = ref({
  work_date: "",
  break_start_time: "",
  break_end_time: "",
});

const timeRangeModel = ref({ min: 8, max: 18 });

const minTimeLabel = computed(() => `${timeRangeModel.value.min}:00`);
const maxTimeLabel = computed(() => `${timeRangeModel.value.max}:00`);
const timeMarkerLabels = Array.from({ length: 11 }, (_, i) => ({
  value: 8 + i,
  label: `${8 + i}:00`,
}));

const eventsMap = computed(() => {
  const map = {};
  events.value.forEach((event) => {
    (map[event.date] = map[event.date] || []).push(event);
  });
  return map;
});

const currentMonth = computed(() => {
  const date = new Date(selectedDate.value);
  return date.toLocaleString("default", { month: "long", year: "numeric", day: "numeric" });
});

async function fetchSchedules() {
  try {
    const response = await api.get("/api/schedules");
    events.value = response.data.map((schedule) => ({
      id: schedule.id,
      title: `Staff: ${schedule.staff.name}`,
      date: schedule.work_date,
      time: `${schedule.start_time} - ${schedule.end_time}`,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      status: schedule.status,
      remark: schedule.remark,
      bgcolor: "blue",
    }));
  } catch (error) {
    console.error("Error fetching schedules:", error);
  }
}

async function fetchStaffList() {
  try {
    const response = await api.get("/api/staff");
    staffList.value = response.data;
  } catch (error) {
    console.error("Error fetching staff list:", error);
  }
}

function openScheduleDialog() {
  fetchStaffList();
  scheduleDialog.value = true;
}

function closeScheduleDialog() {
  scheduleDialog.value = false;
  resetScheduleForm();
}

function resetScheduleForm() {
  selectedStaff.value = null;
  schedule.value = {
    work_date: "",
    break_start_time: "",
    break_end_time: "",
  };
}

async function saveSchedule() {
  if (!selectedStaff.value) {
    alert("Please select a staff member.");
    return;
  }

  // Set start_time and end_time based on timeRangeModel
  schedule.value.start_time = `${timeRangeModel.value.min}:00`;
  schedule.value.end_time = `${timeRangeModel.value.max}:00`;

  try {
    const payload = {
      staff_id: selectedStaff.value.id,
      ...schedule.value,
    };
    await api.post("/api/schedules", payload);
    fetchSchedules();
    closeScheduleDialog();
  } catch (error) {
    console.error("Error saving schedule:", error);
  }
}

function badgeClasses(event) {
  return {
    [`text-white bg-${event.bgcolor}`]: true,
    "rounded-border": true,
  };
}

const eventDialog = ref(false);
const selectedEvent = ref({});

function openEventDialog(event) {
  selectedEvent.value = {
    ...event,
    start_time: event.start_time || "08:00", // Default to 08:00 if not provided
    end_time: event.end_time || "18:00", // Default to 18:00 if not provided
  };
  eventDialog.value = true;
}

function closeEventDialog() {
  eventDialog.value = false;
  selectedEvent.value = {};
}

async function updateEvent() {
  try {
    const { id, start_time, end_time, status, remark } = selectedEvent.value;
    await api.put(`/api/schedules/${id}`, { start_time, end_time, status, remark });
    fetchSchedules();
    closeEventDialog();
  } catch (error) {
    console.error("Error updating event:", error);
  }
}

async function deleteEvent() {
  try {
    const { id } = selectedEvent.value;
    await api.delete(`/api/schedules/${id}`);
    fetchSchedules();
    closeEventDialog();
  } catch (error) {
    console.error("Error deleting event:", error);
  }
}

function onToday() {
  if (calendar.value?.moveToToday) {
    calendar.value.moveToToday();
  } else {
    console.error("Calendar reference is not initialized or invalid.");
  }
}

function onPrev() {
  if (calendar.value?.prev) {
    calendar.value.prev();
  } else {
    console.error("Calendar reference is not initialized or invalid.");
  }
}

function onNext() {
  if (calendar.value?.next) {
    calendar.value.next();
  } else {
    console.error("Calendar reference is not initialized or invalid.");
  }
}

onMounted(() => {
  fetchSchedules();
});
</script>

<style>
.my-event {
  position: relative;
  font-size: 12px;
  width: 100%;
  margin: 1px 0 0 0;
  justify-content: center;
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
