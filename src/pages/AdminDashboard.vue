<template>
  <div class="q-pa-md q-pt-lg">
    <!-- first row -->
    <div class="row q-col-gutter-lg">
      <!-- Statistics Card -->
      <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
        <q-card class="fit q-pa-lg shadow-1" style="background: #7367f0;">
          <div class="row items-center q-mb-md">
            <div class="col text-h5 text-white  ">Statistics</div>
            <div class="col-auto text-subtitle2 text-white">
              Updated 1 month ago
            </div>
          </div>
          <div class="row q-col-gutter-xl q-mt-md q-mb-md flex justify-between">

            <div class="col-auto flex column items-center">
              <div
                class="bg-indigo-2 flex flex-center"
                style="width: 64px; height: 64px; border-radius: 50%"
              >
                <q-icon name="pie_chart" color="indigo-3" size="32px" />
              </div>
              <div class="text-h5 text-weight-bold text-white q-mt-sm">
                245k
              </div>
              <div class="text-subtitle2 text-white">Total Appointments</div>
            </div>

          </div>
        </q-card>
      </div>

      <!-- Sales Summary -->
      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
        <q-card class="fit bg-white q-pa-lg shadow-1">
          <div class="row items-center q-mb-xs">
            <div class="text-h6 text-grey-6">Sales Summary</div>
            <div class="text-orange-6 text-weight-bold q-ml-auto">+18.2%</div>
          </div>

          <div class="text-h4 text-weight-bold text-grey-5">
            ${{ todayStatistics.total_revenue.toFixed(2) }}
          </div>

          <!-- Payment Methods Grid -->
          <div class="q-mt-md">
            <div class="row q-gutter-xs q-mb-sm">
              <div
                v-for="(method, index) in topPaymentMethods.slice(0, 3)"
                :key="method.key"
                class="col flex column items-center"
              >
                <div
                  :class="method.bgColor"
                  class="flex flex-center"
                  style="width: 45px; height: 45px; border-radius: 6px"
                >
                  <q-icon
                    :name="method.icon"
                    :color="method.iconColor"
                    size="25px"
                  />
                </div>
                <div class="text-caption text-grey-5 q-mt-xs text-center">
                  {{ method.label }}
                </div>
                <div class="text-caption text-weight-bold text-grey-6">
                  {{ method.percentage }}%
                </div>
                <div class="text-caption text-grey-5">${{ method.amount }}</div>
              </div>
            </div>
            <div class="row q-gutter-xs">
              <div
                v-for="(method, index) in topPaymentMethods.slice(3, 6)"
                :key="method.key"
                class="col flex column items-center"
              >
                <div
                  :class="method.bgColor"
                  class="flex flex-center"
                  style="width: 45px; height: 45px; border-radius: 6px"
                >
                  <q-icon
                    :name="method.icon"
                    :color="method.iconColor"
                    size="25px"
                  />
                </div>
                <div class="text-caption text-grey-5 q-mt-xs text-center">
                  {{ method.label }}
                </div>
                <div class="text-caption text-weight-bold text-grey-6">
                  {{ method.percentage }}%
                </div>
                <div class="text-caption text-grey-5">${{ method.amount }}</div>
              </div>
            </div>
          </div>
          <q-linear-progress
            :value="topPaymentMethodPercentage / 100"
            color="deep-purple-4"
            class="q-mt-md"
            style="height: 6px; border-radius: 4px"
            track-color="grey-3"
          />
        </q-card>
      </div>

         <!--Today Income Earned -->
      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
        <q-card class="fit bg-white q-pa-lg shadow-1">
          <div class="row q-mb-md">
            <div
              class="bg-orange-1 flex flex-center q-mr-md"
              style="width: 40px; height: 40px; border-radius: 50%"
            >
              <q-icon name="o_analytics" color="green-3" size="25px" />
            </div>

            <div class="col-6">
              <div class="text-h5 text-weight-bold text-grey-7">
                {{ todayStatistics.total_appointments }}
              </div>
              <div class="text-subtitle2 text-grey-5 q-mb-md">Appointments</div>
            </div>

            <div class="col-auto text-subtitle2 text-grey-5">
              <q-icon name="circle" size="15px" class="text-green-2" />
              Today
            </div>
          </div>

          <div class="text-h4 text-weight-bold text-grey-7">
            ${{ todayStatistics.total_revenue.toFixed(2) }}
          </div>
          <div class="text-subtitle2 text-grey-5 q-mb-md">Sale Amount</div>
          <div style="height: 160px">
            <!-- Appointments line chart in this week -->
            <ApexCharts
              type="line"
              :options="AppointmentWeekChartOptions"
              :series="AppointmentWeekSeries"
            />
          </div>
        </q-card>
      </div>

      <!-- Tracker -->
      <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
        <q-card class="fit bg-white q-pa-lg shadow-1">
          <div class="row items-center q-mb-md">
            <div class="col">
              <div class="text-h6 text-grey-6">Appointment Tracker</div>
              <div class="text-subtitle2 text-grey-5">Today</div>
            </div>
            <q-btn flat round icon="more_vert" class="q-ml-auto" />
          </div>

          <div class="row">
            <!-- Left: Ticket Stats -->
            <div class="col-5">
              <div class="text-h2 text-weight-bold text-grey-7">
                {{ todayStatistics.total_appointments }}
              </div>
              <div class="text-subtitle2 text-grey-5 q-mb-lg">
                Aggregate Appointments
              </div>

              <!-- Appointments Status Group -->
              <div class="q-mb-md flex items-center">
                <div
                  class="bg-orange-1 flex flex-center"
                  style="width: 40px; height: 40px; border-radius: 12px"
                >
                  <q-icon name="check_circle" color="cyan-5" size="24px" />
                </div>
                <div class="q-ml-md">
                  <div class="text-body1 text-grey-6">Finished</div>
                  <div class="text-caption text-grey-5">
                    {{ todayStatistics.appointmentGroup?.finished || 0 }}
                    Checked Appointments
                  </div>
                </div>
              </div>
              <div class="q-mb-md flex items-center">
                <div
                  class="bg-deep-purple-1 flex flex-center"
                  style="width: 40px; height: 40px; border-radius: 12px"
                >
                  <q-icon
                    name="confirmation_number"
                    color="deep-purple-4"
                    size="24px"
                  />
                </div>
                <div class="q-ml-md">
                  <div class="text-body1 text-grey-6">Pending</div>
                  <div class="text-caption text-grey-5">
                    {{ todayStatistics.appointmentGroup?.booked || 0 }}
                    Open Appointments
                  </div>
                </div>
              </div>

              <div class="flex items-center">
                <div
                  class="bg-red-1 flex flex-center"
                  style="width: 40px; height: 40px; border-radius: 12px"
                >
                  <q-icon name="schedule" color="red-5" size="24px" />
                </div>
                <div class="q-ml-md">
                  <div class="text-body1 text-grey-6">No Show</div>
                  <div class="text-caption text-grey-5">
                    {{ todayStatistics.appointmentGroup?.pending || 0 }}
                    Appointments
                  </div>
                </div>
              </div>
            </div>
            <!-- Right: Appointment Tracker Chart -->
            <div class="col-7 flex flex-center">
              <div style="width: 100%; height: 350px">
                <ApexCharts
                  type="radialBar"
                  :options="AppointmentTrackerchartOptions"
                  :series="AppointmentTrackerSeries"
                  height="350"
                />
              </div>
            </div>
          </div>
        </q-card>
      </div>


      <!-- Summary of Weekly Earnings -->
      <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
        <q-card class="q-pa-md shadow-1">
          <div class="row items-center q-mb-md">
            <div class="col">
              <div class="text-h6 text-grey-6">Summary of Staff Earnings</div>
              <div class="text-subtitle2 text-grey-5">Weekly Statements</div>
            </div>
            <q-btn flat round icon="more_vert" class="q-ml-auto" />
          </div>

          <!-- Staff Selection Buttons -->
          <div class="row q-mb-md q-gutter-xs">
            <q-btn
              :color="selectedStaffId === 'all' ? 'deep-purple-4' : 'grey-4'"
              :text-color="selectedStaffId === 'all' ? 'white' : 'grey-7'"
              :outline="selectedStaffId !== 'all'"
              size="sm"
              @click="selectAllStaff()"
              class="q-mb-xs"
            >
              All
            </q-btn>
            <q-btn
              v-for="staff in staffEarningsData"
              :key="staff.id"
              :color="selectedStaffId === staff.id ? 'deep-purple-4' : 'grey-4'"
              :text-color="selectedStaffId === staff.id ? 'white' : 'grey-7'"
              :outline="selectedStaffId !== staff.id"
              size="sm"
              @click="selectStaff(staff)"
              class="q-mb-xs"
            >
              {{ staff.name }}
            </q-btn>
          </div>

          <div class="row items-center q-mb-md">
            <div class="col-auto">
              <div class="text-h2 text-weight-bold">${{ totalWeeklyEarnings.toFixed(2) }}</div>
            </div>
            <div class="col-auto flex items-center">
              <q-badge color="orange-2" text-color="orange-8" class="q-ml-sm"
                >{{ selectedStaffName }}</q-badge
              >
            </div>
          </div>
          <div class="text-grey-5 q-mb-md">
            Weekly earnings for {{ selectedStaffName || 'selected staff' }}
          </div>
          <div class="q-mb-lg">
            <!-- Staff Earnings Column Charts -->
            <ApexCharts
              type="bar"
              :options="StaffEarningsBarOptions"
              :series="StaffEarningsBarSeries"
              height="180"
            />
          </div>
          <q-separator />
          <div class="row q-mt-md q-gutter-md">
            <div
              class="col bg-grey-1 q-pa-md rounded-borders flex column items-center"
            >
              <q-icon
                name="attach_money"
                color="deep-purple-4"
                size="md"
                class="q-mb-xs"
              />
              <div class="text-caption text-grey-6">Weekly Income</div>
              <div class="text-h6 text-weight-bold">${{ totalWeeklyEarnings.toFixed(2) }}</div>
              <q-linear-progress
                :value="totalWeeklyEarnings > 0 ? Math.min(totalWeeklyEarnings / totalWeeklyEarnings, 1) : 0"
                color="deep-purple-4"
                class="q-mt-sm"
                style="height: 4px; width: 100%"
              />
            </div>
            <div
              class="col bg-grey-1 q-pa-md rounded-borders flex column items-center"
            >
              <q-icon
                name="schedule"
                color="cyan-5"
                size="md"
                class="q-mb-xs"
              />
              <div class="text-caption text-grey-6">Total Services</div>
              <div class="text-h6 text-weight-bold">
                {{ selectedStaffId === 'all' ?
                  staffEarningsData.reduce((total, staff) => total + (staff.booking_services?.length || 0), 0)
                  : (selectedStaffId ?
                    staffEarningsData.find(s => s.id === selectedStaffId)?.booking_services?.length || 0
                    : 0) }}
              </div>
              <q-linear-progress
                :value="selectedStaffId === 'all' ?
                  1
                  : (selectedStaffId ?
                    (staffEarningsData.reduce((total, staff) => total + (staff.booking_services?.length || 0), 0) > 0 ?
                      (staffEarningsData.find(s => s.id === selectedStaffId)?.booking_services?.length || 0) /
                      staffEarningsData.reduce((total, staff) => total + (staff.booking_services?.length || 0), 0)
                      : 0)
                    : 0)"
                color="cyan-5"
                class="q-mt-sm"
                style="height: 4px; width: 100%"
              />
            </div>
            <div
              class="col bg-grey-1 q-pa-md rounded-borders flex column items-center"
            >
              <q-icon name="trending_up" color="green-4" size="md" class="q-mb-xs" />
              <div class="text-caption text-grey-6">Average/Service</div>
              <div class="text-h6 text-weight-bold">
                ${{ selectedStaffId === 'all' ?
                  (staffEarningsData.reduce((total, staff) => total + (staff.booking_services?.length || 0), 0) > 0 ?
                    (totalWeeklyEarnings / staffEarningsData.reduce((total, staff) => total + (staff.booking_services?.length || 0), 0)).toFixed(2)
                    : '0.00')
                  : (selectedStaffId && staffEarningsData.find(s => s.id === selectedStaffId)?.booking_services?.length > 0 ?
                    (totalWeeklyEarnings / staffEarningsData.find(s => s.id === selectedStaffId).booking_services.length).toFixed(2)
                    : '0.00') }}
              </div>
              <q-linear-progress
                :value="selectedStaffId === 'all' ?
                  (staffEarningsData.reduce((total, staff) => total + (staff.booking_services?.length || 0), 0) > 0 ?
                    Math.min((totalWeeklyEarnings / staffEarningsData.reduce((total, staff) => total + (staff.booking_services?.length || 0), 0)) / 100, 1)
                    : 0)
                  : (selectedStaffId && staffEarningsData.find(s => s.id === selectedStaffId)?.booking_services?.length > 0 ?
                    Math.min((totalWeeklyEarnings / staffEarningsData.find(s => s.id === selectedStaffId).booking_services.length) / 100, 1)
                    : 0)"
                color="green-4"
                class="q-mt-sm"
                style="height: 4px; width: 100%"
              />
            </div>
          </div>
        </q-card>
      </div>

      <!-- Sales by Staff Card -->
      <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
        <q-card
          class="col bg-white q-pa-lg shadow-1 card-min"
          style="border-radius: 20px"
        >
          <div class="row items-center q-mb-md">
            <div class="text-h6 text-grey-6">Sales by Staff</div>
            <q-btn flat round icon="more_vert" class="q-ml-auto" />
          </div>
          <div class="text-subtitle2 text-grey-5 q-mb-md">
            Monthly Sales Overview
          </div>
          <div
            v-for="country in countries"
            :key="country.name"
            class="row items-center q-mb-sm"
          >
            <img
              :src="country.flag"
              alt="flag"
              style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                object-fit: cover;
              "
            />
            <div class="q-ml-md">
              <div class="text-h6 text-weight-bold text-grey-4">
                ${{ country.amount }}
              </div>
              <div class="text-caption text-grey-5">{{ country.name }}</div>
            </div>
            <div class="q-ml-auto flex items-center">
              <q-icon
                :name="country.trend > 0 ? 'north' : 'south'"
                :color="country.trend > 0 ? 'green-5' : 'red-5'"
                size="16px"
              />
              <span
                :class="country.trend > 0 ? 'text-green-5' : 'text-red-5'"
                class="q-ml-xs"
                >{{ Math.abs(country.trend) }}%</span
              >
            </div>
          </div>
        </q-card>
      </div>

      <!-- Monthly Appointment Performance Card -->
      <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
        <q-card
          class="col bg-white q-pa-lg shadow-1 card-min"
          style="border-radius: 20px"
        >
          <div class="row items-center q-mb-md">
            <div class="text-h6 text-grey-6">
              Monthly Appointment Performance
            </div>
            <q-btn flat round icon="more_vert" class="q-ml-auto" />
          </div>
          <div class="text-subtitle2 text-grey-5 q-mb-md">
            4,210 Social Visitor
          </div>
          <div
            v-for="item in marketing"
            :key="item.label"
            class="row items-center q-mb-sm"
          >
            <div
              :class="item.bg"
              class="flex flex-center"
              style="width: 40px; height: 40px; border-radius: 12px"
            >
              <q-icon :name="item.icon" :color="item.color" size="24px" />
            </div>
            <div class="q-ml-md text-grey-4" style="min-width: 120px">
              {{ item.label }}
            </div>
            <div class="q-ml-auto text-h6 text-weight-bold text-grey-6">
              {{ item.value }}
            </div>
            <div class="q-ml-md" :class="item.trend > 0 ? 'text-green-5' : ''">
              {{
                item.trend
                  ? (item.trend > 0 ? "+" : "") + item.trend + "%"
                  : item.percent + "%"
              }}
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

