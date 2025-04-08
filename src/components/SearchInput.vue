<template>
  <q-input
    rounded
    v-model="modelValue"
    outlined
    :placeholder="placeholder"
    :debounce="300"
    @keyup.enter="searchFunction(modelValue)"
    @input="searchFunction(modelValue)"

  >
    <template v-slot:append>
      <q-icon v-if="modelValue === ''" name="search" />
      <q-icon
        v-else
        name="clear"
        class="cursor-pointer"
        @click="clearInput"
      />
    </template>
  </q-input>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import { api } from "axios";

defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: "Search",
  },
  searchFunction: {
    type: Function,
    required: true,
  },
});

defineEmits(["update:modelValue"]);

const clearInput = () => {
  emit("update:modelValue", "");
};

</script>
