<template>
  <div class="q-pa-md q-pt-lg">
    <!-- first row -->
    <div class="row q-col-gutter-lg">
      <!-- Summary of Weekly Schedule -->
      <div class="col-lg-12 col-md-6 col-sm-12 col-xs-12">
        <q-card class="q-pa-md shadow-1">
          <div class="row items-center q-mb-md">
            <div class="col">
              <div class="text-h6 text-grey-6">Summary of Staff Schedule</div>
              <div class="text-subtitle2 text-grey-5">
                {{
                  scheduleSelectedDateRange
                    ? `From ${scheduleSelectedDateRange.from} to ${scheduleSelectedDateRange["to"]}`
                    : "Current Week"
                }}
              </div>
            </div>
            <q-btn flat round icon="more_vert" class="q-ml-auto">
              <q-menu>
                <q-list style="min-width: 300px">
                  <q-item-label header class="text-subtitle1"
                    >* Select Date Range</q-item-label
                  >
                  <q-item>
                    <q-item-section>
                      <q-date
                        v-model="scheduleSelectedDateRange"
                        range
                        color="deep-purple-4"
                        class="no-shadow"
                        @update:model-value="updateScheduleDateRange"
                      />
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item
                    clickable
                    v-close-popup
                    @click="resetScheduleDateRange"
                  >
                    <q-item-section>
                      <q-item-label class="text-grey-6"
                        >Reset to Current Week</q-item-label
                      >
                    </q-item-section>
                    <q-item-section side>
                      <q-icon name="refresh" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>

          <!-- Staff Selection Buttons -->
          <div
            class="row q-mb-md q-gutter-xs"
            v-if="staffScheduleData.length > 0"
          >
            <q-btn
              :color="
                selectedScheduleStaffId === 'all' ? 'deep-purple-4' : 'grey-4'
              "
              :text-color="
                selectedScheduleStaffId === 'all' ? 'white' : 'grey-7'
              "
              :outline="selectedScheduleStaffId !== 'all'"
              size="sm"
              @click="selectAllScheduleStaff()"
              class="q-mb-xs"
            >
              All
            </q-btn>
            <q-btn
              v-for="staff in staffScheduleData"
              :key="staff.id"
              :color="
                selectedScheduleStaffId === staff.id
                  ? 'deep-purple-4'
                  : 'grey-4'
              "
              :text-color="
                selectedScheduleStaffId === staff.id ? 'white' : 'grey-7'
              "
              :outline="selectedScheduleStaffId !== staff.id"
              size="sm"
              @click="selectScheduleStaff(staff)"
              class="q-mb-xs"
            >
              {{ staff.name }}
            </q-btn>
          </div>

          <!-- No Staff Message -->
          <div
            v-if="staffScheduleData.length === 0"
            class="text-center q-pa-md"
          >
            <q-icon
              name="schedule"
              size="48px"
              color="grey-4"
              class="q-mb-sm"
            />
            <div class="text-body1 text-grey-6">
              No staff schedule data available
            </div>
            <div class="text-caption text-grey-5">
              Please check back later or contact administrator
            </div>
          </div>

          <!-- Main Schedule Content -->
          <div v-if="staffScheduleData.length > 0">
            <div class="row items-center q-mb-md">
              <div class="col-auto">
                <div class="text-h3 text-weight-bold">
                  {{ totalWeeklyHours.toFixed(2) }}h
                </div>
              </div>
              <div class="col-auto flex items-center">
                <q-badge
                  color="orange-2"
                  text-color="orange-8"
                  class="q-ml-sm"
                  >{{ selectedScheduleStaffDisplayName }}</q-badge
                >
              </div>
            </div>
            <div class="text-grey-5 q-mb-md">
              Weekly schedule for
              {{ selectedScheduleStaffDisplayName || "selected staff" }}
            </div>
            <div class="q-mb-lg">
              <!-- Staff Schedule Column Charts -->
              <ApexCharts
                type="bar"
                :options="StaffScheduleBarOptions"
                :series="StaffScheduleBarSeries"
                height="180"
              />
            </div>
            <q-separator />
            <div class="row q-mt-md q-gutter-md">
              <div
                class="col bg-grey-1 q-pa-md rounded-borders flex column items-center"
              >
                <q-icon
                  name="schedule"
                  color="deep-purple-4"
                  size="md"
                  class="q-mb-xs"
                />
                <div class="text-caption text-grey-6">Total Hours</div>
                <div class="text-h6 text-weight-bold">
                  {{ totalWeeklyHours.toFixed(2) }}h
                </div>
                <q-linear-progress
                  :value="
                    selectedScheduleStaffId === 'all'
                      ? 1
                      : selectedScheduleStaffId && staffScheduleData.length > 0
                      ? totalAllStaffWeeklyHours > 0
                        ? totalWeeklyHours / totalAllStaffWeeklyHours
                        : 0
                      : 0
                  "
                  color="deep-purple-4"
                  class="q-mt-sm"
                  style="height: 4px; width: 100%"
                />
              </div>
              <div
                class="col bg-grey-1 q-pa-md rounded-borders flex column items-center"
              >
                <q-icon
                  name="event_available"
                  color="cyan-5"
                  size="md"
                  class="q-mb-xs"
                />
                <div class="text-caption text-grey-6">Total Schedules</div>
                <div class="text-h6 text-weight-bold">
                  {{ totalScheduleCount }}
                </div>
                <q-linear-progress
                  :value="
                    selectedScheduleStaffId === 'all'
                      ? 1
                      : selectedScheduleStaffId
                      ? totalScheduleCount > 0
                        ? totalScheduleCount / Math.max(totalScheduleCount, 7)
                        : 0
                      : 0
                  "
                  color="cyan-5"
                  class="q-mt-sm"
                  style="height: 4px; width: 100%"
                />
              </div>
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { api } from "boot/axios";
import ApexCharts from "vue3-apexcharts";