const AppointmentTrackerchartOptions = {
  chart: {
    type: "radialBar",
    offsetY: 20,
    background: "transparent",
    sparkline: { enabled: true },
    dropShadow: { enabled: false },
    events: {},
    selection: { enabled: false },
    zoom: { enabled: false },
  },
  plotOptions: {
    radialBar: {
      startAngle: -135,
      endAngle: 135,
      hollow: {
        margin: 0,
        size: "70%",
        background: "transparent",
        image: undefined,
      },
      track: {
        background: "transparent",
        strokeWidth: "100%",
        margin: 0,
        dashArray: 0,
      },
      dataLabels: {
        name: {
          offsetY: -20,
          show: true,
          color: "#bdbacb",
          fontSize: "15px",
          fontWeight: 500,
        },
        value: {
          offsetY: 20,
          // color: "#6C5DD3",
          fontSize: "38px",
          fontWeight: 500,
          show: true,
          formatter: function (val) {
            return val + "%";
          },
        },
      },
    },
  },
  states: {
    hover: {
      filter: {
        type: "none",
      },
    },
    active: {
      filter: {
        type: "none",
      },
    },
  },
  fill: {
    type: "gradient",
    gradient: {
      shade: "light",
      type: "horizontal",
      gradientToColors: ["#7367f0"],
      stops: [0, 100],
      shadeIntensity: 1,
      opacityFrom: 1,
      opacityTo: 1,
    },
    colors: ["#cdc9fa"],
  },
  stroke: {
    lineCap: "butt",
    dashArray: 6,
  },
  labels: ["Completed Appointments"],
};
const AppointmentTrackerSeries = ref([0]);


