<template>
  <q-card ref="captureArea" class="q-pa-lg q-mx-auto" style="max-width: 700px">
    <q-toolbar-title class="text-weight-bold text-blue-4">
      <q-icon name="privacy_tip" size="md" />
      Confidential Client Information
      <q-btn
        class="float-right"
        icon="download"
        color="primary"
        :disable="loading"
        flat
        @click="exportAsImage"
      />
      <q-btn
        size="13px"
        v-if="editable"
        class="float-right"
        icon="edit"
        color="primary"
        flat
        @click="is_edit = !is_edit"
      />
    </q-toolbar-title>
    <q-separator class="q-my-md" />
    <div class="q-pa-xs q-gutter-md">
      <div class="row">
        <div class="col-6 q-pr-md">
          <q-input
            v-model="profile.first_name"
            label="First Name"
            outlined
            dense
            readonly
          />
        </div>
        <div class="col-6">
          <q-input
            v-model="profile.last_name"
            label="Last Name"
            outlined
            dense
            readonly
          />
        </div>
      </div>
      <q-input v-model="profile.phone" label="Phone" outlined dense readonly />
      <div class="row text-grey-8">
        <div class="col-6 q-pr-md">
          <q-input
            v-model="profile.date_of_birth"
            label="Date of Birth"
            outlined
            dense
            :readonly="!is_edit"
          />
        </div>
        <div class="col-6">
          <q-input
            v-model="profile.gender"
            label="Gender"
            outlined
            dense
            :readonly="!is_edit"
          />
        </div>
      </div>
      <q-input
        v-model="profile.address"
        label="Address"
        outlined
        dense
        :readonly="!is_edit"
      />
      <div class="row">
        <div class="col-6 q-pr-md">
          <q-input
            v-model="profile.emergency_contact_name"
            label="Emergency Contact Name"
            outlined
            dense
            :readonly="!is_edit"
          />
        </div>
        <div class="col-6">
          <q-input
            v-model="profile.emergency_contact_phone"
            label="Emergency Contact Phone"
            outlined
            dense
            :readonly="!is_edit"
          />
        </div>
      </div>
      <q-input
        v-model="profile.private_health_fund_provider"
        label="Private health fund provider"
        outlined
        dense
        :readonly="!is_edit"
      />
      <q-input
        v-model="profile.visit_reason"
        label="Reason for visit"
        outlined
        dense
        :readonly="!is_edit"
        type="textarea"
      />
      <div class="row">
        <div class="col-md-7 col-xs-12 q-pl-sm-md">
          <PainPointMarker
            :painPoints="painPoints"
            @update:painPoints="(val) => (painPoints.value = val)"
            :readonly="!is_edit"
          />
        </div>
        <div class="col-md-5 col-xs-12">
          <q-input
            v-model="profile.areas_of_soreness"
            label="Areas of Soreness"
            dense
            type="textarea"
            :autogrow="false"
            :input-style="
              $q.screen.gt.xs ? 'min-height: 310px;' : 'min-height: 120px;'
            "
            :readonly="!is_edit"
          />
        </div>
      </div>
      <div class="row q-pt-md">
        <div class="col-12">
          <q-input
            v-model="profile.medical_history"
            label="Medical History"
            outlined
            dense
            type="textarea"
            :readonly="!is_edit"
          />
        </div>
        <div class="col-12 q-pb-md row justify-between">
          <AttachmentViewer :attachments="attachments" />
          <q-file
            v-if="editable"
            v-model="files"
            dense
            use-chips
            multiple
            counter
            max-files="5"
            :counter-label="counterLabelFn"
            style="min-width: 50%; max-width: 100%"
            accept=".jpg,.jpeg,.png,image/*"
            label-slot
          >
            <template v-slot:prepend>
              <q-icon size="xs" name="cloud_upload" />
            </template>
            <template v-slot:label>
              <span class="text-caption">Upload Medical Files</span>
            </template>
          </q-file>
        </div>
      </div>
      <q-input
        v-model="profile.others"
        label="Others"
        outlined
        dense
        type="textarea"
        :readonly="!is_edit"
      />
      <q-input
        v-model="profile.notes"
        label="Notes"
        outlined
        dense
        type="textarea"
        :readonly="!is_edit"
      />
    </div>
    <q-separator class="q-my-md" />
    <q-card-actions align="right" v-show="is_edit || files.length">
      <q-btn flat label="Cancel" color="negative" @click="is_edit = false" />
      <q-btn flat label="Save" color="primary" @click="updateProfile" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, nextTick, computed, onMounted, watch } from "vue";
import { useQuasar } from "quasar";
import PainPointMarker from "components/PainPointMarker.vue";
import AttachmentViewer from "./AttachmentViewer.vue";
import html2canvas from "html2canvas";

import axios from "axios";
const VITE_API_URL = import.meta.env.VITE_API_URL;

const props = defineProps({
  profileId: { type: Object, required: true },
  editable: { type: Boolean, required: true },
});

const profile = ref({});
const painPoints = ref([]);
const attachments = ref([]);
const files = ref([]);
const is_edit = ref(false);

const counterLabelFn = ({ totalSize, filesNumber, maxFiles }) => {
  return `${filesNumber} files of ${maxFiles} (max) | ${totalSize}`;
};

onMounted(async () => {
  const id = props.profileId;
  if (!id) {
    //add profile

    return;
  }
  try {
  const { data } = await axios.get(`${VITE_API_URL}/api/user-profile/${id}`);
  profile.value = data;
  // Parse pain points
  try {
    painPoints.value = data.pain_points ? JSON.parse(data.pain_points) : [];
  } catch (e) {
    painPoints.value = [];
  }
  // Parse attachments
  attachments.value = data.medical_attachment_path;
  } catch (e) {
    $q.notify({ type: "negative", message: "Failed to load profile" });
  }
});

const $q = useQuasar();
const captureArea = ref(null);
const loading = ref(false);

const exportAsImage = async () => {
  if (loading.value) return;
  loading.value = true;
  await nextTick();
  if (!captureArea.value || !captureArea.value.$el) {
    $q.notify({ type: "negative", message: "Capture area is not available." });
    loading.value = false;
    return;
  }
  try {
    const canvas = await html2canvas(
      captureArea.value.$el || captureArea.value
    );
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "profile.png";
    link.click();
  } catch (error) {
    $q.notify({ type: "negative", message: "Failed to export as image." });
  }
  loading.value = false;
};

const updateProfile = async () => {
  try {
    const formData = new FormData();
    // Append profile fields
    const profileData = { ...profile.value };
    profileData.pain_points = JSON.stringify(painPoints.value);
    // Remove files/attachments from profileData if present
    delete profileData.medical_attachment_path;
    // Append each field to FormData
    Object.entries(profileData).forEach(([key, value]) => {
      formData.append(key, value == null ? "" : value);
    });

    // Append files
    if (files.value && Array.isArray(files.value)) {
      files.value.forEach((file) => {
        formData.append("files[]", file);
      });
    } else if (files.value) {
      formData.append("files[]", files.value);
    }

    const response = await axios.post(
      `${VITE_API_URL}/api/user-profile/${props.profileId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    $q.notify({
      type: "positive",
      message: "Profile updated successfully",
    });
    profile.value = response.data;
    painPoints.value = response.data.pain_points
      ? JSON.parse(response.data.pain_points)
      : [];
    attachments.value = response.data.medical_attachment_path;
    files.value = [];
    is_edit.value = false;
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Failed to update profile",
    });
  }
};
</script>
