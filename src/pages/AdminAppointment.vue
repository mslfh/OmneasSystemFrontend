<template>
  <div>
    <q-btn
      class="float-left q-ma-md"
      label="Add Appointment"
      color="blue-8"
      @click="
        addAppointmentForm.booking_date = selectedDate;
        addAppointmentForm.booking_time = '';
        addAppointmentForm.customer_service[0].staff = '';
        addAppointmentForm.customer_service[0].service = '';
        showAddAppointmentDialog();
      "
    />
    <div class="float-right text-grey-7 text-weight-bold q-ma-md">
      <q-badge color="teal-5"></q-badge>
      Assigned
      <q-space />
      <q-badge color="deep-orange-3"></q-badge>
      Unassigned
      <q-space />
      <q-badge color="teal-2"></q-badge>
      Progressing
      <q-space />
      <q-badge color="brown-3"></q-badge>
      Completed
      <q-space />
      <q-icon color="teal-4" name="loyalty"> </q-icon>
      By Customer
    </div>

    <div class="text-h6 text-center">
      {{ currentMonth }}
    </div>

    <navigation-bar @today="onToday" @prev="onPrev" @next="onNext" />

    <div class="row">
      <div class="q-mx-sm col-2">
        <div
          class="text-subtitle1 text-weight-bold q-my-md text-brown-9 text-center"
        >
          <q-btn dense flat color="grey-8" icon="calendar_month" size="md">
            <q-badge color="deep-orange" text-color="white" floating>
              {{ dragItems.length }}
            </q-badge>
          </q-btn>
          Waitting List
        </div>
        <ul class="column">
          <li
            v-for="item in dragItems"
            :key="item.id"
            draggable="true"
            @dragstart="onDragStart($event, item)"
          >
            <q-card class="text-subtitle q-mb-sm bg-amber-11" flat bordered>
              <q-icon name="drag_indicator"></q-icon>Time: {{ item.time }} ({{
                item.service_duration
              }}
              min)
              <q-separator></q-separator>
              <q-card-section class="q-pt-none q-pb-none">
                Name: {{ item.customer_name }}
              </q-card-section>
              <q-card-section class="q-pt-none q-pb-none text-caption">
                * {{ item.service_title }}
              </q-card-section>
            </q-card>
          </li>
        </ul>
      </div>

      <div class="col-9" style="display: flex; height: 85vh">
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
          :interval-minutes="10"
          :interval-start="46"
          :interval-count="78"
          :interval-height="28"
          @moved="onMoved"
          @click-date="onClickDate"
          @click-time="onClickTime"
          @click-interval="onClickInterval"
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
                <div @click="scrollToNow()">
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
                    :name="event.status != 'finished'?'drag_indicator':'o_check_circle'"
                    size="20px"
                    class="float-right"
                  />
                </div>
                <div
                  class="q-ml-md q-mt-xs flex items-center"
                  style="height: 75%"
                >
                  <q-list>
                    <q-item-label
                      :class="
                        event.service_duration > 45
                          ? 'text-subtitle2 text-weight-bold'
                          : 'text-subtitle3 text-weight-bold'
                      "
                    >
                      <q-icon
                        v-if="event.status === 'in_progress'"
                        color="white"
                        name="hourglass_top"
                      >
                      </q-icon>
                      Name: {{ event.customer_name }}
                      <q-icon size="13px" v-if="!event.tag && event.status != 'break'" color="white" name="loyalty">
                      </q-icon>
                    </q-item-label>
                    <q-item-label class="text-caption">
                      Time: {{ event.time }} -
                      {{ event.expected_end_time }}
                    </q-item-label>
                    <q-item-label class="text-subtitle">
                      {{ event.service_title }} |
                      {{ event.service_duration }} Min
                      {{ event.service_price? '- $'+event.service_price : '' }}
                    </q-item-label>
                    <q-chip
                      size="10px"
                      v-if="
                        event.status === 'pending' ||
                        event.status === 'unassigned'
                      "
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
                      v-if="
                        event.status != 'break' &&
                        event.status != 'finished'
                      "
                      outline
                      text-color="deep-orange-1"
                      icon="o_verified"
                      clickable
                      @click.stop="finishAppointment(event)"
                    >
                      Done
                    </q-chip>

                    <q-item-label v-if="event.service_duration > 30">
                      Comments:
                      {{ event.comments }}
                    </q-item-label>
                  </q-list>
                </div>
                <q-tooltip>{{
                  event.time +
                  " - " +
                  event.service_title +
                  " | " +
                  event.service_duration +
                  " min"
                }}</q-tooltip>
              </div>
            </template>
          </template>
        </q-calendar-day>
      </div>
    </div>
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
  <q-dialog v-model="addAppointmentDialog.visible">
    <q-card style="min-width: 1000px">
      <div class="row">
        <!--Events -->
        <div class="col-2">
          <q-card-section>
            <q-label style="color: goldenrod" class="text-h5 text-weight-bold">
              <q-icon name="alarm" size="md" />
              {{ addAppointmentForm.booking_time }}
            </q-label>
            <q-btn
              dense
              outline
              style="color: goldenrod"
              class="q-ma-md"
              label="Add Appointment"
            />
            <q-btn
              v-if="
                addAppointmentForm.booking_time !== '' &&
                addAppointmentForm.customer_service[0].service == ''
              "
              dense
              outline
              style="color: teal"
              class="q-ma-md"
              label="Take a break"
              @click="showTakeBreakDialog"
            />
          </q-card-section>
        </div>
        <div class="col-4">
          <div>
            <div class="text-h6 text-grey-8 q-pa-xs">Select Therapist</div>
            <q-chip
              v-for="staff in staffOptions"
              :key="staff.id"
              clickable
              :color="selectedStaff.id === staff.id ? 'orange-2' : 'blue-2'"
              @click="
                () => {
                  selectedStaff.id = staff.id;
                  selectedStaff.name = staff.name;
                  fetchAvailableBookingTime(addAppointmentForm.booking_date);
                }
              "
            >
              {{ staff.name }}
            </q-chip>

            <q-select
              v-model="addAppointmentForm.customer_service[0].service"
              :options="serviceOptions"
              label="* Service"
              option-value="id"
              option-label="name"
              clearable
              @update:model-value="
                fetchAvailableBookingTime(addAppointmentForm.booking_date)
              "
            />
            <q-input
              v-model="addAppointmentForm.booking_date"
              label="Select Date"
              mask="####-##-##"
            >
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="addAppointmentForm.booking_date"
                      mask="YYYY-MM-DD"
                      @update:model-value="
                        fetchAvailableBookingTime(
                          addAppointmentForm.booking_date
                        )
                      "
                    >
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
            <q-label class="text-subtitle2 text-grey-9"> Booking Time</q-label>
            <q-input
              dense
              v-model="addAppointmentForm.booking_time"
              outlined
              type="time"
            />
            <q-separator class="q-my-md" />
            <q-scroll-area style="height: 250px">
              <q-chip
                v-for="item in available_booking_time"
                :key="item"
                clickable
                :icon="
                  addAppointmentForm.booking_time == item
                    ? 'check_circle'
                    : 'o_fiber_manual_record'
                "
                :color="
                  addAppointmentForm.booking_time == item
                    ? 'orange-3'
                    : 'teal-1'
                "
                @click="addAppointmentForm.booking_time = item"
                >{{ item }}</q-chip
              >
            </q-scroll-area>
          </div>
        </div>
        <div class="col-6">
          <q-card-section>
            <q-input
              rounded
              v-model="user_search"
              outlined
              placeholder="Find User by Name, Phone, or Email"
              @keyup.enter="selectUserFromSearch"
            >
              <template v-slot:append>
                <q-icon v-if="user_search === ''" name="search" />
                <q-icon
                  v-else
                  name="clear"
                  class="cursor-pointer"
                  @click="user_search = ''"
                />
              </template>
            </q-input>
            <q-item-label
              v-if="foundUsers.length == 0 && user_search !== ''"
              class="text-caption"
              >No data found</q-item-label
            >
            <q-scroll-area v-if="user_search !== ''" style="height: 100px">
              <q-list>
                <q-item
                  v-for="user in foundUsers"
                  :key="user.id"
                  clickable
                  @click="
                    addAppointmentForm.customer_service[0].customer_name =
                      user.name;
                    addAppointmentForm.customer_first_name = user.first_name;
                    addAppointmentForm.customer_last_name = user.last_name;
                    addAppointmentForm.customer_email = user.email;
                    addAppointmentForm.customer_phone = user.phone;
                  "
                >
                  <q-item-section>
                    <q-item-label>{{ user.name }}</q-item-label>
                    <q-item-label caption>{{ user.phone }}</q-item-label>
                    <q-item-label caption>{{ user.email }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-scroll-area>
            <q-input
              v-model="addAppointmentForm.customer_service[0].customer_name"
              label="Customer Name"
            />
            <q-input
              v-model="addAppointmentForm.customer_first_name"
              label="First Name"
            />
            <q-input
              v-model="addAppointmentForm.customer_last_name"
              label="Last Name"
            />
            <q-input
              v-model="addAppointmentForm.customer_email"
              label="Email"
            />
            <q-input
              v-model="addAppointmentForm.customer_phone"
              label="Phone"
            />
            <q-input
              v-model="addAppointmentForm.customer_service[0].comments"
              label="Service Comments"
            />
            <q-input v-model="addAppointmentForm.comments" label="Comments" />
            <q-label class="text-subtitle1 text-grey-8 text-weight-bold"
              >Save Customer</q-label
            >
            <q-toggle
              v-model="addAppointmentForm.is_first"
              checked-icon="check"
              color="deep-orange"
              unchecked-icon="clear"
            />
          </q-card-section>
        </div>
      </div>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="negative"
          @click="addAppointmentDialog.visible = false"
        />
        <q-btn flat label="Add" color="positive" @click="addAppointment" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Take a Break Dialog -->
  <q-dialog v-model="takeBreakDialog.visible" seamless position="bottom">
    <q-card>
      <q-linear-progress :value="1.0" color="pink" />
      <q-card-section>
        <div class="text-h6">
          Take a Break - {{ addAppointmentForm.booking_time }}
        </div>
        <q-radio
          v-model="takeBreakDialog.selectedDuration"
          val="10"
          label="10 minutes"
          @update:model-value="assumeBreakEvent(10)"
        />
        <q-radio
          v-model="takeBreakDialog.selectedDuration"
          val="20"
          label="20 minutes"
          @update:model-value="assumeBreakEvent(20)"
        />
        <q-radio
          v-model="takeBreakDialog.selectedDuration"
          val="30"
          label="30 minutes"
          @update:model-value="assumeBreakEvent(30)"
        />
        <q-input
          v-model="takeBreakDialog.customDuration"
          label="Custom Duration (minutes)"
          type="number"
          outlined
          dense
          @change="
            takeBreakDialog.selectedDuration = null;
            assumeBreakEvent(takeBreakDialog.customDuration);
          "
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="negative"
          @click="
            assumeBreakEvent(0);
            takeBreakDialog.visible = false;
          "
        />
        <q-btn
          flat
          label="Confirm"
          color="positive"
          @click="confirmTakeBreak"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Edit Event Dialog -->
  <q-dialog v-model="editEventDialog.visible">
    <q-card style="min-width: 850px">
      <q-card-section horizontal class="q-ma-sm">
        <div class="text-h6">Edit Event</div>
        <q-space />
        <q-btn
          flat
          style="color: red"
          icon="delete"
          @click="deleteAppointment()"
        />
      </q-card-section>
      <div class="row q-ma-md">
        <!--Events -->
        <div class="col-4">
          <div>
            <div class="text-h6 text-grey-8 q-pa-xs">Select Therapist</div>
            <q-chip
              v-for="staff in staffOptions"
              :key="staff.id"
              clickable
              :color="selectedStaff.id === staff.id ? 'orange-2' : 'blue-2'"
              @click="
                () => {
                  selectedStaff.id = staff.id;
                  selectedStaff.name = staff.name;
                  fetchAvailableBookingTime(editEventForm.booking_date);
                }
              "
            >
              {{ staff.id == 0 ? "* Waitting List" : staff.name }}
            </q-chip>

            <q-select
              v-model="editEventForm.service"
              :options="serviceOptions"
              label="* Service"
              option-value="id"
              option-label="name"
              clearable
              @update:model-value="
                fetchAvailableBookingTime(editEventForm.booking_date)
              "
            />
            <q-input
              v-model="editEventForm.booking_date"
              label="Select Date"
              mask="####-##-##"
            >
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="editEventForm.booking_date"
                      mask="YYYY-MM-DD"
                      @update:model-value="
                        fetchAvailableBookingTime(editEventForm.booking_date)
                      "
                    >
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
            <div class="q-mb-sm text-weight-bold">
              <q-label class="text-subtitle2 text-grey-9">
                Booking Time:</q-label
              >
              <q-input
                dense
                v-model="editEventForm.booking_time"
                outlined
                type="time"
              />
              <q-separator class="q-my-md" />
            </div>
            <q-scroll-area style="height: 200px">
              <q-chip
                v-for="item in available_booking_time"
                :key="item"
                clickable
                :icon="
                  editEventForm.booking_time == item
                    ? 'check_circle'
                    : 'o_fiber_manual_record'
                "
                :color="
                  editEventForm.booking_time == item ? 'orange-3' : 'teal-1'
                "
                @click="editEventForm.booking_time = item"
                >{{ item }}</q-chip
              >
            </q-scroll-area>
          </div>
        </div>
        <div class="col-6">
          <q-card-section>
            <q-input
              rounded
              v-model="user_search"
              outlined
              placeholder="Find User by Name, Phone, or Email"
              @keyup.enter="selectUserFromSearch"
            >
              <template v-slot:append>
                <q-icon v-if="user_search === ''" name="search" />
                <q-icon
                  v-else
                  name="clear"
                  class="cursor-pointer"
                  @click="user_search = ''"
                />
              </template>
            </q-input>
            <q-item-label
              v-if="foundUsers.length == 0 && user_search !== ''"
              class="text-caption"
              >No data found</q-item-label
            >
            <q-scroll-area v-if="user_search !== ''" style="height: 100px">
              <q-list>
                <q-item
                  v-for="user in foundUsers"
                  :key="user.id"
                  clickable
                  @click="
                    editEventForm.customer_name = user.name;
                    editEventForm.customer_first_name = user.first_name;
                    editEventForm.customer_last_name = user.last_name;
                    editEventForm.customer_email = user.email;
                    editEventForm.customer_phone = user.phone;
                  "
                >
                  <q-item-section>
                    <q-item-label>{{ user.name }}</q-item-label>
                    <q-item-label caption>{{ user.phone }}</q-item-label>
                    <q-item-label caption>{{ user.email }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-scroll-area>
            <q-input
              v-model="editEventForm.customer_name"
              label="Customer Name"
            />
            <q-input
              v-model="editEventForm.customer_first_name"
              label="First Name"
            />
            <q-input
              v-model="editEventForm.customer_last_name"
              label="Last Name"
            />
            <q-input v-model="editEventForm.customer_email" label="Email" />
            <q-input v-model="editEventForm.customer_phone" label="Phone" />
            <q-input v-model="editEventForm.comments" label="Comments" />
          </q-card-section>
        </div>
      </div>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="negative"
          @click="editEventDialog.visible = false"
        />
        <q-btn flat label="Save" color="positive" @click="saveEditedEvent" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Finish Appointment Dialog -->
  <q-dialog v-model="finishAppointmentDialog.visible">
    <q-card style="min-width: 650px">
      <q-card-section horizontal class="q-ma-sm">
        <div class="text-h6">Appointment Details</div>
      </q-card-section>
      <div class="row q-ma-md">
        <!--Events -->
        <div class="col-4 q-pa-xs">
          <div class="text-subtitle2 text-grey-8">
            <q-chip color="blue-2">
              {{ finishAppointmentDialog.event.staff_name }}
            </q-chip>
          </div>
          <q-input
            dense
            v-model="finishAppointmentDialog.event.customer_name"
            readonly
            label="Customer Name"
          />
          <q-input
            dense
            v-model="finishAppointmentDialog.event.service_title"
            label="Service"
            readonly
          />
          <div class="q-mb-sm text-weight-bold">
            <q-input
            v-model="finishAppointmentDialog.event.time"
            dense
            readonly
            label="Booking Time"
          />
          </div>
            <q-separator class="q-my-md" />
          <q-input
            dense
            v-model="finishAppointmentDialog.actual_start_time"
            filled
            type="time"
            label="Started At"
          >
          <template v-slot:prepend>
          <q-icon size="xs" name="hourglass_top" />
        </template>
          </q-input>
          <q-input
            dense
            v-model="finishAppointmentDialog.actual_end_time"
            filled
            type="time"
            label="Ended At"
            >
          <template v-slot:prepend>
          <q-icon size="xs" name="hourglass_bottom" />
        </template>
          </q-input>
        </div>
        <div class="col-1 flex justify-center">
          <q-separator vertical class="q-my-md" style="height: 90%" />
        </div>
        <div class="col-7">
          <q-card-section
            horizontal
            class="q-pa-sm bg-grey-3 text-grey-7 text-weight-bold"
            style="border-radius: 8px"
          >
            <div>Total Price:</div>
            <q-space />
            <q-span>$ {{ finishAppointmentDialog.event.service_price }}</q-span>
          </q-card-section>
          <div class="text-weight-bold text-grey-9 q-mt-md">Payment Method</div>
          <q-card-section horizontal class="text-weight-bold text-grey-7">
            <q-radio
              v-for="method in paymentMethods"
              v-model="finishAppointmentDialog.paymentMethod"
              keep-color
              :unchecked-icon="method.icon"
              :val="method.value"
              :label="method.label"
            />
          </q-card-section>
          <q-card-section class="q-pa-sm text-grey-7">
            <q-input
              v-model="finishAppointmentDialog.paymentAmount"
              label="Payment Amount"
              type="number"
              outlined
              dense
            >
              <template v-slot:prepend>
                <q-icon name="attach_money" />
              </template>
            </q-input>
          </q-card-section>
          <q-card-section class="q-pa-sm text-grey-7">
            Payment Note
            <q-input
              v-model="finishAppointmentDialog.note"
              type="textarea"
              outlined
              dense
            >
            </q-input>
          </q-card-section>
        </div>
      </div>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="negative"
          @click="finishAppointmentDialog.visible = false"
        />
        <q-btn
          flat
          label="Confirm"
          color="positive"
          @click="confirmFinishAppointment"
        />
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
import {
  useQuasar,
  QDialog,
  QCard,
  QCardSection,
  QCardActions,
  QBtn,
} from "quasar";

const $q = useQuasar();
interface Event {
  id: number;
  duration: number;
  staff_id: number;
  staff_name: string;
  date: string;
  time: string;
  expected_end_time: string;
  service_id: number;
  service_title: string;
  service_duration: number;
  service_price: number;
  customer_name: string;
  comments: string;
  bgcolor: string;
  status: string;
  appointment_id: number;
  tag: string;
  actual_start_time: string;
  actual_end_time: string;
}

const calendar = ref<QCalendarDay>();
const selectedDate = ref(today());
const staffList = ref<{ staff_id: number; staff_name: string }[]>([]);
const available_booking_time = ref<string[]>([]);
const serviceOptions = ref<{ id: number; name: string; duration: Number }[]>(
  []
);
const staffOptions = ref<{ id: number; name: string }[]>([]);

onMounted(() => {
  fetchAppointments();
  fetchServiceOptions();
  fetchStaffList();
  setInterval(() => {
    fetchAppointments();
  }, 60000);
});

const events = ref<Event[]>([]);
const dragItems = ref<Event[]>([]);
const defaultEvent = ref<Event[]>([]);

interface CustomDragEvent extends Event {
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

const currentMonth = computed(() => {
  const date = new Date(selectedDate.value);
  return date.toLocaleString("default", {
    weekday: "short",
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
        bookedService.status === "break"
          ? "blue-grey-3"
          : bookedService.status === "in_progress"
          ? "light-teal"
          : bookedService.status === "unassigned"
          ? "peach"
          : bookedService.status === "finished"
          ? "brown-4"
          : "teal-5",
      status: bookedService.status,
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

async function fetchAvailableBookingTime(date: string) {
  try {
    let formattedDate = new Date(date);
    const day = String(formattedDate.getDate()).padStart(2, "0");
    const month = String(formattedDate.getMonth() + 1).padStart(2, "0");
    const year = formattedDate.getFullYear();

    let url = "/api/get-unavailable-time-from-date";
    if (selectedStaff.value.id !== 0) {
      url = "/api/get-unavailable-time-from-staff";
    }
    const response = await api.get(url, {
      params: {
        date: `${year}/${month}/${day}`,
        staff_id: selectedStaff.value.id,
      },
    });
    if (response.data.no_schedule) {
      available_booking_time.value = [];
      return;
    }
    const minTime = response.data.start_time;
    const maxTime = response.data.end_time;
    const unavailable_booking_time = response.data.unavilable_time;

    console.log("Unavailable booking times:", unavailable_booking_time);

    const allTimes = [];
    const startTime = new Date(`1970-01-01T${minTime}:00`);
    const endTime = new Date(`1970-01-01T${maxTime}:00`);
    const timeIncrement = 10;
    for (
      let time = startTime;
      time <= endTime;
      time.setMinutes(time.getMinutes() + timeIncrement)
    ) {
      allTimes.push(time.toTimeString().slice(0, 5)); // Format as HH:mm
    }
    // Check the time  duration
    let duration = addAppointmentForm.value.customer_service[0].service
      ? serviceOptions.value.filter(
          (service) =>
            service.id ===
            addAppointmentForm.value.customer_service[0].service.id
        )[0].duration
      : 0;
    if (duration === 0 && editEventDialog.value.visible) {
      duration = editEventForm.value.service.duration;
    }
    // Filter out unavailable times
    available_booking_time.value = allTimes.filter((time) => {
      return !unavailable_booking_time.some((timeRange) => {
        const startTime = time + ":00";
        let endHour =
          parseInt(startTime.split(":")[0]) + Math.floor(duration / 60); // Changed to let
        let endMinute = parseInt(startTime.split(":")[1]) + (duration % 60);
        if (endMinute >= 60) {
          endMinute -= 60;
          endHour += 1;
        }
        const endTime =
          `${endHour.toString().padStart(2, "0")}:${endMinute
            .toString()
            .padStart(2, "0")}` + ":00";

        return (
          (startTime >= timeRange.start_time &&
            startTime < timeRange.end_time) ||
          (endTime > timeRange.start_time && endTime <= timeRange.end_time) ||
          (startTime < timeRange.start_time && endTime > timeRange.end_time) ||
          endTime > maxTime + ":00"
        );
      });
    });
    if (available_booking_time.value.length === 0) {
      $q.notify({
        type: "warning",
        color: "orange-4",
        message: "No available booking time found.",
      });
    }
  } catch (error) {
    console.log("Error fetching available booking times:", error);
    available_booking_time.value = [];
    $q.notify({
      type: "negative",

      message: "No available booking time for the selected date.",
    });
    return;
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
  addAppointmentForm.value.booking_date = data.date;
  fetchAppointments();
}

const selectedStaff = ref({
  id: 0,
  name: "Any therapist",
});
const selectedTime = ref("");

function onClickTime(data: Timestamp) {
  const staff = staffList.value[data.scope.columnIndex];
  selectedStaff.value.id = staff.staff_id;
  selectedStaff.value.name = staff.staff_name;

  selectedTime.value = data.scope.timestamp.time.slice(0, 4);
  addAppointmentForm.value.booking_date = selectedDate.value;
  addAppointmentForm.value.booking_time = selectedTime.value + "0";
  fetchAvailableBookingTime(selectedDate.value);
  showAddAppointmentDialog();
}

function onClickInterval(data: Timestamp) {
  console.info("onClickInterval", data);
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

const addAppointmentDialog = ref({ visible: false });

const addAppointmentForm = ref({
  booking_time: "",
  booking_date: selectedDate.value,
  customer_first_name: "",
  customer_last_name: "",
  is_first: false,
  customer_email: "",
  customer_phone: "",
  comments: "",
  tag: ["staff_created"],
  customer_service: [
    {
      customer_name: "",
      service: "",
      staff: "",
      comments: "",
    },
  ],
});

const clickTakeBreak = ref(false);

function showAddAppointmentDialog() {
  fetchAvailableBookingTime(selectedDate.value);
  addAppointmentDialog.value.visible = true;
}

async function addAppointment() {
  try {
    if (addAppointmentForm.value.customer_service[0]["service"] === "") {
      $q.notify({
        type: "negative",
        message: "Please select a service",
        position: "top",
        timeout: 2000,
      });
      return;
    }
    // Check if booking time is in the available booking time list
    if (!addAppointmentForm.value.booking_time) {
      $q.notify({
        type: "negative",
        message: "Booking time can not be empty!",
        position: "top",
        timeout: 2000,
      });
      return;
    }

    if (addAppointmentForm.value.customer_service[0]["customer_name"] === "") {
      $q.notify({
        type: "negative",
        message: "Customer Name Can not be empty!",
        position: "top",
        timeout: 2000,
      });
      return;
    }
    if (
      addAppointmentForm.value.is_first &&
      addAppointmentForm.value.customer_phone === ""
    ) {
      $q.notify({
        type: "negative",
        message: "Phone Number can not be empty when saving!",
        position: "top",
        timeout: 2000,
      });
      return;
    }
    addAppointmentForm.value.customer_service[0]["staff"] = selectedStaff.value;

    const payload = {
      ...addAppointmentForm.value,
    };
    const response = await api.post("/api/appointments", payload);

    if (response.status === 201) {
      $q.notify({
        type: "positive",
        message: "Appointment added successfully",
        position: "top",
        timeout: 2000,
      });
    }

    addAppointmentDialog.value.visible = false;
    addAppointmentForm.value = {
      booking_time: "",
      booking_date: selectedDate.value,
      customer_first_name: "",
      customer_last_name: "",
      is_first: false,
      customer_email: "",
      customer_phone: "",
      comments: "",
      tag: ["staff_created"],
      customer_service: [
        {
          customer_name: "",
          service: "",
          staff: "",
          comments: "",
        },
      ],
    };
    available_booking_time.value = [];
    dragItems.value = [];

    fetchAppointments(); // Refresh appointments after adding
  } catch (error) {
    console.error("Error adding appointment:", error);
  }
}

const takeBreakDialog = ref({
  visible: false,
  selectedDuration: null as number | null,
  customDuration: "",
});

function showTakeBreakDialog() {
  addAppointmentDialog.value.visible = false;
  takeBreakDialog.value.visible = true;
}

const assumeEvent = ref<Event>({
  id: 0,
  staff_id: 0,
  staff_name: "",
  date: "",
  time: "",
  expected_end_time: "",
  service_id: null,
  service_title: "Break",
  service_duration: 0,
  service_price: 0,
  customer_name: "",
  comments: "Scheduled break",
  bgcolor: "grey-5",
  status: "break",
  appointment_id: null,
});

function assumeBreakEvent(duration: number) {
  if (assumeEvent.value.id !== 0) {
    events.value.splice(events.value.indexOf(assumeEvent.value), 1);
  }
  if (duration === 0) {
    return;
  }
  const startTime = addAppointmentForm.value.booking_time;
  let [startHour, startMinute] = startTime.split(":").map(Number);
  let minutes = Number(startMinute) + Number(duration);
  if (Number(minutes) >= 60) {
    startHour += 1;
    minutes = minutes % 60;
  }
  console.log("startMinute", startMinute);
  const endTime = `${String(startHour).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}`;
  assumeEvent.value.id = Date.now(); // Temporary unique ID
  assumeEvent.value.staff_id = selectedStaff.value.id;
  assumeEvent.value.staff_name = selectedStaff.value.name;
  assumeEvent.value.customer_name = selectedStaff.value.name;

  assumeEvent.value.date = addAppointmentForm.value.booking_date;
  assumeEvent.value.time = startTime;
  assumeEvent.value.expected_end_time = endTime;
  assumeEvent.value.service_duration = duration;
  events.value.push(assumeEvent.value);
}

async function confirmTakeBreak() {
  const duration =
    takeBreakDialog.value.selectedDuration ||
    parseInt(takeBreakDialog.value.customDuration, 10);
  if (!duration || duration <= 0) {
    $q.notify({
      type: "negative",
      message: "Please select or enter a valid break duration",
      position: "top",
      timeout: 2000,
    });
    return;
  }

  const payload = {
    ...assumeEvent.value,
  };
  const response = await api.post("/api/takeBreakAppointment", payload);
  if (response.status === 201) {
    $q.notify({
      type: "positive",
      message: `Break scheduled successfully`,
      position: "top",
      timeout: 2000,
    });
  }
  //reset the q-radio
  takeBreakDialog.value.selectedDuration = null;

  takeBreakDialog.value.visible = false;
  assumeEvent.value.id = 0; // Reset the ID
  fetchAppointments(); // Refresh appointments after taking a break
}

const editEventDialog = ref({ visible: false });

const editEventForm = ref({
  id: 0,
  booking_date: "",
  booking_time: "",
  customer_name: "",
  service: {},
  staff: {},
  comments: "",
  customer_first_name: "",
  customer_last_name: "",
  customer_phone: "",
  customer_email: "",
});

function openEditEventDialog(event: Event) {
  selectedStaff.value.id = event.staff_id;
  selectedStaff.value.name = event.staff_name;
  editEventForm.value = {
    id: event.appointment_id,
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
  };
  editEventDialog.value.visible = true;
  fetchAvailableBookingTime(event.date);
}

async function saveEditedEvent() {
  try {
    editEventForm.value.staff = selectedStaff.value;
    const payload = { ...editEventForm.value };
    await api.put(`/api/appointments/${payload.id}`, payload);
    editEventDialog.value.visible = false;
    editEventForm.value = {
      id: 0,
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
    // Refresh appointments after editing
    fetchAppointments();
  } catch (error) {
    console.error("Error saving edited event:", error);
  }
}

const user_search = ref("");
const foundUsers = ref<{ id: number; name: string; phone: string }[]>([]);

const selectUserFromSearch = async () => {
  foundUsers.value = [];
  try {
    const response = await api.get("/api/findUserByField", {
      params: { search: user_search.value },
    });
    if (response.data.length > 0) {
      foundUsers.value = response.data.map((user) => ({
        ...user,
      }));
    }
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

const startAppointment = async (event: Event) => {
  // Show confirmation dialog before starting the appointment
  //get the current time
  const start_time = new Date();
  const hours = String(start_time.getHours()).padStart(2, "0");
  const minutes = String(start_time.getMinutes()).padStart(2, "0");
  const formattedTime = `${selectedDate.value} ${hours}:${minutes}`;

  $q.dialog({
    title: "Start Appointment",
    message:
      "Do you want to start this appointment? it will be " + formattedTime.slice(11),
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
};

const finishAppointmentDialog = ref({
  visible: false,
  event: {} as Event,
  paymentMethod: null as string | null,
  paymentAmount: null as number | null,
  start_time: "",
  end_time: "",
  note: "",
});

const paymentMethods = ref([
  { label: "Cash", value: "cash", icon: "payments" },
  {
    label: "Card",
    value: "credit_card",
    icon: "credit_card",
  },
  {
    label: "Voucher",
    value: "voucher",
    icon: "request_page",
  },
  {
    label: "Unpaid",
    value: "unpaid",
    icon: "money_off",
  },
]);

function openFinishAppointmentDialog(event: Event) {
  const start_time = new Date();
  const hours = String(start_time.getHours()).padStart(2, "0");
  const minutes = String(start_time.getMinutes()).padStart(2, "0");
  const formattedTime = `${hours}:${minutes}`;
  finishAppointmentDialog.value.event = event;
  if (event.actual_start_time) {
    finishAppointmentDialog.value.actual_start_time = event.actual_start_time;
  } else {
    finishAppointmentDialog.value.actual_start_time = event.time;
  }
  finishAppointmentDialog.value.actual_end_time = formattedTime;
  finishAppointmentDialog.value.paymentMethod = "credit_card";
  finishAppointmentDialog.value.paymentAmount = event.service_price;
  finishAppointmentDialog.value.visible = true;
}

async function confirmFinishAppointment() {
  if (
    !finishAppointmentDialog.value.paymentMethod ||
    !finishAppointmentDialog.value.paymentAmount
  ) {
    $q.notify({
      type: "negative",
      message: "Please select a payment method and enter the payment amount.",
      position: "top",
      timeout: 2000,
    });
    return;
  }
  //check if the selected date is not today
  if(selectedDate.value != today()){
    $q.notify({
      type: "negative",
      message: "You can only finish the appointment on today.",
      position: "top",
      timeout: 2000,
    });
    return;
  }
  try {
    const status = finishAppointmentDialog.value.paymentMethod === "unpaid" ? "unpaid" : "paid";
    const payload = {
      appointment_id: finishAppointmentDialog.value.event.appointment_id,
      status: status,
      total_amount: finishAppointmentDialog.value.event.service_price,
      actual_start_time:selectedDate.value+' '+finishAppointmentDialog.value.actual_start_time,
      actual_end_time: selectedDate.value+' '+finishAppointmentDialog.value.actual_end_time,
      payment_note: finishAppointmentDialog.value.note,
      payment_method: finishAppointmentDialog.value.paymentMethod,
      paid_amount: finishAppointmentDialog.value.paymentAmount,
      operator_id: finishAppointmentDialog.value.event.staff_id,
      operator_name: finishAppointmentDialog.value.event.staff_name
    };
    await api.post(`/api/orders`, payload);
    $q.notify({
      type: "positive",
      message: "Appointment Comfirmed Successfully",
      position: "top",
      timeout: 2000,
    });
    finishAppointmentDialog.value.visible = false;
    fetchAppointments(); // Refresh appointments after finishing
  } catch (error) {
    console.error("Error finishing appointment:", error);
    $q.notify({
      type: "negative",
      message: "Failed to finish the appointment. Please try again.",
      position: "top",
      timeout: 2000,
    });
  }
}

const finishAppointment = async (event: Event) => {
  openFinishAppointmentDialog(event);
};

async function deleteAppointment() {
  try {
    // Show confirmation dialog
    $q.dialog({
      title: "Delete Appointment",
      message: "Are you sure you want to delete this appointment?",
      cancel: true,
      persistent: true,
    })
      .onOk(() => {
        const response = api.delete(
          `/api/appointments/${editEventForm.value.id}`
        );
        if (response.status === 200) {
          $q.notify({
            type: "positive",
            message: "Appointment deleted successfully",
            position: "top",
            timeout: 2000,
          });
        }
        editEventDialog.value.visible = false;
        fetchAppointments();
      })
      .onCancel(() => {
        console.log("Delete appointment canceled");
      });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    $q.notify({
      type: "negative",
      message: "Failed to delete the appointment. Please try again.",
      position: "top",
      timeout: 2000,
    });
  }
}

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
.unassigned {
  background-color: #ffa95d !important;
}
</style>