const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// Staff earnings data
const staffEarningsData = ref([]);
const selectedStaffId = ref('all'); // Default to 'all'
const selectedStaffName = ref('All Staff');
const weeklyEarningsData = ref([0, 0, 0, 0, 0, 0, 0]); // Monday to Sunday

const StaffEarningsBarOptions = computed(() => ({
  chart: {
    type: "bar",
    toolbar: { show: false },
    height: 180,
    events: {
      dataPointSelection: function(event, chartContext, config) {
        // This will be handled by the staff selection buttons instead
      }
    }
  },
  plotOptions: {
    bar: {
      borderRadius: 8,
      columnWidth: "40%",
      distributed: true,
    },
  },
  dataLabels: {
    enabled: true,
    offsetY: 2,
    style: {
      fontSize: '12px',
      fontWeight: 'bold',
      colors: ['#ffffff']
    },
    formatter: function (val) {
      return val > 0 ? '$' + val.toFixed(0) : '';
    }
  },
  xaxis: {
    categories: days,
    labels: { style: { colors: "#bdbacb", fontSize: "14px" } },
  },
  yaxis: {
    show: false
  },
  grid: { show: false },
  legend: {
    show: false
  },
  tooltip: {
    enabled: true,
    y: {
      formatter: function (val) {
        return '$' + val.toFixed(2);
      }
    }
  },
  colors: days.map((_, idx) => (selectedStaffId.value ? "#5B4FE9" : "#E6E4FB")),
}));

