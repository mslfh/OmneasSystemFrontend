<template>
  <q-dialog
    v-model="editScheduleStaffDialog"
    transition-show="scale"
    transition-hide="scale"
    @hide="emit('close')"
  >
    <q-card>
      <q-card-section>
        <div class="text-h6">
          {{ props.staffSchedule.staff_name }}'s Schedule
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row">
          <q-input
            class="col-6"
            v-model="props.staffSchedule.staff_name"
            label="Staff"
            readonly
            outlined
          />
          <q-input
            class="col-6"
            v-model="schedule.work_date"
            type="date"
            label="Date"
            outlined
          />
        </div>
        <q-input v-model="schedule.start_time" type="time" label="Start Time" />
        <q-input v-model="schedule.end_time" type="time" label="End Time" />
        <!-- <q-option-group
          v-model="schedule.status"
          label="Status"
          :options="[
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ]"
          inline
        /> -->
        <q-input v-model="schedule.remark" label="Remark" />
      </q-card-section>
      <q-card-section class="items-center q-pb-none text-grey text-subtitle1">
        <div class="text-bold">
          <q-icon name="group" size="sm" class="q-mr-md" />Staff Filter
        </div>
        <q-option-group
          v-model="showAllStaff"
          :options="[
            { label: 'All Staff', value: true },
            { label: 'Scheduled Staff Only', value: false },
          ]"
          type="radio"
          color="primary"
          inline
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="negative"
          @click="editScheduleStaffDialog = false"
        />
        <q-btn
          flat
          label="Comfirm"
          color="primary"
          @click="
            () => {
              editScheduleStaffDialog = false;
              if (showAllStaff != props.isShowAllStaff) {
                updateSchedule();
                emit('switch-show-staff');
              } else {
                updateSchedule();
              }
            }
          "
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useQuasar } from "quasar";
import { api } from "boot/axios";

const props = defineProps({
  staffSchedule: {
    type: Object,
    required: true,
  },
  isShowAllStaff: {
    type: Boolean,
    required: true,
  },
});

const $q = useQuasar();

const schedule = ref([]);

const emit = defineEmits(["close", "switch-show-staff"]);

const editScheduleStaffDialog = ref(true);
const showAllStaff = ref(props.isShowAllStaff);

onMounted(() => {
  schedule.value = props.staffSchedule.schedule[0] || {};
});

async function updateSchedule() {
  try {
    const { id, start_time, end_time,status, remark } = schedule.value;
    if (id) {
      await api.put(`/api/schedules/${id}`, {
        start_time,
        end_time,
        // status,
        remark,
      });
    } else {
      await api.post(`/api/schedules`, {
        staff_id: props.staffSchedule.staff_id,
        work_date: schedule.value.work_date,
        status:"active",
        start_time,
        end_time,
        remark,
      });
    }
  } catch (error) {
    console.error("Error updating event:", error);
  }
}
</script>
