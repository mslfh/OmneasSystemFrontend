<template>
  <q-page class="q-pa-sm bg-white">
    <q-btn
      :dense="$q.screen.lt.md"
      label="Staff Schedule"
      color="accent"
      @click="openScheduleDialog"
      class="q-mr-md"
    />

    <div class="text-h6 q-mb-md text-center">
      {{ currentMonth }}
    </div>

    <navigation-bar @today="onToday" @prev="onPrev" @next="onNext" />

    <q-calendar-month
      ref="calendar"
      v-model="selectedDate"
      animated
      bordered
      focusable
      hoverable
      no-active-date
      :focus-type="['day']"
      :day-min-height="100"
      @click-day="onClickDay"
    >
      <template #day="{ scope: { timestamp } }">
        <template v-for="event in eventsMap[timestamp.date]" :key="event.id">
          <div
            :class="badgeClasses(event)"
            class="my-event "
            @click="openEventDialog(event)"
          >
            <abbr :title="event.details" class="tooltip">
              <div
                :class="[
                  event.status !== 'inactive' ? 'bg-' + eventColors[event.title] : 'bg-grey-5',
                  'q-mt-xs text-center rounded-borders',
                  { 'inactive-event': event.status === 'inactive' }
                ]"
                :style="
                  event.status == 'inactive'
                    ? 'text-decoration: line-through;'
                    : ''
                "
              >
                {{ event.title }} {{ event.time }}
                <div v-if="event.remark">Remark: {{ event.remark }}</div>
              </div>
            </abbr>
          </div>
        </template>
      </template>
    </q-calendar-month>

    <!-- Staff Schedule Dialog Component -->
    <ScheduleStaffSetDialog
      v-model="scheduleDialog"
      :staff-list="staffList"
      @save="saveSchedule"
      @cancel="closeScheduleDialog"
    />

    <!-- Quick Schedule Dialog Component -->
    <ScheduleQuickSetMonthDialog
      v-model="dayScheduleDialog"
      :staff-list="staffList"
      :work-date="schedule.work_date"
      :selected-staff="selectedStaff"
      :time-range="timeRangeModel"
      :remark="schedule.remark"
      @save="saveDaySchedule"
      @cancel="closeDayScheduleDialog"
    />

    <!-- Event Details Dialog Component -->
    <ScheduleEventDetailsDialog
      v-model="eventDialog"
      :event-data="selectedEvent"
      @save="updateEvent"
      @delete="deleteEvent"
    />
  </q-page>
</template>

<script setup lang="ts">
import { QCalendarMonth, today, Timestamp } from "@quasar/quasar-ui-qcalendar";
import { ref, computed, onMounted } from "vue";
import { api } from "boot/axios";
import NavigationBar from "src/components/NavigationBar.vue";
import ScheduleEventDetailsDialog from "../components/dialog/ScheduleEventDetailsDialog.vue";
import ScheduleQuickSetMonthDialog from "../components/dialog/ScheduleQuickSetMonthDialog.vue";
import ScheduleStaffSetDialog from "../components/dialog/ScheduleStaffSetDialog.vue";

const calendar = ref(null);
const selectedDate = ref(today());
const events = ref([]);
const scheduleDialog = ref(false);
const dayScheduleDialog = ref(false);
const eventDialog = ref(false);
const staffList = ref([]);
const selectedStaff = ref(null);
const selectedEvent = ref({});

const schedule = ref({
  status: "",
  start_time: "",
  end_time: "",
  remark: "",
  work_date: "",
  break_start_time: "",
  break_end_time: "",
});

const timeRangeModel = ref({ min: 8, max: 20 });

const eventsMap = computed(() => {
  const map = {};
  events.value.forEach((event) => {
    (map[event.date] = map[event.date] || []).push(event);
  });
  return map;
});

const eventColors = computed(() => {
  const colorMap = {};
  const colors = ["teal-5", "blue-5", "deep-orange-3", "purple-3"];
  let colorIndex = 0;

  events.value.forEach((event) => {
    if (!colorMap[event.title]) {
      colorMap[event.title] = colors[colorIndex % colors.length];
      colorIndex++;
    }
  });

  return colorMap;
});

const currentMonth = computed(() => {
  const date = new Date(selectedDate.value);
  return date.toLocaleString("default", {
    month: "long",
    year: "numeric",
    day: "numeric",
  });
});

async function fetchSchedules() {
  try {
    const response = await api.get("/api/schedules");
    events.value = response.data.map((schedule) => ({
      id: schedule.id,
      title: `${schedule.staff.name}`,
      date: schedule.work_date,
      time: `${schedule.start_time} - ${schedule.end_time}`,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      break_end_time: schedule.break_end_time,
      break_start_time: schedule.break_start_time,
      status: schedule.status,
      remark: schedule.remark,
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
  scheduleDialog.value = true;
}

function closeScheduleDialog() {
  scheduleDialog.value = false;
}

async function saveSchedule(payload) {
  try {
    await api.post("/api/insert-schedule", payload);
    fetchSchedules();
    closeScheduleDialog();
  } catch (error) {
    console.error("Error saving schedule:", error);
  }
}

function badgeClasses(event) {
  return {
    [`text-white `]: event.status !== 'inactive',
    "text-grey-2 bg-grey-5": event.status === 'inactive',
    "rounded-border": true,
    "inactive-event": event.status === 'inactive',
  };
}

function openEventDialog(event) {
  selectedEvent.value = {
    ...event,
    start_time: event.start_time,
    end_time: event.end_time,
  };
  console.log("Selected Event:", event);
  eventDialog.value = true;
}

async function updateEvent(eventData) {
  try {
    await api.put(`/api/schedules/${eventData.id}`, eventData);
    fetchSchedules();
    eventDialog.value = false;
  } catch (error) {
    console.error("Error updating event:", error);
  }
}

async function deleteEvent(id) {
  try {
    await api.delete(`/api/schedules/${id}`);
    fetchSchedules();
    eventDialog.value = false;
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

function onClickDay(data: Timestamp) {
  if (eventDialog.value == true) {
    return;
  }
  schedule.value.work_date = data.scope.timestamp.date;
  selectedStaff.value = null; // Reset selected staff
  dayScheduleDialog.value = true;
}

function closeDayScheduleDialog() {
  dayScheduleDialog.value = false;
  resetScheduleForm();
}

function resetScheduleForm() {
  selectedStaff.value = null;
  schedule.value = {
    status: "",
    start_time: "",
    end_time: "",
    remark: "",
    work_date: "",
    break_start_time: "",
    break_end_time: "",
  };
  timeRangeModel.value = { min: 8, max: 19 };
}

async function saveDaySchedule(payload) {
  try {
    await api.post("/api/schedules", payload);
    fetchSchedules();
    closeDayScheduleDialog();
  } catch (error) {
    console.error("Error saving day schedule:", error);
  }
}

onMounted(() => {
  fetchSchedules();
  fetchStaffList(); // Ensure this is only called once and does not trigger unnecessary reactivity
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

.inactive-event {
  text-decoration: line-through;
  position: relative;
  border-radius: 5px;
}

</style>
