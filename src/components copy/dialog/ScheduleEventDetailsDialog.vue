<template>
  <q-dialog v-model="show" @hide="onClose">
    <q-card
      style="
        width: 500px;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      "
    >
      <q-card-section class="dialog-header">
        <div class="text-h6 text-white">
          <q-icon name="edit_calendar" class="q-mr-sm" size="24px" />
          Event Details
        </div>
      </q-card-section>
      <q-card-section class="q-pa-lg">
        <div>
          <q-input
            v-model="formData.title"
            label="Staff"
            readonly

            class="q-mb-sm"
          >
            <template v-slot:prepend>
              <q-icon name="person" :color="formData.status === 'active' ? 'green-5' : 'grey-5'" />
            </template>
          </q-input>
        </div>

        <!-- Duration Display -->
        <div class="row justify-between items-center q-mb-md" v-if="duration">
          <q-chip
            :color="formData.status === 'active' ? 'green-2' : 'grey-4'"
            :text-color="formData.status === 'active' ? 'green-8' : 'grey-7'"
            icon="o_timer"
            class="q-ma-none"
          >
            Duration: {{ duration }}
          </q-chip>
          <q-toggle
            v-model="isActive"
            :color="isActive ? 'green-6' : 'grey-5'"
            :icon="isActive ? 'check_circle' : 'cancel'"
            size="md"
            @update:model-value="updateStatus"
          />
        </div>

        <div class="row q-gutter-md q-mb-md">
          <div class="col">
            <q-input
              v-model="formData.start_time"
              type="time"
              label="Start Time"
              outlined
              dense
              color="green-3"
              @update:model-value="updateDuration"
            >
              <template v-slot:prepend>
                <q-icon name="access_time" size="xs" :color="formData.status === 'active' ? 'green-5' : 'grey-5'" />
              </template>
            </q-input>
          </div>
          <div class="col">
            <q-input
              v-model="formData.end_time"
              type="time"
              label="End Time"
              outlined
              dense
              color="green-3"
              @update:model-value="updateDuration"
            >
            </q-input>
          </div>
        </div>

        <div>
          <q-input
            v-model="formData.remark"
            label="Remark"
            outlined
            dense
            type="textarea"
            rows="4"
            color="green-6"
          >
            <template v-slot:prepend>
              <q-icon name="o_info" size="xs" :color="formData.status === 'active' ? 'green-3' : 'grey-5'" />
            </template>
          </q-input>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md q-pt-none">
        <q-btn
          flat
          label="Delete"
          color="red-6"
          class="q-mr-sm"
          @click="onDelete"
          v-if="showDeleteButton"
        />
        <q-btn
          unelevated
          label="Save"
          color="green-6"
          @click="onSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useQuasar } from 'quasar';

interface Props {
  modelValue: boolean;
  eventData?: any;
  showDeleteButton?: boolean;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "save", data: any): void;
  (e: "delete", id: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  showDeleteButton: true,
});

const emit = defineEmits<Emits>();
const $q = useQuasar();

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const formData = ref({
  id: null,
  title: "",
  start_time: "",
  end_time: "",
  status: "active",
  remark: "",
});

// 状态切换的响应式变量
const isActive = computed({
  get: () => formData.value.status === "active",
  set: (value) => {
    formData.value.status = value ? "active" : "inactive";
  },
});

// 计算工作时长
const duration = computed(() => {
  if (!formData.value.start_time || !formData.value.end_time) return "";

  const startTime = new Date(`2000-01-01 ${formData.value.start_time}`);
  const endTime = new Date(`2000-01-01 ${formData.value.end_time}`);

  if (endTime <= startTime) return "";

  const diffMs = endTime.getTime() - startTime.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
});

function resetForm() {
  formData.value = {
    id: null,
    title: "",
    start_time: "",
    end_time: "",
    status: "active",
    remark: "",
  };
}

function updateDuration() {
  // 这个函数用于触发duration的重新计算
  // 实际上computed会自动更新，这里只是为了确保响应性
}

function updateStatus(value: boolean) {
  formData.value.status = value ? "active" : "inactive";
}

function onSave() {
  const saveData = {
    id: formData.value.id,
    start_time: formData.value.start_time,
    end_time: formData.value.end_time,
    status: formData.value.status,
    remark: formData.value.remark,
  };

  emit("save", saveData);
}

function onDelete() {
  if (formData.value.id) {
    $q.dialog({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this schedule? It will not show up again!',
      cancel: true,
      persistent: true,
      color: 'negative'
    }).onOk(() => {
      emit("delete", formData.value.id);
    });
  }
}

function onClose() {
  resetForm();
}

// Watch for eventData changes to populate form
watch(
  () => props.eventData,
  (newData) => {
    if (newData) {
      formData.value = {
        id: newData.id || null,
        title: newData.title || "",
        start_time: newData.start_time || "",
        end_time: newData.end_time || "",
        status: newData.status || "active",
        remark: newData.remark || "",
      };
    }
  },
  { immediate: true }
);

// Watch for dialog close to reset form
watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) {
      resetForm();
    }
  }
);
</script>

<style scoped>
.dialog-header {
  background: linear-gradient(135deg, #54bf9d 0%, #1f8467 100%);
}
</style>
