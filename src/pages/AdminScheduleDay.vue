<template>
  <q-page class="q-pa-sm bg-white schedule-day-view">
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
      <q-chip
        color="grey-1"
        text-color="grey-8"
        icon="info"
        class="tip-chip"
      >
        Click on header or intervals to quickly add schedules
      </q-chip>
    </div>


    <div class="calendar-container">
      <q-calendar-day
        ref="calendar"
        v-model="selectedDate"
        view="day"
        animated
        bordered
        transition-next="slide-left"
        transition-prev="slide-right"
        no-active-date
        :interval-minutes="10"
        :interval-start="62"
        :interval-count="64"
        :interval-height="$q.screen.lt.md ? 10 : 12"
        @click-head-day=" onClickHeadDay "
        @click-time=" onClickTime "
        class="calendar-day"
      >
        <template #head-day-event="{ scope: { timestamp } }">
          <div
            style="
              display: flex;
              justify-content: center;
              flex-wrap: wrap;
              padding: 2px;
            "
          >
            <template
              v-for="event in eventsMap[timestamp.date]"
              :key="event.id"
            >
              <q-badge
                v-if="!event.time"
                :class="badgeClasses(event)"
                :style="badgeStyles(event)"
                style="
                  width: 100%;
                  cursor: pointer;
                  height: 12px;
                  font-size: 10px;
                  margin: 1px;
                "
              >
                <span class="title q-calendar__ellipsis">
                  {{ event.title }}
                  <q-tooltip>{{ event.details }}</q-tooltip>
                </span>
              </q-badge>
              <q-badge
                v-else
                :class="badgeClasses(event)"
                :style="badgeStyles(event)"
                style="
                  margin: 1px;
                  width: 10px;
                  max-width: 10px;
                  height: 10px;
                  max-height: 10px;
                "
                @click="scrollToEvent(event)"
              >
                <q-tooltip>{{ event.title + " - " + event.time }}</q-tooltip>
              </q-badge>
            </template>
          </div>
        </template>

        <template
          #day-body="{ scope: { timestamp, timeStartPos, timeDurationHeight } }"
        >
          <template v-for="event in getEvents(timestamp.date)" :key="event.id">
            <div
              v-if="event.time !== undefined"
              class="my-event"
              :class="badgeClasses(event)"
              :style="[
                badgeStyles(event, timeStartPos, timeDurationHeight),
                !isAdminOrDesk ? 'cursor: default;' : 'cursor: pointer;'
              ]"
              @click="isAdminOrDesk ? openEventDialog(event) : null"
            >
              <div class="event-content">
                <div class="event-title">{{ event.title }}</div>
                <div class="event-start-time">{{ event.start_time }}</div>
                <div class="event-duration">
                  {{ Math.floor(event.duration / 60) }}h
                  {{ event.duration % 60 }}m
                </div>
                <div class="event-end-time">{{ event.end_time }}</div>
              </div>
              <q-tooltip>{{ event.details }}</q-tooltip>
            </div>
          </template>
        </template>
      </q-calendar-day>
    </div>
  </q-page>

  <!-- Staff Schedule Dialog Component -->
  <ScheduleStaffSetDialog
    v-if="isAdminOrDesk"
    v-model="scheduleDialog"
    :staff-list="staffList"
    @save="saveSchedule"
    @cancel="closeScheduleDialog"
  />

  <!-- Event Details Dialog Component -->
  <ScheduleEventDetailsDialog
    v-if="isAdminOrDesk"
    v-model="eventDialog"
    :event-data="selectedEvent"
    :show-break-time="false"
    @save="updateEvent"
    @delete="deleteEvent"
  />

  <!-- Quick Schedule Dialog Component -->
  <ScheduleQuickSetDayDialog
    v-if="isAdminOrDesk"
    v-model="quickScheduleDialog"
    :staff-list="staffList"
    :work-date="quickSchedule.work_date"
    :start-time="quickSchedule.start_time"
    :duration="quickSchedule.duration"
    @save="saveQuickSchedule"
    @cancel="closeQuickScheduleDialog"
  />
