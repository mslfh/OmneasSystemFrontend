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
                  <q-card-section class="q-pa-sm">
                    <div
                      class="text-subtitle1 text-weight-bold q-mt-sm q-mb-xs text-blue-9"
                    >
                      {{ pkg.title }}
                    </div>
                    <div class="text-caption text-grey">
                      {{ pkg.hint }}
                    </div>
                  </q-card-section>

                  <q-card-actions align="right" class="q-pa-none">
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
                      @click="toggleExpanded(pkg.id)"
                    />
                  </q-card-actions>

                  <q-slide-transition>
                    <div v-show="expandedStates[pkg.id]">
                      <q-list bordered>
                        <q-expansion-item
                          v-for="service in pkg.services"
                          :key="service.id"
                          :label="`* ${service.title} | ${service.duration}`"
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
                                    selectedService = service.id;
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

              <!-- Select a Time & Practitioner -->
              <q-step
                :name="2"
                title="Time & Practitioner"
                icon="date_range"
                :done="step > 2"
                :header-nav="step > 2"
              >
                <div class="q-pa-md-md q-pa-none-xs">
                  <div class="text-h6 text-grey-8 q-pb-md">* Select Time</div>
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
                            @update:model-value="selectDate"
                            :events="events"
                            :event-color="(date) => eventColors[date] || ''"
                            :options="dateOptions"
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
                  <!-- time -->
                  <q-input filled v-model="time" mask="time" :rules="['time']">
                    <template v-slot:append>
                      <q-icon name="access_time" class="cursor-pointer">
                        <q-popup-proxy
                          cover
                          transition-show="scale"
                          transition-hide="scale"
                        >
                          <q-time
                            now-btn
                            v-model="time"
                            :landscape="$q.screen.gt.xs"
                            :options="optionsFnTime"
                            @update:model-value="selectTime"
                          >
                            <div class="row items-center justify-end">
                              <q-btn
                                v-close-popup
                                label="Close"
                                color="primary"
                                flat
                              />
                            </div>
                          </q-time>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
                <div class="q-pa-md-md q-pa-none-xs q-gutter-md">
                  <q-separator />
                  <div class="text-h6 text-grey-8 q-pb-md">
                    * Select Practitioner
                  </div>
                  <div class="row q-pa-md-md q-pa-none-xs">
                    <q-chip
                      clickable
                      @click="
                        () => {
                          selectedStaff = '';
                        }
                      "
                      :color="selectedStaff === '' ? 'orange-2' : 'blue-1'"
                      icon="chevron_right"
                    >
                      Any practitioner
                    </q-chip>
                    <q-separator vertical />
                    <q-chip
                      v-for="staff in availableStaff"
                      :key="staff.id"
                      clickable
                      :color="
                        selectedStaff === staff.id ? 'orange-2' : 'blue-2'
                      "
                      @click="
                        () => {
                          selectedStaff = staff.id;
                        }
                      "
                    >
                      <q-avatar>
                        <img src="https://cdn.quasar.dev/img/avatar5.jpg" />
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
                        done2 = true;
                        step = 3;
                      }
                    "
                    class="float-right q-mr-md q-mb-md"
                    color="blue"
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
                    <q-icon name="account_circle"></q-icon> Personal Information
                  </div>
                  <div class="col-10">
                    <q-checkbox
                      keep-color
                      v-model="first_time"
                      label="This is my first time!"
                      label-class="text-h6"
                      color="orange"
                    />
                  </div>
                  <div class="col-5">
                    <q-input
                      dense
                      outlined
                      class="full-width"
                      v-model="name.first_name"
                      label="First Name *"
                    />
                  </div>
                  <div class="col-5">
                    <q-input
                      dense
                      outlined
                      class="full-width"
                      v-model="name.last_name"
                      label="Last Name *"
                    />
                  </div>
                  <!-- email -->
                  <div class="col-10">
                    <q-input
                      outlined
                      v-model="email"
                      input-class="text-right"
                      label-slot
                      clearable
                    >
                      <template v-slot:label>
                        <div class="row items-center all-pointer-events">
                          <q-icon
                            class="q-mr-xs"
                            color="deep-orange"
                            size="24px"
                            name="mail"
                          />
                          Email Address
                        </div>
                      </template>
                    </q-input>
                  </div>
                  <!-- phone -->
                  <div class="col-10">
                    <q-input
                      outlined
                      v-model="phone"
                      input-class="text-right"
                      label-slot
                      clearable
                    >
                      <template v-slot:label>
                        <div class="row items-center all-pointer-events">
                          <q-icon
                            class="q-mr-xs"
                            color="deep-orange"
                            size="24px"
                            name="phone_iphone"
                          />
                          Phone Number

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
                  <!-- travel -->
                  <div class="col-10">
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
                        <q-icon name="place" @click.stop />
                      </template>
                    </q-select>
                  </div>

                  <div class="col-10"><q-separator /></div>

                  <div class="col-10 text-h6 text-grey-7">
                    <q-icon name="info"></q-icon> Extra Information
                  </div>

                  <div class="col-10">
                    <q-input
                      label="Any comments"
                      v-model="comments"
                      outlined
                      type="textarea"
                    />
                  </div>

                  <div class="col-10 q-pa-md">
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
                        done3 = true;
                        step = 4;
                      }
                    "
                    class="float-right q-mr-md q-mb-md"
                    color="blue"
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
                  <q-card class="col-12 col-md-6 col-lg-6 q-mb-md"> </q-card>
                  <div class="col-12">
                    <q-item-label header class="text-h6"
                      >Booking Summary</q-item-label
                    >
                    <q-item class="full-width">
                      <q-item-section>
                        <q-icon name="explore"></q-icon>
                        <q-item-label>
                          Aim Remedial Massage 141 Penquite Road Newstead, TAS
                          7250
                        </q-item-label>
                        <q-item-label caption>Caption</q-item-label>
                      </q-item-section>
                      <q-item-section side> $10.99 </q-item-section>
                    </q-item>
                    <q-separator></q-separator>
                    <q-item class="full-width">
                      <q-item-section>
                        <q-item-label lines="1">Product 2</q-item-label>
                        <q-item-label caption>Caption Product 2</q-item-label>
                      </q-item-section>
                      <q-item-section side> $19.99 </q-item-section>
                    </q-item>
                    <q-separator></q-separator>
                    <q-item class="full-width">
                      <q-item-section>
                        <q-item-label lines="1">Product 3</q-item-label>
                        <q-item-label caption>Caption Product 3</q-item-label>
                      </q-item-section>
                      <q-item-section side> $78.99 </q-item-section>
                    </q-item>
                    <q-separator></q-separator>
                    <q-item class="full-width">
                      <q-item-section>
                        <q-item-label lines="1">Product 4</q-item-label>
                        <q-item-label caption>Caption Product 4</q-item-label>
                      </q-item-section>
                      <q-item-section side> $178.99 </q-item-section>
                    </q-item>
                    <q-separator></q-separator>

                    <q-item class="full-width">
                      <q-item-section>
                        <q-item-label lines="1">Shipping</q-item-label>
                      </q-item-section>
                      <q-item-section side> Free </q-item-section>
                    </q-item>
                    <q-separator></q-separator>
                    <q-item
                      class="full-width"
                      style="border-top: 3px dotted blue"
                    >
                      <q-item-section>
                        <q-item-label lines="1">Total</q-item-label>
                      </q-item-section>
                      <q-item-section side> $288.96 </q-item-section>
                    </q-item>
                  </div>
                </div>

                <q-card class="rounded-borders">
                  <q-card-section horizontal>
                    <q-card-section class="col-5 q-pt-xs">
                      <div class="text-h6 text-center">Shipping</div>
                      <div class="text-subtitle1">Pratik Patel</div>
                      <div class="text-subtitle2">4841 Johnston Locks</div>
                    </q-card-section>
                    <q-card-section class="col-7 q-pt-xs">
                      <div class="text-h6 text-center">Payment details</div>
                      <div class="text-subtitle1 q-mb-xs">Card type - Visa</div>
                      <div class="text-subtitle1 q-mb-xs">
                        Card holder - P***ik Patel
                      </div>
                      <div class="text-subtitle1 q-mb-xs">
                        Card Number - xxxx-xxxx-xxxx-1234
                      </div>
                      <div class="text-subtitle1 q-mb-xs">
                        Expiry date - 04/2012
                      </div>
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
                    color="blue"
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
            <q-card class="bg-grey-2 no-shadow" bordered>
              <q-card-section class="text-center text-h6 text-black">
                <q-icon name="shopping_cart" class="q-mr-sm" />
                Order Summary
              </q-card-section>
              <q-card-section horizontal>
                <q-card-section class="col-5 flex flex-center">
                  <q-img
                    height="80px"
                    class="rounded-borders"
                    src="https://cdn.quasar.dev/img/parallax2.jpg"
                  />
                </q-card-section>
                <q-card-section class="">
                  <div class="text-subtitle2 q-mt-sm">Product 1</div>
                  <div class="text-subtitle2 q-mb-xs">$10.99</div>
                </q-card-section>
              </q-card-section>
              <q-separator />
              <q-card-section horizontal class="q-pa-none">
                <q-card-section class="col-5 flex flex-center">
                  <q-img
                    height="80px"
                    class="rounded-borders"
                    src="https://cdn.quasar.dev/img/parallax2.jpg"
                  />
                </q-card-section>
                <q-card-section class="">
                  <div class="text-subtitle2 q-mt-md">Product 2</div>
                  <div class="text-subtitle2 q-mb-xs">$19.99</div>
                </q-card-section>
              </q-card-section>
              <q-separator />

              <q-separator></q-separator>
              <q-card-section class="row">
                <div class="col-12 text-h6 full-width">
                  <div class="float-right q-mr-md">
                    Total : <span class="text-blue">$288.96</span>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-page>
      <q-page-sticky
        v-if="$q.screen.lt.sm"
        position="bottom-right"
        :offset="[10, 20]"
      >
        <q-btn round icon="checklist" direction="up" color="purple-4"> </q-btn>
      </q-page-sticky>
    </div>
    <div v-if="!$q.screen.lt.sm" class="col-2"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { comment } from "postcss";
