<template>
  <q-dialog
    v-model="finishAppointmentDialog.visible"
    transition-show="scale"
    transition-hide="scale"
    @hide="emit('close')"
  >
    <q-card style="min-width: 650px">
      <q-card-section horizontal class="q-ma-sm">
        <div class="text-h6">Appointment Details</div>
        <q-space />
        <q-btn
          size="sm"
          flat
          icon="close"
          color="grey"
          @click="emit('close')"
        />
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
          <q-card-section class="text-weight-bold text-grey-7">
            <q-radio
              v-for="method in paymentMethods"
              v-model="finishAppointmentDialog.paymentMethod"
              keep-color
              :unchecked-icon="method.icon"
              :val="method.value"
              :label="method.label"
              @update:model-value="handlePaymentMethodChange"
            />
            <div
              v-if="finishAppointmentDialog.paymentMethod === 'split_payment'"
            >
              <div class="row">
                <div class="col-6 text-weight-bold text-grey-9 q-mt-md">
                  Split Payments
                </div>
                <div class="text-grey-6 q-mt-md">
                  Total: ${{
                    finishAppointmentDialog.splitPayments.reduce(
                      (sum, payment) => sum + (payment.amount || 0),
                      0
                    )
                  }}
                  , Unpaid: ${{
                    Math.max(
                      0,
                      finishAppointmentDialog.event.service_price -
                        finishAppointmentDialog.splitPayments.reduce(
                          (sum, payment) => sum + (payment.amount || 0),
                          0
                        )
                    )
                  }}
                </div>
              </div>
              <div
                v-for="(
                  payment, index
                ) in finishAppointmentDialog.splitPayments"
                :key="index"
                class="row items-center q-my-sm"
              >
                <q-select
                  v-model="payment.method"
                  :options="
                    paymentMethods.filter((m) => m.value !== 'split_payment')
                  "
                  label="Payment Method"
                  option-value="value"
                  option-label="label"
                  dense
                  outlined
                  class="col-6"
                />
                <q-input
                  v-model.number="payment.amount"
                  label="$ Amount"
                  type="number"
                  dense
                  outlined
                  class="col-4"
                />
                <q-btn
                  icon="delete"
                  color="deep-orange"
                  flat
                  dense
                  @click="removeSplitPayment(index)"
                  class="col-2"
                />
              </div>
              <q-btn
                label="Add Payment"
                icon="add"
                color="blue"
                flat
                dense
                @click="addSplitPayment"
              />
            </div>
          </q-card-section>
          <q-card-section
            class="q-pa-sm text-grey-7"
            v-if="finishAppointmentDialog.paymentMethod != 'split_payment'"
          >
            <q-input
              v-show="finishAppointmentDialog.paymentMethod !== 'unpaid'"
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
        <q-btn flat label="Cancel" color="negative" @click="emit('close')" />
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
import { today } from "@quasar/quasar-ui-qcalendar";
import { ref, defineProps, onMounted, defineEmits  } from "vue";
import { useQuasar } from "quasar";
import { api } from "boot/axios";

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
  selectedDate: {
    type: String,
    required: true,
  },
});

const $q = useQuasar();

const emit = defineEmits(["close"]);

const finishAppointmentDialog = ref({
  visible: false,
  event: {},
  paymentMethod: null as string | null,
  paymentAmount: null as number | null,
  start_time: "",
  end_time: "",
  note: "",
  status: "",
  splitPayments: [] as { method: string; amount: number }[],
});

const paymentMethods = ref([
  {
    label: "Eftpos",
    value: "eft_pos",
    icon: "credit_card",
  },
  { label: "Cash", value: "cash", icon: "o_payments" },
  {
    label: "Bank Transfer",
    value: "bank_transfer",
    icon: "o_paid",
  },
  // {
  //   label: "Gift card",
  //   value: "gift_card",
  //   icon: "redeem",
  // },
  {
    label: "Hicaps",
    value: "hicaps",
    icon: "o_account_balance",
  },
  {
    label: "Split Payment",
    value: "split_payment",
    icon: "o_price_change",
  },
  {
    label: "Unpaid",
    value: "unpaid",
    icon: "money_off",
  },
]);

