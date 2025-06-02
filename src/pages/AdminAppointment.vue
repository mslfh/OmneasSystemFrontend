<template>
  <div>
    <q-btn
      :class="$q.screen.gt.md ? 'float-left q-ma-md' : 'q-mb-md'"
      label="Add Appointment"
      :dense="$q.screen.lt.md"
      color="blue-8"
      @click="showAddAppointmentDialog()"
    />

    <!-- hint -->
    <div
      v-if="$q.screen.gt.md"
      class="float-right text-grey-7 text-weight-bold q-ma-md"
    >
      <q-badge color="teal-5"></q-badge>
      Assigned
      <q-space />
      <q-badge color="deep-orange-3"></q-badge>
      Unassigned
      <q-space />
      <q-icon color="teal-4" name="hourglass_top"> </q-icon>
      Progressing
      <q-space />
      <q-icon color="teal-4" name="check_circle"> </q-icon>
      Completed
      <q-space />
      <q-icon color="teal-4" name="loyalty"> </q-icon>
      Online Booking
    </div>

    <!-- current day -->
    <div class="text-h6 text-center">
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date
            v-model="selectedDate"
            mask="YYYY-MM-DD"
            @update:model-value="
              fetchAppointments();
              fetchStaffList();
            "
          >
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
      {{ currentMonth }}
    </div>

    <!-- navigation bar -->
    <navigation-bar @today="onToday" @prev="onPrev" @next="onNext" />

    <!-- zoom controls -->
    <div :class="$q.screen.gt.md ? 'float-right' : 'absolute q-ml-md'">
      <q-icon
        size="sm"
        name="zoom_out"
        color="grey"
        clickable
        @click="increaseInterval"
      />
      <q-icon
        size="sm"
        name="zoom_in"
        color="grey"
        clickable
        @click="decreaseInterval"
      />
    </div>

    <!-- calendar -->
    <div class="row">
      <!-- Waitting List -->
      <div class="col-md-2 col-xs-12">
        <div
          class="text-subtitle1 text-weight-bold q-my-md text-brown-9 text-center"
        >
          <q-btn dense flat color="grey-8" icon="calendar_month" size="md">
            <q-badge color="deep-orange" text-color="white" floating>
              {{ dragItems.length }}
            </q-badge>
          </q-btn>
          <q-label> Waitting List </q-label>
        </div>
        <ul class="column q-pr-xs">
          <li
            v-for="item in dragItems"
            :key="item.id"
            draggable="true"
            @dragstart="onDragStart($event, item)"
          >
            <q-card class="text-subtitle q-mb-sm bg-amber-11" flat bordered>
              <div class="row">
                <div class="col-7">
              <q-icon name="drag_indicator"></q-icon>Time: {{ item.time }}
              </div>
              <div v-if="item.type === 'no_show'" class="text-caption text-red-6 col-5">
               <q-icon name="visibility_off" /> No Show
              </div>
              </div>
              <q-separator></q-separator>
              <q-card-section class="q-pt-none q-pb-none">
                Name: {{ item.customer_name }}
              </q-card-section>
              <q-card-section class="q-pt-none q-pb-none text-caption">
                * {{ item.service_title }} ({{ item.service_duration }}
                min)
              </q-card-section>
            </q-card>
          </li>
        </ul>
      </div>

      <div
        :class="$q.screen.gt.md ? 'col-10' : 'col-12'"
        style="display: flex; height: 80vh"
      >
        <q-calendar-day
          ref="calendar"
          v-model="selectedDate"
          :drag-enter-func="onDragEnter"
          :drag-over-func="onDragOver"
          :drag-leave-func="onDragLeave"
          :drop-func="onDrop"
          view="day"
          hoverable
          animated
          bordered
          transition-next="slide-left"
          transition-prev="slide-right"
          no-active-date
          :column-count="staffList.length"
          :interval-minutes="interval"
          :interval-start="intervalStart"
          :interval-count="intervalCount"
          :interval-height="24"
          @moved="onMoved"
          @click-date="onClickDate"
          @click-time="onClickTime"
          @click-interval="onClickInterval"
        >
          <template #head-day="{ scope: { timestamp, columnIndex } }">
            <div
              style="display: flex; justify-content: center; flex-wrap: wrap"
              class="row"
            >
              <div
                class="col-12 text-subtitle2 text-weight-bold text-grey-9"
                v-if="staffList[columnIndex]"
                style="text-align: center"
              >
                <!-- staff list -->
                <div @click="openScheduleStaffDialog(staffList[columnIndex])">
                  {{ staffList[columnIndex].staff_name }}
                  <div
                    v-for="schedule in staffList[columnIndex].schedule"
                    class="text-caption text-grey-7"
                  >
                    {{ schedule.start_time }} - {{ schedule.end_time }}
                  </div>
                  <q-tooltip>{{
                    getEventsByStaff(
                      timestamp.date,
                      staffList[columnIndex]?.staff_id
                    ).length
                  }}</q-tooltip>
                </div>
              </div>

              <div class="col-12" style="text-align: center">
                <template
                  v-for="event in getEventsByStaff(
                    timestamp.date,
                    staffList[columnIndex]?.staff_id
                  )"
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
                      cursor: pointer;
                    "
                    @click="scrollToEvent(event)"
                  >
                    <q-tooltip>{{
                      event.customer_name +
                      " " +
                      event.time +
                      " - " +
                      event.service_title +
                      " | " +
                      event.service_duration +
                      " min"
                    }}</q-tooltip>
                  </q-badge>
                </template>
              </div>
            </div>
          </template>

          <template
            #day-body="{
              scope: {
                timestamp,
                columnIndex,
                timeStartPos,
                timeDurationHeight,
              },
            }"
          >
            <template
              v-for="event in getEventsByStaff(
                timestamp.date,
                staffList[columnIndex]?.staff_id
              )"
              :key="event.id"
            >
              <div
                v-if="event.time !== undefined"
                class="my-event shadow-2"
                :draggable="event.status !== 'finished'"
                @dragstart="onDragStart($event, event)"
                :class="badgeClasses(event, 'body')"
                :style="
                  badgeStyles(event, 'body', timeStartPos, timeDurationHeight)
                "
                @click="openEditEventDialog(event)"
              >
                <div align="right" class="q-ma-sm">
                  <q-icon
                    :name="
                      event.status != 'finished' &&
                      event.status != 'in_progress'
                        ? 'drag_indicator'
                        : event.status == 'finished'
                        ? 'o_check_circle'
                        : 'hourglass_top'
                    "
                    size="20px"
                    class="float-right"
                  />
                </div>
                <div
                  class="q-ml-md q-mt-xs flex items-center"
                  style="height: 75%"
                >
                  <q-list>
                    <div :class="interval == 10 ? '' : 'row'">
                      <q-item-label
                        :class="
                          event.service_duration > 45 && interval == 10
                            ? 'text-subtitle2 text-weight-bold'
                            : 'text-subtitle3 text-weight-bold'
                        "
                      >
                        <q-icon
                          size="13px"
                          v-if="!event.tag && event.type != 'break'"
                          color="white"
                          name="loyalty"
                        />
                        {{ event.customer_name }}
                      </q-item-label>
                      <q-item-label
                        :class="
                          event.service_duration > 45 && interval == 10
                            ? 'text-subtitle2 text-weight-bold'
                            : 'text-subtitle3 text-weight-bold q-ml-xs'
                        "
                        :style="'margin-top: 0px;'"
                      >
                        {{ event.time }} -
                        {{ event.expected_end_time }}
                      </q-item-label>
                    </div>

                    <q-item-label class="text-subtitle">
                      {{ event.service_title }} |
                      {{ event.service_duration }} Min
                      {{
                        event.service_price ? "- $" + event.service_price : ""
                      }}
                    </q-item-label>
                    <q-chip
                      size="10px"
                      v-if="event.type != 'break' && event.status === 'booked'"
                      class="shadow-up-1"
                      outline
                      color="white"
                      text-color="white"
                      icon="event"
                      clickable
                      @click.stop="startAppointment(event)"
                    >
                      Start
                    </q-chip>
                    <q-chip
                      size="10px"
                      v-if="event.type != 'break' && event.status != 'finished'"
                      class="shadow-up-2"
                      outline
                      text-color="deep-orange-1"
                      icon="o_verified"
                      clickable
                      @click.stop="finishAppointment(event)"
                    >
                      Check Out
                    </q-chip>
                    <q-item-label class="text-subtitle" v-if="event.comments">
                      Notes: {{ event.comments }}
                    </q-item-label>
                  </q-list>
                </div>
                <q-tooltip>
                  <div>
                    {{ event.service_title + " - $" + event.service_price }}
                  </div>
                  <div>
                    {{ event.customer_name + " " + event.customer_phone }}
                  </div>
                  <div>
                    {{ event.time + " | " + event.service_duration + " min" }}
                  </div>
                  <div v-if="event.comments">
                    {{ "Notes: " + event.comments }}
                  </div>
                </q-tooltip>
              </div>
            </template>
          </template>
        </q-calendar-day>
      </div>
    </div>
    <q-space style="height: 50px" />
  </div>

  <!-- Drag Appointment Dialog -->
  <q-dialog v-model="confirmDialog.visible">
    <q-card>
      <q-card-section>
        <div class="text-h6">Confirm Assignment</div>
        <div>
          Do you want to assign this item to {{ confirmDialog.staffName }}?
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="negative"
          @click="confirmDialog.reject"
        />
        <q-btn
          flat
          label="Confirm"
          color="positive"
          @click="confirmDialog.resolve"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Add Appointment Dialog -->
  <AddAppointmentDialog
    v-if="showAddEventDialog"
    :selectedStaff="selectedStaff"
    :selectedDate="selectedDate"
    :selectedTime="selectedTime"
    :staffOptions="staffOptions"
    :serviceOptions="serviceOptions"
    @close="showAddEventDialog = false"
    @addBreakEvent="handleAddBreakEvent"
    @save="
      () => {
        showAddEventDialog = false;
        fetchAppointments();
      }
    "
  />

  <!-- Edit Event Dialog -->
  <EditAppointmentDialog
    v-if="showEditEventDialog"
    :editEventForm="editEventForm"
    :selectedStaff="selectedStaff"
    :selectedDate="selectedDate"
    :staffOptions="staffOptions"
    :serviceOptions="serviceOptions"
    @close="showEditEventDialog = false"
    @openSms="
      showEditEventDialog = false;
      showSendSmsDialog = true;
    "
    @delete="
      () => {
        showEditEventDialog = false;
        fetchAppointments();
      }
    "
    @checkOut="
      (event) => {
        showEditEventDialog = false;
        showFinishAppointmentDialog = true;
      }
    "
    @save="editedEvent()"
  />

  <!-- Edit Break Dialog -->
  <EditBreakEventDialog
    v-if="showEditBreakEventDialog"
    :editEventForm="editEventForm"
    @close="
      showEditBreakEventDialog = false;
      fetchAppointments();
    "
    @delete="
      () => {
        showEditBreakEventDialog = false;
        fetchAppointments();
      }
    "
  />

  <!-- Finish Appointment Dialog -->
  <FinishAppointmentDialog
    v-if="showFinishAppointmentDialog"
    :event="clickedEvent"
    :selectedDate="selectedDate"
    @close="
      showFinishAppointmentDialog = false;
      fetchAppointments();
    "
  />

  <!-- Send SMS Dialog -->
  <SendSmsDialog
    v-if="showSendSmsDialog"
    :editEventForm="editEventForm"
    :selectedDate="selectedDate"
    :reminder_msg_template="reminder_msg_template"
    @close="showSendSmsDialog = false"
  />