const VITE_API_URL = import.meta.env.VITE_API_URL;

// ***Book from service List page
// import { useProductStore } from "../stores/ProductStore";
// const productStore = useProductStore();
// const selectedProduct = productStore.selectedProduct;
// console.log(selectedProduct);
const packages = ref([]);
const selectedService = ref("");

const step = ref(1);
const expandedStates = ref({}); // Object to track expanded state for each card

const toggleExpanded = (pkgId) => {
  expandedStates.value[pkgId] = !expandedStates.value[pkgId];
};

const date = ref(new Date().toLocaleDateString("en-CA").replace(/-/g, "/")); // Default to today's date in Y/m/d format

const availableStaff = ref([]);
const dateOptions = ref([]);
const events = ref([]);
const selectedStaff = ref("");
const eventColors = ref({}); // Change to an object to map dates to colors

onMounted(async () => {
  try {
    var response = await axios.get(VITE_API_URL + "/api/packages-with-service");
    packages.value = response.data;

    response = await axios.get(VITE_API_URL + "/api/get-available-shedules");
    if (response.data.length > 0) {
      response.data.forEach((element) => {
        dateOptions.value.push(element.date); // Corrected syntax
        events.value.push(element.date);
        eventColors.value[element.date] =
          element.status === "nearFull" ? "orange" : "teal";
      });
    }
    refreshStaff();
  } catch (error) {
    console.error("Error fetching packages:", error);
  }
});

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