const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// Schedule data
const staffScheduleData = ref([]);
const selectedScheduleStaffId = ref("all"); // Default to 'all'
const selectedScheduleStaffName = ref("All Staff");
const weeklyScheduleData = ref([0, 0, 0, 0, 0, 0, 0]); // Monday to Sunday

const scheduleSelectedDateRange = ref(null); // For date range picker

// Schedule functions
const calculateWeeklySchedule = (staffData) => {
  const weeklyData = [0, 0, 0, 0, 0, 0, 0]; // Monday to Sunday (in hours)

  if (!staffData || !staffData.schedules) {
    return weeklyData;
  }

  // Process schedules object where each key is a date
  Object.values(staffData.schedules).forEach((schedule) => {
    if (schedule.date && schedule.hours > 0) {
      const scheduleDate = new Date(schedule.date);
      // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
      let dayOfWeek = scheduleDate.getDay();
      // Convert to Monday = 0, Tuesday = 1, ..., Sunday = 6
      dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      weeklyData[dayOfWeek] += schedule.hours;
    }
  });

  return weeklyData;
};

// Function to calculate weekly schedule for all staff combined
const calculateAllStaffWeeklySchedule = () => {
  const weeklyData = [0, 0, 0, 0, 0, 0, 0]; // Monday to Sunday

  staffScheduleData.value.forEach((staff) => {
    if (staff.schedules) {
      Object.values(staff.schedules).forEach((schedule) => {
        if (schedule.date && schedule.hours > 0) {
          const scheduleDate = new Date(schedule.date);
          // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
          let dayOfWeek = scheduleDate.getDay();
          // Convert to Monday = 0, Tuesday = 1, ..., Sunday = 6
          dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

          weeklyData[dayOfWeek] += schedule.hours;
        }
      });
    }
  });

  return weeklyData;
};

// Function to select all staff and update schedule chart
const selectAllScheduleStaff = () => {
  if (staffScheduleData.value.length === 0) return;
  selectedScheduleStaffId.value = "all";
  selectedScheduleStaffName.value = "All Staff";
  weeklyScheduleData.value = calculateAllStaffWeeklySchedule();
};

// Function to select staff and update schedule chart
const selectScheduleStaff = (staff) => {
  selectedScheduleStaffId.value = staff.id;
  selectedScheduleStaffName.value = staff.name;
  weeklyScheduleData.value = calculateWeeklySchedule(staff);
};

// Function to handle date range updates
const updateScheduleDateRange = (dateRange) => {
  if (dateRange && dateRange.from && dateRange.to) {
    fetchStaffScheduleStatistics(dateRange.from, dateRange.to);
  }
};

// Function to reset date range to current week
const resetScheduleDateRange = () => {
  scheduleSelectedDateRange.value = null;
  fetchStaffScheduleStatistics(); // Fetch current week data
};

// Schedule Computed Properties
const totalWeeklyHours = computed(() => {
  if (staffScheduleData.value.length === 0) return 0;
  return weeklyScheduleData.value.reduce((sum, hours) => sum + hours, 0);
});