const StaffEarningsBarSeries = computed(() => [{
  name: 'Earnings',
  data: weeklyEarningsData.value
}]);

const AppointmentWeekChartOptions = {
  chart: {
    type: "line",
  },
  xaxis: {
    categories: ["Jan", "Feb", "Mar", "Apr"],
  },
};
const AppointmentWeekSeries = [
  {
    name: "Sales",
    data: [10, 41, 35, 51],
  },
];

const countries = [
  {
    name: "United States",
    amount: "2.45",
    trend: 5.8,
    flag: "https://flagcdn.com/us.svg",
  },
  {
    name: "Brazil",
    amount: "4.78",
    trend: -6.2,
    flag: "https://flagcdn.com/br.svg",
  },
  {
    name: "India",
    amount: "1.48",
    trend: 22.3,
    flag: "https://flagcdn.com/in.svg",
  },
  {
    name: "Australia",
    amount: "2.12",
    trend: -31.9,
    flag: "https://flagcdn.com/au.svg",
  },
  {
    name: "France",
    amount: "2.45",
    trend: 6.2,
    flag: "https://flagcdn.com/fr.svg",
  },
  {
    name: "China",
    amount: "1.90",
    trend: 4.8,
    flag: "https://flagcdn.com/cn.svg",
  },
];
const marketing = [
  {
    label: "Email Messages",
    value: "12,346",
    percent: 0.3,
    icon: "mail",
    color: "green-5",
    bg: "bg-green-1",
  },
  {
    label: "Emails Opened",
    value: "8,734",
    percent: 2.1,
    icon: "link",
    color: "cyan-5",
    bg: "bg-cyan-1",
  },
  {
    label: "Links Clicked",
    value: "967",
    percent: 1.4,
    icon: "campaign",
    color: "red-5",
    bg: "bg-red-1",
  },
  {
    label: "Subscribers",
    value: "345",
    trend: 8.5,
    icon: "person",
    color: "cyan-7",
    bg: "bg-cyan-1",
  },
  {
    label: "Complaints",
    value: "10",
    percent: 1.5,
    icon: "report_problem",
    color: "red-5",
    bg: "bg-red-1",
  },
  {
    label: "Unsubscribers",
    value: "86",
    percent: 0.8,
    icon: "block",
    color: "orange-5",
    bg: "bg-orange-1",
  },
];


