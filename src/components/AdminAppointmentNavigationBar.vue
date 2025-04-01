<template>
  <div class="custom-nav-bar">
    <q-btn flat round dense icon="arrow_back" @click="onPrev">
      <q-tooltip>Previous</q-tooltip>
    </q-btn>
    <div class="nav-title">{{ title }}</div>
    <q-btn flat round dense icon="arrow_forward" @click="onNext">
      <q-tooltip>Next</q-tooltip>
    </q-btn>
    <q-btn flat round dense icon="today" @click="onToday">
      <q-tooltip>Today</q-tooltip>
    </q-btn>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

defineProps({
  title: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["prev", "next", "today"]);

function onPrev() {
  emit("prev");
}

function onNext() {
  emit("next");
}

function onToday() {
  emit("today");
}
</script>

<style scoped>
.custom-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background-color: #3f51b5;
  color: white;
  border-radius: 4px;
}

.nav-title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  flex-grow: 1;
}
</style>
