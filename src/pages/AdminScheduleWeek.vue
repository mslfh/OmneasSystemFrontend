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
    <div style="display: flex; min-width: 1000px; width: 100%;">
      <q-calendar-day
        ref="calendar"
        v-model="selectedDate"
        view="week"
        animated
        bordered
        transition-next="slide-left"
        transition-prev="slide-right"
        no-active-date
        :interval-minutes="15"
        :interval-start="36"
        :interval-count="50"
        :interval-height="12"
        @click-head-day="onClickHeadDay"
        @click-time="onClickTime"
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
                :class="badgeClasses(event, 'header')"
                :style="badgeStyles(event, 'header')"
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
                :class="badgeClasses(event, 'header')"
                :style="badgeStyles(event, 'header')"
                style="
                  margin: 1px;
                  width: 10px;
                  max-width: 10px;
                  height: 10px;
                  max-height: 10px;
                "
                @click="scrollToEvent(event)"
              >
                <q-tooltip>{{ event.time + " - " + event.details }}</q-tooltip>
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
              :class="badgeClasses(event, 'body')"
              :style="
                badgeStyles(event, 'body', timeStartPos, timeDurationHeight)
              "
              @click="openEventDialog(event)"
            >
              <div class="event-content">
                <div class="event-title">{{ event.title }}</div>
                <div class="event-start-time">{{ event.start_time }}</div>
                <div class="event-duration">{{ Math.floor(event.duration / 60) }}h {{ event.duration % 60 }}m</div>
                <div class="event-end-time">{{ event.end_time }}</div>
              </div>
              <q-tooltip>{{ event.details }}</q-tooltip>
            </div>
          </template>
        </template>
      </q-calendar-day>
    </div>
  </q-page>

  <!-- Set Staff Schedule Dialog -->
  <q-dialog v-model="scheduleDialog">
    <q-card>
      <q-card-section>
        <div class="text-h6">Set Staff Schedule</div>
      </q-card-section>
      <q-card-section horizontal>
        <q-card style="width: 400px">
          <q-card-section>
            <q-select
              v-model="selectedStaff"
              :options="staffList"
              option-label="name"
              option-value="id"
              label="Select Staff"
              dense
            />
          </q-card-section>
          <q-card-section>
            <q-select
              v-model="scheduleType"
              label="Schedule Type"
              :options="['Every week']"
            />
          </q-card-section>

          <q-card-section>
            <q-input v-model="startDate" label="Start Date" mask="####-##-##">
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="startDate" mask="YYYY-MM-DD">
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </q-card-section>
          <q-card-section>
            <q-input v-model="endDate" label="End Date" mask="####-##-##">
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="endDate" mask="YYYY-MM-DD">
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </q-card-section>
        </q-card>
        <q-separator vertical />
        <q-card style="width: 400px">
          <q-card-section>
            <q-card class="q-ma-sm q-gutter-sm">
              <q-card-section
                horizontal
                class="q-gutter-sm"
                v-for="(day, index) in weekDays"
                :key="index"
              >
                <q-checkbox
                  style="width: 140px"
                  v-model="day.enabled"
                  :label="day.label"
                />
                <div v-if="day.enabled">
                  <q-card-section horizontal>
                    <q-input
                      outlined
                      v-model="day.start"
                      type="time"
                      style="width: 70px"
                      dense
                    />
                    <q-label class="q-ma-sm"> -- </q-label>
                    <q-input
                      outlined
                      v-model="day.end"
                      type="time"
                      style="width: 70px"
                      dense
                    />
                    <q-btn
                      color="accent"
                      icon="add"
                      @click="addTimeInput(day)"
                      flat
                      round
                    />
                  </q-card-section>
                  <q-card-section
                    v-for="(time, timeIndex) in day.additionalTimes || []"
                    :key="timeIndex"
                    horizontal
                  >
                    <q-input
                      outlined
                      v-model="time.start"
                      type="time"
                      style="width: 70px"
                      dense
                    />
                    <q-label class="q-ma-sm"> -- </q-label>
                    <q-input
                      outlined
                      v-model="time.end"
                      type="time"
                      style="width: 70px"
                      dense
                    />
                    <q-btn
                      icon="remove"
                      @click="removeTimeInput(day, timeIndex)"
                      color="negative"
                      flat
                      round
                    />
                  </q-card-section>
                </div>
              </q-card-section>
            </q-card>
          </q-card-section>
        </q-card>
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

  <!-- Add Day Schedule Dialog -->
  <q-dialog v-model="dayScheduleDialog" persistent>
    <q-card class="day-schedule-card" style="width: 550px; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.12);">
      <q-card-section class="dialog-header bg-gradient-to-r from-orange-500 to-red-500">
        <div class="text-h6 text-white font-medium flex items-center">
          <q-icon name="event_note" class="q-mr-sm" size="24px" />
          Add Day Schedule
        </div>
      </q-card-section>
      <q-card-section class="q-pa-lg">
        <div class="form-group">
          <q-input
            v-model="schedule.work_date"
            outlined
            type="date"
            label="Work Date"
            dense
            class="q-mb-md modern-input"
            color="orange-6"
          >
            <template v-slot:prepend>
              <q-icon name="event" color="orange-6" />
            </template>
          </q-input>
        </div>

        <div class="form-group">
          <q-select
            v-model="selectedStaff"
            :options="staffList"
            option-label="name"
            option-value="id"
            label="* Select Staff"
            clearable
            outlined
            dense
            class="q-mb-md modern-select"
            color="orange-6"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="orange-6" />
            </template>
          </q-select>
        </div>

        <div class="form-group">
          <q-card flat bordered class="time-range-card q-mb-md">
            <q-card-section class="q-pa-md">
              <div class="text-subtitle2 text-grey-7 q-mb-sm flex items-center">
                <q-icon name="access_time" class="q-mr-xs" size="18px" />
                Working Time
              </div>
              <q-range
                v-model="timeRangeModel"
                color="orange-6"
                :inner-min="8"
                :inner-max="19"
                :step="0.5"
                markers
                label-always
                :left-label-value="minTimeLabel"
                :right-label-value="maxTimeLabel"
                switch-label-side
                :min="8"
                :max="19"
                class="modern-range"
              />
            </q-card-section>
          </q-card>
        </div>

        <div class="form-group">
          <q-input
            v-model="schedule.remark"
            label="Remark"
            outlined
            type="textarea"
            rows="3"
            class="modern-textarea"
            color="orange-6"
          >
            <template v-slot:prepend>
              <q-icon name="note" color="orange-6" />
            </template>
          </q-input>
        </div>
      </q-card-section>
      <q-card-actions align="right" class="q-pa-lg q-pt-none">
        <q-btn
          flat
          label="Cancel"
          color="grey-6"
          class="q-mr-sm modern-btn-cancel"
          @click="closeDayScheduleDialog"
        />
        <q-btn
          unelevated
          label="Save Schedule"
          color="orange-6"
          class="modern-btn-save"
          @click="saveDaySchedule"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Event Details Dialog -->
  <q-dialog v-model="eventDialog" persistent>
    <q-card class="event-detail-card" style="width: 500px; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.12);">
      <q-card-section class="dialog-header bg-gradient-to-r from-green-500 to-teal-600">
        <div class="text-h6 text-white font-medium flex items-center">
          <q-icon name="edit_calendar" class="q-mr-sm" size="24px" />
          Event Details
        </div>
      </q-card-section>
      <q-card-section class="q-pa-lg">
        <div class="form-group">
          <q-input
            v-model="selectedEvent.title"
            label="Staff"
            readonly
            outlined
            dense
            class="q-mb-md modern-input-readonly"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="green-6" />
            </template>
          </q-input>
        </div>

        <div class="row q-gutter-md q-mb-md">
          <div class="col">
            <q-input
              v-model="selectedEvent.start_time"
              type="time"
              label="Start Time"
              outlined
              dense
              class="modern-input"
              color="green-6"
            >
              <template v-slot:prepend>
                <q-icon name="access_time" color="green-6" />
              </template>
            </q-input>
          </div>
          <div class="col">
            <q-input
              v-model="selectedEvent.end_time"
              type="time"
              label="End Time"
              outlined
              dense
              class="modern-input"
              color="green-6"
            >
              <template v-slot:prepend>
                <q-icon name="schedule" color="green-6" />
              </template>
            </q-input>
          </div>
        </div>

        <div class="form-group">
          <q-card flat bordered class="status-card q-mb-md">
            <q-card-section class="q-pa-md">
              <div class="text-subtitle2 text-grey-7 q-mb-sm flex items-center">
                <q-icon name="toggle_on" class="q-mr-xs" size="18px" />
                Status
              </div>
              <q-option-group
                v-model="selectedEvent.status"
                :options="[
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                ]"
                inline
                color="green-6"
                class="status-options"
              />
            </q-card-section>
          </q-card>
        </div>

        <div class="form-group">
          <q-input
            v-model="selectedEvent.remark"
            label="Remark"
            outlined
            type="textarea"
            rows="3"
            class="modern-textarea"
            color="green-6"
          >
            <template v-slot:prepend>
              <q-icon name="note" color="green-6" />
            </template>
          </q-input>
        </div>
      </q-card-section>
      <q-card-actions align="right" class="q-pa-lg q-pt-none">
        <q-btn
          flat
          label="Delete"
          color="red-6"
          class="q-mr-sm modern-btn-delete"
          @click="deleteEvent"
        />
        <q-btn
          unelevated
          label="Save Changes"
          color="green-6"
          class="modern-btn-save"
          @click="updateEvent"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Quick Schedule Dialog -->
  <q-dialog v-model="quickScheduleDialog" persistent>
    <q-card class="quick-schedule-card" style="width: 450px; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.12);">
      <q-card-section class="dialog-header bg-gradient-to-r from-blue-500 to-purple-600">
        <div class="text-h6 text-white font-medium flex items-center">
          <q-icon name="schedule" class="q-mr-sm" size="24px" />
          Add Schedule for {{ formatDateTitle(quickSchedule.work_date) }}
        </div>
      </q-card-section>
      <q-card-section class="q-pa-lg">
        <div class="form-group">
          <q-select
            v-model="quickSelectedStaff"
            :options="staffList"
            option-label="name"
            option-value="id"
            label="* Select Staff"
            clearable
            outlined
            dense
            class="q-mb-md modern-select"
            color="blue-6"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="blue-6" />
            </template>
          </q-select>
        </div>

        <div class="form-group">
          <q-input
            v-model="quickSchedule.start_time"
            type="time"
            label="* Start Time"
            outlined
            dense
            class="q-mb-md modern-input"
            color="blue-6"
            @update:model-value="updateEndTime"
          >
            <template v-slot:prepend>
              <q-icon name="access_time" color="blue-6" />
            </template>
          </q-input>
        </div>

        <div class="form-group">
          <q-card flat bordered class="duration-card q-mb-md">
            <q-card-section class="q-pa-md">
              <div class="text-subtitle2 text-grey-7 q-mb-sm flex items-center">
                <q-icon name="timer" class="q-mr-xs" size="18px" />
                Work Duration
              </div>
              <q-option-group
                v-model="quickSchedule.duration"
                :options="durationOptions"
                inline
                color="blue-6"
                class="duration-options q-mt-xs"
                @update:model-value="updateEndTime"
              />
            </q-card-section>
          </q-card>
        </div>

        <div class="form-group">
          <q-input
            v-model="quickSchedule.end_time"
            type="time"
            label="* End Time"
            outlined
            dense
            class="q-mb-md modern-input"
            color="blue-6"
          >
            <template v-slot:prepend>
              <q-icon name="schedule" color="blue-6" />
            </template>
          </q-input>
        </div>

        <div class="form-group">
          <q-input
            v-model="quickSchedule.remark"
            label="Remark"
            outlined
            type="textarea"
            rows="3"
            class="modern-textarea"
            color="blue-6"
          >
            <template v-slot:prepend>
              <q-icon name="note" color="blue-6" />
            </template>
          </q-input>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-lg q-pt-none">
        <q-btn
          flat
          label="Cancel"
          color="grey-6"
          class="q-mr-sm modern-btn-cancel"
          @click="closeQuickScheduleDialog"
        />
        <q-btn
          unelevated
          label="Save Schedule"
          color="blue-6"
          class="modern-btn-save"
          @click="saveQuickSchedule"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { QCalendarMonth, today, Timestamp } from "@quasar/quasar-ui-qcalendar";