const todayStatistics = ref({
  total_appointments: 0,
  total_revenue: 0,
  total_paid: 0,
  appointmentGroup: null,
  orderGroup: null,
});

const staffIncomeStatistics = ref({
  total_income: 0,
  income_by_staff: [],
});

// Function to calculate weekly earnings for selected staff
const calculateWeeklyEarnings = (staffData) => {
  const weeklyData = [0, 0, 0, 0, 0, 0, 0]; // Monday to Sunday

  if (!staffData || !staffData.booking_services) {
    return weeklyData;
  }

  staffData.booking_services.forEach(booking => {
    const bookingDate = new Date(booking.booking_time);
    // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    let dayOfWeek = bookingDate.getDay();
    // Convert to Monday = 0, Tuesday = 1, ..., Sunday = 6
    dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    weeklyData[dayOfWeek] += booking.service_price;
  });

  return weeklyData;
};

// Function to calculate weekly earnings for all staff combined
const calculateAllStaffWeeklyEarnings = () => {
  const weeklyData = [0, 0, 0, 0, 0, 0, 0]; // Monday to Sunday

  staffEarningsData.value.forEach(staff => {
    if (staff.booking_services) {
      staff.booking_services.forEach(booking => {
        const bookingDate = new Date(booking.booking_time);
        // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        let dayOfWeek = bookingDate.getDay();
        // Convert to Monday = 0, Tuesday = 1, ..., Sunday = 6
        dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        weeklyData[dayOfWeek] += booking.service_price;
      });
    }
  });

  return weeklyData;
};

