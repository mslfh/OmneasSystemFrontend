<template>
  <q-page>
    <q-card class="q-pa-sm">
       </q-card>
  </q-page>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";

const router = useRouter();
const $q = useQuasar();
</script>
