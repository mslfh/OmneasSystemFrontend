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
                  ? `From ${(scheduleSelectedDateRange['from'])} to ${(scheduleSelectedDateRange['to'])}`
                  : "Current Week" }}
              </div>
            </div>
            <q-btn flat round icon="more_vert" class="q-ml-auto">
              <q-menu>
                <q-list style="min-width: 300px">
                  <q-item-label header class="text-subtitle1">* Select Date Range</q-item-label>
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
                  <q-item clickable v-close-popup @click="resetScheduleDateRange">
                    <q-item-section>
                      <q-item-label class="text-grey-6">Reset to Current Week</q-item-label>
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
          <div class="row q-mb-md q-gutter-xs" v-if="staffScheduleData.length > 0">
            <q-btn
              :color="selectedScheduleStaffId === 'all' ? 'deep-purple-4' : 'grey-4'"
              :text-color="selectedScheduleStaffId === 'all' ? 'white' : 'grey-7'"
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
              :color="selectedScheduleStaffId === staff.id ? 'deep-purple-4' : 'grey-4'"
              :text-color="selectedScheduleStaffId === staff.id ? 'white' : 'grey-7'"
              :outline="selectedScheduleStaffId !== staff.id"
              size="sm"
              @click="selectScheduleStaff(staff)"
              class="q-mb-xs"
            >
              {{ staff.name }}
            </q-btn>
          </div>

          <!-- No Staff Message -->
          <div v-if="staffScheduleData.length === 0" class="text-center q-pa-md">
            <q-icon name="schedule" size="48px" color="grey-4" class="q-mb-sm" />
            <div class="text-body1 text-grey-6">No staff schedule data available</div>
            <div class="text-caption text-grey-5">Please check back later or contact administrator</div>
          </div>

          <!-- Main Schedule Content -->
          <div v-if="staffScheduleData.length > 0">
            <div class="row items-center q-mb-md">
              <div class="col-auto">
                <div class="text-h3 text-weight-bold">
                  {{ totalWeeklyHours.toFixed(1) }}h
                </div>
              </div>
              <div class="col-auto flex items-center">
                <q-badge color="orange-2" text-color="orange-8" class="q-ml-sm">{{
                  selectedScheduleStaffDisplayName
                }}</q-badge>
              </div>
            </div>
            <div class="text-grey-5 q-mb-md">
              Weekly schedule for {{ selectedScheduleStaffDisplayName || "selected staff" }}
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
                  {{ totalWeeklyHours.toFixed(1) }}h
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

      <!-- Statistics Card with Carousel -->
      <div v-if="false" class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
        <q-card
          class="fit shadow-1 overflow-hidden"
        >
          <q-carousel
            v-model="currentStatSlide"
            transition-prev="slide-right"
            transition-next="slide-left"
            swipeable
            animated
            control-color="white"
            navigation
            infinite
            :autoplay="5000"
            height="100%"
            class="text-white rounded-borders"
            style=" background: #7165ec;"
          >
            <!-- Slide 1: Site Performance -->
            <q-carousel-slide name="performance" class="column no-wrap q-pa-none">
              <div class="q-pa-lg fit">
                <div class="row fit">
                  <div class="col-7 column justify-between">
                    <div>
                      <div class="text-h4 text-white q-mb-xs">
                        Service Performance
                      </div>
                      <div class="text-subtitle1 text-white" style="opacity: 0.8;">
                        The conversion rate is a total of {{ appointmentConversionRate }}%.
                      </div>
                    </div>

                    <div class="q-mt-md">
                      <div class="text-h5 text-white q-mb-md">Spending</div>
                      <div class="row q-gutter-lg">
                        <div class="col">
                          <div class="text-h6 text-white">
                            {{ todayStatistics.total_appointments }}h
                          </div>
                          <div class="text-body2 text-white" style="opacity: 0.8;">
                            Spend
                          </div>
                          <div class="text-body2 text-white q-mt-sm">
                            {{ todayStatistics.appointmentGroup?.finished || 0 }}
                          </div>
                          <div class="text-body2 text-white" style="opacity: 0.8;">
                            Order
                          </div>
                        </div>
                        <div class="col">
                          <div class="text-h6 text-white">110</div>
                          <div class="text-body2 text-white" style="opacity: 0.8;">
                            Order Size
                          </div>
                          <div class="text-body2 text-white q-mt-sm">28k</div>
                          <div class="text-body2 text-white" style="opacity: 0.8;">
                            Items
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-5 flex flex-center">
                    <q-img
                      src="../assets/sidebar-dashboard.png"
                      style="max-width: 200px; max-height: 200px"
                      class="performance-image"
                    />
                  </div>
                </div>
              </div>
            </q-carousel-slide>

            <!-- Slide 2: Appointment Statistics -->
            <q-carousel-slide name="appointments" class="column no-wrap q-pa-none">
              <div class="q-pa-lg fit">
                <div class="row fit">
                  <div class="col-7 column justify-between">
                    <div>
                      <div class="text-h4 text-white q-mb-xs">
                        Orders Statistics
                      </div>
                      <div class="text-subtitle1 text-white" style="opacity: 0.8;">
                        Updated {{ formatUpdateTime() }}
                      </div>
                    </div>

                    <div class="q-mt-md">
                      <div class="text-h5 text-white q-mb-md">
                        Today's Overview
                      </div>
                      <div class="row q-gutter-lg">
                        <div class="col">
                          <div class="text-h6 text-white">
                            {{ todayStatistics.total_appointments }}
                          </div>
                          <div class="text-body2 text-white" style="opacity: 0.8;">
                            Total Appointments
                          </div>
                          <div class="text-body2 text-white q-mt-sm">
                            ${{ todayStatistics.total_revenue.toFixed(0) }}
                          </div>
                          <div class="text-body2 text-white" style="opacity: 0.8;">
                            Revenue
                          </div>
                        </div>
                        <div class="col">
                          <div class="text-h6 text-white">
                            {{ todayStatistics.appointmentGroup?.finished || 0 }}
                          </div>
                          <div class="text-body2 text-white" style="opacity: 0.8;">
                            Completed
                          </div>
                          <div class="text-body2 text-white q-mt-sm">
                            {{ todayStatistics.appointmentGroup?.booked || 0 }}
                          </div>
                          <div class="text-body2 text-white" style="opacity: 0.8;">
                            Pending
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-5 flex flex-center">
                    <q-img
                      src="../assets/sidebar-dashboard.png"
                      style="max-width: 200px; max-height: 200px"
                      class="appointment-image"
                    />
                  </div>
                </div>
              </div>
            </q-carousel-slide>

            <!-- Slide 3: Revenue Analytics -->
            <q-carousel-slide name="revenue" class="column no-wrap q-pa-none">
              <div class="q-pa-lg fit">
                <div class="row fit">
                  <div class="col-7 column justify-between">
                    <div>
                      <div class="text-h4 text-white q-mb-xs">
                        Revenue Analytics
                      </div>
                      <div class="text-subtitle1 text-white" style="opacity: 0.8;">
                        Financial performance overview
                      </div>
                    </div>

                    <div class="q-mt-md">
                      <div class="text-h5 text-white q-mb-md">
                        Payment Distribution
                      </div>
                      <div class="row q-gutter-lg">
                        <div class="col">
                          <div class="text-h6 text-white">
                            ${{ todayStatistics.total_revenue.toFixed(0) }}
                          </div>
                          <div class="text-body2 text-white" style="opacity: 0.8;">
                            Total Revenue
                          </div>
                          <div class="text-body2 text-white q-mt-sm">
                            ${{ todayStatistics.total_paid?.toFixed(0) || 0 }}
                          </div>
                          <div class="text-body2 text-white" style="opacity: 0.8;">
                            Paid Amount
                          </div>
                        </div>
                        <div class="col">
                          <div class="text-h6 text-white">
                            {{ topPaymentMethods.length }}
                          </div>
                          <div class="text-body2 text-white" style="opacity: 0.8;">
                            Payment Methods
                          </div>
                          <div class="text-body2 text-white q-mt-sm">
                            {{ topPaymentMethodPercentage.toFixed(1) }}%
                          </div>
                          <div class="text-body2 text-white" style="opacity: 0.8;">
                            Paid Rate
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-5 flex flex-center">
                    <q-img
                      src="../assets/sidebar-dashboard.png"
                      style="max-width: 200px; max-height: 200px"
                      class="revenue-image"
                    />
                  </div>
                </div>
              </div>
            </q-carousel-slide>
          </q-carousel>
        </q-card>
      </div>

      <!--Today Income Earned -->
      <div v-if="false" class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
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
              <div class="text-subtitle2 text-grey-5 q-mb-md">Orders</div>
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
          <div style="height: 100px; overflow: hidden;">
            <!-- Appointments line chart in this week -->
            <ApexCharts
              type="area"
              :options="AppointmentWeekChartOptions"
              :series="AppointmentWeekSeries"
              height="100"
            />
          </div>
        </q-card>
      </div>

      <!-- Sales Summary -->
      <div v-if="false" class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
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

      <!-- Tracker -->
      <div v-if="false" class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
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
      <div v-if="false" class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
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
              <div class="text-h2 text-weight-bold">
                ${{ totalWeeklyEarnings.toFixed(2) }}
              </div>
            </div>
            <div class="col-auto flex items-center">
              <q-badge color="orange-2" text-color="orange-8" class="q-ml-sm">{{
                selectedStaffName
              }}</q-badge>
            </div>
          </div>
          <div class="text-grey-5 q-mb-md">
            Weekly earnings for {{ selectedStaffName || "selected staff" }}
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
              <div class="text-h6 text-weight-bold">
                ${{ totalWeeklyEarnings.toFixed(2) }}
              </div>
              <q-linear-progress
                :value="
                  totalWeeklyEarnings > 0
                    ? Math.min(totalWeeklyEarnings / totalWeeklyEarnings, 1)
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
                name="schedule"
                color="cyan-5"
                size="md"
                class="q-mb-xs"
              />
              <div class="text-caption text-grey-6">Total Services</div>
              <div class="text-h6 text-weight-bold">
                {{ actualServiceCount }}
              </div>
              <q-linear-progress
                :value="
                  selectedStaffId === 'all'
                    ? 1
                    : selectedStaffId
                    ? totalServiceCount > 0
                      ? actualServiceCount / totalServiceCount
                      : 0
                    : 0
                "
                color="cyan-5"
                class="q-mt-sm"
                style="height: 4px; width: 100%"
              />
            </div>

            <div
              class="col bg-grey-1 q-pa-md rounded-borders flex column items-center"
            >
              <q-icon
                name="pending_actions"
                color="deep-orange-4"
                size="md"
                class="q-mb-xs"
              />
              <div class="text-caption text-grey-6">Pending</div>
              <div class="text-h6 text-weight-bold">
                {{ unpaidCount }}
              </div>
              <q-linear-progress
                :value="
                  selectedStaffId === 'all'
                    ? 1
                    : selectedStaffId
                    ? staffEarningsData.reduce(
                        (total, staff) =>
                          total +
                          (staff.booking_services?.filter(
                            (booking) =>
                              booking.appointment?.status !== 'finished'
                          ).length || 0),
                        0
                      ) > 0
                      ? unpaidCount /
                        staffEarningsData.reduce(
                          (total, staff) =>
                            total +
                            (staff.booking_services?.filter(
                              (booking) =>
                                booking.appointment?.status !== 'finished'
                            ).length || 0),
                          0
                        )
                      : 0
                    : 0
                "
                color="deep-orange-4"
                class="q-mt-sm"
                style="height: 4px; width: 100%"
              />
            </div>
            <div
              class="col bg-grey-1 q-pa-md rounded-borders flex column items-center"
            >
              <q-icon name="coffee" color="grey-6" size="md" class="q-mb-xs" />
              <div class="text-caption text-grey-6">Break</div>
              <div class="text-h6 text-weight-bold">
                {{ breakCount }}
              </div>
              <q-linear-progress
                :value="
                  selectedStaffId === 'all'
                    ? 1
                    : selectedStaffId
                    ? staffEarningsData.reduce(
                        (total, staff) =>
                          total +
                          (staff.booking_services?.filter(
                            (booking) => booking.appointment?.type === 'break'
                          ).length || 0),
                        0
                      ) > 0
                      ? breakCount /
                        staffEarningsData.reduce(
                          (total, staff) =>
                            total +
                            (staff.booking_services?.filter(
                              (booking) => booking.appointment?.type === 'break'
                            ).length || 0),
                          0
                        )
                      : 0
                    : 0
                "
                color="brown-5"
                class="q-mt-sm"
                style="height: 4px; width: 100%"
              />
            </div>
          </div>
        </q-card>
      </div>

      <!-- Sales by Staff Card -->
      <div v-if="false" class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
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
      <div v-if="false" class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
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