</template>

<script setup lang="ts">
import { QCalendarDay, today, Timestamp } from "@quasar/quasar-ui-qcalendar";
import { ref, computed, onMounted, watch } from "vue";
import { api } from "boot/axios";
import NavigationBar from "src/components/tools/NavigationBar.vue";
import ScheduleViewSwitcher from "src/components/tools/ScheduleViewSwitcher.vue";

import ScheduleEventDetailsDialog from "src/components/dialog/ScheduleEventDetailsDialog.vue";
import ScheduleQuickSetDayDialog from "src/components/dialog/ScheduleQuickSetDayDialog.vue";
import ScheduleStaffSetDialog from "src/components/dialog/ScheduleStaffSetDialog.vue";
import { getCurrentUser, getUserRole, canAccessAllMenus } from "../utils/auth";


const calendar = ref<QCalendarDay>();
const selectedDate = ref(today());

// User role management
const currentUser = ref(null);
const userRole = ref("");
const isAdminOrDesk = ref(false);

const currentDay = computed(() => {
  return selectedDate.value;
});

const events = ref([]);
const scheduleDialog = ref(false);
const quickScheduleDialog = ref(false);
const eventDialog = ref(false);
const staffList = ref([]);
const quickSelectedStaff = ref(null);
const selectedEvent = ref({});

const quickSchedule = ref({
  work_date: "",
  start_time: "",
  remark: "",
  duration: 3,
});

const currentMonth = computed(() => {
  const date = new Date(selectedDate.value);
  return date.toLocaleString("default", {
    weekday: "long",
    month: "long",
    year: "numeric",
    day: "numeric",
  });
});

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

// Helper function to check if two events overlap
function eventsOverlap(event1: Event, event2: Event): boolean {
  if (!event1.time || !event2.time || !event1.duration || !event2.duration) {
    return false;
  }

  const getTimeInMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const start1 = getTimeInMinutes(event1.time);
  const end1 = start1 + event1.duration;
  const start2 = getTimeInMinutes(event2.time);
  const end2 = start2 + event2.duration;

  return start1 < end2 && start2 < end1;
}

// Function to assign column positions to overlapping events
function assignEventColumns(events: Event[]): Event[] {
  const timeEvents = events.filter((event) => event.time);
  const noTimeEvents = events.filter((event) => !event.time);

  if (timeEvents.length === 0) {
    return [...timeEvents, ...noTimeEvents];
  }

  // Find overlapping groups first
  const overlapGroups: Event[][] = [];

  timeEvents.forEach((event) => {
    let addedToGroup = false;

    for (const group of overlapGroups) {
      if (group.some((groupEvent) => eventsOverlap(event, groupEvent))) {
        group.push(event);
        addedToGroup = true;
        break;
      }
    }

    if (!addedToGroup) {
      overlapGroups.push([event]);
    }
  });

  // Process each overlap group
  overlapGroups.forEach((group) => {
    const maxEventsPerRow = 5;

    // Sort events by time within the group
    group.sort((a, b) => {
      const getTimeInMinutes = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
      };
      return getTimeInMinutes(a.time!) - getTimeInMinutes(b.time!);
    });

    // Calculate total columns needed (max events in any row)
    const totalColumns = Math.min(group.length, maxEventsPerRow);

    // Assign positions
    group.forEach((event, index) => {
      event.column = index % maxEventsPerRow;
      event.totalColumns = totalColumns;
      event.row = Math.floor(index / maxEventsPerRow);
    });
  });

  return [...timeEvents, ...noTimeEvents];
}

function getEvents(dt: string) {
  const evts = eventsMap.value[dt] || [];
  evts.forEach((event) => {
    event.bgcolor = eventColors.value[event.title] || "teal-5";
  });

  return assignEventColumns(evts);
}

