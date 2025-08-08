<template>
  <div class="q-pa-md">
    <q-table
      no-data-label="No product attribute found"
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
        <div class="text-h6 q-mr-md">Product Attribute</div>
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

      <template v-slot:body-cell-extra_cost="props">
        <q-td :props="props">
          <q-chip
            size="sm"
            dense
            :color="parseFloat(props.row.extra_cost) > 0 ? 'green' : 'grey'"
            :label="`$${parseFloat(props.row.extra_cost).toFixed(2)}`"
            text-color="white"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            round
            icon="o_delete"
            color="negative"
            size="10px"
            @click="deleteRow(props.row.id)"
          />
          <q-btn
            flat
            round
            icon="o_edit"
            color="primary"
            size="10px"
            @click="editAttribute(props.row)"
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
import { format, useQuasar } from "quasar";
import AttributeDialog from "src/components/dialog/AttributeDialog.vue";

const router = useRouter();
const $q = useQuasar();
const API_URL = "/api/attributes";
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
    name: "type",
    label: "Type",
    align: "center",
    field: "type",
    sortable: true,
  },
  {
    name: "extra_cost",
    label: "Extra Cost",
    align: "right",
    field: "extra_cost",
    sortable: true,
    format: (val) => `$${parseFloat(val).toFixed(2)}`,
  },
  { name: "actions", label: "Actions", align: "center" },
];

const filterFields = [
  { label: "Name", value: "name" },
  { label: "Type", value: "type" },
  { label: "Extra Cost", value: "extra_cost" },
];

const searchFields = [
  { icon: "engineering", label: "Material", value: "type:material" },
  { icon: "local_dining", label: "Sweetness", value: "type:sweetness" },
  { icon: "whatshot", label: "Spice Level", value: "type:spice_level" },
  { icon: "texture", label: "Texture", value: "type:texture" },
  { icon: "thermostat", label: "Temperature", value: "type:temperature" },
  { icon: "restaurant", label: "Cooking Method", value: "type:cooking_method" },
  { icon: "attach_money", label: "Has Extra Cost", value: "extra_cost:>0" },
  { icon: "money_off", label: "No Extra Cost", value: "extra_cost:0" },
];

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
  const filterValue = filter.value ? { ...filter.value } : undefined;
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
    material: "brown",
    sweetness: "pink",
    spice_level: "red",
    texture: "orange",
    temperature: "blue",
    cooking_method: "purple",
  };
  return colorMap[type] || "grey";
};

const formatType = (type) => {
  return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
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
