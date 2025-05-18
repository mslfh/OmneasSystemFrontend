<template>
  <q-page padding>
    <q-card v-if="appointment" class="q-pa-md">
      <q-card-section>
        <div class="text-h6">Appointment Details</div>
        <q-btn
          flat
          class=""
          icon="history"
          color="grey"
          label="view history"
          @click="fetchCustomerHistory()"
        />

        <q-btn
        v-if="appointment.status === 'finished'"
          flat
          icon="receipt_long"
          color="grey"
          label="view invoice"
          @click="negativeOrder()"
        />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-list bordered>
          <q-item>
            <q-item-section>
              <strong>Service Title:</strong>
              {{ appointment.services[0]?.service_title }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <strong>Customer Name:</strong>
              {{ appointment.customer_first_name }}
              {{ appointment.customer_last_name }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <strong>Customer Phone:</strong> {{ appointment.customer_phone }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <strong>Customer Email:</strong> {{ appointment.customer_email }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <strong>Booking Time:</strong> {{ appointment.booking_time }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <strong>Status:</strong>
              <q-chip
                :color="
                  appointment.status === 'finished' ? 'teal-4' : 'deep-orange-5'
                "
                text-color="white"
                dense
              >
                {{ appointment.status }}
              </q-chip>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <strong>Actual Start Time:</strong>
              {{ appointment.actual_start_time }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <strong>Actual End Time:</strong>
              {{ appointment.actual_end_time }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="text-h6">Services</div>
        <q-list bordered>
          <q-item v-for="service in appointment.services" :key="service.id">
            <q-item-section>
              <strong>Service Title:</strong> {{ service.service_title }}
            </q-item-section>
            <q-item-section>
              <strong>Duration:</strong> {{ service.service_duration }} minutes
            </q-item-section>
            <q-item-section>
              <strong>Price:</strong> ${{ service.service_price }}
            </q-item-section>
            <q-item-section>
              <strong>Staff:</strong> {{ service.staff_name }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
    <q-card v-else class="q-pa-md">
      <q-card-section>
        <q-spinner color="primary" />
        <span>Loading appointment details...</span>
      </q-card-section>
    </q-card>
  </q-page>

  <q-dialog v-model="isHistoryDialogOpen">
    <q-card :style="$q.screen.gt.md ? 'min-width: 500px' : 'min-width: 100%'">
      <q-card-section horizontal class="q-pl-md q-pt-md">
        <div class="text-h6 text-grey">Customer History</div>
      </q-card-section>
      <q-card-section>
        <q-timeline class="q-pl-md" v-if="customerHistory.length > 0">
          <q-timeline-entry
            v-for="event in customerHistory"
            :key="event.id"
            color="blue-5"
          >
            <div class="text-grey-6">
              <div>
                {{
                  event.services[0].service_title +
                  " | " +
                  event.services[0].service_duration +
                  " Min"
                }}
              </div>
              <div>{{ event.status }}</div>
              <div>{{ event.services[0].customer_name }}</div>
              <div>{{ event.services[0].staff_name }}</div>
              <div>{{ event.services[0].customer_phone }}</div>
              <q-separator class="q-my-sm" color="grey-3" style="height: 1px" />
              <div class="text-grey-7 text-weight-bold text-caption">
                <q-btn
                  size="sm"
                  flat
                  color="orange-4"
                  icon="receipt_long"
                  @click="
                    router.push({
                      path: '/admin/appointment/detail',
                      query: { id: event.appointment_id },
                    })
                  "
                  label="View Order"
                >
                </q-btn>
                <q-btn
                  size="sm"
                  flat
                  color="green-4"
                  icon="list_alt"
                  @click="
                    router.push({
                      path: '/admin/appointment/detail',
                      query: { id: event.id },
                    })
                  "
                  label="View Appointment"
                >
                </q-btn>
              </div>
            </div>
            <template v-slot:subtitle>
              <div class="row q-pa-none">
                <q-lable class="col-9 text-subtitle2">{{
                  event.booking_time.slice(0, 16)
                }}</q-lable>
                <!-- <q-lable class="col-3 text-grey-8"> 2 days ago </q-lable> -->
              </div>
            </template>
          </q-timeline-entry>
        </q-timeline>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useQuasar } from "quasar";
import { onMounted, ref } from "vue";
import { api } from "boot/axios";
import { useRouter,useRoute } from "vue-router";

const route = useRoute();
const router = useRouter();
const appointment = ref(null);
const $q = useQuasar();

const fetchAppointmentDetail = async (id) => {
  try {
    const response = await api.get(`/api/appointments/${id}`);
    appointment.value = response.data;
  } catch (error) {
    console.error("Error fetching appointment details:", error);
  }
};

onMounted(() => {
  const id = route.query.id;
  if (id) {
    fetchAppointmentDetail(id);
  }
});

const isHistoryDialogOpen = ref(false);
const customerHistory = ref([]);

const fetchCustomerHistory = async () => {
  const user_search = appointment.value.customer_phone;
  try {
    const userResponse = await api.get("/api/search-user-by-field", {
      params: { search: user_search },
    });
    if (userResponse.data.length === 1) {
      const userId = userResponse.data[0].id;
      const historyResponse = await api.get("/api/getUserBookingHistory", {
        params: { id: userId },
      });
      customerHistory.value = historyResponse.data;
      $q.notify({
        type: "info",
        message: "Customer history fetched successfully",
        position: "top",
        timeout: 2000,
      });
      isHistoryDialogOpen.value = true;
    } else {
      $q.notify({
        type: "negative",
        message: "No users found with the provided phone number.",
        position: "top",
        timeout: 2000,
      });
    }
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

const negativeOrder = async () => {
  const id = route.query.id;
  try {
    const response = await api.get(`/api/getOrderByAppointment/${id}`);
    const orderId = response.data.id;

    if (orderId) {
      router.push({
        path: "/admin/order/detail",
        query: { id: orderId},
      });
    }
  } catch (error) {
    console.error("Error fetching order details:", error);
  }
};
</script>