const selectDate = () => {
  const response = axios.get(
    VITE_API_URL + "/api/get-unavailable-time-from-date",
    {
      params: {
        date: date.value,
      },
    }
  );
  if (response.data) {
    unavailabelTime.value = response.data;
  }

  refreshStaff();
};

const time = ref("10:00");
const unavailabelTime = ref([]);

const optionsFnTime = (hr, min, sec) => {
  if (hr < 9 || hr > 18) {
    return false;
  }
  if (unavailabelTime.value.length > 0) {
    const time = `${hr}:${min}`;
    for (let i = 0; i < unavailabelTime.value.length; i++) {
      if (unavailabelTime.value[i].time === time) {
        return false;
      }
    }
  }
  return true;
};

const selectTime = async () => {
  try {
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
          customer_name: name.value.first_name + ' ' + name.value.last_name,
          service_id: selectedService.value,
          staff_id: selectedStaff.value,
          staff_name: selectedStaff.value,
          comments: comments.value,
        },
      ],
    };

    const response = await axios.post(
      VITE_API_URL + "/api/make-appointment",
      payload
    );

    if (response.status === 200) {
      console.log("Appointment successfully created:", response.data);
      // Optionally, redirect or show a success message
    } else {
      console.error("Failed to create appointment:", response.data);
    }
  } catch (error) {
    console.error("Error submitting appointment:", error);
  }
};
</script>

<style scoped></style>
