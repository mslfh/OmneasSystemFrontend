<template>
  <div class="q-pa-md">
    <q-table
      title="Appointment History"
      no-data-label="No appointments found"
      :dense="$q.screen.lt.md"
      :rows="appointments"
      :columns="columns"
      row-key="id"
      v-model:pagination="pagination"
      :loading="loading"
      :filter="filter"
      @request="onRequest"
      binary-state-sort
    >
      <template v-slot:top-right>
        <q-input
          outlined
          dense
          debounce="300"
          clearable
          rounded
          v-model="filter"
          placeholder="Search by name, phone or date"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-icon
              size="sm"
              color="accent"
              @click="props.expand = !props.expand"
              :name="props.expand ? 'remove' : 'add'"
            />
          </q-td>
          <q-td key="service_title" :props="props">
            <div v-for="service in props.row.services" :key="service.id">
              {{ service.service_title }}
            </div>
          </q-td>
          <q-td key="booking_time" :props="props">
            {{ props.row.booking_time.slice(10, 16) }}
          </q-td>
          <q-td key="booking_date" :props="props">
            {{
              new Date(props.row.booking_time).toLocaleDateString("en-AU", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              })
            }}
          </q-td>
          <q-td key="customer_name" :props="props">
            <div v-for="service in props.row.services" :key="service.id">
              {{ service.customer_name }}
            </div>
          </q-td>
          <q-td key="status" :props="props">
            <q-chip
              size="12px"
              dense

              :color="
                props.row.status === 'finished' ? 'teal-4' :
                props.row.status === 'pending' ? 'red-10' :
                props.row.status === 'in_progress' ? 'green-4' : 'deep-orange-5'
              "
              :label="props.row.status"
              text-color="white"
              class="q-mr-sm"
            />
          </q-td>
           <q-td key="type" :props="props">
            <q-chip
              size="12px"
              dense
              outline
              :color="
                props.row.type === 'no_show' ? 'red-10' :
                props.row.type === 'break' ? 'grey' :
                props.row.type === 'assigned' ? 'green-5' : 'deep-orange-5'
              "
              :label="props.row.type"
              text-color="white"
              class="q-mr-sm"
            />
          </q-td>
          <q-td key="actions" :props="props">
            <q-btn flat round icon="delete" color="grey-6" size="10px" />
            <q-btn
              flat
              round
              icon="o_visibility"
              color="grey"
              size="10px"
              @click="
                router.push({
                  path: '/admin/appointment/detail',
                  query: { id: props.row.id },
                })
              "
            />
            <!-- <q-btn flat round icon="more_vert" color="grey" size="10px" /> -->
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <div class="text-left">
              Started at: {{ props.row.actual_start_time }}
              <br />
              Ended at: {{ props.row.actual_end_time }}
               <br />
              Comments: {{ props.row.comments }}
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "boot/axios";

const router = useRouter();
const appointments = ref([]); // Ensure appointments is always initialized as an empty array
const columns = [
  { name: "service_title", label: "Service Title", align: "left" },
  {
    name: "booking_time",
    label: "Booking Time",
    align: "left",
    field: "booking_time",
    sortable: true,
  },
  {
    name: "booking_date",
    label: "Booking Date",
    align: "left",
    field: "booking_date",
    sortable: true,
  },
  { name: "customer_name", label: "Customer Name", align: "left" },
  { name: "status", label: "Status", align: "center" },
  { name: "type", label: "Type", align: "center" },
  { name: "actions", label: "Actions", align: "center" },
];

const filter = ref("");
const loading = ref(false);
const pagination = ref({
  sortBy: "id",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

const fetchAppointments = async (
  startRow,
  count,
  filter,
  sortBy,
  descending
) => {
  try {
    loading.value = true;
    const response = await api.get("/api/appointments", {
      params: {
        start: startRow,
        count,
        filter,
        sortBy,
        descending,
      },
    });
    appointments.value = response.data?.rows || []; // Fallback to an empty array if rows is undefined
    pagination.value.rowsNumber = response.data?.total || 0; // Fallback to 0 if total is undefined
    loading.value = false;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    appointments.value = []; // Ensure appointments is reset to an empty array on error
    pagination.value.rowsNumber = 0; // Reset rowsNumber to 0 on error
    loading.value = false;
  }
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  const filterValue = props.filter;
  const startRow = (page - 1) * rowsPerPage;
  const count = rowsPerPage === 0 ? pagination.value.rowsNumber : rowsPerPage;
  fetchAppointments(startRow, count, filterValue, sortBy, descending);
};

onMounted(() => {
  onRequest({
    pagination: pagination.value,
    filter: undefined,
  });
});
</script>
