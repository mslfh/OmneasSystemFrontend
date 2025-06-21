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
      <div style="display: flex;">
        <q-calendar-day
          ref="calendar"
          v-model="selectedDate"
          view="week"
          animated
          bordered
          transition-next="slide-left"
          transition-prev="slide-right"
          no-active-date
          :interval-start="6"
          :interval-count="18"
          :interval-height="50"
        >
          <template #head-day-event="{ scope: { timestamp } }">
            <div style="display: flex; justify-content: center; flex-wrap: wrap; padding: 2px">
              <template v-for="event in eventsMap[timestamp.date]" :key="event.id">
                <q-badge
                  v-if="!event.time"
                  :class="badgeClasses(event, 'header')"
                  :style="badgeStyles(event, 'header')"
                  style="width: 100%; cursor: pointer; height: 12px; font-size: 10px; margin: 1px"
                >
                  <span class="title q-calendar__ellipsis">
                    {{ event.title }}
                    <q-tooltip>{{ event.details }}</q-tooltip>
                  </span>
                </q-badge>
                <q-badge
                  v-else
                  :class="badgeClasses(event, 'header')"
                  :style="badgeStyles(event, 'header')"
                  style="margin: 1px; width: 10px; max-width: 10px; height: 10px; max-height: 10px"
                  @click="scrollToEvent(event)"
                >
                  <q-tooltip>{{ event.time + ' - ' + event.details }}</q-tooltip>
                </q-badge>
              </template>
            </div>
          </template>

          <template #day-body="{ scope: { timestamp, timeStartPos, timeDurationHeight } }">
            <template v-for="event in getEvents(timestamp.date)" :key="event.id">
              <div
                v-if="event.time !== undefined"
                class="my-event"
                :class="badgeClasses(event, 'body')"
                :style="badgeStyles(event, 'body', timeStartPos, timeDurationHeight)"
                @click="openEventDialog(event)"
              >
                <span class="title q-calendar__ellipsis">
                  {{ event.title }}
                  <q-tooltip>{{ event.details }}</q-tooltip>
                </span>
              </div>
            </template>
          </template>
        </q-calendar-day>
      </div>
  </q-page>
</template>

<script setup lang="ts">
import { QCalendarMonth, today, Timestamp } from "@quasar/quasar-ui-qcalendar";
import { ref, computed, onMounted } from "vue";
import { api } from "boot/axios";
import NavigationBar from "src/components/NavigationBar.vue"; // Import NavigationBar
import { matHeight, matWidthFull } from "@quasar/extras/material-icons";

const calendar = ref(null); // Ensure this is initialized as null

const selectedDate = ref(today());

const weekStart = computed(() => {
  const date = new Date(selectedDate.value);
  const day = date.getDay(); // 0 = Sunday
  const start = new Date(date);
  start.setDate(date.getDate() - day);
  return start;
});

const weekEnd = computed(() => {
  const start = new Date(weekStart.value);
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Saturday
  return end;
});

const events = ref([]);
const scheduleDialog = ref(false);
const dayScheduleDialog = ref(false);
const staffList = ref([]);
const selectedStaff = ref(null);

const schedule = ref({
  status: "",
  start_time: "",
  end_time: "",
  remark: "",
  work_date: "",
  break_start_time: "",
  break_end_time: "",
});

const timeRangeModel = ref({ min: 8, max: 19 });

const minTimeLabel = computed(() => {
  return formatTimeLabel(timeRangeModel.value.min);
});
const maxTimeLabel = computed(() => {
  return formatTimeLabel(timeRangeModel.value.max);
});

function formatTimeLabel(time) {
  const hasHalfStep = time % 1 === 0.5;

  if (hasHalfStep) {
    return Math.floor(time) + ":30";
  } else {
    return time + ":00";
  }
}

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

const eventColors = computed(() => {
  const colorMap = {};
  const colors = [
    'teal-5', 'blue-5', 'deep-orange-3', 'purple-3', 'green-5', 'red-5', 'indigo-5', 'cyan-5', 'amber-5', 'brown-5', 'pink-5', 'lime-5', 'deep-purple-5', 'orange-5', 'blue-grey-5', 'yellow-8', 'light-blue-5', 'grey-8'
  ];
  let colorIndex = 0;
  events.value.forEach((event) => {
    if (!colorMap[event.title]) {
      colorMap[event.title] = colors[colorIndex % colors.length];
      colorIndex++;
    }
  });
  return colorMap;
});

function getEvents(dt: string) {
  // get all events for the specified date
  const evts = eventsMap.value[dt] || [];
  // 为每个 event 分配颜色
  evts.forEach(event => {
    event.bgcolor = eventColors.value[event.title] || 'teal-5';
  });
  return evts
}

function scrollToEvent(event: Event) {
  if (calendar.value && event.time) {
    calendar.value.scrollToTime(event.time, 350)
  }
}

const currentMonth = computed(() => {
  const date = new Date(selectedDate.value);
  return date.toLocaleString("default", {
    month: "long",
    year: "numeric",
    day: "numeric",
  });
});

interface Event {
  id: number
  title: string
  details: string
  date: string
  time?: string
  duration?: number
  bgcolor?: string
}