</template>

<script setup lang="ts">
import {
  QCalendarDay,
  addToDate,
  parseTimestamp,
  isBetweenDates,
  today,
  parsed,
  parseTime,
  Timestamp,
} from "@quasar/quasar-ui-qcalendar";
import "@quasar/quasar-ui-qcalendar/index.css";
import { ref, computed, onMounted } from "vue";
import { api } from "boot/axios";
import NavigationBar from "components/NavigationBar.vue";

import SendSmsDialog from "components/dialog/SendSmsDialog.vue";
import EditBreakEventDialog from "components/dialog/EditBreakEventDialog.vue";
import FinishAppointmentDialog from "components/dialog/FinishAppointmentDialog.vue";
import EditAppointmentDialog from "components/dialog/EditAppointmentDialog.vue";
import AddAppointmentDialog from "components/dialog/AddAppointmentDialog.vue";

import { fetchUserFromSearch } from "../composables/useUserFromSearch";
import type { AppointmentEvent } from "../types/appointment";

import {
  useQuasar,
  QDialog,
  QCard,
  QCardSection,
  QCardActions,
  QBtn,
} from "quasar";

const $q = useQuasar();
const calendar = ref<QCalendarDay>();
const interval_height = ref(28);
const available_booking_time = ref<string[]>([]);
const staffList = ref<{ staff_id: number; staff_name: string }[]>([]);
const staffOptions = ref<{ id: number; name: string }[]>([]);
const serviceOptions = ref<{ id: number; name: string; duration: Number }[]>(
  []
);
const selectedDate = ref(today());
const selectedTime = ref("");
const selectedStaff = ref({
  id: 0,
  name: "Any therapist",
});

