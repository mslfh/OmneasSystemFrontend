<template>
  <q-page padding>
    <q-card v-if="appointment" class="q-pa-md">
      <q-card-section>
        <div class="text-h6">Appointment Details</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-list bordered>
          <q-item>
            <q-item-section>
              <strong>Service Title:</strong> {{ appointment.services[0]?.service_title }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <strong>Customer Name:</strong> {{ appointment.customer_first_name }} {{ appointment.customer_last_name }}
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
                :color="appointment.status === 'finished' ? 'teal-4' : 'deep-orange-5'"
                text-color="white"
                dense
              >
                {{ appointment.status === 'finished' ? 'Finished' : 'Pending' }}
              </q-chip>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <strong>Actual Start Time:</strong> {{ appointment.actual_start_time }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <strong>Actual End Time:</strong> {{ appointment.actual_end_time }}
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
</template>

<script setup>
import { onMounted, ref } from "vue";
import { api } from "boot/axios";
import { useRoute } from "vue-router";

const route = useRoute();
const appointment = ref(null);

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
</script>