async function fetchSchedules() {
  try {
    const response = await api.get("/api/schedules", {
      params: {
        start_date: weekStart.value.toISOString().split("T")[0],
        end_date: weekEnd.value.toISOString().split("T")[0],
      },
    });

    events.value = response.data.map((schedule) => ({
      id: schedule.id,
      title: `${schedule.staff.name}`,
      date: schedule.work_date,
      time: schedule.start_time,
      remark: schedule.remark,
      bgcolor: 'teal-5',
      duration: schedule.start_time && schedule.end_time ? getDuration(schedule.start_time, schedule.end_time) : 60,
    }));

    console.log("Fetched schedules:", events.value);
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

const scheduleType = ref("Every week");
const startDate = ref("");
const endDate = ref("");

const weekDays = ref([
  { label: "Monday", enabled: false, start: "", end: "" },
  { label: "Tuesday", enabled: false, start: "", end: "" },
  { label: "Wednesday", enabled: false, start: "", end: "" },
  { label: "Thursday", enabled: false, start: "", end: "" },
  { label: "Friday", enabled: false, start: "", end: "" },
  { label: "Saturday", enabled: false, start: "", end: "" },
  { label: "Sunday", enabled: false, start: "", end: "" },
]);

function addTimeInput(day) {
  if (!day.additionalTimes) {
    day.additionalTimes = [];
  }
  day.additionalTimes.push({ start: "", end: "" });
}

function removeTimeInput(day, index) {
  if (day.additionalTimes && day.additionalTimes.length > index) {
    day.additionalTimes.splice(index, 1);
  }
}

async function saveSchedule() {
  if (!selectedStaff.value) {
    alert("Please select a staff member.");
    return;
  }
  if (!startDate.value || !endDate.value) {
    alert("Please select a start and end date.");
    return;
  }

  const payload = {
    staff_id: selectedStaff.value.id,
    schedule_type: scheduleType.value,
    start_date: startDate.value,
    end_date: endDate.value,
    week_days: weekDays.value
      .filter((day) => day.enabled)
      .map((day) => ({
        day: day.label,
        start_time: day.start,
        end_time: day.end,
        additional_times: day.additionalTimes || [],
      })),
  };

  try {
    await api.post("/api/insert-schedule", payload);
    fetchSchedules();
    closeScheduleDialog();
  } catch (error) {
    console.error("Error saving schedule:", error);
  }
}

function badgeClasses(event: Event, type: string) {
  const isHeader = type === 'header'
  return {
    [`text-white bg-${event.bgcolor}`]: true,
    'full-width': !isHeader && (!event.side || event.side === 'full'),
    'left-side': !isHeader && event.side === 'left',
    'right-side': !isHeader && event.side === 'right',
    'rounded-border': true,
  }
}
function badgeStyles(
  event: Event,
  type: string,
  timeStartPos?: (_time: string) => number,
  timeDurationHeight?: (_duration: number) => number,
): Record<string, string> {
  const s: Record<string, string> = {}

  if (type === 'body' && timeStartPos && timeDurationHeight && event.time && event.duration) {
    s.top = `${timeStartPos(event.time)}px`;
    s.height = `${timeDurationHeight(event.duration)}px`;
    s.position = 'absolute';
    s.width = '100%';
  }

  s['align-items'] = 'flex-start';
  return s;
}




const eventDialog = ref(false);
const selectedEvent = ref({});

function openEventDialog(event) {
  selectedEvent.value = {
    ...event,
    start_time: event.start_time,
    end_time: event.end_time,
    break_start_time: event.break_start_time, // Include break start time
    break_end_time: event.break_end_time, // Include break end time
  };
  console.log("Selected Event:", event);
  eventDialog.value = true;
}

function closeEventDialog() {
  eventDialog.value = false;
  selectedEvent.value = {};
}

async function updateEvent() {
  try {
    const {
      id,
      start_time,
      end_time,
      status,
      remark,
      break_start_time,
      break_end_time,
    } = selectedEvent.value;
    await api.put(`/api/schedules/${id}`, {
      start_time,
      end_time,
      status,
      remark,
      break_start_time,
      break_end_time,
    });
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

function onClickDay(data: Timestamp) {
  if (eventDialog.value == true) {
    return;
  }
  schedule.value.work_date = data.scope.timestamp.date; // Set the selected date
  dayScheduleDialog.value = true; // Open the dialog
}

function closeDayScheduleDialog() {
  dayScheduleDialog.value = false;
  resetScheduleForm();
}

async function saveDaySchedule() {
  if (!selectedStaff.value) {
    alert("Please select a staff member.");
    return;
  }
  // Set date into yyyy/mm/dd format
  schedule.value.work_date = schedule.value.work_date.replace(/-/g, "/");
  // Set start_time and end_time based on timeRangeModel

  schedule.value.start_time = formatTimeLabel(timeRangeModel.value.min);
  schedule.value.end_time = formatTimeLabel(timeRangeModel.value.max);

  if (schedule.value.start_time.length == 4) {
    schedule.value.start_time = "0" + schedule.value.start_time;
  }
  if (schedule.value.end_time.length == 4) {
    schedule.value.end_time = "0" + schedule.value.end_time;
  }

  schedule.value.status = "active";
  try {
    const payload = {
      staff_id: selectedStaff.value.id,
      ...schedule.value,
    };
    await api.post("/api/schedules", payload);
    fetchSchedules();
    closeDayScheduleDialog();
  } catch (error) {
    console.error("Error saving day schedule:", error);
  }
}

// Helper function to calculate duration in minutes
function getDuration(start, end) {
  // start, end: 'HH:mm' string
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
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
</style>
