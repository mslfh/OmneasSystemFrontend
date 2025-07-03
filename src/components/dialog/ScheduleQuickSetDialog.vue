<template>
  <q-dialog v-model="show" @hide="onClose">
    <q-card
      style="
        width: 450px;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      "
    >
      <q-card-section
        class="dialog-header"
      >
        <div class="text-h6 text-white">
          <q-icon name="schedule" class="q-mr-sm" size="24px" />
          Add Schedule for {{ formatDateTitle(formData.work_date) }}
        </div>
      </q-card-section>
      <q-card-section class="q-pa-lg">
        <div>
          <q-select
            v-model="formData.selectedStaff"
            :options="staffList"
            option-label="name"
            option-value="id"
            label="* Select Staff"
            clearable
            outlined
            dense
            class="q-mb-md"
            color="blue-6"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="blue-6" />
            </template>
          </q-select>
        </div>

        <div>
          <q-input
            v-model="formData.start_time"
            type="time"
            label="* Start Time"
            outlined
            dense
            class="q-mb-md"
            color="blue-6"
            @update:model-value="updateEndTime"
          >
            <template v-slot:prepend>
              <q-icon name="access_time" color="blue-6" />
            </template>
          </q-input>
        </div>

        <div v-if="showDuration">
          <q-card flat bordered class="q-mb-md">
            <q-card-section class="q-pa-md">
              <div class="text-subtitle2 text-grey-7 q-mb-sm">
                <q-icon name="timer" class="q-mr-xs" size="18px" />
                Work Duration
              </div>
              <q-option-group
                v-model="formData.duration"
                :options="durationOptions"
                inline
                color="blue-6"
                class="q-mt-xs"
                @update:model-value="updateEndTime"
              />
            </q-card-section>
          </q-card>
        </div>

        <div v-if="showTimeRange">
          <q-card flat bordered class="q-mb-md">
            <q-card-section class="q-pa-md">
              <div class="text-subtitle2 text-grey-7 q-mb-sm">
                <q-icon name="access_time" class="q-mr-xs" size="18px" />
                Working Time
              </div>
              <q-range
                v-model="timeRangeModel"
                color="teal"
                :inner-min="8"
                :inner-max="19"
                :step="0.5"
                markers
                label-always
                :left-label-value="minTimeLabel"
                :right-label-value="maxTimeLabel"
                switch-label-side
                :min="8"
                :max="19"
                @update:model-value="updateTimeFromRange"
              />
            </q-card-section>
          </q-card>
        </div>

        <div>
          <q-input
            v-model="formData.end_time"
            type="time"
            label="* End Time"
            outlined
            dense
            class="q-mb-md"
            color="blue-6"
          >
            <template v-slot:prepend>
              <q-icon name="schedule" color="blue-6" />
            </template>
          </q-input>
        </div>

        <div>
          <q-input
            v-model="formData.remark"
            label="Remark"
            outlined
            type="textarea"
            rows="3"
            color="blue-6"
          >
            <template v-slot:prepend>
              <q-icon name="note" color="blue-6" />
            </template>
          </q-input>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-lg q-pt-none">
        <q-btn
          flat
          label="Cancel"
          color="grey-6"
          class="q-mr-sm"
          @click="onCancel"
        />
        <q-btn
          unelevated
          label="Save Schedule"
          color="blue-6"
          @click="onSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Props {
  modelValue: boolean;
  staffList: any[];
  scheduleData?: any;
  showDuration?: boolean;
  showTimeRange?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'save', data: any): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  showDuration: true,
  showTimeRange: false,
});

const emit = defineEmits<Emits>();

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const formData = ref({
  selectedStaff: null,
  work_date: '',
  start_time: '',
  end_time: '',
  remark: '',
  duration: 1.5,
});

const timeRangeModel = ref({ min: 8, max: 19 });

const durationOptions = [
  { label: "1.5h", value: 1.5 },
  { label: "2h", value: 2 },
  { label: "2.5h", value: 2.5 },
  { label: "3h", value: 3 },
];

const minTimeLabel = computed(() => {
  return formatTimeLabel(timeRangeModel.value.min);
});

const maxTimeLabel = computed(() => {
  return formatTimeLabel(timeRangeModel.value.max);
});

function formatTimeLabel(time: number) {
  const hasHalfStep = time % 1 === 0.5;
  if (hasHalfStep) {
    return Math.floor(time) + ":30";
  } else {
    return time + ":00";
  }
}

function formatDateTitle(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const weekday = weekdays[date.getDay()];
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${weekday} (${month}-${day})`;
}

function updateEndTime() {
  if (!formData.value.start_time || !formData.value.duration) return;

  const [hours, minutes] = formData.value.start_time
    .split(":")
    .map(Number);
  const totalMinutes = hours * 60 + minutes + formData.value.duration * 60;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;

  formData.value.end_time = `${String(endHours).padStart(2, "0")}:${String(
    endMinutes
  ).padStart(2, "0")}`;
}

function updateTimeFromRange() {
  formData.value.start_time = formatTimeLabel(timeRangeModel.value.min);
  formData.value.end_time = formatTimeLabel(timeRangeModel.value.max);

  if (formData.value.start_time.length == 4) {
    formData.value.start_time = "0" + formData.value.start_time;
  }
  if (formData.value.end_time.length == 4) {
    formData.value.end_time = "0" + formData.value.end_time;
  }
}

function resetForm() {
  formData.value = {
    selectedStaff: null,
    start_time: '',
    end_time: '',
    remark: '',
    duration: 1.5,
  };
  timeRangeModel.value = { min: 8, max: 19 };
}

function onSave() {
  if (!formData.value.selectedStaff) {
    alert("Please select a staff member.");
    return;
  }

  if (!formData.value.start_time || !formData.value.end_time) {
    alert("Please enter start time and end time.");
    return;
  }

  const payload = {
    staff_id: formData.value.selectedStaff.id,
    work_date: formData.value.work_date,
    start_time: formData.value.start_time,
    end_time: formData.value.end_time,
    remark: formData.value.remark,
    status: "active",
  };

  emit('save', payload);
}

function onCancel() {
  emit('cancel');
}

function onClose() {
  resetForm();
}

// Watch for scheduleData changes to populate form
watch(() => props.scheduleData, (newData) => {
  if (newData) {
    formData.value = {
      selectedStaff: newData.selectedStaff || null,
      work_date: newData.work_date || '',
      start_time: newData.start_time || '',
      end_time: newData.end_time || '',
      remark: newData.remark || '',
      duration: newData.duration || 1.5,
    };

    if (props.showTimeRange && newData.timeRange) {
      timeRangeModel.value = newData.timeRange;
    }
  }
}, { immediate: true });

// Watch for dialog close to reset form
watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    resetForm();
  }
});
</script>

<style scoped>
.dialog-header {
  background: linear-gradient(135deg, #7ab1d4 0%, #3d33c8 100%);
  border-radius: 16px 16px 0 0;
  padding: 20px 24px;
}

</style>
