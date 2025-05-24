<template>
  <q-dialog v-model="dialog" persistent>
    <q-card style="min-width: 350px; max-width: 90vw;">
      <q-card-section v-if="loading">
        <div class="row items-center q-gutter-sm">
          <q-spinner size="24px" color="primary" />
          <div class="text-h6">Loading...</div>
        </div>
      </q-card-section>
      <q-card-section v-else-if="users.length === 1">
        <div class="text-h6">Confirm User</div>
        <div class="q-mt-xs">Name: {{ users[0].first_name }} {{ users[0].last_name }}</div>
        <div>Phone: {{ users[0].phone }}</div>
      </q-card-section>
      <q-card-section v-else-if="users.length > 1">
        <div class="text-h6">Select User</div>
        <div class="q-mt-sm">Multiple users are under {{ users[0].phone }}, please select yourself:</div>
        <q-option-group
          v-model="selectedId"
          :options="userOptions"
          type="radio"
          color="primary"
          class="q-mt-md"
        />
      </q-card-section>
      <q-card-actions align="right" v-if="!loading">
        <q-btn v-if="users.length === 1" flat label="Not me" color="primary" @click="close(null)" />
        <q-btn v-if="users.length === 1" flat label="This is me" color="primary" @click="close(users[0].id)" />
        <q-btn v-if="users.length > 1" flat label="None of these are me" color="primary" @click="close(null)" />
        <q-btn v-if="users.length > 1" :disable="!selectedId" flat label="Confirm" color="primary" @click="close(selectedId)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, defineExpose, computed } from 'vue';
import axios from 'axios';

const dialog = ref(false);
const users = ref([]);
const selectedId = ref(null);
const loading = ref(false);
let resolver = null;

const VITE_API_URL = import.meta.env.VITE_API_URL;

const userOptions = computed(() => users.value.map(u => ({
  label: `${u.first_name} ${u.last_name} (${u.phone})`,
  value: u.id
})));

const open = async (phone) => {
  users.value = [];
  selectedId.value = null;
  loading.value = true;
  dialog.value = true;
  try {
    const response = await axios.get(`${VITE_API_URL}/api/find-user-by-field`, {
      params: { search: phone, field: 'phone' },
    });
    users.value = Array.isArray(response.data) ? response.data : [];
    if (!users.value.length) {
      dialog.value = false;
      return null;
    }
  } catch (e) {
    users.value = [];
    dialog.value = false;
    return null;
  } finally {
    loading.value = false;
  }
  return new Promise((resolve) => {
    resolver = resolve;
  });
};

function close(val) {
  dialog.value = false;
  if (resolver) {
    resolver(val);
    resolver = null;
  }
}

defineExpose({ open });
</script>
