<template>
  <div class="q-pa-md">
    <q-btn
      flat
      label="Add New Package"
      color="primary"
      @click="openAddPackageDialog"
    />

    <q-dialog v-model="isAddDialogOpen">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Add New Package</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="addForm.title" label="Title" />
          <q-input v-model="addForm.hint" label="Hint" type="textarea" />
          <q-select
            v-model="addForm.status"
            label="Status"
            :options="statusOptions"
            emit-value
            map-options
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="primary"
            @click="isAddDialogOpen = false"
          />
          <q-btn flat label="Add" color="green" @click="addPackage" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-table
      title="Package"
      no-data-label="I didn't find anything for you"
      :dense="$q.screen.lt.md"
      :rows="packages"
      :columns="columns"
      row-key="id"
    >
      <template v-slot:body-cell-status="props">
        <q-badge :color="props.row.status === 'active' ? 'green' : 'red'">
          {{ props.row.status }}
        </q-badge>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-btn
          flat
          round
          icon="edit"
          color="primary"
          @click="editPackage(props.row)"
        />
        <q-btn
          flat
          round
          icon="delete"
          color="red"
          @click="deletePackage(props.row)"
        />
      </template>
    </q-table>

    <q-dialog v-model="isEditDialogOpen">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Edit Package</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="editForm.title" label="Title" />
          <q-input v-model="editForm.hint" label="Hint" type="textarea" />
          <q-select
            v-model="editForm.status"
            label="Status"
            :options="statusOptions"
            emit-value
            map-options
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="primary"
            @click="isEditDialogOpen = false"
          />
          <q-btn flat label="Update" color="green" @click="updatePackage" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="isDeleteDialogOpen">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirm Deletion</div>
        </q-card-section>
        <q-card-section>
          Are you sure you want to delete "{{ deleteTarget?.title }}"?
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
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
const { VITE_API_URL } = import.meta.env;
import axios from "axios";
import { api } from "boot/axios";

const packages = ref([]);
const columns = [
  { name: "title", required: true, label: "Title", align: "left", field: "title" },
  { name: "hint", label: "Hint", align: "left", field: "hint" },
  { name: "status", label: "Status", align: "left", field: "status" },
  { name: "actions", label: "Actions", align: "center" },
];

onMounted(async () => {
  try {
    const response = await axios.get(VITE_API_URL + "/api/packages");
    if (response.data.length > 0) {
      packages.value = response.data;
    }
  } catch (error) {
    if (error.response?.status === 401) {
      console.error("Unauthorized access. Redirecting to login...");
      window.location.href = "/admin/login";
    } else {
      console.error("Error fetching packages:", error);
    }
  }
});

const isAddDialogOpen = ref(false);
const addForm = ref({
  title: "",
  hint: "",
  status: "",
});

const openAddPackageDialog = () => {
  addForm.value = { title: "", hint: "", status: "" };
  isAddDialogOpen.value = true;
};

const addPackage = async () => {
  try {
    const response = await api.post("/api/packages", addForm.value);
    packages.value.push(response.data);
    isAddDialogOpen.value = false;
  } catch (error) {
    console.error("Error adding package:", error);
  }
};

const isEditDialogOpen = ref(false);
const editForm = ref({
  id: null,
  title: "",
  hint: "",
  status: "",
});

const editPackage = (row) => {
  editForm.value = { ...row };
  isEditDialogOpen.value = true;
};

const updatePackage = async () => {
  try {
    const response = await api.put(`/api/packages/${editForm.value.id}`, editForm.value);
    const index = packages.value.findIndex((p) => p.id === editForm.value.id);
    if (index !== -1) {
      packages.value[index] = { ...editForm.value };
    }
    isEditDialogOpen.value = false;
  } catch (error) {
    console.error("Error updating package:", error);
  }
};

const isDeleteDialogOpen = ref(false);
const deleteTarget = ref(null);

const deletePackage = (row) => {
  deleteTarget.value = row;
  isDeleteDialogOpen.value = true;
};

const confirmDelete = async () => {
  try {
    await api.delete(`/api/packages/${deleteTarget.value.id}`);
    packages.value = packages.value.filter((p) => p.id !== deleteTarget.value.id);
    isDeleteDialogOpen.value = false;
    deleteTarget.value = null;
  } catch (error) {
    console.error("Error deleting package:", error);
  }
};

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];
</script>
