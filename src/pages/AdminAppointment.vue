<template>
  <div class="subcontent">
    <div class="text-h6 q-my-md text-center">
      {{ currentMonth }}
    </div>
    <navigation-bar @today="onToday" @prev="onPrev" @next="onNext" />
    <q-btn label="Add Appointment" color="primary" @click="showAddAppointmentDialog" class="q-my-md" />
    <div class="row">
      <div class="q-mx-sm col-2">
        <div class="text-h6 q-my-md text-center">Unassign Staff Appointment</div>

        <ul class="column">
          <li
            v-for="item in dragItems"
            :key="item.id"
            class=" bg-blue text-white "
            draggable="true"
            @dragstart="onDragStart($event, item)"
          >
            {{ item.title }}
          </li>
        </ul>
      </div>

      <div class="col-9" style="display: flex; height: 600px">
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
          :interval-minutes="15"
          :interval-start="32"
          :interval-count="52"
          :interval-height="28"
          @moved="onMoved"
          @click-date="onClickDate"
          @click-time="onClickTime"
          @click-interval="onClickInterval"
          @click-head-day="onClickHeadDay"
        >
          <template #head-day="{ scope: { timestamp, columnIndex } }">
            <div
              style="
                display: flex;
                justify-content: center;
                flex-wrap: wrap;
                padding: 2px;
              "
              class="row"
            >
              <div
                class="col-12"
                v-if="staffList[columnIndex]"
                style="text-align: center"
              >
                <div>{{ staffList[columnIndex].staff_name }}</div>
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
                    <div class="title q-calendar__ellipsis">
                      {{ event.title }}
                      <q-tooltip>{{ event.details }}</q-tooltip>
                    </div>
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
                      event.time + " - " + event.details
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
                class="my-event"
                :class="badgeClasses(event, 'body')"
                :style="
                  badgeStyles(event, 'body', timeStartPos, timeDurationHeight)
                "
              >
                <div class="title q-calendar__ellipsis">
                  {{ event.title }}
                  <q-tooltip>{{
                    event.time + " - " + event.details
                  }}</q-tooltip>
                </div>
              </div>
            </template>
          </template>
        </q-calendar-day>
      </div>
    </div>
  </div>

  <q-dialog v-model="confirmDialog.visible">
    <q-card>
      <q-card-section>
        <div class="text-h6">Confirm Assignment</div>
        <div>Do you want to assign this item to {{ confirmDialog.staffName }}?</div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="negative" @click="confirmDialog.reject" />
        <q-btn flat label="Confirm" color="positive" @click="confirmDialog.resolve" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Add Appointment Dialog -->
  <q-dialog v-model="addAppointmentDialog.visible">
    <q-card style="min-width: 450px">
      <q-card-section>
        <div class="text-h6">Add Appointment</div>
      </q-card-section>
      <q-card-section>
        <q-input v-model="addAppointmentForm.booking_date" filled type="date" hint="Native date" />
        <q-input v-model="addAppointmentForm.booking_time" filled type="time" hint="Native time" />
        <q-input v-model="addAppointmentForm.customer_first_name" label="First Name" />
        <q-input v-model="addAppointmentForm.customer_last_name" label="Last Name" />
        <q-input v-model="addAppointmentForm.customer_email" label="Email" />
        <q-input v-model="addAppointmentForm.customer_phone" label="Phone" />
        <q-input v-model="addAppointmentForm.comments" label="Comments" />
        <q-input v-model="addAppointmentForm.customer_service[0].customer_name" label="Customer Name" />
        <q-select
          v-model="addAppointmentForm.customer_service[0].service"
          :options="serviceOptions"
          label="Service"
          option-value="id"
          option-label="name"
        />
        <q-select
          v-model="addAppointmentForm.customer_service[0].staff"
          :options="practitionerOptions"
          label="Practitioner"
          option-value="id"
          option-label="name"
        />
        <q-input v-model="addAppointmentForm.customer_service[0].comments" label="Service Comments" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="negative" @click="addAppointmentDialog.visible = false" />
        <q-btn flat label="Add" color="positive" @click="addAppointment" />
      </q-card-actions>
    </q-card>
  </q-dialog>
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
import { QDialog, QCard, QCardSection, QCardActions, QBtn } from "quasar";