function scrollToEvent(event: Event) {
  if (calendar.value && event.time) {
    calendar.value.scrollToTime(event.time, 350);
  }
}

const currentDayTitle = computed(() => {
  return formatDateTitle(selectedDate.value);
});

interface Event {
  id: number;
  title: string;
  details: string;
  date: string;
  time?: string;
  start_time?: string;
  end_time?: string;
  duration?: number;
  bgcolor?: string;
  column?: number;
  totalColumns?: number;
  row?: number;
}

async function fetchSchedules() {
  try {
    // Prepare API parameters
    const params = {
      start_date: selectedDate.value,
      end_date: selectedDate.value,
    };

    // If user is staff, only fetch their own schedules
    if (!isAdminOrDesk.value && currentUser.value) {
      params.staff_id =  currentUser.value.staff?.id;
    }

    const response = await api.get("/api/getStaffSchedule", { params });

    events.value = response.data.map((schedule) => ({
      id: schedule.id,
      title: `${schedule.staff.name}`,
      details:
        schedule.remark || `${schedule.start_time} - ${schedule.end_time}`,
      date: schedule.work_date,
      time: schedule.start_time,
      end_time: schedule.end_time,
      start_time: schedule.start_time,
      remark: schedule.remark,
      status: schedule.status,
      bgcolor: "teal-5",
      duration:
        schedule.start_time && schedule.end_time
          ? getDuration(schedule.start_time, schedule.end_time)
          : 60,
    }));
    console.log("Fetched schedules for day:", events.value);
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

function badgeClasses(event: Event) {
  return {
    [`text-white bg-${event.bgcolor}`]: event.status !== 'inactive',
    "text-grey-2 bg-grey-5": event.status === 'inactive',
    "rounded-border": true,
    "inactive-event": event.status === 'inactive',
  };
}

function badgeStyles(
  event: Event,
  timeStartPos?: (_time: string) => number,
  timeDurationHeight?: (_duration: number) => number
): Record<string, string> {
  const s: Record<string, string> = {};

  if (
    timeStartPos &&
    timeDurationHeight &&
    event.time &&
    event.duration
  ) {
    const baseTop = timeStartPos(event.time);
    const baseHeight = timeDurationHeight(event.duration);

    // Handle row positioning for events that exceed 5 per overlap group
    const rowOffset = (event.row || 0) * 25; // 25px offset per row
    s.top = `${baseTop + rowOffset}px`;
    s.height = `${Math.max(baseHeight - rowOffset, 20)}px`; // Minimum height of 20px
    s.position = "absolute";

    // Handle column positioning for events
    // Always leave 10% space (5% on each side) for easier time interval clicking
    const availableWidth = 90; // 90% of total width, leaving 10% for clicking
    const leftMargin = 5; // 5% margin on the left

    if (
      event.column !== undefined &&
      event.totalColumns !== undefined &&
      event.totalColumns > 1
    ) {
      const columnWidth = availableWidth / event.totalColumns;
      s.width = `${columnWidth - 0.5}%`; // Slight gap between columns
      s.left = `${leftMargin + (event.column * columnWidth)}%`;
    } else {
      s.width = `${availableWidth}%`; // Leave 10% space (5% on each side) for easier time interval clicking
      s.left = `${leftMargin}%`; // Center the event with margin on both sides
    }
  }

  s["align-items"] = "flex-start";
  return s;
}

function openEventDialog(event) {
  // Staff users can only view, not edit
  if (!isAdminOrDesk.value) {
    return;
  }

  selectedEvent.value = {
    ...event,
    start_time: event.start_time,
    end_time: event.end_time,
    status: event.status || "active",
    remark: event.remark || "",
  };
  console.log("Selected Event:", selectedEvent.value);
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
}

function onClickHeadDay(data: any) {
  if (eventDialog.value == true) {
    return;
  }

  // Staff users cannot add schedules
  if (!isAdminOrDesk.value) {
    return;
  }

  quickSchedule.value.work_date = data.scope.timestamp.date;
  quickSelectedStaff.value = null; // Reset selected staff
  quickScheduleDialog.value = true;
}

function onClickTime(data: any) {
  if (eventDialog.value == true) {
    return;
  }

  // Staff users cannot add schedules
  if (!isAdminOrDesk.value) {
    return;
  }

  quickSchedule.value.work_date = data.scope.timestamp.date;

  const originalTime = data.scope.timestamp.time;
  const [hours, minutes] = originalTime.split(":").map(Number);
  const roundedMinutes = Math.floor(minutes / 10) * 10;
  const roundedTime = `${String(hours).padStart(2, "0")}:${String(
    roundedMinutes
  ).padStart(2, "0")}`;

  quickSchedule.value.start_time = roundedTime;
  quickSchedule.value.duration = 3;
  quickSelectedStaff.value = null; // Reset selected staff

  quickScheduleDialog.value = true;
}

function closeQuickScheduleDialog() {
  quickScheduleDialog.value = false;
  resetQuickScheduleForm();
}

function resetQuickScheduleForm() {
  quickSelectedStaff.value = null;
  quickSchedule.value = {
    work_date: "",
    start_time: "",
    remark: "",
    duration: 3,
  };
}

async function saveQuickSchedule(payload) {
  try {
    await api.post("/api/schedules", payload);
    fetchSchedules();
    closeQuickScheduleDialog();
  } catch (error) {
    console.error("Error saving quick schedule:", error);
  }
}

// Helper function to calculate duration in minutes
function getDuration(start, end) {
  // start, end: 'HH:mm' string
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
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

// Watch for selectedDate changes to refetch schedules
watch(selectedDate, () => {
  fetchSchedules();
});
</script>

<style>
/* Calendar container for centering and responsive design */
.page-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 16px;
}

.schedule-btn {
  border-radius: 8px;
  font-weight: 500;
}

.calendar-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 0 auto;
  overflow-x: auto;
}

.calendar-day {
  width: 800px;
  max-width: 100%;
  min-width: 300px;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .page-header {
    justify-content: center;
    margin-bottom: 12px;
  }

  .schedule-btn {
    margin-right: 0 !important;
    font-size: 13px;
    padding: 8px 16px;
  }

  .calendar-container {
    padding: 0 8px;
  }

  .calendar-day {
    width: 100%;
    min-width: 280px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.1rem !important;
    margin-bottom: 12px !important;
    padding: 0 8px;
  }

  .calendar-container {
    padding: 0 4px;
  }

  .calendar-day {
    width: 100%;
    min-width: 250px;
  }

  /* Adjust calendar header for mobile - Day view only */
  .schedule-day-view .q-calendar-day__head-weekday {
    font-size: 12px !important;
    padding: 4px !important;
  }

  /* Adjust time intervals for mobile - Day view only */
  .schedule-day-view .q-calendar-day__time {
    font-size: 10px !important;
    padding: 2px !important;
  }

  /* Adjust event cards for mobile - Day view only */
  .schedule-day-view .my-event {
    font-size: 10px !important;
    padding: 1px !important;
  }

  .schedule-day-view .event-content {
    padding: 1px !important;
  }

  .schedule-day-view .event-title {
    font-size: 10px !important;
    margin-bottom: 1px !important;
  }

  .schedule-day-view .event-start-time,
  .schedule-day-view .event-end-time {
    font-size: 8px !important;
    margin-bottom: 1px !important;
    margin-top: 1px !important;
  }

  .schedule-day-view .event-duration {
    font-size: 9px !important;
  }
}

/* Day view specific event styles */
.schedule-day-view .my-event {
  position: relative;
  font-size: 12px;
  width: 100%;
  margin: 1px 0 0 0;
  justify-content: center;
  text-overflow: ellipsis;
  overflow: hidden;
  cursor: pointer;
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  padding: 2px;
}

.tip-chip {
  font-size: 12px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.8;
  }
}

