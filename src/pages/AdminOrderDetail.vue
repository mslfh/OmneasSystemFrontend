<template>
  <q-page padding>
    <q-card>
      <q-card-section horizontal class="q-pl-md q-pt-md">
        <div class="text-h6">Order Details</div>
        <q-btn
          flat
          class=""
          icon="receipt_long"
          color="grey"
          label="view invoice"
          @click="
            router.push({
              path: '/admin/invoice',
              query: { id: order.id },
            })
          "
        />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-list>
          <q-item>
            <q-item-section>Order Status:</q-item-section>
            <q-item-section>
              <q-chip :color="getStatusColor(order.order_status)" outline>
                {{ order.order_status }}
              </q-chip>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Payment Status:</q-item-section>
            <q-item-section>
              <q-chip :color="getStatusColor(order.payment_status)" outline>
                {{ order.payment_status }}
              </q-chip>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Payment Method:</q-item-section>
            <q-item-section>{{ order.payment_method }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Total Amount:</q-item-section>
            <q-item-section>${{ order.total_amount }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Paid Amount:</q-item-section>
            <q-item-section>${{ order.paid_amount }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Note:</q-item-section>
            <q-item-section>{{ order.payment_note }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Booking Time:</q-item-section>
            <q-item-section>
              {{
                new Date(order.appointment.booking_time).toLocaleDateString(
                  "en-AU",
                  {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }
                )
              }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Submitted at:</q-item-section>
            <q-item-section>
              {{
                new Date(order.appointment.booking_time).toLocaleDateString(
                  "en-AU",
                  {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }
                )
              }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <q-space />

    <q-card>
      <q-card-section>
        <div class="text-h6">Appointment Details</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-list>
          <q-item>
            <q-item-section>Customer Name:</q-item-section>
            <q-item-section>
              {{ order.appointment.customer_first_name }}
              {{ order.appointment.customer_last_name }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Phone:</q-item-section>
            <q-item-section>{{
              order.appointment.customer_phone
            }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Email:</q-item-section>
            <q-item-section>{{
              order.appointment.customer_email
            }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Booking Time:</q-item-section>
            <q-item-section>{{
              order.appointment.booking_time
            }}</q-item-section>
          </q-item>

          <q-item>
            <q-item-section>Actual Start Time:</q-item-section>
            <q-item-section>{{
              order.appointment.actual_start_time
            }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Actual End Time:</q-item-section>
            <q-item-section>{{
              order.appointment.actual_end_time
            }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Status:</q-item-section>
            <q-item-section>{{ order.appointment.status }}</q-item-section>
          </q-item>
          <q-item
            v-for="(service, index) in order.appointment.services"
            :key="index"
          >
            <q-item-section>Service:</q-item-section>
            <q-item-section>
              <div>
              {{ service.service_title }} - ${{ service.service_price }}
              </div>
              <q-chip size="sm" style="width:60px;">
                {{ service.staff_name }}
              </q-chip>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <q-space v-if="order.payment_method === 'split_payment'" />

    <q-card v-if="order.payment_method === 'split_payment'">
      <q-card-section>
        <div class="text-h6">Payment Details</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-list bordered>
          <q-item v-for="(payment, index) in order.payment" :key="index">
            <q-item-section>
              <div>Payment Method: {{ payment.paid_by }}</div>
              <div>Status: {{ payment.status }}</div>
              <div>Total: ${{ payment.total_amount }}</div>
              <div>Paid: ${{ payment.paid_amount }}</div>
              <div>Remark: {{ payment.remark }}</div>
              <div>
                Paid At:
                {{
                  new Date(payment.created_at).toLocaleDateString("en-AU", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                }}
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { api } from "boot/axios";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const order = ref({
  id: 0,
  appointment: {},
  payment: [],
});

const getStatusColor = (status) => {
  switch (status) {
    case "paid":
    case "Completed":
      return "green";
    case "pending":
      return "orange";
    case "failed":
      return "red";
    default:
      return "grey";
  }
};

const fetchOrderDetails = async () => {
  try {
    const response = await api.get(`/api/orders/${route.query.id}`);
    order.value = response.data;
  } catch (error) {
    console.error("Error fetching order details:", error);
  }
};

onMounted(() => {
  fetchOrderDetails();
});
</script>