interface Event {
  id: number;
  title: string;
  details: string;
  date: string;
  time: string;
  duration: number;
  bgcolor: string;
  icon: string;
  side?: string;
  days?: number;
  staff_id: number;
  staff_name: string;
}

const calendar = ref<QCalendarDay>();
const selectedDate = ref(today());
const staffList = ref<{ staff_id: number; staff_name: string }[]>([]);

onMounted(() => {
  selectedDate.value = "2025-03-31";
  fetchAppointments();
  fetchServiceOptions();
  fetchPractitionerOptions();
});

const events = ref<Event[]>([]);

const dragItems = ref<Event[]>([
]);
const defaultEvent = {
  id: 0,
  title: '',
  details: '',
  date: '',
  time:'',
  duration: 0,
  bgcolor:'',
  icon: '',
  side: '',
  days: 0,
  staff_id: 0,
  staff_name: ''
}
interface CustomDragEvent extends Event {
  dataTransfer: DataTransfer
  preventDefault: () => void
}

interface Scope {
  scope: any
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

const currentMonth = computed(() => {
  const date = new Date(selectedDate.value);
  return date.toLocaleString("default", {
    month: "long",
    year: "numeric",
    day: "numeric",
  });
});
// convert the events into a map of lists keyed by date
const eventsMap = computed(() => {
  const map: { [key: string]: Event[] } = {};
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

async function fetchAppointments() {
  try {
    const response = await api.get("/api/getBookedServiceByDate", {
      params: {
        date: selectedDate.value,
      },
    });

    const fetchedData = response.data.map((bookedService) => ({
      id: bookedService.id,
      title: bookedService.service_title,
      details: "Time to pitch my idea to the company",
      date: selectedDate.value,
      time: bookedService.booking_time.slice(11, 16),
      duration: bookedService.service_duration,
      price: bookedService.service_price,
      staff_id: bookedService.staff_id,
      staff_name: bookedService.staff_name,
      bgcolor: "teal",
      icon: "fas fa-handshake",
    }));

    events.value = fetchedData.filter((event) => event.staff_id !== 0);
    dragItems.value =fetchedData.filter((event) => event.staff_id === 0);
    staffList.value = Array.from(
      new Map(
        fetchedData
          .filter((event) => event.staff_id !== 0)
          .map((event) => [
            event.staff_id,
            {
              staff_id: event.staff_id,
              staff_name: event.staff_name,
            },
          ])
      ).values()
    );

    console.log("events.value", events.value);
    console.log("dragItems.value", dragItems.value);
    console.log("staffList.value", staffList.value);
  } catch (error) {
    console.error("Error fetching schedules:", error);
  }
}

function getEventsByStaff(date: string, staffId: number): Event[] {
  return (
    eventsMap.value[date]?.filter((event) => event.staff_id === staffId) || []
  );
}

function badgeClasses(event: Event, type: string) {
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
  event: Event,
  _type: string,
  timeStartPos?: (_time: string) => number,
  timeDurationHeight?: (_minutes: number) => number
) {
  const s: { [key: string]: string } = {};
  if (timeStartPos && timeDurationHeight) {
    s.top = timeStartPos(event.time) + "px";
    s.height = timeDurationHeight(event.duration) + "px";
  }
  s["align-items"] = "flex-start";
  return s;
}

function getEvents(dt: string): Event[] {
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

function scrollToEvent(event: Event) {
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
  fetchAppointments();
}

function onClickDate(data: Timestamp) {
  console.info("onClickDate", data);
}
function onClickTime(data: Timestamp) {
  console.info("onClickTime", data);
}
function onClickInterval(data: Timestamp) {
  console.info("onClickInterval", data);
}
function onClickHeadDay(data: Timestamp) {
  console.info("onClickHeadDay", data);
}

function onDragStart(e: DragEvent, item: DragItem) {
  console.info('onDragStart called')
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy'
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('ID', String(item.id))
  }
}

function onDragEnter(e: DragEvent, type: string, { scope }: Scope) {
  console.info('onDragEnter', type, scope)
  e.preventDefault()
  return true
}

function onDragOver(e: DragEvent, type: string, { scope }: Scope) {
  console.info('onDragOver', type, scope)
  e.preventDefault()
  return true
}

function onDragLeave(_e: DragEvent, type: string, { scope }: Scope) {
  console.info('onDragLeave', type, scope)
  return false
}

interface DropEvent extends CustomDragEvent {
  dataTransfer: DataTransfer
}

interface DropScope extends Scope {
  timestamp: Timestamp,
  staff_id: number,
  staff_name: string
}

async function onDrop(e: DropEvent, type: string, { scope }: DropScope): Promise<boolean> {
  console.info("onDrop", type, scope);
  const itemID = parseInt(e.dataTransfer.getData("ID"), 10);
  const item = dragItems.value.filter((item) => item.id === itemID);
  const event = item[0] ? { ...item[0] } : { ...defaultEvent };

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
      staff_name: event.staff_name
    };
    await api.put("/api/service-appointments/"+event.id, payload);
  } catch (error) {
    console.error("Error updating appointments:", error);
    return false;
  }
  events.value.push(event);
  dragItems.value = dragItems.value.filter((item) => item.id !== itemID);
  console.log("events.value", events.value);
  return false;
}

function onIntervalClass({ scope }) {
  return {
    droppable: scope.droppable === true,
  }
}

/// @ts-expect-error ignore
function onWeekdayClass({ scope }) {
  return {
    droppable: scope.droppable === true,
  }
}

const addAppointmentDialog = ref({ visible: false });
const addAppointmentForm = ref({
  booking_time: "",
  booking_date: today(),
  customer_first_name: "",
  customer_last_name: "",
  is_first: false,
  customer_email: "",
  customer_phone: "",
  comments: "",
  customer_service: [
    {
      customer_name: "",
      service: {},
      staff: {},
      comments: "",
    },
  ],
});

const serviceOptions = ref<{ id: number; name: string }[]>([]);
const practitionerOptions = ref<{ id: number; name: string }[]>([]);

async function fetchServiceOptions() {
  try {
    const response = await api.get("/api/services");
    serviceOptions.value = response.data.map((service: any) => ({
      id: service.id,
      name: service.title,
    }));
  } catch (error) {
    console.error("Error fetching services:", error);
  }
}

async function fetchPractitionerOptions() {
  try {
    const response = await api.get("/api/staff");
    practitionerOptions.value = response.data.map((staff: any) => ({
      id: staff.id,
      name: staff.name,
    }));
  } catch (error) {
    console.error("Error fetching practitioners:", error);
  }
}

function showAddAppointmentDialog() {
  addAppointmentDialog.value.visible = true;
}

async function addAppointment() {

  try {
    const payload = {
      ...addAppointmentForm.value,
    };
    await api.post("/api/appointments", payload);
    addAppointmentDialog.value.visible = false;
    fetchAppointments(); // Refresh appointments after adding
  } catch (error) {
    console.error("Error adding appointment:", error);
  }
}
</script>

<style lang="scss" scoped>
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

.bg-green {
  background: green;
}

.bg-orange {
  background: orange;
}

.bg-red {
  background: red;
}

.bg-teal {
  background: teal;
}

.bg-grey {
  background: grey;
}

.bg-purple {
  background: purple;
}

.full-width {
  left: 0;
  width: calc(100% - 2px);
}

.left-side {
  left: 0;
  width: calc(50% - 3px);
}

.right-side {
  left: 50%;
  width: calc(50% - 3px);
}

.rounded-border {
  border-radius: 2px;
}
</style>