// Carousel state for statistics card
const currentStatSlide = ref("performance");

const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// Staff earnings data
const staffEarningsData = ref([]);
const selectedStaffId = ref("all"); // Default to 'all'
const selectedStaffName = ref("All Staff");
const weeklyEarningsData = ref([0, 0, 0, 0, 0, 0, 0]); // Monday to Sunday

// Schedule data
const staffScheduleData = ref([]);
const selectedScheduleStaffId = ref("all"); // Default to 'all'
const selectedScheduleStaffName = ref("All Staff");
const weeklyScheduleData = ref([0, 0, 0, 0, 0, 0, 0]); // Monday to Sunday
const scheduleSelectedDateRange = ref(null); // For date range picker

const StaffEarningsBarOptions = computed(() => ({
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
      columnWidth: "40%",
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
      return val > 0 ? "$" + val.toFixed(0) : "";
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
        return "$" + val.toFixed(2);
      },
    },
  },
  colors: days.map((_, idx) => (selectedStaffId.value ? "#5B4FE9" : "#E6E4FB")),
}));

const StaffEarningsBarSeries = computed(() => [
  {
    name: "Earnings",
    data: weeklyEarningsData.value,
  },
]);

const AppointmentWeekChartOptions = {
  chart: {
    type: "area",
    height: 100,
    width: "100%",
    sparkline: {
      enabled: true
    },
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    },
    dropShadow: {
      enabled: true,
      top: 1,
      left: 0,
      blur: 3,
      opacity: 0.2,
      color: "#3bcc7c"
    }
  },
  stroke: {
    curve: "smooth",
    width: 2.5,
    colors: ["#3bcc7c"],
    lineCap: "round"
  },
  fill: {
    type: "gradient",
    gradient: {
      type: "vertical",
      shadeIntensity: 1,
      gradientToColors: ["#3bcc7c"],
      inverseColors: false,
      opacityFrom: 0.5,
      opacityTo: 0.1,
      stops: [0, 90, 100]
    }
  },
  markers: {
    size: 0,
    hover: {
      size: 0
    }
  },
  grid: {
    show: false,
    padding: {
      top: -10,
      right: 5,
      bottom: -10,
      left: 5
    }
  },
  xaxis: {
    labels: {
      show: false
    },
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    },
    crosshairs: {
      show: false
    }
  },
  yaxis: {
    labels: {
      show: false
    },
    min: 0
  },
  dataLabels: {
    enabled: false
  },
  legend: {
    show: false
  },
  tooltip: {
    enabled: true,
    theme: 'light',
    style: {
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif'
    },
    custom: function({ series, seriesIndex, dataPointIndex }) {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return '<div style="background: #1f2937; color: white; padding: 8px 12px; border-radius: 6px; font-size: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">' +
        '<span>' + days[dataPointIndex] + ': ' + series[seriesIndex][dataPointIndex] + ' appointments</span>' +
        '</div>';
    }
  }
};
const AppointmentWeekSeries = [
  {
    name: "Appointments",
    data: [8, 15, 12, 22, 28, 20, 14],
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

  staffData.booking_services.forEach((booking) => {
    // Only include bookings that are not breaks or no-shows and have service_price
    if (
      booking.appointment?.type !== "break" &&
      booking.appointment?.type !== "no_show" &&
      booking.service_price !== null &&
      booking.service_price > 0
    ) {
      const bookingDate = new Date(booking.booking_time);
      // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
      let dayOfWeek = bookingDate.getDay();
      // Convert to Monday = 0, Tuesday = 1, ..., Sunday = 6
      dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      weeklyData[dayOfWeek] += booking.service_price;
    }
  });

  return weeklyData;
};

// Function to calculate weekly earnings for all staff combined
const calculateAllStaffWeeklyEarnings = () => {
  const weeklyData = [0, 0, 0, 0, 0, 0, 0]; // Monday to Sunday

  staffEarningsData.value.forEach((staff) => {
    if (staff.booking_services) {
      staff.booking_services.forEach((booking) => {
        // Only include bookings that are not breaks or no-shows and have service_price
        if (
          booking.appointment?.type !== "break" &&
          booking.appointment?.type !== "no_show" &&
          booking.service_price !== null &&
          booking.service_price > 0
        ) {
          const bookingDate = new Date(booking.booking_time);
          // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
          let dayOfWeek = bookingDate.getDay();
          // Convert to Monday = 0, Tuesday = 1, ..., Sunday = 6
          dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

          weeklyData[dayOfWeek] += booking.service_price;
        }
      });
    }
  });

  return weeklyData;
};

// Function to select all staff and update chart
const selectAllStaff = () => {
  selectedStaffId.value = "all";
  selectedStaffName.value = "All Staff";
  weeklyEarningsData.value = calculateAllStaffWeeklyEarnings();
};

// Function to select staff and update chart
const selectStaff = (staff) => {
  selectedStaffId.value = staff.id;
  selectedStaffName.value = staff.name;
  weeklyEarningsData.value = calculateWeeklyEarnings(staff);
};

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

// Calculate total weekly earnings for selected staff
const totalWeeklyEarnings = computed(() => {
  return weeklyEarningsData.value.reduce((sum, amount) => sum + amount, 0);
});

// Schedule Computed Properties
const totalWeeklyHours = computed(() => {
  if (staffScheduleData.value.length === 0) return 0;
  return weeklyScheduleData.value.reduce((sum, hours) => sum + hours, 0);
});

const totalScheduleCount = computed(() => {
  if (staffScheduleData.value.length === 0) return 0;
  if (selectedScheduleStaffId.value === "all") {
    return staffScheduleData.value.reduce((total, staff) => {
      return total + (staff.schedules ? Object.keys(staff.schedules).length : 0);
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
  return calculateAllStaffWeeklySchedule().reduce((sum, hours) => sum + hours, 0);
});

// Calculate actual service count (excluding breaks and no-shows)
const actualServiceCount = computed(() => {
  if (selectedStaffId.value === "all") {
    return staffEarningsData.value.reduce((total, staff) => {
      return (
        total +
        (staff.booking_services?.filter(
          (booking) =>
            booking.appointment?.type !== "break" &&
            booking.appointment?.type !== "no_show" &&
            booking.service_price !== null &&
            booking.service_price > 0
        ).length || 0)
      );
    }, 0);
  } else if (selectedStaffId.value) {
    const staff = staffEarningsData.value.find(
      (s) => s.id === selectedStaffId.value
    );
    return (
      staff?.booking_services?.filter(
        (booking) =>
          booking.appointment?.type !== "break" &&
          booking.appointment?.type !== "no_show" &&
          booking.service_price !== null &&
          booking.service_price > 0
      ).length || 0
    );
  }
  return 0;
});

// Calculate break count
const breakCount = computed(() => {
  if (selectedStaffId.value === "all") {
    return staffEarningsData.value.reduce((total, staff) => {
      return (
        total +
        (staff.booking_services?.filter(
          (booking) => booking.appointment?.type === "break"
        ).length || 0)
      );
    }, 0);
  } else if (selectedStaffId.value) {
    const staff = staffEarningsData.value.find(
      (s) => s.id === selectedStaffId.value
    );
    return (
      staff?.booking_services?.filter(
        (booking) => booking.appointment?.type === "break"
      ).length || 0
    );
  }
  return 0;
});

// Calculate unpaid count (appointments not finished)
const unpaidCount = computed(() => {
  if (selectedStaffId.value === "all") {
    return staffEarningsData.value.reduce((total, staff) => {
      return (
        total +
        (staff.booking_services?.filter(
          (booking) =>
            booking.appointment?.status !== "finished" &&
            booking.appointment?.type !== "break"
        ).length || 0)
      );
    }, 0);
  } else if (selectedStaffId.value) {
    const staff = staffEarningsData.value.find(
      (s) => s.id === selectedStaffId.value
    );
    return (
      staff?.booking_services?.filter(
        (booking) =>
          booking.appointment?.status !== "finished" &&
          booking.appointment?.type !== "break"
      ).length || 0
    );
  }
  return 0;
});

// Calculate combined break and unpaid count for backwards compatibility
const breakUnpaidCount = computed(() => {
  return breakCount.value + unpaidCount.value;
});

// Calculate total service count for progress bar calculation
const totalServiceCount = computed(() => {
  return staffEarningsData.value.reduce((total, staff) => {
    return (
      total +
      (staff.booking_services?.filter(
        (booking) =>
          booking.appointment?.type !== "break" &&
          booking.appointment?.type !== "no_show" &&
          booking.service_price !== null &&
          booking.service_price > 0
      ).length || 0)
    );
  }, 0);
});

// Computed property for appointment conversion rate
const appointmentConversionRate = computed(() => {
  if (todayStatistics.value.total_appointments === 0) return "0.0";
  const finishedAppointments =
    todayStatistics.value.appointmentGroup?.finished || 0;
  return (
    (finishedAppointments / todayStatistics.value.total_appointments) *
    100
  ).toFixed(1);
});

// Function to format update time
const formatUpdateTime = () => {
  const now = new Date();
  const hours = now.getHours();
  if (hours < 12) return "this morning";
  if (hours < 17) return "this afternoon";
  return "this evening";
};

onMounted(() => {
  fetchTodayStatistics();
  fetchStaffIncomeStatistics();
  fetchStaffScheduleStatistics();
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
    const start_date = new Date(
      date.setDate(date.getDate() - date.getDay() + 1)
    );
    const end_date = new Date(date.setDate(date.getDate() - date.getDay() + 7));

    const response = await api.get("/api/getStaffIncomeStatistics", {
      params: {
        start_date: start_date.toISOString().split("T")[0], // Format date as YYYY-MM-DD
        end_date: end_date.toISOString().split("T")[0],
      },
    });

    if (response.data) {
      staffEarningsData.value = response.data; // Store the staff array directly

      // Calculate total income from all staff (excluding breaks and no-shows)
      const totalIncome = response.data.reduce((sum, staff) => {
        const staffTotal = staff.booking_services.reduce(
          (staffSum, booking) => {
            // Only include bookings that are not breaks or no-shows and have service_price
            if (
              booking.appointment?.type !== "break" &&
              booking.appointment?.type !== "no_show" &&
              booking.service_price !== null &&
              booking.service_price > 0
            ) {
              return staffSum + booking.service_price;
            }
            return staffSum;
          },
          0
        );
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

async function fetchStaffScheduleStatistics(customStartDate = null, customEndDate = null) {
  try {
    let start_date, end_date;

    if (customStartDate && customEndDate) {
      // Use custom date range
      start_date = new Date(customStartDate);
      end_date = new Date(customEndDate);
    } else {
      // Use current week (default behavior)
      const date = new Date();
      // if weekly statistics, set to the start of the week (Monday)
      start_date = new Date(
        date.setDate(date.getDate() - date.getDay() + 1)
      );
      end_date = new Date(date.setDate(date.getDate() - date.getDay() + 7));
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

      console.log("Staff schedule statistics:", staffScheduleData.value);
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
      return val > 0 ? val.toFixed(1) + "h" : "";
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
  colors: days.map((_, idx) => (selectedScheduleStaffId.value ? "#5B4FE9" : "#E6E4FB")),
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

.bg-opacity-20 {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

/* Image animations for carousel slides */
.performance-image,
.appointment-image,
.revenue-image {
  filter: brightness(1.1) contrast(1.1);
  transition: all 0.3s ease;
  animation: float 3s ease-in-out infinite;
}

.performance-image:hover,
.appointment-image:hover,
.revenue-image:hover {
  transform: scale(1.05);
  filter: brightness(1.2) contrast(1.2);
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Carousel improvements */
.q-carousel__control {
  background: rgba(255, 255, 255, 0.2) !important;
  border-radius: 50% !important;
}

.q-carousel__control--active {
  background: rgba(255, 255, 255, 0.8) !important;
}

.q-carousel__arrow {
  background: rgba(255, 255, 255, 0.2) !important;
  border-radius: 50% !important;
  color: white !important;
}

.q-carousel__arrow:hover {
  background: rgba(255, 255, 255, 0.4) !important;
}

:deep(.tooltip-custom) {
  background: #1f2937;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