const totalScheduleCount = computed(() => {
  if (staffScheduleData.value.length === 0) return 0;
  if (selectedScheduleStaffId.value === "all") {
    return staffScheduleData.value.reduce((total, staff) => {
      return (
        total + (staff.schedules ? Object.keys(staff.schedules).length : 0)
      );
    }, 0);
  } else if (selectedScheduleStaffId.value) {
    const staff = staffScheduleData.value.find(
      (s) => s.id === selectedScheduleStaffId.value
    );
    return staff?.schedules ? Object.keys(staff.schedules).length : 0;
  }
  return 0;
});

const selectedScheduleStaffDisplayName = computed(() => {
  if (staffScheduleData.value.length === 0) return "";
  return selectedScheduleStaffName.value;
});

const totalAllStaffWeeklyHours = computed(() => {
  if (staffScheduleData.value.length === 0) return 0;
  return calculateAllStaffWeeklySchedule().reduce(
    (sum, hours) => sum + hours,
    0
  );
});

onMounted(() => {
  fetchStaffScheduleStatistics();
});

async function fetchStaffScheduleStatistics(
  customStartDate = null,
  customEndDate = null
) {
  try {
    let start_date, end_date;

    if (customStartDate && customEndDate) {
      // Use custom date range
      start_date = new Date(customStartDate);
      end_date = new Date(customEndDate);
    } else {
      // Use current week of today's date (default behavior)
      const today = new Date();
      const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // Treat Sunday (0) as 7

      start_date = new Date(today);
      start_date.setDate(today.getDate() - dayOfWeek + 1); // Monday

      end_date = new Date(today);
      end_date.setDate(today.getDate() - dayOfWeek + 7); // Sunday
    }

    const response = await api.get("/api/getStaffScheduleStatistics", {
      params: {
        start_date: start_date.toISOString().split("T")[0], // Format date as YYYY-MM-DD
        end_date: end_date.toISOString().split("T")[0],
      },
    });

    if (response.data && Array.isArray(response.data)) {
      staffScheduleData.value = response.data; // Store the staff array directly

      // Auto-select "All" staff by default only if there's data
      if (response.data.length > 0) {
        selectAllScheduleStaff();
      } else {
        // Reset to empty state when no data
        selectedScheduleStaffId.value = null;
        selectedScheduleStaffName.value = "";
        weeklyScheduleData.value = [0, 0, 0, 0, 0, 0, 0];
      }
    } else {
      // Handle case where API returns null or undefined
      staffScheduleData.value = [];
      selectedScheduleStaffId.value = null;
      selectedScheduleStaffName.value = "";
      weeklyScheduleData.value = [0, 0, 0, 0, 0, 0, 0];
    }
  } catch (error) {
    console.error("Error fetching staff schedule statistics:", error);
    // Set empty state on error
    staffScheduleData.value = [];
    selectedScheduleStaffId.value = null;
    selectedScheduleStaffName.value = "";
    weeklyScheduleData.value = [0, 0, 0, 0, 0, 0, 0];
  }
}

const StaffScheduleBarOptions = computed(() => ({
  chart: {
    type: "bar",
    toolbar: { show: false },
    height: 180,
    events: {
      dataPointSelection: function (event, chartContext, config) {
        // This will be handled by the staff selection buttons instead
      },
    },
  },
  plotOptions: {
    bar: {
      borderRadius: 8,
      columnWidth: "60%",
      distributed: true,
    },
  },
  dataLabels: {
    enabled: true,
    offsetY: 2,
    style: {
      fontSize: "12px",
      fontWeight: "bold",
      colors: ["#ffffff"],
    },
    formatter: function (val) {
      return val > 0 ? val.toFixed(2) + "h" : "";
    },
  },
  xaxis: {
    categories: days,
    labels: { style: { colors: "#bdbacb", fontSize: "14px" } },
  },
  yaxis: {
    show: false,
  },
  grid: { show: false },
  legend: {
    show: false,
  },
  tooltip: {
    enabled: true,
    y: {
      formatter: function (val) {
        return val.toFixed(1) + " hours";
      },
    },
  },
  colors: days.map((_, idx) =>
    selectedScheduleStaffId.value ? "#5B4FE9" : "#E6E4FB"
  ),
}));

const StaffScheduleBarSeries = computed(() => [
  {
    name: "Hours",
    data: weeklyScheduleData.value,
  },
]);
</script>

<style scoped>
.q-card {
  border-radius: 16px;
}
</style>