const events = ref<AppintmentEvent[]>([]);
const dragItems = ref<AppintmentEvent[]>([]);
const defaultEvent = ref<AppintmentEvent[]>([]);
const currentMonth = computed(() => {
  const date = new Date(selectedDate.value);
  return date.toLocaleString("default", {
    weekday: "short",
    month: "long",
    year: "numeric",
    day: "numeric",
  });
});

onMounted(() => {
  fetchSystemSetting();
  fetchAppointments();
  fetchServiceOptions();
  fetchStaffList();
  setInterval(() => {
    fetchAppointments();
  }, 60000);
});

// afterMounted(() => {
//   scrollToNow();
// })

async function fetchStaffList() {
  const staffResponse = await api.get("/api/get-staff-schedule-from-date", {
    params: {
      date: selectedDate.value,
    },
  });
  staffList.value = staffResponse.data.map((staff: any) => ({
    staff_id: staff.id,
    staff_name: staff.name,
    schedule: staff.schedules,
  }));
  staffOptions.value = staffResponse.data.map((staff: any) => ({
    id: staff.id,
    name: staff.name,
  }));
  staffOptions.value.unshift({
    id: 0,
    name: "Any therapist ",
  });
}

async function fetchAppointments() {
  try {
    const response = await api.get("/api/getBookedServiceByDate", {
      params: {
        date: selectedDate.value,
      },
    });

    const fetchedData = response.data.map((bookedService) => ({
      id: bookedService.id,
      service_id: bookedService.service_id,
      service_title: bookedService.service_title,
      service_duration: bookedService.service_duration,
      service_price: bookedService.service_price,
      comments: bookedService.comments,
      date: selectedDate.value,
      time: bookedService.booking_time.slice(11, 16),
      expected_end_time: bookedService.expected_end_time.slice(11, 16),
      customer_name: bookedService.customer_name,
      staff_id: bookedService.staff_id,
      staff_name: bookedService.staff_name,
      bgcolor:
        bookedService.type === "break"
          ? "blue-grey-3"
          : bookedService.type === "unassigned"
          ? "peach"
          : bookedService.status === "in_progress"
          ? "light-teal"
          : bookedService.status === "finished"
          ? "light-teal"
          : "teal-5",

      status: bookedService.status,
      type: bookedService.type,
      tag: bookedService.tag,
      appointment_id: bookedService.appointment_id,
      customer_first_name: bookedService.customer_first_name,
      customer_last_name: bookedService.customer_last_name,
      customer_phone: bookedService.customer_phone,
      customer_email: bookedService.customer_email,
      actual_start_time: bookedService.actual_start_time?.slice(11, 16),
    }));

    events.value = fetchedData.filter((event) => event.staff_id !== 0);

    dragItems.value = fetchedData.filter((event) => event.staff_id === 0);
  } catch (error) {
    console.error("Error fetching schedules:", error);
  }
}

