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
            class="my-event"
            @click="openEventDialog(event)"
          >
            <abbr :title="event.details" class="tooltip">
              <div :class="'bg-' + eventColors[event.title]">
                {{ event.title }} {{ event.time }} {{ event.status }}
                <div>Remark: {{ event.remark }}</div>
              </div>
            </abbr>
          </div>
        </template>
      </template>
    </q-calendar-month>

    <q-dialog v-model="scheduleDialog">
      <q-card style="min-width: 1000px;">
        <q-card-section>
          <div class="text-h6">Set Staff Schedule</div>
        </q-card-section>
        <div class="row q-ma-md">
          <q-card class="col-3">
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
            <q-card-section
              ><q-select
                v-model="scheduleType"
                label="Schedule Type"
                :options="['Every week']"
            /></q-card-section>
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
          <div class="col-1"></div>
          <div class="col-6">
            <q-scroll-area style="height: 450px">
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
                        style="width: 70px;"
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
                      <q-btn icon="add" @click="addTimeInput(day)" flat round />
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
            </q-scroll-area>
            <q-card-actions align="right">
              <q-btn
                flat
                label="Cancel"
                color="primary"
                @click="closeScheduleDialog"
              />
              <q-btn
                flat
                label="Save"
                color="primary"
                @click="saveSchedule"
              />
            </q-card-actions>
          </div>

        </div>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dayScheduleDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Add Day Schedule</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="schedule.work_date"
            filled
            type="date"
            label="Work Date"
          />
          <q-select
            v-model="selectedStaff"
            :options="staffList"
            option-label="name"
            option-value="id"
            label="Select Staff"
            dense
          />
          <!-- <q-input
            v-model="schedule.break_start_time"
            filled
            type="time"
            label="Break Start Time"
          /> -->
          <!-- <q-input
            v-model="schedule.break_end_time"
            filled
            type="time"
            label="Break End Time"
          /> -->
          <q-label>
            <q-icon name="access_time" class="q-mr-sm" />
            <span class="text-subtitle1">Working Hours</span>
          </q-label>
          <q-range
            v-model="timeRangeModel"
            color="green"
            :inner-min="8"
            :inner-max="19"
            markers
            label-always
            :left-label-value="minTimeLabel"
            :right-label-value="maxTimeLabel"
            switch-label-side
            switch-marker-labels-side
            :min="8"
            :max="18"
          />
          <q-input v-model="schedule.remark" label="Remark" filled />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="primary"
            @click="closeDayScheduleDialog"
          />
          <q-btn flat label="Save" color="primary" @click="saveDaySchedule" />
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
          <!-- <q-input
            v-model="selectedEvent.break_start_time"
            filled
            type="time"
            label="Break Start Time"
          />
          <q-input
            v-model="selectedEvent.break_end_time"
            filled
            type="time"
            label="Break End Time"
          /> -->
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

<script setup lang="ts">
import { QCalendarMonth, today, Timestamp } from "@quasar/quasar-ui-qcalendar";
import { ref, computed, onMounted } from "vue";
import { api } from "boot/axios";
import NavigationBar from "src/components/NavigationBar.vue"; // Import NavigationBar
import { matHeight, matWidthFull } from "@quasar/extras/material-icons";

const calendar = ref(null); // Ensure this is initialized as null
const selectedDate = ref(today());
const events = ref([]);
const scheduleDialog = ref(false);
const dayScheduleDialog = ref(false);
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

const eventColors = computed(() => {
  const colorMap = {};
  const colors = ["teal-5", "blue-5", "cyan-5", "purple-3"];
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
    await api.post("/api/insertSchedule", payload);
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
  schedule.value.start_time = `${timeRangeModel.value.min}:00`;
  schedule.value.end_time = `${timeRangeModel.value.max}:00`;
  if (schedule.value.start_time.length == 4) {
    schedule.value.start_time = "0" + schedule.value.start_time;
  }
  if (schedule.value.end_time.length == 4) {
    schedule.value.end_time = "0" + schedule.value.end_time;
  }
  console.log("Day Schedule Data:", schedule.value);
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
