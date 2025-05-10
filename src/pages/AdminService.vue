<template>
  <div class="q-pa-md">
    <q-dialog v-model="isAddDialogOpen">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Add New Service</div>
        </q-card-section>
        <q-card-section>
          <q-select
            v-model="addForm.package_id"
            label="Package"
            :options="packageOptions"
            option-value="id"
            option-label="title"
            emit-value
            map-options
          />
          <q-input v-model="addForm.title" label="Title" />
          <q-input
            v-model="addForm.description"
            label="Description"
            type="textarea"
          />
          <q-input
            v-model="addForm.duration"
            label="Duration (minutes)"
            type="number"
          />
          <q-input v-model="addForm.price" label="Price ($)" type="number" />
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
          <q-btn flat label="Add" color="green" @click="addService" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-table
      title="Services"
      no-data-label="I didn't find anything for you"
      :dense="$q.screen.lt.md"
      :rows="services"
      :columns="columns"
      row-key="id"
    >

    <template v-slot:top-right>
      <q-btn
          flat
          label="Add New Service"
          color="accent"
          @click="openAddServiceDialog"
      />
      </template>
      <template v-slot:body-cell-status="props">
        <q-td class="text-center">
        <q-badge :color="props.row.status === 'active' ? 'green' : 'red'">
          {{ props.row.status }}
        </q-badge>
      </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td class="text-center">
        <q-btn
          flat
          round
          icon="edit"
          color="accent"
          @click="editService(props.row)"
        />
        <q-btn
          flat
          round
          icon="delete"
          color="red"
          @click="deleteService(props.row)"
        />
      </q-td>
      </template>
    </q-table>

    <q-dialog v-model="isEditDialogOpen">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Edit Service</div>
        </q-card-section>
        <q-card-section>
          <q-select
            v-model="editForm.package_id"
            label="Package"
            :options="packageOptions"
            option-value="id"
            option-label="title"
            emit-value
            map-options
          />
          <q-input v-model="editForm.title" label="Title" />
          <q-input
            v-model="editForm.description"
            label="Description"
            type="textarea"
          />
          <q-input
            v-model="editForm.duration"
            label="Duration (minutes)"
            type="number"
          />
          <q-input v-model="editForm.price" label="Price ($)" type="number" />
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
          <q-btn flat label="Update" color="green" @click="updateService" />
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

const services = ref([]);
const packages = ref([]);
const packageOptions = ref([]);
const columns = [
  {
    name: "title",
    required: true,
    label: "Title",
    align: "left",
    field: "title",
  },
  {
    name: "description",
    label: "Description",
    align: "left",
    field: "description",
  },
  {
    name: "duration",
    label: "Duration (min)",
    align: "left",
    field: "duration",
  },
  { name: "price", label: "Price ($)", align: "left", field: "price" },
  { name: "status", label: "Status", align: "left", field: "status" },
  { name: "actions", label: "Actions", align: "center" },
];

onMounted(async () => {
  try {
    const [servicesResponse, packagesResponse] = await Promise.all([
      axios.get(VITE_API_URL + "/api/services"),
      axios.get(VITE_API_URL + "/api/packages"),
    ]);

    services.value = servicesResponse.data;
    packages.value = packagesResponse.data;
    packageOptions.value = packages.value.map((pkg) => ({
      id: pkg.id,
      title: pkg.title,
    }));
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});

const isAddDialogOpen = ref(false);
const addForm = ref({
  package_id: null,
  title: "",
  description: "",
  duration: null,
  price: null,
  status: "",
});

const openAddServiceDialog = () => {
  addForm.value = {
    package_id: null,
    title: "",
    description: "",
    duration: null,
    price: null,
    status: "",
  };
  isAddDialogOpen.value = true;
};

const addService = async () => {
  try {
    const response = await api.post("/api/services", addForm.value);
    services.value.push(response.data);
    isAddDialogOpen.value = false;
  } catch (error) {
    console.error("Error adding service:", error);
  }
};

const isEditDialogOpen = ref(false);
const editForm = ref({
  id: null,
  package_id: null,
  title: "",
  description: "",
  duration: null,
  price: null,
  status: "",
});

const editService = (row) => {
  editForm.value = { ...row };
  isEditDialogOpen.value = true;
};

const updateService = async () => {
  try {
    const response = await api.put(
      `/api/services/${editForm.value.id}`,
      editForm.value
    );
    const index = services.value.findIndex((s) => s.id === editForm.value.id);
    if (index !== -1) {
      services.value[index] = { ...editForm.value };
    }
    isEditDialogOpen.value = false;
  } catch (error) {
    console.error("Error updating service:", error);
  }
};

const isDeleteDialogOpen = ref(false);
const deleteTarget = ref(null);

const deleteService = (row) => {
  deleteTarget.value = row;
  isDeleteDialogOpen.value = true;
};

const confirmDelete = async () => {
  try {
    await api.delete(`/api/services/${deleteTarget.value.id}`);
    services.value = services.value.filter(
      (s) => s.id !== deleteTarget.value.id
    );
    isDeleteDialogOpen.value = false;
    deleteTarget.value = null;
  } catch (error) {
    console.error("Error deleting service:", error);
  }
};

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];
</script>
