<template>
  <div class="q-pa-md">
    <q-table
      no-data-label="No products found"
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
        <div class="text-h6 q-mr-md">Product</div>
        <q-chip
          outline
          color="primary"
          icon="add"
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

      <template v-slot:body-cell-image="props">
        <q-td :props="props">
          <q-avatar size="40px" rounded>
            <img :src="props.row.image" :alt="props.row.title" />
          </q-avatar>
        </q-td>
      </template>

      <template v-slot:body-cell-is_featured="props">
        <q-td :props="props">
          <q-icon
            :name="props.row.is_featured ? 'star' : 'star_border'"
            :color="props.row.is_featured ? 'amber' : 'grey'"
            size="sm"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-categories="props">
        <q-td :props="props">
          <div class="q-gutter-xs">
            <q-chip
              v-for="category in props.row.categories"
              :key="category.id"
              size="sm"
              dense
              color="blue-2"
              text-color="blue-8"
              :label="category.title"
              class="q-ma-xs"
            />
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-stock="props">
        <q-td :props="props">
          <q-chip
            size="12px"
            dense
            :color="props.row.stock > 0 ? 'green' : 'red'"
            :label="props.row.stock"
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
            icon="o_visibility"
            color="grey"
            size="10px"
            @click="
              router.push({
                path: '/admin/product/detail',
                query: { id: props.row.id },
              })
            "
          />
          <q-btn flat round icon="more_vert" color="grey" size="10px">
            <q-menu>
              <q-list style="min-width: 100px">
                <q-btn
                  flat
                  icon="receipt_long"
                  color="grey"
                  size="10px"
                  label="invoice"
                  @click="
                    router.push({
                      path: '/admin/product/invoice',
                      query: { id: props.row.id },
                    })
                  "
                />
              </q-list>
            </q-menu>
          </q-btn>
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip
            size="12px"
            dense
            :color="
              props.row.status === 'active'
                ? 'green-5'
                : props.row.status === 'inactive'
                ? 'red-5'
                : 'grey'
            "
            :label="props.row.status"
            text-color="white"
            class="q-mr-sm"
          />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "boot/axios";
import { format, useQuasar } from "quasar";

const router = useRouter();
const $q = useQuasar();
const API_URL = "/api/products";
const data = ref([]);

const columns = [
  { name: "image", label: "Image", align: "center", field: "image" },
  { name: "code", label: "Code", align: "left", field: "code", sortable: true },
  {
    name: "title",
    label: "Title",
    align: "left",
    field: "title",
    sortable: true,
  },
  {
    name: "second_title",
    label: "Second Title",
    align: "left",
    field: "second_title",
  },
  {
    name: "categories",
    label: "Categories",
    align: "left",
    field: "categories",
  },
  {
    name: "price",
    label: "Price",
    align: "right",
    field: "price",
    sortable: true,
    format: (val) => `$${val}`,
  },
  {
    name: "selling_price",
    label: "Selling Price",
    align: "right",
    field: "selling_price",
    sortable: true,
    format: (val) => `$${val}`,
  },
  {
    name: "stock",
    label: "Stock",
    align: "center",
    field: "stock",
    sortable: true,
  },
  {
    name: "status",
    label: "Status",
    align: "center",
    field: "status",
    sortable: true,
  },
  {
    name: "is_featured",
    label: "Featured",
    align: "center",
    field: "is_featured",
  },
  { name: "actions", label: "Actions", align: "center" },
];

const filterFields = [
  { label: "Title", value: "title" },
  { label: "Code", value: "code" },
  { label: "Second Title", value: "second_title" },
  { label: "Description", value: "description" },
  { label: "Tag", value: "tag" },
];

const searchFields = [
  { icon: "star", label: "Featured", value: "is_featured:true" },
  { icon: "star_border", label: "Not Featured", value: "is_featured:false" },
  { icon: "check_circle", label: "Active", value: "status:active" },
  { icon: "pause_circle", label: "Inactive", value: "status:inactive" },
  { icon: "inventory_2", label: "In Stock", value: "stock:>0" },
  { icon: "no_backpack", label: "Out of Stock", value: "stock:0" },
];

const filter = ref({
  field: "title",
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
    message: "Are you sure you want to completely delete?",
    cancel: true,
    persistent: true,
  })
    .onOk(() => {
      api
        .delete(`${API_URL}/${id}`)
        .then(() => {
          $q.notify({
            type: "positive",
            message: "Deleted successfully.",
          });
          // Refresh the products list after deletion
          onRequest({
            pagination: pagination.value,
            filter: undefined,
          });
        })
        .catch((error) => {
          console.error("Error deleting:", error);
          $q.notify({
            type: "negative",
            message: "Failed to delete.",
          });
        });
    })
    .onCancel(() => {
      return;
    });
};
</script>
