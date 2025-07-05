<template>
  <q-dialog v-model="show" @hide="onClose">
    <q-card style="max-width: 900px; width: 100%; border-radius: 12px">
      <q-card-section class="dialog-header q-pa-md">
        <div class="text-h6 text-white">Set Staff Schedule</div>
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
                  :rules="[(val) => !!val || 'Start date is required']"
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
                  :rules="[(val) => !!val || 'End date is required']"
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
              <div>
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
                  class="q-pt-md"
                  v-model="formData.selectedStaff"
                  :options="staffList"
                  option-label="name"
                  option-value="id"
                  label="Select Staff"
                  outlined
                  clearable
                  :rules="[(val) => !!val || 'Staff selection is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                </q-select>

                <q-input
                  v-if="
                    formData.selectedStaff && formData.selectedStaff.description
                  "
                  outlined
                  readonly
                  dense
                  input-class="text-grey-6"
                  v-model="formData.selectedStaff.description"
                >
                  <template v-slot:prepend>
                    <q-icon name="info" color="grey-6" size="15px" />
                  </template>
                </q-input>

                <!-- repeat from last week -->
                <q-checkbox
                  v-if="formData.selectedStaff"
                  v-model="formData.repeatFromLastWeek"
                  label="Sync Last Week Schedule"
                  class="q-mt-md text-grey-7"
                  color="blue"
                  keep-color
                  checked-icon="repeat"
                  @update:model-value="onRepeatFromLastWeekChange"
                >
                </q-checkbox>
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
                <div
                  class="text-subtitle2 text-grey-7"
                  v-if="totalWeeklyHours > 0"
                >
                  <q-icon name="schedule" class="q-mr-xs" />
                  Total: {{ totalWeeklyHours }}h/week
                </div>
              </div>
              <div class="q-gutter-xs">
                <q-expansion-item
                  v-for="(day, index) in formData.weekDays"
                  :key="index"
                  :icon="
                    day.enabled ? 'check_circle' : 'radio_button_unchecked'
                  "
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
                        @update:model-value="
                          (val) => onDayEnabledChange(index, val)
                        "
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-subtitle2">{{
                        day.label
                      }}</q-item-label>
                      <q-item-label
                        v-if="day.enabled && day.start && day.end"
                        caption
                        class="text-positive"
                      >
                        {{ day.start }} - {{ day.end }} ({{
                          calculateDayHours(day)
                        }}h)
                        <span
                          v-for="(time, timeIndex) in day.additionalTimes"
                          :key="timeIndex"
                        >
                          ; {{ time.start }} - {{ time.end }} ({{
                            calculateTimeSlotHours(time)
                          }}h)
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
import { ref, watch, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import { api } from "boot/axios";

interface Props {
  modelValue: boolean;
  staffList: any[];
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "save", data: any): void;
  (e: "cancel"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const $q = useQuasar();

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

// 获取今天的日期，格式为 YYYY-MM-DD
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 获取指定日期一周后的日期，格式为 YYYY-MM-DD
function getDateAfterOneWeek(dateString: string) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + 7);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const formData = ref({
  selectedStaff: null,
  scheduleType: "Every week",
  startDate: getTodayDate(),
  endDate: getDateAfterOneWeek(getTodayDate()),
  repeatFromLastWeek: false,
  weekDays: [
    { label: "Monday", enabled: false, start: "", end: "" },
    { label: "Tuesday", enabled: false, start: "", end: "" },
    { label: "Wednesday", enabled: false, start: "", end: "" },
    { label: "Thursday", enabled: false, start: "", end: "" },
    { label: "Friday", enabled: false, start: "", end: "" },
    { label: "Saturday", enabled: false, start: "", end: "" },
    { label: "Sunday", enabled: false, start: "", end: "" },
  ],
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

// 获取指定日期所在周的周一日期
function getMonday(dateString: string) {
  const date = new Date(dateString);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // 调整为周一
  const monday = new Date(date.setDate(diff));
  return formatDate(monday);
}

// 获取指定日期所在周的周日日期
function getSunday(dateString: string) {
  const monday = new Date(getMonday(dateString));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return formatDate(sunday);
}

// 格式化日期为 YYYY-MM-DD
function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 获取上周的日期范围
function getLastWeekRange(currentDate: string) {
  const currentMonday = getMonday(currentDate);
  const lastWeekMonday = new Date(currentMonday);
  lastWeekMonday.setDate(lastWeekMonday.getDate() - 7);

  const lastWeekSunday = new Date(lastWeekMonday);
  lastWeekSunday.setDate(lastWeekMonday.getDate() + 6);

  return {
    start_date: formatDate(lastWeekMonday),
    end_date: formatDate(lastWeekSunday),
  };
}

// 将英文星期转换为对应的索引
function getDayIndex(workDate: string) {
  const date = new Date(workDate);
  const dayOfWeek = date.getDay();
  // 转换为周一为0的索引
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
}

// 处理重复上周排班的checkbox变化
async function onRepeatFromLastWeekChange(checked: boolean) {
  if (!checked || !formData.value.selectedStaff) {
    return;
  }

  try {
    // 计算上周的日期范围
    const lastWeekRange = getLastWeekRange(formData.value.startDate);

    $q.loading.show({
      message: "Loading last week schedule...",
    });

    // 调用API获取上周排班
    const response = await api.get("/api/getStaffSchedule", {
      params: {
        start_date: lastWeekRange.start_date,
        end_date: lastWeekRange.end_date,
        staff_id: formData.value.selectedStaff.id,
      },
    });

    const lastWeekSchedule = response.data;

    if (lastWeekSchedule && lastWeekSchedule.length > 0) {
      // 重置所有天的设置
      formData.value.weekDays.forEach((day) => {
        day.enabled = false;
        day.start = "";
        day.end = "";
        day.additionalTimes = [];
      });

      // 按工作日期分组排班数据
      const scheduleByDay = lastWeekSchedule.reduce(
        (acc: any, schedule: any) => {
          const dayIndex = getDayIndex(schedule.work_date);
          if (!acc[dayIndex]) {
            acc[dayIndex] = [];
          }
          acc[dayIndex].push(schedule);
          return acc;
        },
        {}
      );

      // 应用上周的排班到表单
      Object.keys(scheduleByDay).forEach((dayIndexStr) => {
        const dayIndex = parseInt(dayIndexStr);
        const daySchedules = scheduleByDay[dayIndex];

        if (daySchedules && daySchedules.length > 0) {
          const dayData = formData.value.weekDays[dayIndex];
          dayData.enabled = true;

          // 设置第一个时间段
          const firstSchedule = daySchedules[0];
          dayData.start = firstSchedule.start_time;
          dayData.end = firstSchedule.end_time;

          // 如果有多个时间段，添加到additionalTimes
          if (daySchedules.length > 1) {
            dayData.additionalTimes = daySchedules
              .slice(1)
              .map((schedule: any) => ({
                start: schedule.start_time,
                end: schedule.end_time,
              }));
          }

          // 自动展开启用的天
          expandedItems.value.add(dayIndex);
        }
      });

      $q.notify({
        type: "positive",
        message: "Last week schedule loaded successfully",
        position: "top",
        timeout: 2000,
      });
    } else {
      $q.notify({
        type: "info",
        message: "No schedule found for last week",
        position: "top",
        timeout: 2000,
      });
    }
  } catch (error) {
    console.error("Error loading last week schedule:", error);
    $q.notify({
      type: "negative",
      message: "Failed to load last week schedule",
      position: "top",
      timeout: 3000,
    });

    // 如果加载失败，取消checkbox选中状态
    formData.value.repeatFromLastWeek = false;
  } finally {
    $q.loading.hide();
  }
}

function resetForm() {
  const todayDate = getTodayDate();
  formData.value = {
    selectedStaff: null,
    scheduleType: "Every week",
    startDate: todayDate,
    endDate: getDateAfterOneWeek(todayDate),
    repeatFromLastWeek: false,
    weekDays: [
      { label: "Monday", enabled: false, start: "", end: "" },
      { label: "Tuesday", enabled: false, start: "", end: "" },
      { label: "Wednesday", enabled: false, start: "", end: "" },
      { label: "Thursday", enabled: false, start: "", end: "" },
      { label: "Friday", enabled: false, start: "", end: "" },
      { label: "Saturday", enabled: false, start: "", end: "" },
      { label: "Sunday", enabled: false, start: "", end: "" },
    ],
  };
  // 重置展开状态
  expandedItems.value.clear();
}

function onSave() {
  // 验证员工选择
  if (!formData.value.selectedStaff) {
    $q.notify({
      type: "negative",
      message: "Please select a staff member",
      position: "top",
      timeout: 3000,
    });
    return;
  }

  // 验证日期选择
  if (!formData.value.startDate || !formData.value.endDate) {
    $q.notify({
      type: "negative",
      message: "Please select both start and end date",
      position: "top",
      timeout: 3000,
    });
    return;
  }

  // 验证至少启用一天
  const enabledDays = formData.value.weekDays.filter((day) => day.enabled);
  if (enabledDays.length === 0) {
    $q.notify({
      type: "negative",
      message: "Please enable at least one day of the week",
      position: "top",
      timeout: 3000,
    });
    return;
  }

  // 验证启用的天数都有时间设置
  for (const day of enabledDays) {
    if (!day.start || !day.end) {
      $q.notify({
        type: "negative",
        message: `Please set start and end time for ${day.label}`,
        position: "top",
        timeout: 3000,
      });
      return;
    }

    // 验证开始时间小于结束时间
    if (day.start >= day.end) {
      $q.notify({
        type: "negative",
        message: `Start time must be earlier than end time for ${day.label}`,
        position: "top",
        timeout: 3000,
      });
      return;
    }

    // 验证额外时间段
    if (day.additionalTimes && day.additionalTimes.length > 0) {
      for (let i = 0; i < day.additionalTimes.length; i++) {
        const additionalTime = day.additionalTimes[i];
        if (!additionalTime.start || !additionalTime.end) {
          $q.notify({
            type: "negative",
            message: `Please set start and end time for additional time slot ${
              i + 1
            } on ${day.label}`,
            position: "top",
            timeout: 3000,
          });
          return;
        }

        // 验证额外时间段的开始时间小于结束时间
        if (additionalTime.start >= additionalTime.end) {
          $q.notify({
            type: "negative",
            message: `Start time must be earlier than end time for additional time slot ${
              i + 1
            } on ${day.label}`,
            position: "top",
            timeout: 3000,
          });
          return;
        }
      }
    }
  }

  // 验证开始日期不能晚于结束日期
  if (formData.value.startDate > formData.value.endDate) {
    $q.notify({
      type: "negative",
      message: "Start date cannot be later than end date",
      position: "top",
      timeout: 3000,
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
    type: "positive",
    message: "Schedule saved successfully",
    position: "top",
    timeout: 2000,
  });

  emit("save", payload);
}

function onCancel() {
  emit("cancel");
}

function onClose() {
  resetForm();
}

// Watch for dialog close to reset form
watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) {
      resetForm();
    }
  }
);

// Watch for start date changes to automatically update end date
watch(
  () => formData.value.startDate,
  (newStartDate) => {
    if (newStartDate) {
      formData.value.endDate = getDateAfterOneWeek(newStartDate);
    }
  }
);

// Watch for staff selection changes to reset repeat checkbox
watch(
  () => formData.value.selectedStaff,
  () => {
    formData.value.repeatFromLastWeek = false;
  }
);

// Watch for start date changes to reset repeat checkbox
watch(
  () => formData.value.startDate,
  () => {
    formData.value.repeatFromLastWeek = false;
  }
);
</script>

<style scoped>
.dialog-header {
  background: linear-gradient(135deg, #7ab1d4 0%, #3d33c8 100%);
  border-radius: 12px 12px 0 0;
}
</style>
