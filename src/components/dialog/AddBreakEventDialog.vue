<template>
  <q-dialog
    v-model="takeBreakDialog.visible"
    transition-show="scale"
    transition-hide="scale"
    seamless
    position="bottom"
    @hide="emit('close')"
  >
    <q-card>
      <q-card-section>
        <div class="text-h6">Confirm Assignment</div>
        <div>
          Do you want to assign this item to {{ confirmDialog.staffName }}?
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="negative"
          @click="confirmDialog.reject"
        />
        <q-btn
          flat
          label="Confirm"
          color="positive"
          @click="confirmDialog.resolve"
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

const takeBreakDialog = ref({
  id: 0,
  visible: true,
  payload: {},
});

const emit = defineEmits(["close"]);

onMounted(() => {
  takeBreakDialog.value.visible = true;
  takeBreakDialog.value.id = props.editEventForm.id;
  takeBreakDialog.value.payload = {
    service_duration: 0,
    time: props.editEventForm.booking_time,
    date: props.editEventForm.booking_date,
  };
});

async function saveEditedBreakEvent() {
  if (takeBreakDialog.value.payload.service_duration == 0) {
    $q.notify({
      type: "negative",
      message: "Please select a break duration.",
      position: "top",
      timeout: 2000,
    });
    return;
  }
  const payload = { ...takeBreakDialog.value.payload };
  await api.put(
    `/api/service-appointments/${takeBreakDialog.value.id}`,
    payload
  );
  takeBreakDialog.value = {
    id: 0,
    visible: false,
    payload: {},
  };
  emit("close");
}
</script>
