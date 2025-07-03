<template>
  <q-dialog v-model="show" @hide="onClose">
    <q-card
      style="
        width: 450px;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      "
    >
      <q-card-section class="dialog-header">
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
            color="grey-6"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="grey-6" />
            </template>
          </q-select>
        </div>

        <div class="row q-gutter-md q-mb-md">
          <div class="col">
            <q-input
              v-model="formData.start_time"
              type="time"
              label="* Start Time"
              outlined
              dense
              @update:model-value="updateEndTime"
            >
              <template v-slot:prepend>
                <q-icon name="access_time" color="indigo-4" size="20px" />
              </template>
            </q-input>
          </div>
          <div class="col">
            <q-input
              v-model="formData.end_time"
              type="time"
              label="End Time"
              outlined
              dense
              @update:model-value="updateDuration"
            >
            </q-input>
          </div>
        </div>

        <div class="q-mb-md q-ml-sm">
          <div class="row q-gutter-md">
            <div class="col-5">
              <div class="text-subtitle2 text-grey-7 q-mb-sm">
                Work Duration (hours)
              </div>
              <q-input
                v-model.number="formData.duration"
                type="number"
                min="0.5"
                max="8"
                step="0.5"
                outlined
                dense
                @update:model-value="updateEndTime"
              >
                <template v-slot:prepend>
                  <q-icon name="o_timer" color="blue-4" size="18px" />
                </template>
                <template v-slot:append>
                  <span class="text-grey-6 text-caption">h</span>
                </template>
              </q-input>
            </div>
            <q-separator vertical/>
            <div class="col-4 flex items-center  ">
                <div class="text-caption text-grey-6">
                Quick Select
                </div>
                <q-option-group
                  v-model="formData.duration"
                  :options="durationOptions"
                  inline
                  dense
                  class="text-grey-6"
                  color="blue-4"
                  size="sm"
                  @update:model-value="updateEndTime"
                />
            </div>
          </div>
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
import { ref, computed, watch } from "vue";

interface Props {
  modelValue: boolean;
  staffList: any[];
  workDate: string;
  startTime?: string;
  duration?: number;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "save", data: any): void;
  (e: "cancel"): void;
}

const props = withDefaults(defineProps<Props>(), {
  duration: 3,
  startTime: "",
});

const emit = defineEmits<Emits>();

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const formData = ref({
  selectedStaff: null,
  work_date: "",
  start_time: "",
  end_time: "",
  remark: "",
  duration: 3,
});

const durationOptions = [
  { label: "2h", value: 2 },
  { label: "2.5h", value: 2.5 },
  { label: "3h", value: 3 },
  { label: "3.5h", value: 3.5 },
];

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

  const [hours, minutes] = formData.value.start_time.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + formData.value.duration * 60;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;

  formData.value.end_time = `${String(endHours).padStart(2, "0")}:${String(
    endMinutes
  ).padStart(2, "0")}`;
}

function updateDuration() {
  if (!formData.value.start_time || !formData.value.end_time) return;

  const [startHours, startMinutes] = formData.value.start_time
    .split(":")
    .map(Number);
  const [endHours, endMinutes] = formData.value.end_time.split(":").map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  // 处理跨天的情况
  let durationMinutes = endTotalMinutes - startTotalMinutes;
  if (durationMinutes < 0) {
    durationMinutes += 24 * 60; // 加上一天的分钟数
  }

  const durationHours = durationMinutes / 60;
  formData.value.duration = Math.round(durationHours * 2) / 2; // 四舍五入到最近的0.5小时
}

function resetForm() {
  formData.value = {
    selectedStaff: null,
    work_date: props.workDate || "",
    start_time: props.startTime || "",
    end_time: "",
    remark: "",
    duration: props.duration || 3,
  };

  // 如果有 start_time，自动计算 end_time
  if (formData.value.start_time && formData.value.duration) {
    updateEndTime();
  }
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

  emit("save", payload);
}

function onCancel() {
  emit("cancel");
}

function onClose() {
  // 不要完全重置表单，保持工作日期和基本信息
  formData.value.selectedStaff = null;
  formData.value.start_time = "";
  formData.value.end_time = "";
  formData.value.remark = "";
  formData.value.duration = 3;
}

// Watch for props changes to update form data
watch(
  () => props.workDate,
  (newDate) => {
    formData.value.work_date = newDate;
  },
  { immediate: true }
);

watch(
  () => props.startTime,
  (newStartTime) => {
    formData.value.start_time = newStartTime;
    // 如果有新的 start_time 且有 duration，自动计算 end_time
    if (newStartTime && formData.value.duration) {
      updateEndTime();
    }
  },
  { immediate: true }
);

watch(
  () => props.duration,
  (newDuration) => {
    formData.value.duration = newDuration;
    // 如果有 start_time，重新计算 end_time
    if (formData.value.start_time && newDuration) {
      updateEndTime();
    }
  },
  { immediate: true }
);

// Watch for dialog open to initialize form
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      resetForm();
    }
  }
);
</script>

<style scoped>
.dialog-header {
  background: linear-gradient(135deg, #7ab1d4 0%, #3d33c8 100%);
  border-radius: 16px 16px 0 0;
  padding: 20px 24px;
}
</style>
