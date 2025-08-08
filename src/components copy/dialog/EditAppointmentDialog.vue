<template>
  <q-dialog
    v-model="editEventDialog"
    transition-show="scale"
    transition-hide="scale"
    @hide="emit('close')"
  >
    <q-card :style="$q.screen.gt.md ? 'min-width: 850px' : 'min-width: 100%'">
      <q-card-section horizontal class="q-ma-sm">
        <div class="text-h6 text-grey-8">Booking Details</div>
        <q-space />
        <q-btn flat round icon="more_vert" color="grey">
          <q-menu>
            <q-list dense class="text-caption">
              <q-item
                clickable
                v-close-popup
                @click="emit('openSms')"
                class="text-teal-5"
              >
                <q-item-label class="q-ma-sm">
                  <q-icon size="xs" name="send" />
                  MESSAGE
                </q-item-label>
              </q-item>

              <q-item
                clickable
                v-close-popup
                @click="emit('openInvoice')"
                class="text-orange-6"
              >
                <q-item-label class="q-ma-sm">
                  <q-icon size="xs" name="receipt_long" />
                  INVOICE
                </q-item-label>
              </q-item>

              <q-item
                clickable
                v-close-popup
                @click="deleteAppointment()"
                class="text-red-4"
              >
                <q-item-label class="q-ma-sm">
                  <q-icon size="xs" name="delete" />
                  DELETE
                </q-item-label>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-card-section>
      <div class="row q-ma-md">
        <!--Events -->
        <div :class="$q.screen.gt.md ? 'col-4' : 'col-6'">
          <div>
            <div class="text-h6 text-grey-8 q-pa-xs">Select Therapist</div>
            <q-chip
              v-for="staff in staffOptions"
              :key="staff.id"
              clickable
              :color="selectedStaff.id === staff.id ? 'orange-2' : 'blue-2'"
              @click="
                () => {
                  selectedStaff.id = staff.id;
                  selectedStaff.name = staff.name;
                  fetchAvailableBookingTime(editEventForm.booking_date);
                }
              "
            >
              {{ staff.id == 0 ? "* Waitting List" : staff.name }}
            </q-chip>

            <q-select
              v-model="editEventForm.service"
              :options="serviceOptions"
              label="* Service"
              option-value="id"
              option-label="name"
              clearable
              @update:model-value="
                fetchAvailableBookingTime(editEventForm.booking_date)
              "
            />
            <q-input
              v-model="editEventForm.booking_date"
              label="Select Date"
              mask="####-##-##"
            >
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="editEventForm.booking_date"
                      mask="YYYY-MM-DD"
                      @update:model-value="
                        fetchAvailableBookingTime(editEventForm.booking_date)
                      "
                    >
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <div class="q-mb-sm text-weight-bold">
              <q-label class="text-subtitle2 text-grey-9">
                Booking Time:</q-label
              >
              <q-input
                dense
                v-model="editEventForm.booking_time"
                outlined
                type="time"
              />
              <q-separator class="q-my-md" />
            </div>
            <q-scroll-area style="height: 200px">
              <q-chip
                v-for="item in available_booking_time"
                :key="item"
                clickable
                :dense="$q.screen.lt.md"
                :icon="
                  editEventForm.booking_time == item
                    ? 'check_circle'
                    : 'o_fiber_manual_record'
                "
                :color="
                  editEventForm.booking_time == item ? 'orange-3' : 'teal-1'
                "
                @click="editEventForm.booking_time = item"
                >{{ item }}</q-chip
              >
            </q-scroll-area>
          </div>
        </div>
        <div v-if="$q.screen.gt.md" class="col-1 flex justify-center">
          <q-separator vertical class="q-my-md" style="height: 90%" />
        </div>
        <div class="col-6">
          <q-card-section class="q-pa-xs row justify-between">
            <q-chip
              size="12px"
              outline
              icon="event"
              color="teal-4"
              text-color="white"
              clickable
              @click.stop="startAppointment()"
            >
              Start
            </q-chip>
            <q-chip
              size="12px"
              outline
              color="orange-5"
              text-color="white"
              icon="o_verified"
              clickable
              @click.stop="finishAppointment()"
            >
              Check Out
            </q-chip>
            <q-chip
              size="12px"
              outline
              color="red-5"
              text-color="white"
              icon="visibility_off"
              clickable
              @click.stop="noShowAppointment()"
            >
              No Show
            </q-chip>
          </q-card-section>
          <q-card-section>
            <q-input
              rounded
              dense
              v-model="user_search"
              outlined
              placeholder="Find User by Name, Phone, or Email"
              @keyup.enter="selectUserFromSearch"
            >
              <template v-slot:append>
                <q-icon v-if="user_search === ''" name="search" />
                <q-icon
                  v-else
                  name="clear"
                  class="cursor-pointer"
                  @click="user_search = ''"
                />
              </template>
            </q-input>
            <q-item-label
              v-if="foundUsers.length == 0 && user_search !== ''"
              class="text-caption"
              >No data found</q-item-label
            >
            <q-scroll-area v-if="user_search !== ''" style="height: 100px">
              <q-list>
                <q-item
                  v-for="user in foundUsers"
                  :key="user.id"
                  clickable
                  @click="
                    editEventForm.customer_name = user.name;
                    editEventForm.customer_first_name = user.first_name;
                    editEventForm.customer_last_name = user.last_name;
                    editEventForm.customer_email = user.email;
                    editEventForm.customer_phone = user.phone;
                  "
                >
                  <q-item-section>
                    <q-item-label>{{ user.name }}</q-item-label>
                    <q-item-label caption>{{ user.phone }}</q-item-label>
                    <q-item-label caption>{{ user.email }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-scroll-area>
            <q-input
              v-model="editEventForm.customer_name"
              label="Customer Name"
            />
            <q-input
              v-model="editEventForm.customer_first_name"
              label="First Name"
            />
            <q-input
              v-model="editEventForm.customer_last_name"
              label="Last Name"
            />
            <q-input v-model="editEventForm.customer_email" label="Email" />
            <q-input v-model="editEventForm.customer_phone" label="Phone" />
            <q-input
              type="textarea"
              v-model="editEventForm.comments"
              label="Comments"
            />
          </q-card-section>

          <div class="row justify-end">
            <q-chip
              v-if="profile"
              size="12px"
              outline
              icon="o_attachment"
              color="blue-4"
              text-color="white"
              clickable
              @click.stop="isAttachmentDialogOpen = true"
            >
              Attachments
            </q-chip>
            <q-chip
              size="12px"
              outline
              icon="o_sticky_note_2"
              color="blue-4"
              text-color="white"
              clickable
              @click.stop="isProfileDialogOpen = true"
            >
              Profile
              <!-- <q-badge  floating-right rounded color="blue" transparent> -->
              <q-icon
                v-if="hasProfile"
                size="15px"
                name="done_all"
                color="blue"
                class="q-ml-sm"
              />
              <q-icon
                v-if="!hasProfile"
                size="15px"
                name="add"
                color="blue"
                class="q-ml-sm"
              />
              <!-- </q-badge> -->
            </q-chip>
            <q-chip
              size="12px"
              outline
              icon="history"
              color="blue-4"
              text-color="white"
              clickable
              @click.stop="isHistoryDialogOpen = true"
            >
              History
            </q-chip>
          </div>
        </div>
      </div>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="negative"
          @click="editEventDialog = false"
        />
        <q-btn flat label="Save" color="positive" @click="saveEditedEvent" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="isHistoryDialogOpen">
    <q-card style="min-width: 350px; min-height: 300px">
      <q-card-section class="text-h6"> Customer History </q-card-section>
      <q-card-section>
        <CustomerHistoryTimeline
          :user_Id="editEventForm.customer_id"
          :customer_phone="editEventForm.customer_phone"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Back"
          color="positive"
          @click="isHistoryDialogOpen = false"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Customer Profile -->
  <q-dialog v-model="isProfileDialogOpen">
    <ConfidentialClientCard
      v-if="hasProfile"
      style="width: 700px"
      :profileId="profile_id"
      :editable="true"
    />
    <CustomerProfileCard
      v-if="!hasProfile"
      style="width: 700px"
      :first_name="editEventForm.customer_first_name"
      :last_name="editEventForm.customer_last_name"
      :phone="editEventForm.customer_phone"
      @save="
        (id) => {
          isProfileDialogOpen = false;
          profile_id = id;
          hasProfile = true;
        }
      "
    />
  </q-dialog>

  <!-- Customer Attachemnt -->
  <ProfileAttachmentDialog
    v-if="isAttachmentDialogOpen"
    :profile="profile"
    @update="
      fetchUserProfile();
      isAttachmentDialogOpen = false;
    "
    @close="isAttachmentDialogOpen = false"
  />
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted, defineEmits } from "vue";
import { useQuasar } from "quasar";
import { api } from "boot/axios";
import { fetchUserFromSearch } from "../../composables/useUserFromSearch";
import { fetchAvailableBookingTimeSlots } from "../../composables/useAvailableBookingTime";
import CustomerHistoryTimeline from "src/components/tools/CustomerHistoryTimeline.vue";
import ConfidentialClientCard from "components/ConfidentialClientCard.vue";
import CustomerProfileCard from "components/CustomerProfileCard.vue";
import ProfileAttachmentDialog from "components/dialog/ProfileAttachmentDialog.vue";

