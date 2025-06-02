<template>
  <q-page>
    <q-card class="q-pa-sm">
      <q-table
        title="Profiles"
        :rows="profiles"
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
            placeholder="Search"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-btn
            flat
            icon="add_circle"
            color="accent"
            @click="
              router.push({
                path: '/profile',
              })
            "
          />
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td class="text-center">
            <q-btn
              flat
              round
              icon="o_visibility"
              color="grey"
              size="10px"
              @click="
                router.push({
                  path: '/admin/profile/detail',
                  query: { id: props.row.id },
                })
              "
            />
            <q-btn
              flat
              round
              icon="delete"
              color="negative"
              size="10px"
              class="q-ml-sm"
              @click="confirmDelete(props.row)"
            />
          </q-td>
        </template>
        <template v-slot:body-cell-attachment="props">
          <q-td class="text-center">
            <AttachmentViewer
              :attachments="props.row.medical_attachment_path "
            />
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import AttachmentViewer from "components/AttachmentViewer.vue";
const VITE_API_URL = import.meta.env.VITE_API_URL;
const router = useRouter();
const $q = useQuasar();
const profiles = ref([]);
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
    name: "first_name",
    label: "First Name",
    align: "left",
    sortable: true,
    field: "first_name",
  },
  { name: "last_name", label: "Last Name",sortable: true, align: "left", field: "last_name" },
  { name: "phone", label: "Phone", align: "left", field: "phone" },
  {
    name: "attachment",
    label: "Attachments",
    align: "center",
    field: "medical_attachment_path",
  },
  {
    name: "created_at",
    label: "Created At",
    align: "left",
    sortable: true,
    field: (row) => formatCreatedAt(row.created_at),
  },
  { name: "actions", label: "Actions", align: "center" },
];

const fetchProfiles = async (startRow, count, filter, sortBy, descending) => {
  try {
    loading.value = true;
    const response = await api.get("/api/user-profile", {
      params: {
        start: startRow,
        count,
        filter,
        sortBy,
        descending,
      },
    });
    if (response.data && Array.isArray(response.data.rows)) {
      profiles.value = response.data.rows;
      pagination.value.rowsNumber = response.data.total || 0;
    } else {
      profiles.value = [];
      pagination.value.rowsNumber = 0;
    }
  } catch (error) {
    profiles.value = [];
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
  fetchProfiles(startRow, count, filterValue, sortBy, descending);
};

function formatCreatedAt(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  return date.toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

const confirmDelete = (row) => {
  $q.dialog({
    title: "Confirm",
    message: `Are you sure you want to delete profile #${row.id}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    deleteProfile(row.id);
  });
};

const deleteProfile = async (id) => {
  try {
    loading.value = true;
    await api.delete(`/api/user-profile/${id}`);
    $q.notify({ type: "positive", message: "Profile deleted" });
    onRequest({
      pagination: pagination.value,
      filter: filter.value,
    });
  } catch (error) {
    $q.notify({ type: "negative", message: "Failed to delete profile" });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  onRequest({
    pagination: pagination.value,
    filter: undefined,
  });
});
</script>