import { ref, computed, onMounted, watch } from "vue";
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
const quickScheduleDialog = ref(false);
const staffList = ref([]);
const selectedStaff = ref(null);
const quickSelectedStaff = ref(null);

const schedule = ref({
  status: "",
  start_time: "",
  end_time: "",
  remark: "",
  work_date: "",
  break_start_time: "",
  break_end_time: "",
});

const quickSchedule = ref({
  work_date: "",
  start_time: "",
  end_time: "",
  remark: "",
  duration: 1.5,
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

function formatDateTitle(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const weekday = weekdays[date.getDay()];
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${weekday} (${month}-${day})`;
}

function updateEndTime() {
  if (!quickSchedule.value.start_time || !quickSchedule.value.duration) return;

  const [hours, minutes] = quickSchedule.value.start_time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + (quickSchedule.value.duration * 60);
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;

  quickSchedule.value.end_time = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}

const timeMarkerLabels = Array.from({ length: 11 }, (_, i) => ({
  value: 8 + i,
  label: `${8 + i}:00`,
}));

const durationOptions = [
  { label: '1.5h', value: 1.5 },
  { label: '2h', value: 2 },
  { label: '2.5h', value: 2.5 },
  { label: '3h', value: 3 },
];

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
    "brown-3",
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

const currentMonth = computed(() => {
  const date = new Date(selectedDate.value);
  return date.toLocaleString("default", {
    month: "long",
    year: "numeric",
    day: "numeric",
  });
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
    const response = await api.get("/api/schedules", {
      params: {
        start_date: weekStart.value.toISOString().split("T")[0],
        end_date: weekEnd.value.toISOString().split("T")[0],
      },
    });

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
    status: "",
    start_time: "",
    end_time: "",
    remark: "",
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
  const isHeader = type === "header";
  return {
    [`text-white bg-${event.bgcolor}`]: true,
    "rounded-border": true,
  };
}

function badgeStyles(
  event: Event,
  type: string,
  timeStartPos?: (_time: string) => number,
  timeDurationHeight?: (_duration: number) => number
): Record<string, string> {
  const s: Record<string, string> = {};

  if (
    type === "body" &&
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
    if (
      event.column !== undefined &&
      event.totalColumns !== undefined &&
      event.totalColumns > 1
    ) {
      const columnWidth = 100 / event.totalColumns;
      s.width = `${columnWidth - 0.5}%`; // Slight gap between columns
      s.left = `${event.column * columnWidth}%`;
    } else {
      s.width = "100%";
    }
  }

  s["align-items"] = "flex-start";
  return s;
}

const eventDialog = ref(false);
const selectedEvent = ref({});

function openEventDialog(event) {
  selectedEvent.value = {
    ...event,
    start_time: event.start_time,
    end_time: event.end_time,
    status: event.status || 'active',
    remark: event.remark || '',
  };
  console.log("Selected Event:", selectedEvent.value);
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
    } = selectedEvent.value;
    await api.put(`/api/schedules/${id}`, {
      start_time,
      end_time,
      status,
      remark,
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

function onClickHeadDay(data: any) {
  if (eventDialog.value == true) {
    return;
  }
  // Set the selected date for the new schedule
  quickSchedule.value.work_date = data.scope.timestamp.date;
  quickScheduleDialog.value = true; // Open the quick schedule dialog
}

function onClickTime(data: any) {
  if (eventDialog.value == true) {
    return;
  }
  // Set the selected date and time for the new schedule
  quickSchedule.value.work_date = data.scope.timestamp.date;

  // Round down the minutes to the nearest 5-minute interval
  const originalTime = data.scope.timestamp.time;
  const [hours, minutes] = originalTime.split(':').map(Number);
  const roundedMinutes = Math.floor(minutes / 5) * 5;
  const roundedTime = `${String(hours).padStart(2, '0')}:${String(roundedMinutes).padStart(2, '0')}`;

  quickSchedule.value.start_time = roundedTime;

  // Set default duration to 1.5 hours
  quickSchedule.value.duration = 1.5;

  // Calculate end time based on duration
  const endHours = hours + Math.floor(quickSchedule.value.duration);
  const endMinutes = roundedMinutes + (quickSchedule.value.duration % 1) * 60;
  const finalEndHours = endHours + Math.floor(endMinutes / 60);
  const finalEndMinutes = endMinutes % 60;
  const endTime = `${String(finalEndHours).padStart(2, '0')}:${String(finalEndMinutes).padStart(2, '0')}`;
  quickSchedule.value.end_time = endTime;

  quickScheduleDialog.value = true; // Open the quick schedule dialog
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

function closeQuickScheduleDialog() {
  quickScheduleDialog.value = false;
  resetQuickScheduleForm();
}

function resetQuickScheduleForm() {
  quickSelectedStaff.value = null;
  quickSchedule.value = {
    work_date: "",
    start_time: "",
    end_time: "",
    remark: "",
    duration: 1.5,
  };
}

async function saveQuickSchedule() {
  if (!quickSelectedStaff.value) {
    alert("Please select a staff member.");
    return;
  }

  if (!quickSchedule.value.start_time || !quickSchedule.value.end_time) {
    alert("Please enter start time and end time.");
    return;
  }

  try {
    const payload = {
      staff_id: quickSelectedStaff.value.id,
      work_date: quickSchedule.value.work_date,
      start_time: quickSchedule.value.start_time,
      end_time: quickSchedule.value.end_time,
      remark: quickSchedule.value.remark,
      status: "active",
    };
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
  fetchSchedules();
  fetchStaffList(); // Ensure this is only called once and does not trigger unnecessary reactivity
});

// Watch for selectedDate changes to refetch schedules
watch([weekStart, weekEnd], () => {
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
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  padding: 2px;
}

.my-event:hover {
  opacity: 1;
}

.event-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  text-align: center;
}

.event-title {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 2px;
  color: white;
}

.event-start-time {
  font-size: 9px;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 2px;
}

.event-duration {
  font-size: 10px;
  font-weight: 500;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  font-style: italic;
}

.event-end-time {
  font-size: 9px;
  font-weight: 500;
  opacity: 0.9;
  margin-top: 2px;
}

/* Add some spacing between overlapping events */
.my-event + .my-event {
  border-left: 1px solid rgba(255, 255, 255, 0.5);
}

/* Alternating column colors for calendar */
.q-calendar-day__head-weekday:nth-child(odd) {
  background-color: #ffffff !important;
}

.q-calendar-day__head-weekday:nth-child(even) {
  background-color: #f5f5f5 !important;
}

.q-calendar-day__day:nth-child(odd) {
  background-color: #ffffff !important;
}

.q-calendar-day__day:nth-child(even) {
  background-color: #f5f5f5 !important;
}

/* Alternative approach using CSS variables */
.q-calendar-day .q-calendar__day-container:nth-child(odd) {
  background-color: #ffffff;
}

.q-calendar-day .q-calendar__day-container:nth-child(even) {
  background-color: #d1d1d1;
}

/* Ensure the alternating pattern is visible */
.q-calendar-day .q-calendar__day {
  border-right: 1px solid #e0e0e0;
}

.q-calendar-day .q-calendar__day:nth-child(odd) {
  background-color: #ffffff;
}

.q-calendar-day .q-calendar__day:nth-child(even) {
  background-color: #f8f8f8;
}

/* Modern Dialog Styles */
.dialog-header {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  border-radius: 16px 16px 0 0;
  padding: 20px 24px;
}

.quick-schedule-card .dialog-header {
  background: linear-gradient(135deg, #2563eb 0%, #3730a3 100%);
}

.event-detail-card .dialog-header {
  background: linear-gradient(135deg, #059669 0%, #065f46 100%);
}

.day-schedule-card .dialog-header {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
}

.form-group {
  margin-bottom: 16px;
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

.duration-card, .status-card, .time-range-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.duration-card:hover, .status-card:hover, .time-range-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.duration-options {
  gap: 8px;
}

.duration-options .q-radio {
  padding: 6px 14px;
  margin: 2px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  transition: all 0.3s ease;
  font-size: 13px;
}

.duration-options .q-radio:hover {
  border-color: #2563eb;
  background: #eff6ff;
}

.duration-options .q-radio--checked {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
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

.duration-card .q-card-section, .status-card .q-card-section, .time-range-card .q-card-section {
  padding: 16px !important;
}

.duration-card .text-subtitle2, .status-card .text-subtitle2, .time-range-card .text-subtitle2 {
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
.quick-schedule-card, .event-detail-card, .day-schedule-card {
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
  .quick-schedule-card, .event-detail-card, .day-schedule-card {
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