const props = defineProps({
  editEventForm: {
    type: Object,
    required: true,
  },
  selectedStaff: {
    type: Object,
    required: true,
  },
  selectedDate: {
    type: String,
    required: true,
  },
  staffOptions: {
    type: Object,
    required: true,
  },
  serviceOptions: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits([
  "close",
  "openSms",
  "save",
  "delete",
  "checkOut",
  "openInvoice",
]);
const $q = useQuasar();

const editEventForm = ref(props.editEventForm);
const selectedStaff = ref(props.selectedStaff);
const staffOptions = ref(props.staffOptions);
const serviceOptions = ref(props.serviceOptions);

const available_booking_time = ref<string[]>([]);
const user_search = ref("");
const foundUsers = ref([]);
const editEventDialog = ref(true);

async function selectUserFromSearch() {
  foundUsers.value = await fetchUserFromSearch(user_search.value);
}

onMounted(() => {
  fetchAvailableBookingTime();
  fetchUserProfile();
});

// UserProfile
const profile_id = ref(0);
const profile = ref(null);
const hasProfile = ref(false);

async function fetchUserProfile() {
  hasProfile.value = false;
  const user_id = editEventForm.value.customer_id;
  if (!user_id) {
    return;
  }
  const { data } = await api.get(`/api/get-profile-by-userId`, {
    params: {
      user_id: user_id,
    },
  });
  if (!data.id) {
    return;
  }
  hasProfile.value = true;
  profile_id.value = data.id;
  profile.value = data;
}

async function fetchAvailableBookingTime(date: string) {
  // try {
  const duration = editEventForm.value.service.duration;

  // Filter out unavailable times
  const times = await fetchAvailableBookingTimeSlots({
    date: props.selectedDate,
    staffId: selectedStaff.value.id,
    duration,
  });

  available_booking_time.value = times;
  if (times.length === 0) {
    $q.notify({
      type: "warning",
      color: "orange-4",
      message: "No available booking time found.",
    });
  }
  // } catch (error) {
  //   available_booking_time.value = [];
  //   $q.notify({
  //     type: "negative",
  //     message: "Failed to load booking time.",
  //   });
  // }
}

async function saveEditedEvent() {
  try {
    editEventForm.value.staff = selectedStaff.value;
    const payload = { ...editEventForm.value };
    const response = await api.put(
      `/api/appointments/${payload.appointment_id}`,
      payload
    );
    if (response.status === 200) {
      $q.notify({
        type: "positive",
        message: "Appointment updated successfully",
        position: "top",
        timeout: 2000,
      });
    } else {
      $q.notify({
        type: "negative",
        message: response.data.message,
        position: "top",
        timeout: 2000,
      });
    }
    emit("save");
  } catch (error) {
    console.error("Error saving edited event:", error);
  }
}

async function deleteAppointment() {
  try {
    // Show confirmation dialog
    $q.dialog({
      title: "Delete Appointment",
      message: "Are you sure you want to delete this appointment?",
      cancel: true,
      persistent: true,
    })
      .onOk(async () => {
        const response = await api.delete(
          `/api/appointments/${editEventForm.value.appointment_id}`
        );

        if (response.status === 200) {
          $q.notify({
            type: "positive",
            message: "Appointment deleted successfully",
            position: "top",
            timeout: 2000,
          });
        }
        emit("delete");
      })
      .onCancel(() => {
        console.log("Delete appointment canceled");
      });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    $q.notify({
      type: "negative",
      message: "Failed to delete the appointment. Please try again.",
      position: "top",
      timeout: 2000,
    });
  }
}

function startAppointment() {
  // Show confirmation dialog before starting the appointment
  const start_time = new Date();
  const hours = String(start_time.getHours()).padStart(2, "0");
  const minutes = String(start_time.getMinutes()).padStart(2, "0");
  const formattedTime = `${props.selectedDate} ${hours}:${minutes}`;
  $q.dialog({
    title: "Start Appointment",
    message: `Are you sure you want to start this appointment at ${formattedTime}?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.put(`/api/appointments/${editEventForm.value.appointment_id}`, {
        ...editEventForm.value,
        actual_start_time: formattedTime,
        status: "in_progress",
      });
      $q.notify({
        type: "positive",
        message: "Appointment started.",
        position: "top",
        timeout: 2000,
      });
      emit("save");
    } catch (error) {
      $q.notify({
        type: "negative",
        message: "Failed to start appointment.",
        position: "top",
        timeout: 2000,
      });
    }
  });
}

function finishAppointment() {
  emit("checkOut");
}

async function noShowAppointment() {
  $q.dialog({
    title: '<span style="color:red;font-weight:bold;">Mark No Show</span>',
    message:
      " Are you sure you want to mark this appointment as <b>No Show</b>?",
    html: true,
    cancel: {
      color: "grey-7",
      label: "Cancel",
    },
    ok: {
      color: "red-5",
      label: "Comfirm No Show",
    },
    persistent: true,
  }).onOk(async () => {
    try {
      await api.post(`/api/appointments/mark-no-show`, {
        id: editEventForm.value.appointment_id,
      });
      $q.notify({
        type: "warning",
        message: "Appointment has marked as No Show.",
        position: "top",
        timeout: 2000,
      });
      emit("save");
    } catch (error) {
      $q.notify({
        type: "negative",
        message: "Failed to mark as No Show.",
        position: "top",
        timeout: 2000,
      });
    }
  });
}

const isHistoryDialogOpen = ref(false);

const isProfileDialogOpen = ref(false);

const isAttachmentDialogOpen = ref(false);
</script>
