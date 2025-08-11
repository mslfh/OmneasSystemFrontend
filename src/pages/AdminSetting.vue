<template>
  <div class="q-pa-md">
    <q-card>
      <q-card-section>
        <p class="q-mb-md">
          You can configure system setting here.
          <br />
        </p>
      </q-card-section>
      <q-separator />
      <q-card-section v-if="false" class="q-pa-md">

        <!-- Placeholder of  booking_reminder_msg -->
        <q-label
          v-if="is_booking_reminder"
          style="font-size: 0.9rem; color: #999;"
          >
          <q-icon name="info" size="16px" class="q-mr-xs" />
        Please use {first_name} to replace with customer first name when editing the message,
        {last_name} for customer last name,
        {date} for booking date (like Friday, May 22),
        {time} for booking time ( like 10:00 AM),
        {service} for service name,
        {duration} for service duration (like 90 minutes),
        {therapist} for staff name (It will be 'Any Therapist' if not ussigned)
        </q-label>
        <q-separator class="q-ma-sm" />

        <q-toggle
          v-model="is_booking_reminder"
          :label="'Enable Booking Success Notification'"
          class="q-mb-md"
          icon="notifications"
        />

        <q-input
          v-model="getSetting('booking_reminder_msg').value"
          :label="'Booking Success Notification Message'"
          outlined
          :hint="getSetting('booking_reminder_msg').description"
          type="textarea"
          class="q-mb-md"
          debounce="1000"
          @update:model-value="
            (value) => saveSetting(getSetting('booking_reminder_msg'))
          "
        />
        <q-separator class="q-ma-sm" />
        <q-label
          v-if="is_reminder_interval"
          style="font-size: 0.9rem; color: #999;"
          >
          <q-icon name="info" size="16px" class="q-mr-xs" />
        The appointments of current day will not send reminder by default.
        </q-label>
        <q-space/>
        <q-toggle
          v-model="is_reminder_interval"
          :label="'Enable Coming Appointment Reminder'"
          class="q-mb-md"
          icon="alarm"
        />

        <q-input
          v-model="getSetting('reminder_interval').value"
          :label="'Reminder Interval (hours)'"
          outlined
          :hint="getSetting('reminder_interval').description"
          type="number"
          class="q-mb-md"
          debounce="1000"
          @update:model-value="
            (value) => saveSetting(getSetting('reminder_interval'))
          "
        />
        <q-input
          v-model="getSetting('reminder_msg').value"
          :label="'Reminder Message'"
          outlined
          :hint="getSetting('reminder_msg').description"
          type="textarea"
          class="q-mb-md"
          debounce="1000"
          @update:model-value="
            (value) => saveSetting(getSetting('reminder_msg'))
          "
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { onMounted, computed, ref, watch } from "vue";
import { api } from "boot/axios";

const settings = ref([]);

const fetchSettings = async () => {
  try {
    const response = await api.get("/api/system-setting");
    if (response.status !== 200) {
      throw new Error("Failed to fetch settings");
    }
    settings.value = response.data;
    console.log("Settings fetched successfully:", settings.value);
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

const getSetting = (key) => {
  return settings.value.find((setting) => setting.key === key) || {};
};

const is_booking_reminder = computed({
  get() {
    return getSetting("booking_reminder").value === "true";
  },
  set(value) {
    const setting = getSetting("booking_reminder");
    setting.value = value ? "true" : "false"; // Convert to string
    saveSetting(setting); // Call API to update booking_reminder
  },
});

const is_reminder_interval = computed({
  get() {
    return getSetting("reminder_interval").value > 0;
  },
  set(value) {
    const setting = getSetting("reminder_interval");
    setting.value = value ? 24 : 0; // Default to 1 if enabled
    saveSetting(setting); // Call API to update reminder_interval
  },
});

watch(is_reminder_interval, (newValue) => {
  if (!newValue) {
    const setting = getSetting("reminder_interval");
    setting.value = 0;
    saveSetting(setting); // Call API to update reminder_interval to 0
  }
});

onMounted(fetchSettings);
</script>
