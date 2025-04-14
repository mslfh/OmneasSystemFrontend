<template>
  <div class="row bg-grey-1">
    <div class="col-md-4 col-sm-0 col-xs-0"></div>
    <div class="col-md-4 col-sm-12 col-xs-12">
      <q-page class="q-pa-sm q-ma-md">
        <q-breadcrumbs class="text-grey" gutter="2px" active-color="blue">
          <template v-slot:separator>
            <q-icon size="1.2em" name="arrow_forward" color="grey" />
          </template>
          <q-breadcrumbs-el
            label="Appointment"
            :icon="step === 1 ? 'hourglass_bottom' : 'task_alt'"
          />
        </q-breadcrumbs>

        <q-card class="bg-grey-1 shadow-1 rounded-borders q-mt-lg">
          <q-card-section horizontal outlined>
            <q-card-section class="col-4 flex flex-center">
              <q-img
                height="90px"
                class="rounded-borders"
                src="src/assets/miamassage.png"
              />
            </q-card-section>
            <q-card-section>
              <div class="text-h6 text-weight-bold">
                Mia's Massage Launceston
              </div>
              <q-label class="text-weight-bold text-orange-10">4.9</q-label>
              <q-rating :value="ratingModel" color="orange-6" readonly />
              <div class="text-subtitle text-grey-9 q-mt-xs">
                Shop 2, 198-216 Charles Street, Launceston
              </div>
            </q-card-section>
          </q-card-section>

          <div class="col-12 q-pa-md-md q-pa-none-xs">
            <q-item-label header class="text-h6">Booking Summary</q-item-label>
            <q-item class="full-width q-pa-md-md">
              <q-item-section>
                <q-item-label class="text-subtitle1">
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
                <q-item-label lines="1" class="text-subtitle1">
                  <q-icon
                    class="q-mr-xs-md"
                    name="o_person"
                    size="22px"
                    color="grey-8"
                  />
                  {{ selectedStaff.id ? selectedStaff.name : "Any therapist" }}
                </q-item-label>
                <q-item-label caption v-if="selectedStaff.id">{{
                  selectedStaff.position
                }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator></q-separator>
            <q-item class="full-width q-pa-md-md">
              <q-item-section>
                <q-item-label class="text-subtitle1">
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
                <q-item-label lines="1" class="text-subtitle1">
                  <q-icon
                    class="q-mr-xs-md"
                    name="o_description"
                    size="20px"
                    color="grey-8"
                  />
                  Booking Notes
                </q-item-label>
                <q-item-label caption>{{
                  comments == "" ? "You don't write any comments." : comments
                }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator></q-separator>
            <q-item class="full-width">
              <q-item-section>
                <q-item-label class="text-subtitle1 text-weight-bold">
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
          <q-card-section class="col-md-12 col-xs-12 q-pa-md">
            <div class="text-h6 text-weight-bold text-grey-7">
              Client Details
            </div>
            <div class="text-subtitle1 text-weight-bold">
              {{ name.first_name + " " + name.last_name }}
            </div>
            <div class="text-subtitle2">Email: {{ email }}</div>
            <div class="text-subtitle2">Phone: {{ phone }}</div>
          </q-card-section>
          <q-card-section class="col-md-12 col-xs-12 q-pt-xs" align="right">
            <!-- <q-btn
              class="q-mt-md"
              color="teal-4"
              label="Reschedule"
              icon="edit"
              @click="reschedule"
            /> -->
            <!-- <q-btn
              class="q-mt-md"
              color="teal-4"
              label="Cancel"
              @click="cancelAppointment"
            /> -->
          </q-card-section>
        </q-card>
      </q-page>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { useQuasar } from "quasar";
import { useRouter, useRoute } from "vue-router"; // Import useRouter and useRoute
import axios from "axios";

const $q = useQuasar();
const router = useRouter(); // Use useRouter for navigation
const route = useRoute(); // Use useRoute for accessing route information
const VITE_API_URL = import.meta.env.VITE_API_URL;
const appointmentId = route.query.id;

const selectedService = ref({
  title: "",
  description: "",
  price: 0,
});
const selectedStaff = ref({
  id: "",
  name: "",
  position: "",
  duration: 0,
});
const time = ref("");
const date = ref("");
const comments = ref("");
const name = ref({
  first_name: "",
  last_name: "",
});
const email = ref("");
const phone = ref("");

onMounted(async () => {
  try {
    // Extract the id from the query
    if (!appointmentId) {
      console.error("No appointment ID provided in the route query.");
      return;
    }
    const response = await axios.get(
      `${VITE_API_URL}/api/appointments/${appointmentId}`
    );
    const data = response.data;
    // Populate Booking Summary
    const service = data.services[0];
    selectedService.value = {
      title: service.service_title,
      description: service.service_description,
      price: service.service_price,
      duration: service.service_duration,
    };
    if(response.data.status == "unassigned"){
      service.staff_id = 0;
    }
    selectedStaff.value = {
      id: service.staff_id,
      name: service.staff_name || "Any therapist",
      position: "", // No position data in the API response
    };
    time.value = service.booking_time.split(" ")[1]; // Extract time from booking_time
    date.value = service.booking_time.split(" ")[0]; // Extract date from booking_time
    comments.value = data.comments || "";
    name.value = {
      first_name: data.customer_first_name,
      last_name: data.customer_last_name,
    };
    email.value = data.customer_email || "N/A";
    phone.value = data.customer_phone;
  } catch (error) {
    console.error("Error fetching appointment data:", error);
  }
});

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

const exportAsImage = () => {};

const cancelAppointment = async () => {
  try {
    if (!appointmentId) {
      console.error("No appointment ID provided for cancellation.");
      return;
    }
    const response = await axios.put(
      `${VITE_API_URL}/api/cancel-appointments/${appointmentId}`
    );
    console.log("Appointment cancelled:", response.data);
    $q.notify({
      message: "Appointment cancelled successfully! You can book again.",
      color: "green",
      icon: "check_circle",
      position: "top",
      timeout: 3000,
    });
    router.push({
      path: "/", // Navigate to the booking page
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    $q.notify({
      message: "Failed to cancel the appointment.",
      color: "red",
      icon: "error",
      position: "top",
      timeout: 3000,
    });
  }
};
</script>

<style scoped></style>
