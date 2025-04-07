<template>
  <div>
    <q-item class="q-mb-sm" clickable v-ripple>
      <q-item-section avatar>
        <q-avatar size="26px">
          <img src="https://cdn.quasar.dev/img/avatar5.jpg" />
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label> name</q-item-label>
        <q-item-label caption lines="1">email</q-item-label>
      </q-item-section>
    </q-item>
    <q-separator />
    <q-item  class="q-mb-sm" clickable v-ripple>
      <q-item-section avatar>
        <q-avatar text-color="grey" icon="person" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Profile</q-item-label>
      </q-item-section>
    </q-item>
    <q-item class="q-mb-sm" clickable v-ripple>
      <q-item-section avatar>
        <q-avatar text-color="grey" icon="help" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Help</q-item-label>
      </q-item-section>
    </q-item>
    <q-item class="q-mb-sm" clickable v-ripple>
      <q-item-section avatar>
        <q-avatar text-color="grey" icon="settings" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Settings</q-item-label>
      </q-item-section>
    </q-item>
    <q-item class="q-mb-sm" clickable v-ripple>
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
</script>
