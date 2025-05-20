<template>
  <div>
    <q-input
      dense
      rounded
      v-model="searchField"
      outlined
      :debounce="debounce"
      :placeholder="placeholder"
      @update:model-value="onSearch"
    >
      <template v-slot:append>
        <q-icon v-if="searchField === ''" name="search" />
        <q-icon
          v-else
          name="clear"
          class="cursor-pointer"
          @click="clearSearch"
        />
      </template>
    </q-input>
    <q-item-label
      v-if="searchField !== '' && !loading && foundUsers.length == 0"
      class="text-caption"
    >
      No data found
    </q-item-label>
    <q-scroll-area v-if="searchField !== ''" style="height: 100px">
      <q-list>
        <q-item
          v-for="user in foundUsers"
          :key="user.id"
          clickable
          @click="selectUser(user)"
        >
          <q-item-section>
            <q-item-label>{{ user.name }}</q-item-label>
            <q-item-label caption>{{ user.phone }}</q-item-label>
            <q-item-label caption>{{ user.email }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import { fetchUserFromSearch } from '../composables/useUserFromSearch';

const props = defineProps({
  placeholder: { type: String, default: 'Find User by Name, Phone, or Email' },
  debounce: { type: [String, Number], default: 500 },
});

const emit = defineEmits(['user-selected']);

const searchField = ref('');
const loading = ref(false);
const foundUsers = ref<{ id: number; name: string; phone: string; email: string }[]>([]);

async function onSearch() {
  if (!searchField.value) {
    foundUsers.value = [];
    return;
  }
  loading.value = true;
  foundUsers.value = await fetchUserFromSearch(searchField.value);
  loading.value = false;
}

function selectUser(user: any) {
  emit('user-selected', user);
  searchField.value = '';
}

function clearSearch() {
  searchField.value = '';
  foundUsers.value = [];
}
</script>
