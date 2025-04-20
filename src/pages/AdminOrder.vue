<template>
  <div class="q-pa-md">
    <q-table
      :rows="orders"
      :columns="columns"
      row-key="id"
      title="Admin Orders"
      v-model:pagination="pagination"
      :loading="loading"
      :filter="filter"
      @request="onRequest"
      binary-state-sort
    >
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width>
            <q-icon name="expand_more" size="sm" />
          </q-th>
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-icon
              v-if="props.row.payment.length > 0"
              size="sm"
              color="accent"
              @click="props.expand = !props.expand"
              :name="props.expand ? 'remove' : 'add'"
            />
          </q-td>
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <template v-if="col.name === 'order_status'">
              <q-chip :color="getStatusColor(props.row.order_status)" outline>
                {{ props.row.order_status }}
              </q-chip>
            </template>
            <template v-else-if="col.name === 'payment_status'">
              <q-chip :color="getStatusColor(props.row.payment_status)" outline>
                {{ props.row.payment_status }}
              </q-chip>
            </template>
            <template v-else-if="col.name === 'actions'">
              <q-btn flat round icon="delete" color="grey-6" size="10px" />
              <q-btn flat round icon="o_visibility" color="grey" size="10px" />
              <q-btn flat round icon="more_vert" color="grey" size="10px" />
            </template>
            <template v-else-if="col.name === 'created_at'">
              {{ new Date(props.row[col.field]).toLocaleDateString(
                "en-AU",
                {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }
              ) }}
            </template>
            <template v-else-if="col.format">
              {{ col.format(props.row[col.field]) }}
            </template>
            <template v-else>
              {{ props.row[col.field] }}
            </template>
          </q-td>
        </q-tr>
        <q-tr v-if="props.expand" :props="props">
          <q-td colspan="100%">
              <q-card-section
              horizontal  class="text-grey" v-for="(item, index) in props.row.payment" :key="index">
                    <q-label class="q-ma-sm">{{ item.payment_status }}</q-label>
                    <q-label class="q-ma-sm">{{ item.payment_method }}</q-label>
                    <q-label class="q-ma-sm">Total:{{ item.total_amount }}</q-label>
                    <q-label class="q-ma-sm">Paid:{{ item.paid_amount }}</q-label>
              </q-card-section>
          </q-td>
        </q-tr>
      </template>

      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn
          color="primary"
          icon-right="archive"
          label="Export to csv"
          no-caps
          @click="exportTable"
        />
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { exportFile, useQuasar } from "quasar";

const $q = useQuasar();
const orders = ref([]);
const filter = ref("");
const loading = ref(false);
const pagination = ref({
  sortBy: "id",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

const columns = [
  { name: "id", required: true, label: "ID", align: "left", field: "id" },
  {
    name: "appointment_id",
    label: "Appointment ID",
    align: "left",
    field: "appointment_id",
  },
  {
    name: "order_status",
    label: "Order Status",
    align: "left",
    field: "order_status",
  },
  {
    name: "payment_status",
    label: "Payment Status",
    align: "left",
    field: "payment_status",
  },
  {
    name: "payment_method",
    label: "Payment Method",
    align: "center",
    field: "payment_method",
    format: (val) => `${val.replace("_", " ")}`,
  },
  {
    name: "total_amount",
    label: "Total Amount",
    align: "center",
    field: "total_amount",
    format: (val) => `$${val}`,
  },
  {
    name: "paid_amount",
    label: "Paid Amount",
    align: "center",
    field: "paid_amount",
    format: (val) => `$${val}`,
  },

  {
    name: "operator_name",
    label: "Staff",
    align: "left",
    field: "operator_name",
  },
  {
    name: "created_at",
    label: "Created At",
    align: "left",
    field: "created_at",
  },
  { name: "actions", label: "Actions", align: "center", field: "actions" },
];

const getStatusColor = (status) => {
  switch (status) {
    case "paid":
    case "success":
      return "green";
    case "pending":
      return "orange";
    case "failed":
      return "red";
    default:
      return "grey";
  }
};

const fetchOrders = async (startRow, count, filter, sortBy, descending) => {
  try {
    loading.value = true;
    const response = await api.get("/api/orders", {
      params: {
        start: startRow,
        count,
        filter,
        sortBy,
        descending,
      },
    });

    if (response.data && Array.isArray(response.data.rows)) {
      orders.value = response.data.rows;
      pagination.value.rowsNumber = response.data.total || 0;
    } else {
      console.error("Unexpected API response structure:", response.data);
      orders.value = [];
      pagination.value.rowsNumber = 0;
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    orders.value = [];
    pagination.value.rowsNumber = 0;
  } finally {
    loading.value = false;
  }
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  const filterValue = props.filter;

  const startRow = (page - 1) * rowsPerPage;
  const count = rowsPerPage === 0 ? pagination.value.rowsNumber : rowsPerPage;

  fetchOrders(startRow, count, filterValue, sortBy, descending);
};

const wrapCsvValue = (val, formatFn, row) => {
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val;

  formatted =
    formatted === void 0 || formatted === null ? "" : String(formatted);

  formatted = formatted.split('"').join('""');
  /**
   * Excel accepts \n and \r in strings, but some other CSV parsers do not
   * Uncomment the next two lines to escape new lines
   */
  // .split('\n').join('\\n')
  // .split('\r').join('\\r')

  return `"${formatted}"`;
};

const exportTable = async () => {
  // naive encoding to csv format
  const content = [columns.map((col) => wrapCsvValue(col.label))]
    .concat(
      orders.value.map((row) =>
        columns
          .map((col) =>
            wrapCsvValue(
              typeof col.field === "function"
                ? col.field(row)
                : row[col.field === void 0 ? col.name : col.field],
              col.format,
              row
            )
          )
          .join(",")
      )
    )
    .join("\r\n");

  const status = exportFile("table-export.csv", content, "text/csv");

  if (status !== true) {
    $q.notify({
      message: "Browser denied file download...",
      color: "negative",
      icon: "warning",
    });
  }
};

onMounted(() => {
  onRequest({
    pagination: pagination.value,
    filter: undefined,
  });
});
</script>