onMounted(() => {
  const start_time = new Date();
  const hours = String(start_time.getHours()).padStart(2, "0");
  const minutes = String(start_time.getMinutes()).padStart(2, "0");
  const formattedTime = `${hours}:${minutes}`;
  finishAppointmentDialog.value.event = props.event;
  if (props.event.actual_start_time) {
    finishAppointmentDialog.value.actual_start_time =
      props.event.actual_start_time;
  } else {
    finishAppointmentDialog.value.actual_start_time = props.event.time;
  }
  finishAppointmentDialog.value.actual_end_time = formattedTime;
  finishAppointmentDialog.value.paymentMethod = "eft_pos";
  finishAppointmentDialog.value.paymentAmount = props.event.service_price;
  finishAppointmentDialog.value.visible = true;
});

function handlePaymentMethodChange(value: string) {
  if (value === "unpaid") {
    finishAppointmentDialog.value.paymentAmount = 0;
  } else if (value === "split_payment") {
    finishAppointmentDialog.value.splitPayments = [{ method: "", amount: 0 }];
  } else {
    finishAppointmentDialog.value.paymentAmount =
      finishAppointmentDialog.value.event.service_price;
    finishAppointmentDialog.value.splitPayments = [];
  }
}

function addSplitPayment() {
  finishAppointmentDialog.value.splitPayments.push({ method: "", amount: 0 });
}

function removeSplitPayment(index: number) {
  finishAppointmentDialog.value.splitPayments.splice(index, 1);
}

async function confirmFinishAppointment() {
  if (!finishAppointmentDialog.value.paymentMethod) {
    $q.notify({
      type: "negative",
      message: "Please select a payment method.",
      position: "top",
      timeout: 2000,
    });
    return;
  }
  //check if the selected date is not today
  if (props.selectedDate != today()) {
    $q.notify({
      type: "negative",
      message: "You can only finish the appointment on today.",
      position: "top",
      timeout: 2000,
    });
    return;
  }
  try {
    // Check if payment method is split_payment
    if (finishAppointmentDialog.value.paymentMethod === "split_payment") {
      // Check if all split payments have a method and amount
      for (const payment of finishAppointmentDialog.value.splitPayments) {
        if (!payment.method || payment.amount <= 0) {
          $q.notify({
            type: "negative",
            message: "Please fill in all split payment details.",
            position: "top",
            timeout: 2000,
          });
          return;
        }
      }
      if (
        finishAppointmentDialog.value.splitPayments.reduce(
          (sum, payment) => sum + payment.amount,
          0
        ) !== finishAppointmentDialog.value.event.service_price
      ) {
        $q.notify({
          type: "negative",
          message: "Split payments do not match the total amount.",
          position: "top",
          timeout: 2000,
        });
        return;
      }
      // Check if split_payment has unpaid method
      const hasUnpaid = finishAppointmentDialog.value.splitPayments.some(
        (payment) => payment.method.value === "unpaid"
      );
      finishAppointmentDialog.value.status = hasUnpaid
        ? "pending"
        : "paid";
      //paymentAmount is the total paid amount of split payments except unpaid
      finishAppointmentDialog.value.paymentAmount =
        finishAppointmentDialog.value.splitPayments.reduce(
          (sum, payment) =>
            payment.method.value !== "unpaid" ? sum + payment.amount : sum,
          0
        );
    } else if (finishAppointmentDialog.value.paymentMethod === "unpaid") {
      finishAppointmentDialog.value.status = "pending";
    } else {
      finishAppointmentDialog.value.status = "paid";
    }

    const payload = {
      appointment_id: finishAppointmentDialog.value.event.appointment_id,
      order_status: finishAppointmentDialog.value.status,
      total_amount: finishAppointmentDialog.value.event.service_price,
      actual_start_time:
        props.selectedDate +
        " " +
        finishAppointmentDialog.value.actual_start_time,
      actual_end_time:
        props.selectedDate +
        " " +
        finishAppointmentDialog.value.actual_end_time,
      payment_note: finishAppointmentDialog.value.note,
      payment_method: finishAppointmentDialog.value.paymentMethod,
      paid_amount: finishAppointmentDialog.value.paymentAmount,
      operator_id: finishAppointmentDialog.value.event.staff_id,
      operator_name: finishAppointmentDialog.value.event.staff_name,
      split_payment:
        finishAppointmentDialog.value.paymentMethod === "split_payment"
          ? finishAppointmentDialog.value.splitPayments
          : [],
    };
    await api.post(`/api/orders`, payload);
    $q.notify({
      type: "positive",
      message: "Appointment Comfirmed Successfully",
      position: "top",
      timeout: 2000,
    });
    finishAppointmentDialog.value.visible = false;
    emit("close");
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
</script>