.schedule-day-view .my-event:hover {
  opacity: 1;
}

.schedule-day-view .inactive-event {
  text-decoration: line-through;
  position: relative;
}


.schedule-day-view .inactive-event .event-title,
.schedule-day-view .inactive-event .event-start-time,
.schedule-day-view .inactive-event .event-duration,
.schedule-day-view .inactive-event .event-end-time {
  text-decoration: line-through;
}

.schedule-day-view .event-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  width: 100%;
  text-align: center;
  padding: 2px;
}

.schedule-day-view .event-title {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 3px;
  color: white;
  order: 1;
  flex-shrink: 0;
}

.schedule-day-view .event-start-time {
  font-size: 9px;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 2px;
  color: white;
  order: 2;
  flex-shrink: 0;
}

.schedule-day-view .event-duration {
  font-size: 10px;
  font-weight: 500;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  font-style: italic;
  color: white;
  order: 3;
}

.schedule-day-view .event-end-time {
  font-size: 9px;
  font-weight: 500;
  opacity: 0.9;
  margin-top: auto;
  color: white;
  order: 4;
  flex-shrink: 0;
}

/* Add some spacing between overlapping events - Day view only */
.schedule-day-view .my-event + .my-event {
  border-left: 1px solid rgba(255, 255, 255, 0.5);
}