// Function to select all staff and update chart
const selectAllStaff = () => {
  selectedStaffId.value = 'all';
  selectedStaffName.value = 'All Staff';
  weeklyEarningsData.value = calculateAllStaffWeeklyEarnings();
};

// Function to select staff and update chart
const selectStaff = (staff) => {
  selectedStaffId.value = staff.id;
  selectedStaffName.value = staff.name;
  weeklyEarningsData.value = calculateWeeklyEarnings(staff);
};

// Calculate total weekly earnings for selected staff
const totalWeeklyEarnings = computed(() => {
  return weeklyEarningsData.value.reduce((sum, amount) => sum + amount, 0);
});

onMounted(() => {
  fetchTodayStatistics();
  fetchStaffIncomeStatistics();
});

async function fetchTodayStatistics() {
  try {
    const response = await api.get("/api/getTodayStatistics");

    if (response.data) {
      todayStatistics.value = {
        total_appointments: response.data.total_appointments || 0,
        total_revenue: response.data.total_revenue || 0,
        total_paid: response.data.total_paid || 0,
        appointmentGroup: response.data.appointmentGroup || null,
        orderGroup: response.data.orderGroup || null,
      };
      console.log("Today's statistics:", todayStatistics.value);
      //AppointmentTrackerSeries computed by the finished appointments / total appointments
      AppointmentTrackerSeries.value = [
        response.data.appointmentGroup?.finished
          ? (
              (response.data.appointmentGroup.finished /
                response.data.total_appointments) *
              100
            ).toFixed(2)
          : 0,
      ];
    }
  } catch (error) {
    console.error("Error fetching today's statistics:", error);
  }
}