async function fetchServiceOptions() {
  try {
    const response = await api.get("/api/services");
    serviceOptions.value = response.data.map((service: any) => ({
      id: service.id,
      name: service.title + " (" + service.duration + " min)",
      duration: service.duration,
    }));
  } catch (error) {
    console.error("Error fetching services:", error);
  }
}

function getEventsByStaff(date: string, staffId: number): AppintmentEvent[] {
  return (
    eventsMap.value[date]?.filter((event) => event.staff_id === staffId) || []
  );
}

// convert the events into a map of lists keyed by date
const eventsMap = computed(() => {
  const map: { [key: string]: AppintmentEvent[] } = {};
  events.value.forEach((event) => {
    if (!map[event.date]) {
      map[event.date] = [];
    }
    map[event.date]!.push(event);
    if (event.days) {
      let timestamp = parseTimestamp(event.date);
      let days = event.days;
      do {
        if (timestamp) {
          timestamp = addToDate(timestamp, { day: 1 });
          if (!map[timestamp.date]) {
            map[timestamp.date] = [];
          }
          map[timestamp.date]!.push(event);
        }
      } while (--days > 0);
    }
  });
  return map;
});

function badgeClasses(event: AppintmentEvent, type: string) {
  const isHeader = type === "header";
  return {
    [`text-white bg-${event.bgcolor}`]: true,
    "full-width": !isHeader && (!event.side || event.side === "full"),
    "left-side": !isHeader && event.side === "left",
    "right-side": !isHeader && event.side === "right",
    "rounded-border": true,
  };
}

