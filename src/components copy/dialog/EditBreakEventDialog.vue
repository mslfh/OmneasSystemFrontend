<template>
  <q-dialog
    v-model="editTakeBreakDialog.visible"
    position="bottom"
    transition-show="scale"
    transition-hide="scale"
    @hide="emit('close')"
  >
    <q-card>
      <q-linear-progress :value="1.0" color="pink" />
      <q-card-section>
        <div class="text-h6">
          {{ props.editEventForm.staff.name + " 's " }} Break
        </div>
        <q-input
          label="From"
          type="time"
          v-model="editTakeBreakDialog.payload.time"
        />
        <div class="text-subtitle5 text-grey-8">Duration</div>
        <q-radio
          v-model="editTakeBreakDialog.payload.service_duration"
          val="20"
          label="20 min"
        />
        <q-radio
          v-model="editTakeBreakDialog.payload.service_duration"
          val="30"
          label="30 min"
        />
        <q-radio
          v-model="editTakeBreakDialog.payload.service_duration"
          val="45"
          label="45 min"
        />
        <q-radio
          v-model="editTakeBreakDialog.payload.service_duration"
          val="60"
          label="60 min"
        />
        <q-input
          v-model="editTakeBreakDialog.payload.service_duration"
          label="Custom Duration (minutes)"
          type="number"
          outlined
          dense
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Delete"
          color="negative"
          @click="deleteBreak()"
        />
        <q-btn
          flat
          label="Confirm"
          color="positive"
          @click="saveEditedBreakEvent()"
        />
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
});

const $q = useQuasar();

const editTakeBreakDialog = ref({
  id: 0,
  visible: true,
  payload: {},
});

const emit = defineEmits(["close","delete"]);

onMounted(() => {
  editTakeBreakDialog.value.visible = true;
  editTakeBreakDialog.value.id = props.editEventForm.id;
  editTakeBreakDialog.value.payload = {
    service_duration: 0,
    time: props.editEventForm.booking_time,
    date: props.editEventForm.booking_date,
  };
});

async function saveEditedBreakEvent() {
  if (editTakeBreakDialog.value.payload.service_duration == 0) {
    $q.notify({
      type: "negative",
      message: "Please select a break duration.",
      position: "top",
      timeout: 2000,
    });
    return;
  }
  const payload = { ...editTakeBreakDialog.value.payload };
  await api.put(
    `/api/service-appointments/${editTakeBreakDialog.value.id}`,
    payload
  );
  editTakeBreakDialog.value = {
    id: 0,
    visible: false,
    payload: {},
  };
  emit("close");
}

async function deleteBreak() {
  try {
    // Show confirmation dialog
    $q.dialog({
      title: "Delete Break",
      message: "Are you sure you want to cancel this break?",
      cancel: true,
      persistent: true,
    })
      .onOk(async () => {
        const response = await api.delete(
          `/api/appointments/${props.editEventForm.appointment_id}`
        );
        if (response.status === 200) {
          $q.notify({
            type: "positive",
            message: "Break deleted successfully",
            position: "top",
            timeout: 2000,
          });
        }
        emit("delete");
      })
      .onCancel(() => {
      });
  } catch (error) {
    console.error("Error deleting Break:", error);
    $q.notify({
      type: "negative",
      message: "Failed to delete the Break. Please try again.",
      position: "top",
      timeout: 2000,
    });
  }
}
</script>
