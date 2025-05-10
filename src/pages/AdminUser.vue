<template>
  <q-card class="q-pa-md">
    <q-table
      title="Users"
      no-data-label="No users found"
      :dense="$q.screen.lt.md"
      :rows="users"
      :columns="columns"
      row-key="id"
      v-model:pagination="pagination"
      :loading="loading"
      :filter="filter"
      @request="onRequest"
    >
      <template v-slot:top-right>
        <q-input
          outlined
          dense
          debounce="300"
          clearable
          rounded
          v-model="filter"
          placeholder="Search by name, phone or email"
          style="width: 280px; "
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td class="text-center">
          <q-btn
            flat
            round
            icon="edit"
            color="accent"
            @click="editUser(props.row)"
          />
          <q-btn
            flat
            round
            icon="visibility"
            color="accent"
            @click="fetchCustomerHistory(props.row.id)"
          />
          <!-- <q-btn
                flat
                round
                icon="delete"
                color="red"
                @click="deleteUser(props.row)"
              /> -->
        </q-td>
      </template>
    </q-table>
    <q-btn
      flat
      label="Import Users"
      color="primary"
      @click="triggerFileInput"
    />
    <input
      type="file"
      ref="fileInput"
      style="display: none"
      @change="importUsers"
      accept=".xlsx, .xls"
    />
    <q-inner-loading :showing="isLoading" />
    <q-dialog v-model="isSuccessDialogOpen">
      <q-card>
        <q-card-section>
          <div class="text-h6">Import Successful</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="OK"
            color="primary"
            @click="isSuccessDialogOpen = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="isEditDialogOpen">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Edit User</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="editForm.name" label="Username" />
          <q-input v-model="editForm.first_name" label="First Name" />
          <q-input v-model="editForm.last_name" label="Last Name" />
          <q-input
            filled
            v-model="editForm.email"
            label="Email"
            type="email"
            readonly
          />
          <q-input v-model="editForm.phone" label="Phone" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="negative"
            @click="isEditDialogOpen = false"
          />
          <q-btn flat label="Update" color="positive" @click="updateUser" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="isDeleteDialogOpen">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirm Deletion</div>
        </q-card-section>
        <q-card-section>
          Are you sure you want to delete "{{ deleteTarget?.name }}"?
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="primary"
            @click="isDeleteDialogOpen = false"
          />
          <q-btn flat label="Delete" color="red" @click="confirmDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="isHistoryDialogOpen">
      <q-card :style="$q.screen.gt.md ? 'min-width: 500px' : 'min-width: 100%'">
        <q-card-section horizontal class="q-pl-md q-pt-md">
          <div class="text-h6 text-grey">Customer History</div>
        </q-card-section>
        <q-card-section>
          <q-timeline class="q-pl-md" v-if="customerHistory.length > 0">
            <q-timeline-entry
              v-for="event in customerHistory"
              :key="event.id"
              color="blue-5"
            >
              <div class="text-grey-6">
                <div>
                  {{
                    event.services[0].service_title +
                    " | " +
                    event.services[0].service_duration +
                    " Min"
                  }}
                </div>
                <div>{{ event.status }}</div>
                <div>{{ event.services[0].customer_name }}</div>
                <div>{{ event.services[0].staff_name }}</div>
                <div>{{ event.services[0].customer_phone }}</div>
                <q-separator
                  class="q-my-sm"
                  color="grey-3"
                  style="height: 1px"
                />
                <div class="text-grey-7 text-weight-bold text-caption">
                  <q-btn
                    size="sm"
                    flat
                    color="orange-4"
                    icon="receipt_long"
                    @click="
                      router.push({
                        path: '/admin/appointment/detail',
                        query: { id: event.appointment_id },
                      })
                    "
                    label="View Order"
                  >
                  </q-btn>
                  <q-btn
                    size="sm"
                    flat
                    color="green-4"
                    icon="list_alt"
                    @click="
                      router.push({
                        path: '/admin/appointment/detail',
                        query: { id: event.id },
                      })
                    "
                    label="View Appointment"
                  >
                  </q-btn>
                </div>
              </div>
              <template v-slot:subtitle>
                <div class="row q-pa-none">
                  <q-lable class="col-9 text-subtitle2">{{
                    event.booking_time.slice(0, 16)
                  }}</q-lable>
                  <!-- <q-lable class="col-3 text-grey-8"> 2 days ago </q-lable> -->
                </div>
              </template>
            </q-timeline-entry>
          </q-timeline>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";

