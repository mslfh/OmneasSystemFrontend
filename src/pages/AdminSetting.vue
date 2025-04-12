<template>
  <div class="q-pa-md">
    <q-card>
      <q-card-section>
        <p class="q-mb-md">
          You can change the opening and closing times of the appointment here.
          <br />
        </p>
      </q-card-section>
      <q-separator />
      <q-card-section
      v-for ="(setting, index) in settings"
      class="q-pa-md">
      <q-input
        v-model="setting.value"
        :label="setting.key"
        outlined
        :type="setting.type"
        class="q-pb-sm"
      />
      <q-btn
        dense
        color="teal-4"
        label="Save"
        @click="() => saveSetting(setting)"
      />
    </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { api } from "boot/axios";

const settings = ref([]);

const fetchSettings = async () => {
  try {
    const response = await api.get("/api/system-setting");
    if (response.status !== 200) {
      throw new Error("Failed to fetch settings");
    }
    settings.value = response.data;
  } catch (error) {
    console.error("Failed to fetch settings:", error);
  }
};
const saveSetting = async (setting) => {
  try {
    const response = await api.put(`/api/system-setting/${setting.id}`, {
      value: setting.value,
    });
    if (response.status !== 200) {
      throw new Error("Failed to save setting");
    }
    console.log("Setting saved successfully:", response.data);
  } catch (error) {
    console.error("Failed to save setting:", error);
  }
};

onMounted(fetchSettings);
</script>
