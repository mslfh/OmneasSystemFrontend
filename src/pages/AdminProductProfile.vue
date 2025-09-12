<template>
  <div class="q-pa-md">
    <q-table
      no-data-label="No product configuration found"
      :dense="$q.screen.lt.md"
      :columns="columns"
      :rows="data"
      row-key="id"
      v-model:pagination="pagination"
      :loading="loading"
      :filter="filter"
      @request="onRequest"
      binary-state-sort
    >
      <template v-slot:top-left>
        <div class="text-h6 q-mr-md">Product Configuration</div>
        <q-chip
          outline
          color="primary"
          icon="add"
          clickable
          @click="openAddDialog"
        >
        Add Configuration
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
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip
            size="sm"
            dense
            :color="props.row.status === 'active' ? 'green' : 'grey'"
            :label="props.row.status"
            text-color="white"
            class="q-ma-xs"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-tax_rate="props">
        <q-td :props="props">
          <q-chip
            size="sm"
            dense
            color="blue"
            :label="`${getTaxRate(props.row.settings)}%`"
            text-color="white"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            round
            icon="o_edit"
            color="primary"
            size="10px"
            @click="editConfiguration(props.row)"
          />
          <q-btn
            flat
            round
            icon="o_delete"
            color="negative"
            size="10px"
            @click="deleteRow(props.row.id)"
          />
        </q-td>
      </template>
    </q-table>

    <!-- Configuration Dialog -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 400px;">
        <q-card-section>
          <div class="text-h6">{{ isEditMode ? 'Edit' : 'Add' }} Product Configuration</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="onSubmit" class="q-gutter-md">
            <q-input
              filled
              v-model="configurationForm.name"
              label="Configuration Name *"
              lazy-rules
              :rules="[ val => val && val.length > 0 || 'Please enter a name']"
            />

            <q-input
              filled
              v-model="configurationForm.description"
              label="Description"
              type="textarea"
            />

            <q-select
              filled
              v-model="configurationForm.status"
              :options="statusOptions"
              label="Status *"
            />

            <div class="text-subtitle2 q-mt-md">Tax Configuration</div>
            <q-input
              filled
              v-model.number="configurationForm.taxRate"
              label="Tax Rate (%)"
              type="number"
              step="0.01"
              min="0"
              max="100"
              suffix="%"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" @click="showDialog = false" />
          <q-btn flat label="Save" @click="onSubmit" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "boot/axios";
import { useQuasar } from "quasar";

const router = useRouter();
const $q = useQuasar();
const API_URL = "/api/profiles";
const data = ref([]);

const columns = [
  {
    name: "name",
    label: "Name",
    align: "left",
    field: "name",
    sortable: true,
  },
  {
    name: "description",
    label: "Description",
    align: "left",
    field: "description",
    sortable: false,
  },
  {
    name: "status",
    label: "Status",
    align: "center",
    field: "status",
    sortable: true,
  },
  {
    name: "tax_rate",
    label: "Tax Rate",
    align: "center",
    field: "settings",
    sortable: false,
  },
  { name: "actions", label: "Actions", align: "center" },
];

const filterFields = [
  { label: "Name", value: "name" },
  { label: "Description", value: "description" },
  { label: "Status", value: "status" },
];

const searchFields = [
  { icon: "toggle_on", label: "Active", value: "status:active" },
  { icon: "toggle_off", label: "Inactive", value: "status:inactive" },
  { icon: "percent", label: "Has Tax Rate", value: "settings:tax_rate" },
];

const statusOptions = ["active", "inactive"];

const filter = ref({
  field: "name",
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
const configurationForm = ref({
  name: "",
  description: "",
  status: "active",
  taxRate: 0,
});
const isEditMode = ref(false);
const editingId = ref(null);

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
    data.value = [];
    pagination.value.rowsNumber = 0;
    loading.value = false;
  }
};

const onRequest = (props) => {
  loading.value = true;
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  const filterValue = filter.value ? { ...filter.value } : undefined;
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
  onRequest({
    pagination: pagination.value,
    filter: undefined,
  });
};

const clearSelectedField = () => {
  selected.value.field = "";
  selected.value.value = "";
  onRequest({
    pagination: pagination.value,
    filter: undefined,
  });
};

const deleteRow = async (id) => {
  $q.dialog({
    title: "Confirm Deletion",
    message: "Are you sure you want to delete this configuration?",
    cancel: true,
    persistent: true,
  })
    .onOk(() => {
      api
        .delete(`${API_URL}/${id}`)
        .then(() => {
          $q.notify({
            type: "positive",
            message: "Configuration deleted successfully.",
          });
          onRequest({
            pagination: pagination.value,
            filter: undefined,
          });
        })
        .catch((error) => {
          console.error("Error deleting:", error);
          $q.notify({
            type: "negative",
            message: "Failed to delete configuration.",
          });
        });
    });
};

const getTaxRate = (settings) => {
  if (!settings) return "0";
  try {
    const parsed = typeof settings === 'string' ? JSON.parse(settings) : settings;
    return parsed.tax_rate || "0";
  } catch (error) {
    return "0";
  }
};

const editConfiguration = (configuration) => {
  const settings = configuration.settings ?
    (typeof configuration.settings === 'string' ?
      JSON.parse(configuration.settings) : configuration.settings) : {};

  configurationForm.value = {
    name: configuration.name,
    description: configuration.description || "",
    status: configuration.status,
    taxRate: settings.tax_rate || 0,
  };
  isEditMode.value = true;
  editingId.value = configuration.id;
  showDialog.value = true;
};

const openAddDialog = () => {
  configurationForm.value = {
    name: "",
    description: "",
    status: "active",
    taxRate: 0,
  };
  isEditMode.value = false;
  editingId.value = null;
  showDialog.value = true;
};

const onSubmit = async () => {
  if (!configurationForm.value.name) {
    $q.notify({
      type: "negative",
      message: "Please enter a configuration name.",
    });
    return;
  }

  const payload = {
    name: configurationForm.value.name,
    description: configurationForm.value.description,
    status: configurationForm.value.status,
    settings: JSON.stringify({
      tax_rate: configurationForm.value.taxRate,
    }),
  };

  try {
    if (isEditMode.value) {
      await api.put(`${API_URL}/${editingId.value}`, payload);
      $q.notify({
        type: "positive",
        message: "Configuration updated successfully.",
      });
    } else {
      await api.post(API_URL, payload);
      $q.notify({
        type: "positive",
        message: "Configuration created successfully.",
      });
    }

    showDialog.value = false;
    onRequest({
      pagination: pagination.value,
      filter: undefined,
    });
  } catch (error) {
    console.error("Error saving configuration:", error);
    $q.notify({
      type: "negative",
      message: `Failed to ${isEditMode.value ? 'update' : 'create'} configuration.`,
    });
  }
};
</script>
