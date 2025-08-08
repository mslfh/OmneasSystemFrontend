<template>
  <q-page class="q-pa-sm bg-white schedule-month-view">
    <div class="row items-center justify-between">
      <q-btn
        v-if="isAdminOrDesk"
        :dense="$q.screen.lt.md"
        label="Schedule"
        color="accent"
        @click="openScheduleDialog"
        class="q-mr-md"
      />
      <!-- View Switcher Component -->
      <schedule-view-switcher />
    </div>

    <div class="text-h6 q-mb-md text-center">
      {{ currentMonth }}
    </div>

    <navigation-bar @today="onToday" @prev="onPrev" @next="onNext" />

    <!-- Quick Add Tip -->
    <div v-if="isAdminOrDesk" class="text-center q-mb-sm">
      <q-chip color="grey-1" text-color="grey-8" icon="info" class="tip-chip">
        Click on date intervals to quickly add schedules
      </q-chip>
    </div>
    <q-calendar-month
      ref="calendar"
      v-model="selectedDate"
      animated
      bordered
      focusable
      :weekdays="[1, 2, 3, 4, 5, 6, 0]"
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
            class="my-event"
            @click="isAdminOrDesk ? openEventDialog(event) : null"
            :style="!isAdminOrDesk ? 'cursor: default;' : 'cursor: pointer;'"
          >
            <abbr :title="event.details" class="tooltip">
              <div
                :class="[
                  event.status !== 'inactive'
                    ? 'bg-' + eventColors[event.title]
                    : 'bg-grey-5',
                  'q-mt-xs text-center rounded-borders',
                  { 'inactive-event': event.status === 'inactive' },
                ]"
                :style="
                  event.status == 'inactive'
                    ? 'text-decoration: line-through;'
                    : ''
                "
              >
                <div class="text-bold">{{ event.title }}</div>
                {{ event.time }}
                <div>{{ event.duration }}h</div>
                <div v-if="event.remark">Remark: {{ event.remark }}</div>
              </div>
            </abbr>
          </div>
        </template>
      </template>
    </q-calendar-month>

    <!-- Staff Schedule Dialog Component -->
    <ScheduleStaffSetDialog
      v-if="isAdminOrDesk"
      v-model="scheduleDialog"
      :staff-list="staffList"
      @save="saveSchedule"
      @cancel="closeScheduleDialog"
    />

    <!-- Quick Schedule Dialog Component -->
    <ScheduleQuickSetMonthDialog
      v-if="isAdminOrDesk"
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
      v-if="isAdminOrDesk"
      v-model="eventDialog"
      :event-data="selectedEvent"
      @save="updateEvent"
      @delete="deleteEvent"
    />
  </q-page>
</template>

<script setup lang="ts">
import { QCalendarMonth, today, Timestamp } from "@quasar/quasar-ui-qcalendar";
import { ref, computed, onMounted, watch } from "vue";
import { api } from "boot/axios";
import NavigationBar from "src/components/tools/NavigationBar.vue";
import ScheduleViewSwitcher from "src/components/tools/ScheduleViewSwitcher.vue";
import ScheduleEventDetailsDialog from "../components/dialog/ScheduleEventDetailsDialog.vue";
import ScheduleQuickSetMonthDialog from "../components/dialog/ScheduleQuickSetMonthDialog.vue";
import ScheduleStaffSetDialog from "../components/dialog/ScheduleStaffSetDialog.vue";
import { getCurrentUser, getUserRole, canAccessAllMenus } from "../utils/auth";

const calendar = ref(null);
const selectedDate = ref(today());
const events = ref([]);
const scheduleDialog = ref(false);
const dayScheduleDialog = ref(false);
const eventDialog = ref(false);
const staffList = ref([]);
const selectedStaff = ref(null);
const selectedEvent = ref({});

// User role management
const currentUser = ref(null);
const userRole = ref("");
const isAdminOrDesk = ref(false);

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
  const colors = [
    "teal-4",
    "blue-4",
    "purple-3",
    "deep-orange-3",
    "green-4",
    "red-3",
    "indigo-4",
    "pink-3",
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
    // Calculate start and end dates for the current month
    const currentDate = new Date(selectedDate.value);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the current month
    const startDate = new Date(year, month, 1);
    // Last day of the current month
    const endDate = new Date(year, month + 1, 0);

    // Format dates as YYYY-MM-DD
    const start_date = startDate.toISOString().split("T")[0];
    const end_date = endDate.toISOString().split("T")[0];

    // Prepare API parameters
    const params = {
      start_date,
      end_date,
    };

    // If user is staff, only fetch their own schedules
    if (!isAdminOrDesk.value && currentUser.value) {
      params.staff_id = currentUser.value.staff?.id;
    }

    const response = await api.get("/api/getStaffSchedule", { params });

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
      duration: calculateDuration(schedule.start_time, schedule.end_time),
    }));
  } catch (error) {
    console.error("Error fetching schedules:", error);
  }
}

// Helper function to calculate duration in hours
function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return 0;

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  const durationMinutes = endMinutes - startMinutes;
  return Math.round((durationMinutes / 60) * 100) / 100; // Round to 2 decimal places
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
    [`text-white `]: event.status !== "inactive",
    "text-grey-2 bg-grey-5": event.status === "inactive",
    "rounded-border": true,
    "inactive-event": event.status === "inactive",
  };
}

function openEventDialog(event) {
  // Staff users can only view, not edit
  if (!isAdminOrDesk.value) {
    // For staff users, show a read-only version or just return
    return;
  }

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

  // Staff users cannot add schedules
  if (!isAdminOrDesk.value) {
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
  // Initialize user role information
  currentUser.value = getCurrentUser();
  userRole.value = getUserRole();
  isAdminOrDesk.value = canAccessAllMenus();

  console.log("Current User:", currentUser.value);
  console.log("User Role:", userRole.value);
  console.log("Is Admin or Desk:", isAdminOrDesk.value);

  fetchSchedules();

  // Only fetch staff list if user is admin or desk
  if (isAdminOrDesk.value) {
    fetchStaffList();
  }
});

// Watch for selectedDate changes to refetch schedules when month changes
watch(selectedDate, () => {
  fetchSchedules();
});
</script>

<style>
/* Month view specific event styles */
.schedule-month-view .my-event {
  position: relative !important;
  font-size: 12px !important;
  width: 100% !important;
  margin: 1px 0 0 0 !important;
  justify-content: center !important;
  text-overflow: ellipsis !important;
  overflow: hidden !important;
  cursor: pointer !important;
  border-radius: 4px !important;
  display: block !important;
  min-height: 20px !important;
  background-color: inherit !important;
  box-sizing: border-box !important;
  border: none !important;
  opacity: 1 !important;
  transition: none !important;
  align-items: initial !important;
}

.schedule-month-view .inactive-event {
  text-decoration: line-through;
  position: relative;
  border-radius: 5px;
}

/* Month view specific styles - protect from day/week view interference */
.schedule-month-view .q-calendar-month__day {
  background-color: #ffffff !important;
}

.schedule-month-view .q-calendar-month__head-weekday {
  background-color: #f8f9fa !important;
}

/* Ensure month view calendar displays correctly */
.schedule-month-view .q-calendar-month .q-calendar__day:nth-child(odd),
.schedule-month-view .q-calendar-month .q-calendar__day:nth-child(even) {
  background-color: inherit !important;
}

.schedule-month-view .q-calendar-month__day-container {
  background-color: #ffffff !important;
}
</style>
