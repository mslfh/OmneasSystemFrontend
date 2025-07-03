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
              <q-icon name="person" color="grey-6" />
            </template>
          </q-select>
        </div>

        <div>
          <q-card flat bordered class="q-mb-md">
            <q-card-section class="q-pa-md">
              <div class="text-subtitle2 text-grey-7 q-mb-sm">
                <q-icon name="access_time" class="q-mr-xs" size="20px" />
                Working Time
              </div>
              <q-range
                v-model="timeRangeModel"
                color="indigo-11"
                :inner-min="dynamicMinTime"
                :inner-max="dynamicMaxTime"
                :step="0.25"
                label-always
                :left-label-value="minTimeLabel"
                :right-label-value="maxTimeLabel"
                switch-label-side
                :min="dynamicMinTime"
                :max="dynamicMaxTime"
                @update:model-value="updateTimeFromRange"
              />
            </q-card-section>
          </q-card>
        </div>

        <div class="row q-gutter-md q-mb-md">
          <div class="col">
          <q-input
            v-model="formData.start_time"
            type="time"
            label="* Start Time"
            outlined
            dense
            class=" q-mb-md"
          >
          </q-input>
          </div>
          <div class="col">
          <q-input
            v-model="formData.end_time"
            type="time"
            label="* End Time"
            outlined
            dense
            class="q-mb-md"
          >
          </q-input>
        </div>
        </div>

        <div>
          <q-input
            v-model="formData.remark"
            label="Remark"
            outlined
            type="textarea"
            rows="3"
            color="grey-6"
          >
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
          label="Save"
          flat
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
  workDate: string;
  selectedStaff?: any;
  timeRange?: { min: number; max: number };
  remark?: string;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'save', data: any): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  timeRange: () => ({ min: 8, max: 19 }),
  remark: '',
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
});

const timeRangeModel = ref({ min: 8, max: 19 });

// 动态时间范围
const dynamicMinTime = computed(() => props.timeRange?.min || 8);
const dynamicMaxTime = computed(() => props.timeRange?.max || 19);

const minTimeLabel = computed(() => {
  return formatTimeLabel(timeRangeModel.value.min);
});

const maxTimeLabel = computed(() => {
  return formatTimeLabel(timeRangeModel.value.max);
});

function formatTimeLabel(time: number) {
  const hours = Math.floor(time);
  const minutes = (time % 1) * 60;

  return `${hours}:${minutes.toString().padStart(2, '0')}`;
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

function timeStringToDecimal(timeString: string): number {
  if (!timeString) return props.timeRange?.min || 8;
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours + (minutes / 60);
}

function updateRangeFromTime() {
  const startDecimal = timeStringToDecimal(formData.value.start_time);
  const endDecimal = timeStringToDecimal(formData.value.end_time);
  const minTime = props.timeRange?.min || 8;
  const maxTime = props.timeRange?.max || 19;

  // 确保时间在有效范围内
  if (startDecimal >= minTime && startDecimal <= maxTime &&
      endDecimal >= minTime && endDecimal <= maxTime &&
      startDecimal < endDecimal) {
    timeRangeModel.value = {
      min: startDecimal,
      max: endDecimal
    };
  }
}

function resetForm() {
  formData.value = {
    selectedStaff: props.selectedStaff || null,
    work_date: props.workDate || '',
    start_time: '',
    end_time: '',
    remark: props.remark || '',
  };
  timeRangeModel.value = props.timeRange || { min: 8, max: 19 };
}

function onClose() {
  formData.value.selectedStaff = null;
  formData.value.start_time = '';
  formData.value.end_time = '';
  formData.value.remark = '';
  timeRangeModel.value = props.timeRange || { min: 8, max: 19 };
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

// Watch for props changes to update form data
watch(() => props.workDate, (newDate) => {
  formData.value.work_date = newDate;
}, { immediate: true });

watch(() => props.selectedStaff, (newStaff) => {
  formData.value.selectedStaff = newStaff;
}, { immediate: true });

watch(() => props.timeRange, (newRange) => {
  if (newRange) {
    timeRangeModel.value = newRange;
  }
}, { immediate: true });

watch(() => props.remark, (newRemark) => {
  formData.value.remark = newRemark;
}, { immediate: true });

// Watch for dialog open to initialize form
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    resetForm();
  }
});

// Watch for manual time input changes to update range
watch(() => formData.value.start_time, () => {
  updateRangeFromTime();
});

watch(() => formData.value.end_time, () => {
  updateRangeFromTime();
});
</script>

<style scoped>
.dialog-header {
  background: linear-gradient(135deg, #7ab1d4 0%, #3d33c8 100%);
  border-radius: 16px 16px 0 0;
  padding: 20px 24px;
}
</style>
