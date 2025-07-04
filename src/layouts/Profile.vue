<template>
  <div>
    <q-item class="q-mb-sm" clickable v-ripple>
      <q-item-section avatar>
        <q-avatar size="26px" color="primary" text-color="white">
          {{ getUserInitials() }}
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ currentUser?.name || 'Unknown User' }}</q-item-label>
        <q-item-label caption lines="1">{{ currentUser?.phone || 'No phone' }}</q-item-label>
      </q-item-section>
    </q-item>
    <q-separator />
    <q-item v-if="false" class="q-mb-sm" clickable v-ripple>
      <q-item-section avatar>
        <q-avatar text-color="grey" icon="person" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Profile</q-item-label>
      </q-item-section>
    </q-item>
    <q-item v-if="false" class="q-mb-sm" clickable v-ripple>
      <q-item-section avatar>
        <q-avatar text-color="grey" icon="help" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Help</q-item-label>
      </q-item-section>
    </q-item>
    <q-item v-if="false" class="q-mb-sm" clickable v-ripple>
      <q-item-section avatar>
        <q-avatar text-color="grey" icon="settings" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Settings</q-item-label>
      </q-item-section>
    </q-item>

    <q-item class="q-mb-sm" clickable v-ripple @click="handleLogout">
      <q-item-section avatar>
        <q-avatar text-color="grey" icon="logout" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Log Out</q-item-label>
      </q-item-section>
    </q-item>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCurrentUser, logout } from '../utils/auth'

const currentUser = ref(null)

onMounted(() => {
  currentUser.value = getCurrentUser()
})

// Get user initials for avatar display
function getUserInitials() {
  if (!currentUser.value) return '?'

  const name = currentUser.value.name
  if (!name) return '?'

  // If name has spaces, get first letter of first and last name
  const nameParts = name.trim().split(' ')
  if (nameParts.length > 1) {
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase()
  }

  // Otherwise just get first letter
  return name.charAt(0).toUpperCase()
}

// Handle logout
function handleLogout() {
  logout()
}
</script>
