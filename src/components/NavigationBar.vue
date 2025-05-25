<template>
  <div class="navigation-bar ">
    <q-btn flat icon="chevron_left" @click="$emit('prev')" label="Previous" />
    <q-btn flat icon="today" @click="$emit('today')" label="Today" />
    <q-btn flat icon="chevron_right" @click="$emit('next')" label="Next" />
  </div>
</template>

<script setup>
</script>

<style>
.navigation-bar {
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>
