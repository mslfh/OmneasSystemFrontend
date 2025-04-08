<template>
  <div class="row bg-grey-1">
    <div class="col-md-2 col-sm-0 col-xs-0"></div>
    <div class="col-md-9 col-sm-12 col-xs-12">
      <q-page class="q-pa-sm q-ma-md">
        <!-- notice -->
        <!-- <q-card class="q-mb-md">
      <q-card-header>
        <div
          style="height: 10px; border-radius: 5px 5px 0px 0px"
          class="bg-red-3"
        ></div>
      </q-card-header>
      <q-card-section>
        <div class="text-h8">Before booking, please read.</div>
      </q-card-section>
    </q-card> -->

        <q-breadcrumbs
          class="text-grey q-pb-md"
          gutter="2px"
          active-color="blue"
        >
          <template v-slot:separator>
            <q-icon size="1.2em" name="arrow_forward" color="grey" />
          </template>
          <q-breadcrumbs-el
            label="Service"
            :icon="step === 1 ? 'hourglass_bottom' : 'task_alt'"
          />
          <q-breadcrumbs-el
            v-if="step >= 2"
            label="Time"
            :icon="step === 2 ? 'hourglass_bottom' : 'task_alt'"
          />
          <q-breadcrumbs-el
            v-if="step >= 3"
            label="Info"
            :icon="step === 3 ? 'hourglass_bottom' : 'task_alt'"
          />
          <q-breadcrumbs-el
            v-if="step == 4"
            label="Confirm"
            icon="hourglass_bottom"
          />
        </q-breadcrumbs>

        <div class="row q-col-gutter-sm">
          <!-- steper -->
          <div class="col-md-8 col-sm-12 col-xs-12">
            <q-stepper
              v-model="step"
              header-nav
              ref="stepper"
              color="primary"
              class="no-shadow"
              bordered
              animated
              :contracted="$q.screen.lt.md"
            >
              <!-- Select a service -->
              <q-step
                :name="1"
                title="Service"
                icon="shopping_cart"
                :done="step > 1"
                :header-nav="step > 1"
              >
                <!-- Service List -->
                <q-card
                  flat
                  bordered
                  class="q-mb-md"
                  v-for="pkg in packages"
                  :key="pkg.id"
                >
                  <q-card-section
                    class="q-pa-sm"
                    @click="toggleExpanded(pkg.id)"
                  >
                    <div
                      class="text-subtitle1 text-weight-bold q-mt-sm q-mb-xs text-blue-9"
                    >
                      {{ pkg.title }}
                    </div>
                    <div class="text-caption text-grey">
                      {{ pkg.hint }}
                    </div>
                  </q-card-section>

                  <q-card-actions
                    align="right"
                    class="q-pa-none"
                    @click="toggleExpanded(pkg.id)"
                  >
                    <q-btn
                      color="grey"
                      round
                      flat
                      dense
                      :icon="
                        expandedStates[pkg.id]
                          ? 'keyboard_arrow_up'
                          : 'keyboard_arrow_down'
                      "
                    />
                  </q-card-actions>

                  <q-slide-transition>
                    <div v-show="expandedStates[pkg.id]">
                      <q-list bordered>
                        <q-expansion-item
                          v-for="service in pkg.services"
                          :key="service.id"
                          :label="`* ${service.title} | ${service.duration} Minutes`"
                          expand-icon="add"
                          expanded-icon="keyboard_arrow_up"
                          header-class="text-primary text-subtitle1 text-weight-medium"
                        >
                          <q-card>
                            <q-card-section class="q-pt-none q-pb-none">
                              <div
                                class="text-subtitle2 text-weight-regular text-grey-7"
                              >
                                {{ service.description }}
                              </div>
                              <div align="right">
                                <q-span
                                  class="text-subtitle1 text-weight-bold text-grey-8"
                                >
                                  ${{ service.price }}
                                </q-span>
                              </div>
                            </q-card-section>
                            <q-card-actions align="right" class="q-pa-none">
                              <q-btn
                                color="primary"
                                flat
                                dense
                                icon="arrow_forward"
                                label="Book Now"
                                @click="
                                  () => {
                                    done1 = true;
                                    step = 2;
                                    selectedService = service;
                                  }
                                "
                              />
                            </q-card-actions>
                          </q-card>
                        </q-expansion-item>
                      </q-list>
                    </div>
                  </q-slide-transition>
                </q-card>
              </q-step>

              <!-- Select a Time & Therapist -->
              <q-step
                :name="2"
                title="Time & Therapist"
                icon="date_range"
                :done="step > 2"
                :header-nav="step > 2"
              >
                <div class="q-pa-md-md q-pa-none-xs">
                  <div class="text-h6 text-grey-8 q-pb-md">
                    <q-icon name="o_alarm" /> Select Time
                  </div>
                  <!-- date picker -->
                  <q-input filled v-model="date" mask="date" :rules="['date']">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy
                          ref="qDateProxy"
                          cover
                          transition-show="scale"
                          transition-hide="scale"
                        >
                          <q-date
                            v-model="date"
                            :landscape="$q.screen.gt.xs"
                            @update:model-value="fetchUnavailabelTime"
                            :events="events"
                            event-color="teal"
                            :options="dateOptionsFn"
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
                  <!-- time picker -->
                  <div
                    class="q-mb-xl bg-grey-2 q-pa-sm"
                    style="
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                    "
                  >
                    <div class="time-picker">
                      <!-- 选择小时 -->
                      <el-select
                        v-model="selectedHour"
                        clearable
                        placeholder="HH"
                        style="width: 85px"
                        @change="handleTimeChange(true)"
                      >
                        <el-option
                          v-for="hour in hours"
                          :key="hour"
                          :label="
                            hour > 11
                              ? hour == 12
                                ? '12 pm'
                                : (hour % 12) + ' pm'
                              : hour + ' am'
                          "
                          :value="hour"
                          :disabled="isHourUnavailable(hour)"
                        />
                      </el-select>
                      ：
                      <!-- 选择分钟 -->
                      <el-select
                        v-model="selectedMinute"
                        clearable
                        placeholder="MM"
                        style="width: 85px"
                        @change="handleTimeChange(false)"
                      >
                        <el-option
                          v-for="minute in minutes"
                          :key="minute"
                          :label="minute"
                          :value="minute"
                          :disabled="isMinuteUnavailable(minute)"
                        />
                      </el-select>
                    </div>
                    <div>
                      <q-icon name="schedule" size="25px" color="grey-8" />
                    </div>
                  </div>
                </div>
                <div class="q-pa-md-md q-pa-none-xs q-gutter-md">
                  <q-separator />
                  <div class="text-h6 text-grey-8 q-pb-xs">
                    <q-icon name="favorite_border" /> Select Therapist
                  </div>
                  <div v-if="availableStaff.length == 0">
                    <q-chip
                      class="q-mb-xm"
                      color="deep-orange-2"
                      icon="hourglass_bottom"
                      label="No therapist available at this time."
                    />
                  </div>
                  <div
                    v-if="availableStaff.length != 0"
                    class="row q-pa-md-md q-pa-none-xs"
                  >
                    <q-chip
                      clickable
                      @click="
                        () => {
                          selectedStaff.id = '';
                        }
                      "
                      :color="selectedStaff.id === '' ? 'orange-2' : 'blue-1'"
                      icon="chevron_right"
                    >
                      Any therapist
                    </q-chip>
                    <q-separator vertical />
                    <q-chip
                      v-for="staff in availableStaff"
                      :key="staff.id"
                      clickable
                      :color="
                        selectedStaff.id === staff.id ? 'orange-2' : 'blue-2'
                      "
                      @click="
                        () => {
                          selectedStaff.id = staff.id;
                          selectedStaff.name = staff.name;
                          selectedStaff.profile_photo_url =
                            staff.profile_photo_url;
                          selectedStaff.position = staff.position;
                        }
                      "
                    >
                      <q-avatar>
                        <img :src="staff.profile_photo_url" />
                      </q-avatar>
                      {{ staff.name }}
                    </q-chip>
                  </div>
                </div>
                <q-stepper-navigation>
                  <q-btn
                    rounded
                    @click="
                      () => {
                        if (availableStaff.length == 0 || !time || !date) {
                          $q.notify({
                            message: 'No therapist available at this time.',
                            color: 'red-4',
                            icon: 'error',
                            position: 'top',
                            timeout: 3000,
                          });
                          return;
                        } else {
                          done2 = true;
                          step = 3;
                        }
                      }
                    "
                    class="float-right q-mr-md q-mb-md"
                    color="blue-9"
                    label="Next"
                  />
                  <q-btn
                    flat
                    @click="step = 1"
                    color="primary"
                    rounded
                    label="Back"
                    class="q-mr-sm float-right"
                  />
                </q-stepper-navigation>
              </q-step>

              <!-- Client Details -->
              <q-step
                :name="3"
                title="Details"
                icon="edit_note"
                :done="step > 3"
                :header-nav="step > 3"
              >
                <div class="row q-gutter-md">
                  <div class="col-10 text-h6 text-grey-7">
                    <q-icon name="o_account_circle"></q-icon> Personal
                    Information
                  </div>
                  <div class="col-10">
                    <q-checkbox
                      keep-color
                      v-model="first_time"
                      label="This is my first time!"
                      label-class="text-h6"
                      color="teal"
                    />
                  </div>

                  <!-- <div class="col-10">
                    <q-checkbox
                      keep-color
                      v-model="first_time"
                      label="Store my profile"
                      label-class="text-h6"
                      color="teal"
                    />
                  </div> -->
                  <div class="col-5">
                    <q-input
                      dense
                      outlined
                      class="full-width"
                      v-model="name.first_name"
                      label="First Name *"
                      :rules="[(val) => !!val]"
                    />
                  </div>
                  <div class="col-5">
                    <q-input
                      dense
                      outlined
                      class="full-width"
                      v-model="name.last_name"
                      label="Last Name *"
                      :rules="[(val) => !!val]"
                    />
                  </div>
                  <!-- phone -->
                  <div class="col-10 q-mt-xs">
                    <q-input
                      outlined
                      v-model="phone"
                      input-class="text-right"
                      label-slot
                      clearable
                      mask="#### ### ###"
                      :rules="[(val) => !!val || 'Phone Number is required']"
                    >
                      <template v-slot:label>
                        <div class="row items-center all-pointer-events">
                          <q-icon
                            class="q-mr-xs"
                            color="teal"
                            size="24px"
                            name="o_phone_iphone"
                          />
                          * Phone Number

                          <q-tooltip
                            class="bg-grey-8"
                            anchor="top left"
                            self="bottom left"
                            :offset="[0, 8]"
                            >Mobile phone</q-tooltip
                          >
                        </div>
                      </template>
                    </q-input>
                  </div>
                  <!-- email -->
                  <div class="col-10 q-mt-xs">
                    <q-input
                      outlined
                      v-model="email"
                      type="email"
                      input-class="text-right"
                      label-slot
                      clearable
                    >
                      <template v-slot:label>
                        <div class="row items-center all-pointer-events">
                          <q-icon
                            class="q-mr-xs"
                            color="teal"
                            size="24px"
                            name="o_mail"
                          />
                          Email Address
                        </div>
                      </template>
                    </q-input>
                  </div>

                  <!-- travel -->
                  <div class="col-10" hidden>
                    <q-select
                      outlined
                      bottom-slots
                      v-model="travel_info"
                      :options="travel_options"
                      label=" About Your Travels"
                      :dense="dense"
                      :options-dense="denseOpts"
                    >
                      <template v-slot:prepend>
                        <q-icon name="o_place" color="teal" @click.stop />
                      </template>
                    </q-select>
                  </div>

                  <div class="col-10"><q-separator /></div>

                  <div class="col-10 text-h6 text-grey-7">
                    <q-icon name="o_info"></q-icon> Extra Information
                  </div>

                  <div class="col-10">
                    <q-input
                      label="Any comments"
                      v-model="comments"
                      outlined
                      type="textarea"
                    />
                  </div>

                  <div class="col-10 q-pa-md" hidden>
                    <q-item-label class="text-subtitle1">
                      * Tick the following that best describes what you are
                      experiencing?
                    </q-item-label>
                    <q-option-group
                      :options="tick_options"
                      type="checkbox"
                      v-model="tick_group"
                    />
                  </div>
                </div>

                <q-stepper-navigation>
                  <q-btn
                    rounded
                    @click="
                      () => {
                        if (!name.first_name || !name.last_name || !phone) {
                          $q.notify({
                            message: 'Please fill in all required fields.',
                            color: 'red-4',
                            icon: 'error',
                            position: 'top',
                            timeout: 3000,
                          });
                          return;
                        }
                        done3 = true;
                        step = 4;
                      }
                    "
                    class="float-right q-mr-md q-mb-md"
                    color="blue-9"
                    label="Next"
                  />
                  <q-btn
                    flat
                    @click="step = 2"
                    color="primary"
                    rounded
                    label="Back"
                    class="q-mr-sm float-right"
                  />
                </q-stepper-navigation>
              </q-step>

              <!-- Order Confirm -->
              <q-step
                :name="4"
                title="Confirm"
                icon="receipt"
                :header-nav="step > 4"
              >
                <div class="row">
                  <q-card v-if="$q.screen.lt.sm" class="bg-grey-1 no-shadow">
                    <q-card-section horizontal outlined>
                      <q-card-section>
                        <div class="text-subtitle text-weight-bold">
                          Mia's Massage Launceston
                        </div>
                        <q-label class="text-weight-bold text-orange-10"
                          >4.9</q-label
                        >
                        <q-rating
                          :value="ratingModel"
                          color="orange-6"
                          readonly
                        />
                        <div class="text-caption text-grey-9 q-mt-xs">
                          Shop 2, 198-216 Charles Street, Launceston
                        </div>
                      </q-card-section>
                    </q-card-section>
                  </q-card>
                  <div class="col-12 q-pa-md-md q-pa-none-xs">
                    <q-item-label header class="text-h6"
                      >Booking Summary</q-item-label
                    >
                    <q-item class="full-width q-pa-md-md">
                      <q-item-section>
                        <q-item-label class="text-subtitle2">
                          <q-icon
                            class="q-mr-xs-md"
                            name="o_spa"
                            size="20px"
                            color="grey-8"
                          />
                          {{ selectedService.title }}
                        </q-item-label>
                        <q-item-label caption>{{
                          selectedService.description
                        }}</q-item-label>
                      </q-item-section>
                      <q-item-section side
                        >$ {{ selectedService.price }}
                      </q-item-section>
                    </q-item>
                    <q-separator></q-separator>

                    <q-item class="full-width q-pa-md-md">
                      <q-item-section>
                        <q-item-label lines="1" class="text-subtitle2">
                          <q-icon
                            class="q-mr-xs-md"
                            name="o_person"
                            size="22px"
                            color="grey-8"
                          />
                          {{
                            selectedStaff.id
                              ? selectedStaff.name
                              : "Any therapist"
                          }}
                        </q-item-label>
                        <q-item-label caption v-if="selectedStaff.id">{{
                          selectedStaff.position
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-separator></q-separator>
                    <q-item class="full-width q-pa-md-md">
                      <q-item-section>
                        <q-item-label class="text-subtitle2">
                          <q-icon
                            class="q-mr-xs-md"
                            name="o_calendar_month"
                            size="20px"
                            color="grey-8"
                          />
                          {{
                            showTime(time) +
                            " - " +
                            showTime(getEndTime()) +
                            ", " +
                            showDate()
                          }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-separator></q-separator>
                    <q-item class="full-width q-pa-md-md">
                      <q-item-section>
                        <q-item-label lines="1" class="text-subtitle2">
                          <q-icon
                            class="q-mr-xs-md"
                            name="o_description"
                            size="20px"
                            color="grey-8"
                          />
                          Booking Notes
                        </q-item-label>
                        <q-item-label caption>{{
                          comments == ""
                            ? "You don't write any comments."
                            : comments
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-separator></q-separator>
                    <q-item class="full-width">
                      <q-item-section>
                        <q-item-label class="text-subtitle2 text-weight-bold">
                          Total</q-item-label
                        >
                      </q-item-section>
                      <q-item-section
                        side
                        class="text-subtitle1 text-black text-weight-bold"
                      >
                        $ {{ selectedService.price }}
                      </q-item-section>
                    </q-item>
                  </div>
                </div>

                <q-card class="rounded-borders shadow-1">
                  <q-card-section :horizontal="!$q.screen.lt.sm">
                    <q-card-section class="col-md-12 col-xs-12 q-pt-xs">
                      <div
                        class="text-subtitle1 text-weight-bold text-grey-7 text-center"
                      >
                        Client Details
                      </div>
                      <div class="text-subtitle2 text-weight-bold">
                        {{ name.first_name + " " + name.last_name }}
                      </div>
                      <div class="text-subtitle3">Email: {{ email }}</div>
                      <div class="text-subtitle3">Phone: {{ phone }}</div>
                    </q-card-section>
                  </q-card-section>
                </q-card>

                <q-stepper-navigation>
                  <q-btn
                    rounded
                    @click="
                      () => {
                        done4 = true;
                        submitAppointment();
                      }
                    "
                    class="float-right q-mr-md q-mb-md"
                    color="blue-9"
                    label="Confirm"
                  />
                  <q-btn
                    flat
                    @click="step = 3"
                    color="primary"
                    rounded
                    label="Back"
                    class="q-mr-sm float-right"
                  />
                </q-stepper-navigation>
              </q-step>
            </q-stepper>
          </div>
          <!--summary -->
          <div v-if="!$q.screen.lt.sm" class="col-4">
            <q-card class="bg-grey-1 no-shadow" bordered>
              <SummaryContent
                :ratingModel="ratingModel"
                :selectedService="selectedService"
                :selectedStaff="selectedStaff"
                :time="time"
                :showDate="showDate"
                :showTime="showTime"
                :availableStaff="availableStaff"
                @editService="step = 1"
                @editDate="step = 2"
                @editTherapist="step = 2"
              />
            </q-card>
          </div>
        </div>
      </q-page>
      <q-page-sticky
        v-if="$q.screen.lt.sm"
        position="bottom-right"
        :offset="[10, 20]"
      >
        <q-btn
          round
          icon="checklist"
          direction="up"
          color="teal-4"
          @click="showSummaryDialog = true"
        ></q-btn>
      </q-page-sticky>

      <q-dialog v-model="showSummaryDialog">
        <q-card class="bg-grey-1 no-shadow" bordered>
          <SummaryContent
            :ratingModel="ratingModel"
            :selectedService="selectedService"
            :selectedStaff="selectedStaff"
            :time="time"
            :showDate="showDate"
            :showTime="showTime"
            :availableStaff="availableStaff"
            @editService="step = 1"
            @editDate="step = 2"
            @editTherapist="step = 2"
          />
        </q-card>
      </q-dialog>
    </div>
    <div v-if="!$q.screen.lt.sm" class="col-2"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { comment } from "postcss";
import SummaryContent from "../components/SummaryContent.vue";
import { useQuasar } from "quasar";
import { ElTimePicker, ElDialog } from "element-plus";

const $q = useQuasar();
const VITE_API_URL = import.meta.env.VITE_API_URL;

// ***Book from service List page
// import { useProductStore } from "../stores/ProductStore";
// const productStore = useProductStore();
// const selectedProduct = productStore.selectedProduct;
// console.log(selectedProduct);
const packages = ref([]);
const ratingModel = ref(4.5);

const selectedService = ref([]);

const step = ref(2);
const expandedStates = ref({}); // Object to track expanded state for each card

const toggleExpanded = (pkgId) => {
  expandedStates.value[pkgId] = !expandedStates.value[pkgId];
};

const date = ref(new Date().toLocaleDateString("en-CA").replace(/-/g, "/")); // Default to today's date in Y/m/d format
const showDate = () => {
  const dateObj = new Date(date.value);
  const options = { weekday: "long", day: "numeric", month: "long" };
  return dateObj.toLocaleDateString("en-US", options);
};
const getEndTime = () => {
  if (!time.value || !selectedService.value.duration) {
    return "";
  }

  const [hours, minutes] = time.value.split(":").map(Number);
  console.log("time", hours, minutes);
  const duration = selectedService.value.duration; // Assuming duration is in minutes
  const endTime = new Date();
  endTime.setHours(hours);
  endTime.setMinutes(minutes + duration);

  return endTime.toTimeString().slice(0, 5); // Return in HH:mm format
};

const availableStaff = ref([]);
const events = ref([]);
const selectedStaff = ref({
  id: "",
  name: "",
  profile_photo_url: "",
  position: "",
});

onMounted(async () => {
  try {
    var response = await axios.get(VITE_API_URL + "/api/packages-with-service");
    packages.value = response.data;

    response = await axios.get(VITE_API_URL + "/api/get-available-shedules");
    if (response.data.length > 0) {
      response.data.forEach((element) => {
        events.value.push(element.date);
      });
    }
    fetchUnavailabelTime();
    refreshStaff();
  } catch (error) {
    console.error("Error fetching packages:", error);
  }
});

const dateOptionsFn = (date) => {
  const today = new Date();
  const threeMonthsLater = new Date(today);
  threeMonthsLater.setMonth(today.getMonth() + 3);

  const formatDate = (d) =>
    `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
      d.getDate()
    ).padStart(2, "0")}`;

  const formattedToday = formatDate(today);
  const formattedThreeMonthsLater = formatDate(threeMonthsLater);

  // Get the min and max dates from the events list
  const minEventDate = events.value.length > 0 ? events.value[0] : null;
  const maxEventDate =
    events.value.length > 0 ? events.value[events.value.length - 1] : null;

  // Check if the date is within the range of today and three months later
  const isWithinThreeMonths =
    date >= formattedToday && date <= formattedThreeMonthsLater;

  // If the date is within the events range, restrict to only those in events
  if (
    minEventDate &&
    maxEventDate &&
    date >= minEventDate &&
    date <= maxEventDate
  ) {
    return events.value.includes(date);
  }

  // Allow dates beyond the events range but within three months
  return isWithinThreeMonths;
};

const refreshStaff = async () => {
  const response = await axios.get(
    VITE_API_URL + "/api/get-available-staff-from-scheduletime",
    {
      params: {
        date: date.value,
        time: time.value,
      },
    }
  );
  if (response.data.length > 0) {
    availableStaff.value = response.data;
  } else {
    availableStaff.value = [];
  }
};

const fetchUnavailabelTime = async () => {
  try {
    const response = await axios.get(
      VITE_API_URL + "/api/get-unavailable-time-from-date",
      {
        params: {
          date: date.value,
        },
      }
    );
    if (response.data) {
      unavailableTime.value = response.data.map((timeRange) => ({
        start: timeRange.start_time,
        end: timeRange.end_time,
      }));
    }
    console.log("Unavailable time:", unavailableTime.value);
    time.value = "";
    selectedHour.value = "";
    selectedMinute.value = "";
    refreshStaff();
  } catch (error) {
    console.error("Error fetching unavailable time:", error);
  }
};

const time = ref("");

const unavailableTime = ref([]);

const selectedHour = ref("");
const selectedMinute = ref("");
const showTimePickerDialog = ref(false);

const openingTime = ref({
  start: "08:00",
  end: "19:00",
});
const hours = computed(() => {
  const availableHours = [];
  const startHour = parseInt(openingTime.value.start.split(":")[0]);
  const endHour = parseInt(openingTime.value.end.split(":")[0]);
  for (let i = startHour; i < endHour; i++) {
    const hour = `${i < 10 ? "0" : ""}${i}`;
    availableHours.push(hour);
  }
  return availableHours;
});

// 可用的分钟范围：0, 10, 20, 30, 40, 50
const minutes = [
  "00",
  "05",
  "10",
  "15",
  "20",
  "25",
  "30",
  "35",
  "40",
  "45",
  "50",
  "55",
];

// 判断选中的小时是否不可用
const isHourUnavailable = (hour: string) => {
  const duration = selectedService.value.duration ?? 0;
  return unavailableTime.value.some((timeRange) => {
    const startTime = hour + ":00:00";
    let endHour = parseInt(startTime.split(":")[0]) + Math.floor(duration / 60); // Changed to let
    let endMinute = parseInt(startTime.split(":")[1]) + (duration % 60);
    if (endMinute >= 60) {
      endMinute -= 60;
      endHour += 1;
    }
    const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
      .toString()
      .padStart(2, "0")}:00`;
    const { start, end } = timeRange;
    return (
      (startTime >= timeRange.start && startTime < timeRange.end) ||
      (endTime > timeRange.start && endTime < timeRange.end) ||
      (startTime <= timeRange.start && endTime > timeRange.end)
    );
  });
};

// 判断选中的分钟是否不可用
const isMinuteUnavailable = (minute: string) => {
  const duration = selectedService.value.duration ?? 0;
  const hour = selectedHour.value;
  const startTime = hour + ":" + minute + ":00";
  // Calculate end time based on duration
  let endHour = parseInt(startTime.split(":")[0]) + Math.floor(duration / 60); // Changed to let
  let endMinute = parseInt(startTime.split(":")[1]) + (duration % 60);
  if (endMinute >= 60) {
    endMinute -= 60;
    endHour += 1;
  }
  const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
    .toString()
    .padStart(2, "0")}:00`;

  // Check if the selected time is within any of the unavailable time ranges
  return unavailableTime.value.some((timeRange) => {
    return (
      (startTime >= timeRange.start && startTime < timeRange.end) ||
      (endTime > timeRange.start && endTime <= timeRange.end) ||
      (startTime <= timeRange.start && endTime >= timeRange.end)
    );
  });
};

const handleTimeChange = async (isHourChange) => {
  try {
    if (isHourChange) {
      selectedMinute.value = "";
    }
    time.value = `${selectedHour.value}:${selectedMinute.value}`;
    refreshStaff();
  } catch (error) {
    console.error("Error fetching available staff:", error);
  }
};

const first_time = ref(false);
const email = ref("");
const phone = ref("");
const comments = ref("");
const travel_info = ref(null);
const name = ref({});
const travel_options = [
  { label: "11I live in Launceston and feel well today.", value: "option1" },
  { label: "22I live in Launceston and feel well today.", value: "option2" },
  { label: "33I live in Launceston and feel well today.", value: "option3" },
];
const dense = ref(false);
const denseOpts = ref(false);

const tick_group = ref([]);

const tick_options = [
  { label: "Battery too low", value: "bat" },
  { label: "Friend request", value: "friend", color: "green" },
  { label: "Picture uploaded", value: "upload", color: "red" },
];
const router = useRouter();

const submitAppointment = async () => {
  try {
    const payload = {
      booking_date: date.value,
      booking_time: time.value,
      customer_first_name: name.value.first_name,
      customer_last_name: name.value.last_name,
      is_first: first_time.value,
      customer_email: email.value,
      customer_phone: phone.value,
      comments: comments.value,
      tag: tick_group.value,
      customer_service: [
        {
          customer_name: name.value.first_name + " " + name.value.last_name,
          service_id: selectedService.value.id,
          staff_id: selectedStaff.value.id,
          staff_name: selectedStaff.value.name,
          comments: comments.value,
        },
      ],
    };

    const response = await axios.post(
      VITE_API_URL + "/api/make-appointment",
      payload
    );

    if (response.status === 201) {
      console.log("Appointment created successfully:", response.data);

      return;

      // Reset form fields
      selectedService.value = [];
      showSummaryDialog.value = false;
      // step.value = 1;
      // Navigate to appointment page
      $q.notify({
        message: "Appointment booked successfully!",
        color: "green",
        icon: "check_circle",
        position: "top",
        timeout: 3000,
      });
      router.push({
        path: "/appointment",
        query: {
          id: response.data.id,
        },
      });
    } else {
      console.error("Failed to create appointment:", response.data);
    }
  } catch (error) {
    console.error("Error submitting appointment:", error);
  }
};

const showSummaryDialog = ref(false);

const showTime = (time) => {
  if (!time || time.includes("undefined")) {
    return ""; // Return empty string if time is invalid
  }
  let hour = time.split(":")[0]; // Changed from const to let
  const minute = time.split(":")[1];
  if (hour > 12) {
    hour = hour - 12;
    return hour + ":" + minute + " PM";
  } else if (hour == 12) {
    return hour + ":" + minute + " PM";
  } else {
    return hour + ":" + minute + " AM";
  }
};
</script>

<style scoped></style>
