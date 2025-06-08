<template>
  <q-page class="bg-grey-1">
    <q-card-section class="q-pa-md text-center"> </q-card-section>
    <CustomerProfileCard @save="(id) => router.push({ path: '/profile/detail', query: { id } })" />
  </q-page>
</template>

<script setup>
import { useRouter } from "vue-router";
import CustomerProfileCard from "components/CustomerProfileCard.vue";
const router = useRouter();
</script>

<style scoped>
.q-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
</style>