/* Calendar styling for day view only */
.schedule-day-view .q-calendar-day__head-weekday {
  background-color: #f8f9fa !important;
}

.schedule-day-view .q-calendar-day__day {
  background-color: #ffffff !important;
}

.dialog-header {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  border-radius: 16px 16px 0 0;
  padding: 20px 24px;
}

.event-detail-card .dialog-header {
  background: linear-gradient(135deg, #059669 0%, #065f46 100%);
}

.modern-input .q-field__control {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.modern-input:hover .q-field__control {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modern-input.q-field--focused .q-field__control {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.modern-select .q-field__control {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.modern-select:hover .q-field__control {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modern-select.q-field--focused .q-field__control {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.modern-textarea .q-field__control {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.modern-textarea:hover .q-field__control {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modern-textarea.q-field--focused .q-field__control {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.modern-input-readonly .q-field__control {
  background-color: #f8fafc;
  border-radius: 12px;
}

.status-card,
.time-range-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.status-card:hover,
.time-range-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.status-options .q-radio {
  padding: 6px 14px;
  margin: 2px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  transition: all 0.3s ease;
  font-size: 13px;
}

.status-options .q-radio:hover {
  border-color: #059669;
  background: #ecfdf5;
}

.status-options .q-radio--checked {
  background: #059669;
  border-color: #059669;
  color: white;
}

.status-card .q-card-section,
.time-range-card .q-card-section {
  padding: 16px !important;
}

.status-card .text-subtitle2,
.time-range-card .text-subtitle2 {
  margin-bottom: 8px;
  color: #4b5563;
  font-weight: 500;
}

.modern-range {
  padding: 12px;
}

.modern-btn-save {
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  text-transform: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
}

.modern-btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.modern-btn-cancel {
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 500;
  text-transform: none;
  transition: all 0.3s ease;
}

.modern-btn-cancel:hover {
  background-color: #f3f4f6;
}

.modern-btn-delete {
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 500;
  text-transform: none;
  transition: all 0.3s ease;
}

.modern-btn-delete:hover {
  background-color: #fef2f2;
  color: #dc2626;
}

/* Card animations */
.event-detail-card {
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .event-detail-card {
    width: 95vw !important;
    max-width: none !important;
  }

  .dialog-header {
    padding: 16px;
  }

  .q-card-section {
    padding: 16px !important;
  }
}
</style>