function badgeStyles(
  event: AppintmentEvent,
  _type: string,
  timeStartPos?: (_time: string) => number,
  timeDurationHeight?: (_minutes: number) => number
) {
  console.log("event", event);
  const s: { [key: string]: string } = {};
  if (timeStartPos && timeDurationHeight) {
    s.top = timeStartPos(event.time) + "px";
    s.height = timeDurationHeight(Number(event.service_duration || 0)) + "px"; // Ensure service_duration is a number
  }
  s["align-items"] = "flex-start";
  console.log("badgeStyles", s);
  return s;
}

function getEvents(dt: string): AppintmentEvent[] {
  // get all events for the specified date
  const events = eventsMap.value[dt] || [];

  if (events.length === 1 && events[0]) {
    events[0].side = "full";
  } else if (events.length === 2 && events[0] && events[1]) {
    // this example does no more than 2 events per day
    // check if the two events overlap and if so, select
    // left or right side alignment to prevent overlap
    const startTimestamp = parsed(events[0].date);
    if (startTimestamp) {
      const startTime = addToDate(startTimestamp, {
        minute: parseTime(events[0].time),
      });
      const endTime = addToDate(startTime, { minute: events[0].duration });
      const startTime2 = addToDate(parsed(events[1].date)!, {
        minute: parseTime(events[1].time),
      });
      const endTime2 = addToDate(startTime2, { minute: events[1].duration });
      if (
        isBetweenDates(startTime2, startTime, endTime, true) ||
        isBetweenDates(endTime2, startTime, endTime, true)
      ) {
        events[0].side = "left";
        events[1].side = "right";
      } else {
        events[0].side = "full";
        events[1].side = "full";
      }
    }
  }

  return events;
}

function scrollToEvent(event: AppintmentEvent) {
  if (calendar.value) {
    calendar.value.scrollToTime(event.time, 350);
  }
}

function onToday() {
  if (calendar.value) {
    calendar.value.moveToToday();
  }
}
function onPrev() {
  if (calendar.value) {
    calendar.value.prev();
  }
}
function onNext() {
  if (calendar.value) {
    calendar.value.next();
  }
}
function onMoved(data: Timestamp) {
  console.info("onMoved", data);
  selectedDate.value = data.date;
  fetchStaffList();
  fetchAppointments();
}
function onClickTime(data: Timestamp) {
  const staff = staffList.value[data.scope.columnIndex];
  selectedStaff.value.id = staff.staff_id;
  selectedStaff.value.name = staff.staff_name;
  selectedTime.value = data.scope.timestamp.time.slice(0, 4) + "0";
  showAddAppointmentDialog();
}
function onClickInterval(data: Timestamp) {
  console.info("onClickInterval", data);
}

