<template>
  <q-dialog
    v-model="sendSmsDialog.visible"
    persistent
    transition-show="scale"
    transition-hide="scale"
    @hide="emit('close')"
  >
    <q-card style="min-width: 500px">
      <q-card-section horizontal class="q-ma-sm">
        <div class="text-h6">Send SMS</div>
        <q-space />
        <q-btn
          size="sm"
          flat
          icon="close"
          color="grey"
          @click="emit('close');"
        />
      </q-card-section>
      <q-card-section>
        <q-label class="text-subtitle1 text-weight-bold text-grey-7 q-ma-sm">
          {{ props.editEventForm.customer_first_name }}
          {{ props.editEventForm.customer_last_name }}
        </q-label>
        <q-input
          class="q-ma-sm"
          v-model="sendSmsDialog.phone"
          label="Phone"
          dense
        />
        <q-input
          class="q-ma-sm"
          v-model="sendSmsDialog.message"
          label="Message"
          type="textarea"
          outlined
          dense
        />
      </q-card-section>
      <q-card-section>
        <q-checkbox size="sm" v-model="sendSmsDialog.is_schedule_time" />
        <q-label class="text-grey-7 text-weight-bold">Scheduled Send</q-label>
        <q-input
          class="q-ma-md"
          v-if="sendSmsDialog.is_schedule_time"
          v-model="sendSmsDialog.schedule_time"
        >
          <template v-slot:prepend>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  v-model="sendSmsDialog.schedule_time"
                  mask="YYYY-MM-DD HH:mm:ss"
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>

          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-time
                  v-model="sendSmsDialog.schedule_time"
                  mask="YYYY-MM-DD HH:mm:ss"
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="negative"
          @click=" emit('close');"
        />
        <q-btn flat label="Send" color="positive" @click="sendSms" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted, defineEmits } from "vue";
import { useQuasar } from "quasar";
import { api } from "boot/axios";

const props = defineProps({
  editEventForm: {
    type: Object,
    required: true,
  },
  selectedDate: {
    type: String,
    required: true,
  },
  reminder_msg_template: {
    type: String,
    required: true,
  }
});

const $q = useQuasar();

const sendSmsDialog = ref({
  visible: true,
  phone: "",
  message: "",
  schedule_time: "", // Added schedule_time field
  is_schedule_time: false,
});
const emit = defineEmits(["close"]);

onMounted(() => {

  sendSmsDialog.value.phone = props.editEventForm.customer_phone;

  sendSmsDialog.value.schedule_time =
    props.selectedDate + " " + props.editEventForm.booking_time + ":00";

  sendSmsDialog.value.message = formatMassage(
    props.reminder_msg_template,
    props.editEventForm
  );
});

function formatMassage(
  template: string,
  event: typeof props.editEventForm
): string {
  const date = new Date(event.booking_date);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const formattedTime = event.booking_time
    ? new Date(`1970-01-01T${event.booking_time}:00`).toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      )
    : "";

  return template
    .replace("{first_name}", event.customer_first_name || "")
    .replace("{last_name}", event.customer_last_name || "")
    .replace("{date}", formattedDate)
    .replace("{time}", formattedTime)
    .replace("{service}", event.service.name || "")
    .replace("{duration}", `${event.service.duration || 0} minutes`)
    .replace("{therapist}", event.staff.name || "Any Therapist");
}


function sendSms() {
  $q.dialog({
    title: "Confirm Send SMS",
    message: "Are you sure to send this SMS?",
    cancel: true,
    persistent: true,
  })
    .onOk(async () => {
      if (!sendSmsDialog.value.phone || !sendSmsDialog.value.message) {
        $q.notify({
          type: "negative",
          message: "Phone and message cannot be empty.",
          position: "top",
          timeout: 2000,
        });
        return;
      }
      try {
        const payload = {
          appointment_id: props.editEventForm.appointment_id,
          customer_name: props.editEventForm.customer_name,
          phone_number: sendSmsDialog.value.phone,
          message: sendSmsDialog.value.message,
          is_schedule_time: sendSmsDialog.value.is_schedule_time,
          schedule_time: sendSmsDialog.value.schedule_time,
        };
        const response = await api.post("/api/sendSms", payload);
        if (response.status === 200) {
          $q.notify({
            type: "positive",
            message: "SMS sent successfully.",
            position: "top",
            timeout: 2000,
          });
        } else {
          $q.notify({
            type: "negative",
            message: "Failed to send SMS.",
            position: "top",
            timeout: 2000,
          });
        }
      } catch (error) {
        console.error("Error sending SMS:", error);
        $q.notify({
          type: "negative",
          message: "Failed to send SMS. Please try again.",
          position: "top",
          timeout: 2000,
        });
      }
      finally{
        emit('close');
      }
    })
    .onCancel(() => {
      emit('close');
    });
}
</script>