const router = useRouter();
const $q = useQuasar();
const users = ref([]);
const filter  = ref("");
const columns = [
  {
    name: "name",
    required: true,
    label: "Username",
    align: "left",
    field: "name",
  },
  { name: "phone", label: "Phone", align: "left", field: "phone" },
  {
    name: "first_name",
    required: true,
    label: "First Name",
    align: "left",
    field: "first_name",
  },
  {
    name: "last_name",
    required: true,
    label: "Last Name",
    align: "left",
    field: "last_name",
  },
  {
    name: "email",
    required: true,
    label: "Email",
    align: "left",
    field: "email",
  },
  { name: "actions", label: "Actions", align: "center" },
];

const loading = ref(false);
const pagination = ref({
  sortBy: "id",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

const fetchUsers = async (startRow, count, filter, sortBy, descending) => {
  try {
    loading.value = true;
    const response = await api.get("/api/user", {
      params: {
        start: startRow,
        count,
        filter,
        sortBy,
        descending,
      },
    });

    if (response.data && Array.isArray(response.data.rows)) {
      users.value = response.data.rows.map((user) => ({
        ...user,
        first_name: user.first_name || "N/A",
        last_name: user.last_name || "N/A",
      }));
      pagination.value.rowsNumber = response.data.total || 0;
    } else {
      console.error("Unexpected API response structure:", response.data);
      users.value = [];
      pagination.value.rowsNumber = 0;
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    users.value = [];
    pagination.value.rowsNumber = 0;
  } finally {
    loading.value = false;
  }
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  const searchValue = props.filter || filter.value;

  loading.value = true;

  // Calculate starting row and fetch count
  const startRow = (page - 1) * rowsPerPage;
  const count = rowsPerPage === 0 ? pagination.value.rowsNumber : rowsPerPage;

  // Fetch data from server
  fetchUsers(startRow, count, searchValue, sortBy, descending)
    .then(() => {
      // Update pagination object
      pagination.value.page = page;
      pagination.value.rowsPerPage = rowsPerPage;
      pagination.value.sortBy = sortBy;
      pagination.value.descending = descending;
    })
    .finally(() => {
      loading.value = false;
    });
};

onMounted(() => {
  onRequest({
    pagination: pagination.value,
    filter: undefined,
  });
});

const isEditDialogOpen = ref(false);

const editForm = ref({
  id: null,
  name: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
});

const editUser = (row) => {
  editForm.value = { ...row };
  isEditDialogOpen.value = true;
};

const updateUser = async () => {
  try {
    const formData = new FormData();
    formData.append("_method", "PUT");
    Object.keys(editForm.value).forEach((key) => {
      if (key !== "id") {
        formData.append(key, editForm.value[key]);
      }
    });
    await api.post(`/api/user/${editForm.value.id}`, formData);

    const index = users.value.findIndex((u) => u.id === editForm.value.id);
    if (index !== -1) {
      users.value[index] = { ...editForm.value };
    }
    fetchUsers();
    editForm.value = {
      id: null,
      name: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
    };
    isEditDialogOpen.value = false;
  } catch (error) {
    console.error("Error updating user:", error);
  }
};

const isDeleteDialogOpen = ref(false);
const deleteTarget = ref(null);

const deleteUser = (row) => {
  deleteTarget.value = row;
  isDeleteDialogOpen.value = true;
};

const confirmDelete = async () => {
  try {
    await api.delete(`/api/user/${deleteTarget.value.id}`);
    users.value = users.value.filter((u) => u.id !== deleteTarget.value.id);
    isDeleteDialogOpen.value = false;
    deleteTarget.value = null;
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};

const fileInput = ref(null);
const isLoading = ref(false);
const isSuccessDialogOpen = ref(false);

const triggerFileInput = () => {
  fileInput.value.click();
};

const importUsers = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  isLoading.value = true; // Show loading indicator
  try {
    await api.post("/api/import-user", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 10000 * 300, // Increase timeout to 10 seconds
    });
    fetchUsers();
    isSuccessDialogOpen.value = true; // Show success dialog
  } catch (error) {
    console.error("Error importing users:", error);
  } finally {
    isLoading.value = false; // Hide loading indicator
    event.target.value = null;
  }
};

const isHistoryDialogOpen = ref(false);
const customerHistory = ref([]);

const fetchCustomerHistory = async (userId) => {
  const response = await api.get("/api/getUserBookingHistory", {
    params: { id: userId },
  });
  customerHistory.value = response.data;
  $q.notify({
    type: "info",
    message: "Customer history fetched successfully",
    position: "top",
    timeout: 2000,
  });
  isHistoryDialogOpen.value = true;
};
</script>
