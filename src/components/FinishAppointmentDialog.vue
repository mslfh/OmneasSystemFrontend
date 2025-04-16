<template>
  <q-dialog v-model="visible">
    <q-card style="min-width: 600px">
      <q-card-section>
        <div class="text-h6">Finish Appointment</div>
        <div>
          <q-item-label>Name: {{ event.customer_name }}</q-item-label>
          <q-item-label>Service: {{ event.service_title }}</q-item-label>
          <q-item-label>Duration: {{ event.service_duration }} min</q-item-label>
          <q-item-label>Start Time: {{ event.time }}</q-item-label>
          <q-item-label>End Time: {{ event.expected_end_time }}</q-item-label>
        </div>
      </q-card-section>
      <q-card-section>
        <q-select
          v-model="paymentMethod"
          :options="paymentMethods"
          label="Payment Method"
          outlined
          dense
        />
        <q-input
          v-model="paymentAmount"
          label="Payment Amount"
          type="number"
          outlined
          dense
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="negative" @click="onCancel" />
        <q-btn flat label="Confirm" color="positive" @click="onConfirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue";

defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  event: {
    type: Object,
    required: true,
  },
  paymentMethods: {
    type: Array,
    required: true,
  },
});

defineEmits(["update:visible", "confirm"]);

const paymentMethod = ref(null);
const paymentAmount = ref(null);

function onCancel() {
  paymentMethod.value = null;
  paymentAmount.value = null;
  emit("update:visible", false);
}

function onConfirm() {
  if (!paymentMethod.value || !paymentAmount.value) {
    this.$q.notify({
      type: "negative",
      message: "Please select a payment method and enter the payment amount.",
      position: "top",
      timeout: 2000,
    });
    return;
  }
  emit("confirm", { paymentMethod: paymentMethod.value, paymentAmount: paymentAmount.value });
  emit("update:visible", false);
}
</script>