async function fetchStaffIncomeStatistics() {
  try {
    const date = new Date();
    // if weekly statistics, set to the start of the week (Monday)
    const start_date = new Date(date.setDate(date.getDate() - date.getDay() + 1));
    const end_date = new Date(date.setDate(date.getDate() - date.getDay() + 7));

    const response = await api.get("/api/getStaffIncomeStatistics",
      {
        params: {
          start_date: start_date.toISOString().split("T")[0], // Format date as YYYY-MM-DD
          end_date: end_date.toISOString().split("T")[0],
        },
      }
    );

    if (response.data) {
      staffEarningsData.value = response.data; // Store the staff array directly

      // Calculate total income from all staff
      const totalIncome = response.data.reduce((sum, staff) => {
        const staffTotal = staff.booking_services.reduce((staffSum, booking) =>
          staffSum + booking.service_price, 0);
        return sum + staffTotal;
      }, 0);

      staffIncomeStatistics.value = {
        total_income: totalIncome,
        income_by_staff: response.data,
      };

      // Auto-select "All" staff by default
      if (response.data.length > 0) {
        selectAllStaff();
      }

      console.log("Staff income statistics:", staffIncomeStatistics.value);
    }
  } catch (error) {
    console.error("Error fetching staff income statistics:", error);
  }
}

// Payment method configuration
const paymentMethodConfig = {
  cash: {
    label: "Cash",
    icon: "payments",
    iconColor: "green-5",
    bgColor: "bg-green-1",
  },
  eft_pos: {
    label: "EFT/POS",
    icon: "credit_card",
    iconColor: "blue-5",
    bgColor: "bg-blue-1",
  },
  bank_transfer: {
    label: "Bank Transfer",
    icon: "account_balance",
    iconColor: "purple-5",
    bgColor: "bg-purple-1",
  },
  hicaps: {
    label: "Hicaps",
    icon: "local_hospital",
    iconColor: "red-5",
    bgColor: "bg-red-1",
  },
  voucher: {
    label: "Voucher",
    icon: "card_giftcard",
    iconColor: "orange-5",
    bgColor: "bg-orange-1",
  },
  unpaid: {
    label: "Unpaid",
    icon: "schedule",
    iconColor: "grey-5",
    bgColor: "bg-grey-1",
  },
};

// Computed property to get top payment methods with percentages
const topPaymentMethods = computed(() => {
  if (!todayStatistics.value.orderGroup) {
    return [];
  }

  const orderGroup = todayStatistics.value.orderGroup;
  const totalRevenue = todayStatistics.value.total_revenue || 1; // Avoid division by zero

  // Convert orderGroup to array and calculate percentages
  const methods = Object.entries(orderGroup)
    .map(([key, amount]) => {
      const config = paymentMethodConfig[key] || {
        label: key.charAt(0).toUpperCase() + key.slice(1),
        icon: "payment",
        iconColor: "grey-5",
        bgColor: "bg-grey-1",
      };
      return {
        key,
        amount: Number(amount),
        percentage:
          totalRevenue > 0
            ? ((Number(amount) / totalRevenue) * 100).toFixed(1)
            : "0.0",
        ...config,
      };
    })
    .filter((method) => method.amount > 0) // Only show methods with amounts
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending

  return methods;
});

// Computed property for the progress bar (showing the percentage of paid amounts excluding unpaid and voucher)
const topPaymentMethodPercentage = computed(() => {
  if (!todayStatistics.value.orderGroup) {
    return 0;
  }

  const orderGroup = todayStatistics.value.orderGroup;
  const totalRevenue = todayStatistics.value.total_revenue || 1;

  // Calculate total paid amount (excluding unpaid and voucher)
  const paidAmount = Object.entries(orderGroup)
    .filter(([key]) => key !== "unpaid" && key !== "voucher")
    .reduce((sum, [, amount]) => sum + Number(amount), 0);

  // Return percentage of paid amount vs total revenue
  return totalRevenue > 0 ? (paidAmount / totalRevenue) * 100 : 0;
});

</script>

<style scoped>
.q-card {
  border-radius: 16px;
}
</style>
