<template>
  <q-dialog :model-value="modelValue" @update:model-value="onDialogUpdate">
    <q-card
      :style="
        $q.screen.lt.sm
          ? { minWidth: '330px', maxHeight: '600px' }
          : { minWidth: '400px', maxWidth: '600px' }
      "
    >
      <q-card-section class="q-pb-none">
        <div class="text-h6">Replace {{ ingredient?.name }}</div>
      </q-card-section>

      <q-card-section>
        <q-list separator>
          <q-item
            v-for="option in ingredient?.replacementOptions || []"
            :key="option.value"
            clickable
            @click="select(option.value)"
          >
            <q-item-section avatar>
              <q-radio
                :model-value="ingredient?.replacementId"
                :val="option.value"
                color="deep-orange"
                @update:model-value="select"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-medium">{{
                option.name
              }}</q-item-label>
               <q-item-label caption class="text-grey-6">$ {{
                option.price_change.toFixed(2)
              }}</q-item-label>
              <q-item-label caption class="text-grey-5 q-mt-xs">{{
                option.description
              }}</q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="text-right">
                <div class="text-caption text-grey-6">
                  {{ option.price ? "$" + option.price.toFixed(2) : "" }}
                </div>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="grey" @click="close" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { toRef } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  ingredient: { type: Object, default: null },
});
const emit = defineEmits(["update:modelValue", "select", "close"]);

const modelValue = toRef(props, "modelValue");

function onDialogUpdate(val) {
  emit("update:modelValue", val);
}

function close() {
  emit("update:modelValue", false);
  emit("close");
}

function select(val) {
  emit("select", val);
  emit("update-product", { replacementId: val });
}
</script>

<style scoped></style>