// Drag Event
interface CustomDragEvent extends AppintmentEvent {
  dataTransfer: DataTransfer;
  preventDefault: () => void;
}

interface Scope {
  scope: any;
}

const confirmDialog = ref({
  visible: false,
  staffName: "",
  resolve: () => {},
  reject: () => {},
});

function showConfirmDialog(staffName: string): Promise<boolean> {
  return new Promise((resolve) => {
    confirmDialog.value = {
      visible: true,
      staffName,
      resolve: () => {
        confirmDialog.value.visible = false;
        resolve(true);
      },
      reject: () => {
        confirmDialog.value.visible = false;
        resolve(false);
      },
    };
  });
}

function onDragStart(e: DragEvent, item: DragItem) {
  console.info("onDragStart called");
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = "copy";
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("ID", String(item.id));
  }
}
function onDragEnter(e: DragEvent, type: string, { scope }: Scope) {
  console.info("onDragEnter", type, scope);
  e.preventDefault();
  return true;
}
function onDragOver(e: DragEvent, type: string, { scope }: Scope) {
  console.info("onDragOver", type, scope);
  e.preventDefault();
  return true;
}
function onDragLeave(_e: DragEvent, type: string, { scope }: Scope) {
  console.info("onDragLeave", type, scope);
  return false;
}
interface DropEvent extends CustomDragEvent {
  dataTransfer: DataTransfer;
}
interface DropScope extends Scope {
  timestamp: Timestamp;
  staff_id: number;
  staff_name: string;
}
async function onDrop(
  e: DropEvent,
  type: string,
  { scope }: DropScope
): Promise<boolean> {
  const itemID = parseInt(e.dataTransfer.getData("ID"), 10);
  const item = dragItems.value.filter((item) => item.id === itemID);
  let event = item[0] ? { ...item[0] } : { ...defaultEvent };
  if (item.length === 0) {
    event = events.value.filter((item) => item.id === itemID)[0];
  }
  const columnIndex = scope.columnIndex;
  if (staffList.value[columnIndex]) {
    const staffName = staffList.value[columnIndex].staff_name;
    // Use q-dialog for confirmation
    const confirmDrop = await showConfirmDialog(staffName);
    if (!confirmDrop) {
      return false; // Cancel the drop action if the user declines
    }
    event.staff_id = staffList.value[columnIndex].staff_id;
    event.staff_name = staffName;
  }
  try {
    const payload = {
      staff_id: event.staff_id,
      staff_name: event.staff_name,
    };
    await api.put("/api/service-appointments/" + event.id, payload);
  } catch (error) {
    console.error("Error updating appointments:", error);
    return false;
  }
  if (item.length != 0) {
    events.value.push(event);
  }
  dragItems.value = dragItems.value.filter((item) => item.id !== itemID);
  console.log("events.value", events.value);
  return false;
}

//zoom
const interval = ref(10);
// Start at 8:30 AMs
const intervalStart = computed(() =>
  Math.floor((8 * 60 + 30) / interval.value)
);
// Duration from 8:30 AM to 8:30 PM
const intervalCount = computed(() => Math.ceil((12 * 60) / interval.value));

function increaseInterval() {
  interval.value = Math.min(interval.value + 10, 30); // Limit max interval to 30 minutes
}
function decreaseInterval() {
  interval.value = Math.max(interval.value - 10, 10); // Limit min interval to 10 minutes
}

// Add Appointment
const showAddEventDialog = ref(false);

function showAddAppointmentDialog() {
  showAddEventDialog.value = true;
}

function handleAddBreakEvent({
  id,
  event,
}: {
  id: number | null;
  event: AppointmentEvent | null;
}) {
  if (!id) return;
  events.value = events.value.filter((e) => e.id !== id);
  if (!event) return;
  events.value.push(event);
}

