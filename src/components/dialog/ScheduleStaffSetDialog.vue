<template>
  <q-dialog v-model="show" @hide="onClose">
    <q-card style="max-width: 900px; width: 100%;  border-radius: 12px;">
      <q-card-section class="dialog-header q-pa-md">
        <div class="text-h6 text-white">
          Set Staff Schedule
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pa-md">
        <div class="row q-gutter-md">
          <!-- Left Column - Basic Information -->
          <div class="col-12 col-md-5">
            <q-card flat class="q-pa-sm">
               <div class="row q-gutter-sm q-mb-sm">
                  <q-input
                    v-model="formData.startDate"
                    label="Start Date"
                    mask="####-##-##"
                    outlined
                    class="col"
                    :rules="[val => !!val || 'Start date is required']"
                  >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy
                          cover
                          transition-show="scale"
                          transition-hide="scale"
                        >
                          <q-date v-model="formData.startDate" mask="YYYY-MM-DD">
                            <div class="row items-center justify-end">
                              <q-btn
                                v-close-popup
                                label="Close"
                                color="primary"
                                flat
                              />
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>

                  <q-input
                    v-model="formData.endDate"
                    label="End Date"
                    mask="####-##-##"
                    outlined
                    class="col"
                    :rules="[val => !!val || 'End date is required']"
                  >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy
                          cover
                          transition-show="scale"
                          transition-hide="scale"
                        >
                          <q-date v-model="formData.endDate" mask="YYYY-MM-DD">
                            <div class="row items-center justify-end">
                              <q-btn
                                v-close-popup
                                label="Close"
                                color="primary"
                                flat
                              />
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              <div class="q-gutter-sm">
                <q-select
                  v-model="formData.scheduleType"
                  label="Schedule Type"
                  :options="['Every week']"
                  outlined
                  readonly
                >
                  <template v-slot:prepend>
                    <q-icon name="repeat" />
                  </template>
                </q-select>

                <q-select
                  v-model="formData.selectedStaff"
                  :options="staffList"
                  option-label="name"
                  option-value="id"
                  label="Select Staff"
                  outlined
                  clearable
                  :rules="[val => !!val || 'Staff selection is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                </q-select>
              </div>
            </q-card>
          </div>

          <!-- Right Column - Weekly Schedule -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="q-pa-sm">
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle1 text-blue-4">
                  <q-icon name="calendar_month" class="q-mr-xs" size="sm" />
                  Weekly Schedule
                </div>
                <div class="text-subtitle2 text-grey-7" v-if="totalWeeklyHours > 0">
                  <q-icon name="schedule" class="q-mr-xs" />
                  Total: {{ totalWeeklyHours }}h/week
                </div>
              </div>
              <div class="q-gutter-xs">
                <q-expansion-item
                  v-for="(day, index) in formData.weekDays"
                  :key="index"
                  :icon="day.enabled ? 'check_circle' : 'radio_button_unchecked'"
                  :label="day.label"
                  :header-class="day.enabled ? 'text-positive' : 'text-grey-6'"
                  :model-value="expandedItems.has(index)"
                  @update:model-value="(val) => toggleExpansion(index, val)"
                  class="schedule-item"
                >
                  <template v-slot:header>
                    <q-item-section side>
                      <q-checkbox
                        v-model="day.enabled"
                        :color="day.enabled ? 'positive' : 'grey-5'"
                        @click.stop
                        @update:model-value="(val) => onDayEnabledChange(index, val)"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-subtitle2">{{ day.label }}</q-item-label>
                      <q-item-label
                        v-if="day.enabled && day.start && day.end"
                        caption
                        class="text-positive"
                      >
                        {{ day.start }} - {{ day.end }} ({{ calculateDayHours(day) }}h)
                        <span v-for="(time, timeIndex) in day.additionalTimes" :key="timeIndex">
                          ; {{ time.start }} - {{ time.end }} ({{ calculateTimeSlotHours(time) }}h)
                        </span>
                      </q-item-label>
                    </q-item-section>
                  </template>

                  <q-card flat class="q-ml-sm" v-if="day.enabled">
                    <q-card-section class="q-pt-xs q-pb-xs">
                      <div class="row items-center q-gutter-xs q-mb-xs">
                        <q-icon name="schedule" color="light-green" size="xs" />
                        <q-input
                          outlined
                          v-model="day.start"
                          type="time"
                          label="Start"
                          dense
                          class="col-4"
                        />
                        <q-icon name="arrow_forward" color="grey" size="xs" />
                        <q-input
                          outlined
                          v-model="day.end"
                          type="time"
                          label="End"
                          dense
                          class="col-4"
                        />
                        <q-btn
                          color="blue-5"
                          icon="add"
                          @click="addTimeInput(day)"
                          round
                          size="xs"
                          dense
                        >
                          <q-tooltip>Add another time slot</q-tooltip>
                        </q-btn>
                      </div>

                      <!-- Additional time slots -->
                      <div
                        v-for="(time, timeIndex) in day.additionalTimes || []"
                        :key="timeIndex"
                        class="row items-center q-gutter-xs q-mb-xs"
                      >
                      <q-icon name="schedule" color="light-green" size="xs" />
                        <q-input
                          outlined
                          v-model="time.start"
                          type="time"
                          label="Start"
                          dense
                          class="col-4"
                        />
                        <q-icon name="arrow_forward" color="grey" size="xs" />
                        <q-input
                          outlined
                          v-model="time.end"
                          type="time"
                          label="End"
                          dense
                          class="col-4"
                        />
                        <q-btn
                          icon="remove"
                          @click="removeTimeInput(day, timeIndex)"
                          color="red-4"
                          round
                          size="xs"
                          dense
                        >
                          <q-tooltip>Remove this time slot</q-tooltip>
                        </q-btn>
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </div>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-sm">
        <q-btn
          flat
          label="Cancel"
          color="grey"
          @click="onCancel"
          class="q-mr-sm"
        />
        <q-btn
          unelevated
          rounded
          label="Save Schedule"
          color="blue-5"
          @click="onSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';

