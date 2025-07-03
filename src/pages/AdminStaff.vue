<template>
  <q-card class="q-pa-md">
    <q-table
      title="Staff"
      no-data-label="I didn't find anything for you"
      :dense="$q.screen.lt.md"
      :rows="staff"
      :columns="columns"
      row-key="id"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-right>
        <q-btn
          flat
          icon="add_circle"
          label="New Staff"
          color="accent"
          @click="openAddStaffDialog"
        />
      </template>
      <template v-slot:body-cell-status="props">
        <q-td key="status" :props="props">
          <q-badge :color="props.row.status === 'active' ? 'green' : 'red'">
            {{ props.row.status }}
          </q-badge>
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td key="actions" :props="props">
          <q-btn
            flat
            size="10px"
            round
            icon="edit"
            color="accent"
            @click="editStaff(props.row)"
          />
          <q-btn
            size="10px"
            flat
            round
            icon="delete"
            color="red"
            @click="deleteStaff(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="isEditDialogOpen">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Edit Staff</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="editForm.name" label="Name" />
          <q-input filled v-model="editForm.email" label="Email" type="email" />
          <q-input v-model="editForm.position" label="Position" />
          <q-select
            v-model="editForm.status"
            label="Status"
            :options="statusOptions"
            emit-value
            map-options
          />
          <q-input
            v-model="editForm.description"
            label="Description"
            type="textarea"
          />
          <q-input v-model="editForm.phone" label="Phone" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="primary"
            @click="isEditDialogOpen = false"
          />
          <q-btn flat label="Update" color="green" @click="updateStaff" />
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

    <q-dialog v-model="isAddDialogOpen">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Add New Staff</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="addForm.name" label="* Name" />
          <q-input v-model="addForm.phone" label="* Phone" />
          <q-input v-model="addForm.email" label="Email" type="email" />
          <q-input v-model="addForm.position" label="Position" />
          <q-select
            v-model="addForm.status"
            label="Status"
            :options="statusOptions"
            emit-value
            map-options
          />
          <!-- <q-checkbox
            v-model="addForm.has_certificate"
            label="Has Certificate"
          /> -->
          <q-input
            v-model="addForm.description"
            label="Description"
            type="textarea"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="primary"
            @click="isAddDialogOpen = false"
          />
          <q-btn flat label="Add" color="green" @click="addStaff" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { onMounted, ref } from "vue";
const { VITE_API_URL } = import.meta.env;
import axios from "axios";
import { api } from "boot/axios";

const staff = ref([]);
const columns = [
  { name: "name", required: true, label: "Name", align: "left", field: "name" },
  { name: "position", label: "Position", align: "left", field: "position" },
  { name: "phone", label: "Phone", align: "left", field: "phone" },
  { name: "email", label: "Email", align: "left", field: "email" },
  {
    name: "status",
    label: "Status",
    align: "left",
    field: "status",
  },
  { name: "actions", label: "Actions", align: "center" },
];

onMounted(() => {
  fetchStaff();
});

const fetchStaff = async () => {
  try {
    const response = await api.get("/api/staff");
    if (response.data.length > 0) {
      staff.value = response.data;
    }
    console.log("Staff data fetched successfully:", staff.value);
  } catch (error) {
    console.error("Error fetching staff:", error);
  }
};

const isAddDialogOpen = ref(false);
const addForm = ref({
  name: "",
  position: "",
  status: "active",
  description: "",
  // has_certificate: false,
  email: "",
  phone: "",
  password: "",
});

const addFileInput = ref(null);
const editFileInput = ref(null);

const openAddStaffDialog = () => {
  isAddDialogOpen.value = true;
};

const addStaff = async () => {
  try {
    const payload = {
      ...addForm.value,
    };
    payload.password = addForm.value.phone;
    const response = await api.post("/api/staff", payload);
    staff.value.push(response.data);
    isAddDialogOpen.value = false;
    addForm.value = {
      name: "",
      position: "",
      status: "active",
      description: "",
      // has_certificate: false,
      email: "",
      phone: "",
      password: "",
    };
  } catch (error) {
    console.error("Error adding staff:", error);
  }
};

const isEditDialogOpen = ref(false);

const editForm = ref({
  id: null,
  name: "",
  position: "",
  status: "",
  description: "",
  // has_certificate: false,
  email: "",
  phone: "",
  password: "",
});

const editStaff = (row) => {
  editForm.value = { ...row };
  editForm.value.password = row.phone; // Set the password to the phone number
  isEditDialogOpen.value = true;
};

const updateStaff = async () => {
  try {
    const payload = {
      ...editForm.value,
    };
    payload.password = editForm.value.phone;
    await api.put(`/api/staff/${editForm.value.id}`, payload);

    fetchStaff(); // Refresh the staff list
    // Reset the edit form
    editForm.value = {
      id: null,
      name: "",
      position: "",
      status: "",
      description: "",
      // has_certificate: false,
      email: "",
      phone: "",
      password: "",
    };
    isEditDialogOpen.value = false; // Close the dialog
  } catch (error) {
    console.error("Error updating staff:", error);
  }
};

const isDeleteDialogOpen = ref(false);
const deleteTarget = ref(null);

const deleteStaff = (row) => {
  deleteTarget.value = row; // Set the target staff to delete
  isDeleteDialogOpen.value = true; // Open the confirmation dialog
};

const confirmDelete = async () => {
  try {
    // Call the API to delete the staff
    await api.delete(`/api/staff/${deleteTarget.value.id}`);
    staff.value = staff.value.filter((s) => s.id !== deleteTarget.value.id);
    isDeleteDialogOpen.value = false;
    deleteTarget.value = null;
  } catch (error) {
    console.error("Error deleting staff:", error);
  }
};

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];
</script>