// Edit Appointment Event
const showEditEventDialog = ref(false);
const showEditBreakEventDialog = ref(false);
const editEventForm = ref({
  id: 0,
  appointment_id: 0,
  booking_date: "",
  booking_time: "",
  customer_name: "",
  service: {},
  staff: {},
  comments: "",
  status: "",
  type: "",
  customer_first_name: "",
  customer_last_name: "",
  customer_phone: "",
  customer_email: "",
});

function openEditEventDialog(event: AppintmentEvent) {
  clickedEvent.value = event;
  selectedStaff.value.id = event.staff_id;
  selectedStaff.value.name = event.staff_name;
  editEventForm.value = {
    id: event.id,
    appointment_id: event.appointment_id,
    booking_date: event.date,
    booking_time: event.time,
    customer_name: event.customer_name,
    service: {
      id: event.service_id,
      name: event.service_title,
      duration: event.service_duration,
    },
    staff: {
      id: event.staff_id,
      name: event.staff_name,
    },
    comments: event.comments,
    customer_first_name: event.customer_first_name,
    customer_last_name: event.customer_last_name,
    customer_phone: event.customer_phone,
    customer_email: event.customer_email,
    status: event.status,
    type: event.type,
  };

  if (event.type == "break") {
    showEditBreakEventDialog.value = true;
  } else {
    showEditEventDialog.value = true;
  }
}

function editedEvent() {
  try {
    showEditEventDialog.value = false;
    editEventForm.value = {
      id: 0,
      appointment_id: 0,
      booking_date: "",
      booking_time: "",
      customer_name: "",
      service: "",
      staff: {},
      comments: "",
      customer_first_name: "",
      customer_last_name: "",
      customer_phone: "",
      customer_email: "",
    };
    selectedStaff.value = {
      id: 0,
      name: "Any therapist",
    };
    fetchAppointments();
  } catch (error) {
    console.error("Error saving edited event:", error);
  }
}

// Start appointment
async function startAppointment(event: AppintmentEvent) {
  // Show confirmation dialog before starting the appointment
  //get the current time
  const start_time = new Date();
  const hours = String(start_time.getHours()).padStart(2, "0");
  const minutes = String(start_time.getMinutes()).padStart(2, "0");
  const formattedTime = `${selectedDate.value} ${hours}:${minutes}`;

  $q.dialog({
    title: "Start Appointment",
    message:
      "Do you want to start this appointment? it will be " +
      formattedTime.slice(11),
    cancel: true,
    persistent: true,
  })
    .onOk(() => {
      try {
        const payload = {
          id: event.appointment_id,
          actual_start_time: formattedTime,
          status: "in_progress",
        };
        api.put(`/api/appointments/${event.appointment_id}`, payload);
        fetchAppointments(); // Refresh appointments after finishing
      } catch (error) {
        console.error("Error finishing appointment:", error);
      }
    })
    .onCancel(() => {});
}

// Finish appointment
const clickedEvent = ref(null);
const showFinishAppointmentDialog = ref(false);

function finishAppointment(event: AppintmentEvent) {
  clickedEvent.value = event;
  showFinishAppointmentDialog.value = true;
}

// Sms Related
const reminder_msg_template = ref("");
const showSendSmsDialog = ref(false);

async function fetchSystemSetting() {
  const response = await api.get("/api/getSystemSettingByKey", {
    params: {
      key: "booking_reminder_msg",
    },
  });
  if (response.data.value) {
    reminder_msg_template.value = response.data.value;
  }
}

function openSendSmsDialog() {
  showEditEventDialog.value = false;
  showSendSmsDialog.value = true;
}

// Tool
function scrollToNow() {
  if (calendar.value) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const currentTime = `${hours}:${minutes}`;
    calendar.value.scrollToTime(currentTime, 350);
  }
}
</script>

<style lang="scss" scoped>
.my-event {
  border-radius: 14px;
  position: absolute;
  font-size: 12px;
  margin: 0 1px;
  text-overflow: ellipsis;
  overflow: hidden;
  cursor: pointer;
}
</style>