interface Props {
  modelValue: boolean;
  staffList: any[];
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'save', data: any): void;
  (e: 'cancel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const $q = useQuasar();

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// 获取今天的日期，格式为 YYYY-MM-DD
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const formData = ref({
  selectedStaff: null,
  scheduleType: 'Every week',
  startDate: getTodayDate(),
  endDate: '',
  weekDays: [
    { label: "Monday", enabled: false, start: "", end: "" },
    { label: "Tuesday", enabled: false, start: "", end: "" },
    { label: "Wednesday", enabled: false, start: "", end: "" },
    { label: "Thursday", enabled: false, start: "", end: "" },
    { label: "Friday", enabled: false, start: "", end: "" },
    { label: "Saturday", enabled: false, start: "", end: "" },
    { label: "Sunday", enabled: false, start: "", end: "" },
  ]
});

// 控制每个expansion item的展开状态
const expandedItems = ref(new Set());

// 计算单个时间段的小时数
function calculateTimeSlotHours(timeSlot: any): number {
  if (!timeSlot.start || !timeSlot.end) return 0;

  const startTime = new Date(`2000-01-01 ${timeSlot.start}`);
  const endTime = new Date(`2000-01-01 ${timeSlot.end}`);

  if (endTime <= startTime) return 0;

  const diffMs = endTime.getTime() - startTime.getTime();
  return Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10; // 保留1位小数
}

// 计算单天的总工时
function calculateDayHours(day: any): number {
  if (!day.enabled || !day.start || !day.end) return 0;

  let totalHours = calculateTimeSlotHours({ start: day.start, end: day.end });

  // 加上额外时间段的工时
  if (day.additionalTimes && day.additionalTimes.length > 0) {
    for (const timeSlot of day.additionalTimes) {
      totalHours += calculateTimeSlotHours(timeSlot);
    }
  }

  return Math.round(totalHours * 10) / 10; // 保留1位小数
}

// 计算每周总工时
const totalWeeklyHours = computed(() => {
  let total = 0;
  for (const day of formData.value.weekDays) {
    total += calculateDayHours(day);
  }
  return Math.round(total * 10) / 10; // 保留1位小数
});

function addTimeInput(day: any) {
  if (!day.additionalTimes) {
    day.additionalTimes = [];
  }
  day.additionalTimes.push({ start: "", end: "" });
}

function removeTimeInput(day: any, index: number) {
  if (day.additionalTimes && day.additionalTimes.length > index) {
    day.additionalTimes.splice(index, 1);
  }
}

// 处理expansion item的展开/折叠
function toggleExpansion(index: number, isExpanded: boolean) {
  if (isExpanded) {
    expandedItems.value.add(index);
  } else {
    expandedItems.value.delete(index);
  }
}

// 处理checkbox状态变化
function onDayEnabledChange(index: number, enabled: boolean) {
  if (enabled) {
    // 当启用某天时，自动展开对应的expansion item
    expandedItems.value.add(index);
  } else {
    // 当禁用某天时，可以选择是否折叠expansion item
    // 这里我们保持展开状态，让用户可以看到之前的设置
    // 如果你想自动折叠，可以取消注释下面这行
    // expandedItems.value.delete(index);
  }
}

function resetForm() {
  formData.value = {
    selectedStaff: null,
    scheduleType: 'Every week',
    startDate: getTodayDate(),
    endDate: '',
    weekDays: [
      { label: "Monday", enabled: false, start: "", end: "" },
      { label: "Tuesday", enabled: false, start: "", end: "" },
      { label: "Wednesday", enabled: false, start: "", end: "" },
      { label: "Thursday", enabled: false, start: "", end: "" },
      { label: "Friday", enabled: false, start: "", end: "" },
      { label: "Saturday", enabled: false, start: "", end: "" },
      { label: "Sunday", enabled: false, start: "", end: "" },
    ]
  };
  // 重置展开状态
  expandedItems.value.clear();
}

function onSave() {
  // 验证员工选择
  if (!formData.value.selectedStaff) {
    $q.notify({
      type: 'negative',
      message: 'Please select a staff member',
      position: 'top',
      timeout: 3000
    });
    return;
  }

  // 验证日期选择
  if (!formData.value.startDate || !formData.value.endDate) {
    $q.notify({
      type: 'negative',
      message: 'Please select both start and end date',
      position: 'top',
      timeout: 3000
    });
    return;
  }

  // 验证至少启用一天
  const enabledDays = formData.value.weekDays.filter(day => day.enabled);
  if (enabledDays.length === 0) {
    $q.notify({
      type: 'negative',
      message: 'Please enable at least one day of the week',
      position: 'top',
      timeout: 3000
    });
    return;
  }

  // 验证启用的天数都有时间设置
  for (const day of enabledDays) {
    if (!day.start || !day.end) {
      $q.notify({
        type: 'negative',
        message: `Please set start and end time for ${day.label}`,
        position: 'top',
        timeout: 3000
      });
      return;
    }

    // 验证开始时间小于结束时间
    if (day.start >= day.end) {
      $q.notify({
        type: 'negative',
        message: `Start time must be earlier than end time for ${day.label}`,
        position: 'top',
        timeout: 3000
      });
      return;
    }

    // 验证额外时间段
    if (day.additionalTimes && day.additionalTimes.length > 0) {
      for (let i = 0; i < day.additionalTimes.length; i++) {
        const additionalTime = day.additionalTimes[i];
        if (!additionalTime.start || !additionalTime.end) {
          $q.notify({
            type: 'negative',
            message: `Please set start and end time for additional time slot ${i + 1} on ${day.label}`,
            position: 'top',
            timeout: 3000
          });
          return;
        }

        // 验证额外时间段的开始时间小于结束时间
        if (additionalTime.start >= additionalTime.end) {
          $q.notify({
            type: 'negative',
            message: `Start time must be earlier than end time for additional time slot ${i + 1} on ${day.label}`,
            position: 'top',
            timeout: 3000
          });
          return;
        }
      }
    }
  }

  // 验证开始日期不能晚于结束日期
  if (formData.value.startDate > formData.value.endDate) {
    $q.notify({
      type: 'negative',
      message: 'Start date cannot be later than end date',
      position: 'top',
      timeout: 3000
    });
    return;
  }

  const payload = {
    staff_id: formData.value.selectedStaff.id,
    schedule_type: formData.value.scheduleType,
    start_date: formData.value.startDate,
    end_date: formData.value.endDate,
    week_days: formData.value.weekDays
      .filter((day) => day.enabled)
      .map((day) => ({
        day: day.label,
        start_time: day.start,
        end_time: day.end,
        additional_times: day.additionalTimes || [],
      })),
  };

  $q.notify({
    type: 'positive',
    message: 'Schedule saved successfully',
    position: 'top',
    timeout: 2000
  });

  emit('save', payload);
}

function onCancel() {
  emit('cancel');
}

function onClose() {
  resetForm();
}

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
  border-radius: 12px 12px 0 0;
}

</style>

