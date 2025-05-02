<template>
<q-btn
  class="q-mr-xl float-right"
  label="Download"
  icon="download"
  color="primary"
  :disable="loading"
  @click="exportAsImage"
/>
  <!-- <q-btn
      class="q-mb-md"
      label="Print Invoice"
      color="primary"
      icon="print"
      @click="$q.print({ el: '.q-card' })"
    /> -->
  <q-page class="q-pa-md flex flex-center" >
    <q-card ref="captureArea" v-if="order" class="q-pa-md" style="width: 60%">
      <q-card-section/>
      <q-card-section/>
      <q-card-section class="text-center">
        <div class="text-h6">Mia's Massage Therapy</div>
        <div>Phone: +61 466 605 855</div>
        <div>ABN: 90644867112</div>
        <div>
          Mia's Massage Therapy, Shop2, 198 Charles Street, Launceston, 7250,
          Tasmania
        </div>
      </q-card-section>
      <q-card-section class="text-center">
        <div class="text-h6">Tax Invoice {{ '1' + no }}</div>
        <div>{{ formattedDate(order.created_at) }}</div>
      </q-card-section>
      <q-separator />
      <q-card-section class="text-subtitle1">
        <div class="text-weight-bold">Client</div>
        <div>{{ clientName }}</div>
        <div class="text-caption text-grey"> {{ clientPhone }}</div>
        <div class="text-caption text-grey"> {{ clientEmail }}</div>
      </q-card-section>
      <q-separator />
      <q-card-section class="text-subtitle1">
        <div
          v-for="(service, index) in order.appointment?.services || []"
          :key="index"
        >
          <div class="row justify-between">
            <div>{{ service.service_title }}</div>
            <div style="text-align: right">${{ service.service_price }}</div>
          </div>
          <div class="text-caption text-grey">
            {{ formattedDate(service.booking_time) }}
          </div>

          <q-separator v-if="index < order.appointment.services.length - 1" />
        </div>
      </q-card-section>
      <q-separator />
      <!-- <q-card-section>
        <div class="text-subtitle1">Payment Details</div>
        <div v-for="(payment, index) in order.payment" :key="index">
          <div><strong>Method:</strong> {{ payment.payment_method }}</div>
          <div><strong>Status:</strong> {{ payment.payment_status }}</div>
          <div><strong>Amount:</strong> ${{ payment.total_amount }}</div>
          <q-separator v-if="index < order.payment.length - 1" />
        </div>
      </q-card-section> -->
      <q-card-section>
        <div class="row justify-between">
          <div>Subtotal </div>
          <div style="text-align: right">${{ subtotal }}</div>
        </div>
        <div class="row justify-between">
          <div>GST 10% </div>
          <div style="text-align: right">${{ gst }}</div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="row justify-between">
          <div>Total</div>
          <div style="text-align: right">${{ total }}.00</div>
        </div>
      </q-card-section>
      <q-separator />
      <q-separator />
      <q-card-section>
      <div class="row justify-between text-weight-bold text-subtitle1">
          <div>Balance</div>
          <div style="text-align: right">${{ total }}.00</div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section/>
      <q-card-section class="text-center">
        <div class="text-subtitle1">EFT Bank Details</div>
        <div>BSB:082 514  Acc:70 795 2371</div>
      </q-card-section>
      <q-card-section/>
      <q-card-section/>
      <q-card-section/>
    </q-card>
    <div v-else>
      <q-banner type="warning" class="q-mt-md">
        No order details available.
      </q-banner>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import html2canvas from 'html2canvas'
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { useRoute } from "vue-router";

const $q = useQuasar();
const route = useRoute();
const order = ref({});
const orderId = route.query.id;
const loading = ref(true);
onMounted(() => {
  if (!orderId) {
    console.error("No order ID provided in the route query.");
    return;
  }
  api
    .get(`/api/orders/${orderId}`)
    .then((response) => {
      order.value = response.data;
    })
    .catch((error) => {
      console.error("Error fetching order details:", error);
      $q.notify({
        type: "negative",
        message: "Failed to fetch order details.",
      });
    }).finally(() => {
      loading.value = false;
    });
});

// Computed properties for invoice data
const formattedDate = (time) => {
  const date = new Date(time);
  return date.toLocaleString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const clientName = computed(() => {
  const appointment = order.value.appointment || {};
  return `${appointment.customer_first_name || ""} ${
    appointment.customer_last_name || ""
  }`.trim();
});

const clientPhone = computed(
  () => order.value.appointment?.customer_phone || " "
);
const clientEmail = computed(
  () => order.value.appointment?.customer_email || " "
);

const no = computed(() => ( order.value.id || "").toString().padStart(5, "0"));

const subtotal = computed(() => (total.value - total.value * 0.1).toFixed(2));
const gst = computed(() => (total.value * 0.1).toFixed(2));
const total = computed(() => order.value.total_amount || 0);
const paidAmount = computed(() =>
  order.value.payment
    ?.reduce((sum, payment) => sum + parseFloat(payment.paid_amount || 0), 0)
    .toFixed(2)
);
const captureArea = ref(null)
const exportAsImage = async () => {
  if (loading.value) {
    console.warn("Data not ready for export.");
    return;
  }

  await nextTick(); // 确保 DOM 渲染完成

  if (!captureArea.value || !captureArea.value.$el) {
    console.error("Capture area is not available.");
    return;
  }

  try {
    const canvas = await html2canvas(captureArea.value.$el || captureArea.value);
    const dataURL = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "invoice.png";
    link.click();
  } catch (error) {
    console.error("Error capturing the image:", error);
    $q.notify({
      type: "negative",
      message: "Failed to export the invoice as an image.",
    });
  }
};

</script>
