<template>
  <div class="q-pa-md">
    <q-table
      no-data-label="No orders found"
      :dense="$q.screen.lt.md"
      :columns="columns"
      :rows="data"
      row-key="id"
      v-model:pagination="pagination"
      :loading="loading"
  :filter="filter.value"
      @request="onRequest"
      binary-state-sort
    >
      <template v-slot:top-left>
        <div class="text-h6 q-mr-md">Orders</div>
        <q-chip
          outline
          color="primary"
          icon="add"
          clickable
          @click="openAddDialog"
        >
        Add
        </q-chip>
      </template>

      <template v-slot:top-right>
        <q-input
          outlined
          dense
          clearable
          debounce="500"
          rounded
          v-model="filter.value"
          :placeholder="`Search by ${
            filterFields.find((f) => f.value === filter.field)?.label || 'field'
          }`"
          class="q-mr-sm"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-btn flat dense round icon="o_filter_alt" color="grey-6">
          <q-menu>
            <q-list dense>
              <q-item
                v-ripple
                clickable
                v-for="(filterField, index) in filterFields"
                :key="index"
                @click="filter.field = filterField.value"
                :class="{ 'bg-grey-3': filter.field === filterField.value }"
              >
                <q-item-section>
                  <q-item-label class="text-grey-8 text-caption">{{
                    filterField.label
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn flat round icon="o_sort" color="grey-6">
          <q-menu auto-close>
            <q-list>
              <q-item
                v-ripple
                clickable
                @click="clearSelectedField"
                :class="{ 'bg-grey-3': !selected.field }"
              >
                <q-item-section
                  class="row items-center text-grey-6 text-caption"
                >
                  <q-icon name="clear_all" size="sm" />
                  <q-item-label>Clear Filter</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item
                v-ripple
                clickable
                v-for="(selectedField, index) in searchFields"
                :key="index"
                @click="handleSelectedFieldClick(selectedField.value)"
                :class="{ 'bg-grey-3': selected.field === selectedField.value }"
              >
                <q-item-section
                  class="row items-center text-grey-6 text-caption"
                >
                  <q-icon :name="selectedField.icon" size="sm" />
                  <q-item-label>{{ selectedField.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </template>

      <template v-slot:header="props">
        <q-tr :props="props">
          <!-- <q-th auto-width>
            <q-icon name="expand_more" size="sm" />
          </q-th> -->
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body-cell-type="props">
        <q-td :props="props">
          <q-chip
            size="sm"
            dense
            :color="getTypeColor(props.row.type)"
            :label="formatType(props.row.type)"
            text-color="white"
            class="q-ma-xs"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip
            size="sm"
            dense
            :color="getStatusColor(props.row.status)"
            :label="formatType(props.row.status)"
            text-color="white"
            class="q-ma-xs"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-tag="props">
        <q-td :props="props">
          <q-chip
            v-if="props.row.tag"
            size="sm"
            dense
            color="orange"
            :label="props.row.tag"
            text-color="white"
            class="q-ma-xs"
          />
        </q-td>
      </template>
    </q-table>

    <!-- Attribute Dialog -->
    <AttributeDialog
      v-model="showDialog"
      :attribute="selectedAttribute"
      :isEdit="isEditMode"
      @success="onDialogSuccess"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "boot/axios";
import { date as qDate, useQuasar } from "quasar";
import AttributeDialog from "src/components/dialog/AttributeDialog.vue";

const router = useRouter();
const $q = useQuasar();
const API_URL = "/api/orders";
const data = ref([]);

const columns = [
  { name: "order_number", label: "Order No.", align: "left", field: "order_number", sortable: true },
  { name: "user_id", label: "User ID", align: "left", field: "user_id", sortable: true },
  { name: "type", label: "Type", align: "center", field: "type", sortable: true },
  { name: "status", label: "Status", align: "center", field: "status", sortable: true },
  {
    name: "final_amount",
    label: "Final Amount",
    align: "right",
    field: "final_amount",
    sortable: true,
    format: (val) => formatCurrency(val),
  },
  {
    name: "paid_amount",
    label: "Paid",
    align: "right",
    field: "paid_amount",
    sortable: true,
    format: (val) => formatCurrency(val),
  },
  { name: "payment_method", label: "Payment", align: "left", field: "payment_method", sortable: true },
  { name: "tag", label: "Tag", align: "center", field: "tag", sortable: true },
  {
    name: "created_at",
    label: "Created At",
    align: "left",
    field: "created_at",
    sortable: true,
    format: (val) => formatDate(val),
  },
];

const filterFields = [
  { label: "Order No.", value: "order_number" },
  { label: "User ID", value: "user_id" },
  { label: "Type", value: "type" },
  { label: "Status", value: "status" },
  { label: "Payment Method", value: "payment_method" },
  { label: "Tag", value: "tag" },
  { label: "Note", value: "note" },
  { label: "Remark", value: "remark" },
];

const searchFields = [
  // Types
  { icon: "restaurant", label: "Dine In", value: "type:dine_in" },
  { icon: "takeout_dining", label: "Takeaway", value: "type:takeaway" },
  { icon: "delivery_dining", label: "Delivery", value: "type:delivery" },
  // Status
  { icon: "check_circle", label: "Completed", value: "status:completed" },
  { icon: "hourglass_top", label: "Pending", value: "status:pending" },
  { icon: "cancel", label: "Canceled", value: "status:canceled" },
  // Payment methods
  { icon: "payments", label: "Cash", value: "payment_method:cash" },
  { icon: "credit_card", label: "Card", value: "payment_method:card" },
  { icon: "account_balance", label: "Bank Transfer", value: "payment_method:bank_transfer" },
  { icon: "account_balance_wallet", label: "Digital Wallet", value: "payment_method:digital_wallet" },
  // Tag
  { icon: "priority_high", label: "Urgent", value: "tag:urgent" },
];

const filter = ref({
  field: "order_number",
  value: "",
});
const selected = ref({
  field: "",
  value: "",
});
const loading = ref(false);
const pagination = ref({
  sortBy: "id",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

// Dialog state
const showDialog = ref(false);
const selectedAttribute = ref({});
const isEditMode = ref(false);

onMounted(() => {
  onRequest({
    pagination: pagination.value,
    filter: undefined,
  });
});

const fetchData = async (
  startRow,
  count,
  filter,
  sortBy,
  descending,
  selected
) => {
  try {
    loading.value = true;
    const response = await api.get(API_URL, {
      params: {
        start: startRow,
        count,
        filter: filter && filter.value ? JSON.stringify(filter) : undefined,
        selected:
          selected && selected.field ? JSON.stringify(selected) : undefined,
        sortBy,
        descending,
      },
    });
    data.value = response.data?.rows || [];
    pagination.value.rowsNumber = response.data?.total || 0;
    loading.value = false;
  } catch (error) {
    console.error("Error fetching data:", error);
    data.value = []; // Ensure data is reset to an empty array on error
    pagination.value.rowsNumber = 0; // Reset rowsNumber to 0 on error
    loading.value = false;
  }
};

const onRequest = (props) => {
  loading.value = true;
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  // Only send filter if value is not empty, and pass a plain object
  const filterValue = filter.value.value ? { ...filter.value } : undefined;
  // Only send selected if field is not empty, and pass a plain object
  const selectedValue =
    selected.value && selected.value.field ? { ...selected.value } : undefined;

  const startRow = (page - 1) * rowsPerPage;
  const count = rowsPerPage === 0 ? pagination.value.rowsNumber : rowsPerPage;
  fetchData(startRow, count, filterValue, sortBy, descending, selectedValue);
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  loading.value = false;
};

const handleSelectedFieldClick = (fieldValue) => {
  selected.value.field = fieldValue;
  // Trigger data refresh when selected field changes
  onRequest({
    pagination: pagination.value,
    filter: undefined,
  });
};

const clearSelectedField = () => {
  selected.value.field = "";
  selected.value.value = "";
  // Trigger data refresh when clearing selected field
  onRequest({
    pagination: pagination.value,
    filter: undefined,
  });
};

const deleteRow = async (id) => {
  $q.dialog({
    title: "Confirm Deletion?",
    message: "Are you sure you want to completely delete this attribute?",
    cancel: true,
    persistent: true,
  })
    .onOk(() => {
      api
        .delete(`${API_URL}/${id}`)
        .then(() => {
          $q.notify({
            type: "positive",
            message: "Attribute deleted successfully.",
          });
          // Refresh the attributes list after deletion
          onRequest({
            pagination: pagination.value,
            filter: undefined,
          });
        })
        .catch((error) => {
          console.error("Error deleting:", error);
          $q.notify({
            type: "negative",
            message: "Failed to delete attribute.",
          });
        });
    })
    .onCancel(() => {
      return;
    });
};

const getTypeColor = (type) => {
  const colorMap = {
    dine_in: "teal",
    takeaway: "orange",
    delivery: "blue",
  };
  return colorMap[type] || "grey";
};

const getStatusColor = (status) => {
  const colorMap = {
    completed: "green",
    pending: "orange",
    canceled: "red",
    cancelled: "red",
  };
  return colorMap[status] || "grey";
};

const formatType = (type) => {
  return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatCurrency = (val) => {
  const num = Number(val);
  if (Number.isNaN(num)) return "-";
  return `$${num.toFixed(2)}`;
};

const formatDate = (val) => {
  if (!val) return "-";
  try {
  return qDate.formatDate(new Date(val), "YYYY-MM-DD HH:mm");
  } catch (e) {
    return String(val);
  }
};

const editAttribute = (attribute) => {
  selectedAttribute.value = { ...attribute };
  isEditMode.value = true;
  showDialog.value = true;
};

const openAddDialog = () => {
  selectedAttribute.value = {};
  isEditMode.value = false;
  showDialog.value = true;
};

const onDialogSuccess = () => {
  // Refresh the table data when dialog operation succeeds
  onRequest({
    pagination: pagination.value,
    filter: undefined,
  });
};
</script>
