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
    </q-toolbar-title>
    <q-separator class="q-my-md" />
    <div class="q-pa-xs q-gutter-md">
      <div class="row">
        <div class="col-6 q-pr-md">
          <q-input
            :model-value="profile.first_name"
            label="First Name"
            outlined
            dense
            readonly
          />
        </div>
        <div class="col-6">
          <q-input
            :model-value="profile.last_name"
            label="Last Name"
            outlined
            dense
            readonly
          />
        </div>
      </div>
      <div class="row text-grey-8">
        <div class="col-6 q-pr-md">
          <q-input
            :model-value="profile.date_of_birth"
            label="Date of Birth"
            outlined
            dense
            readonly
          />
        </div>
        <div class="col-6">
          <q-input
            :model-value="profile.gender"
            label="Gender"
            outlined
            dense
            readonly
          />
        </div>
      </div>
      <q-input
        :model-value="profile.phone"
        label="Phone"
        outlined
        dense
        readonly
      />
      <q-input
        :model-value="profile.address"
        label="Address"
        outlined
        dense
        readonly
      />
      <div class="row">
        <div class="col-6 q-pr-md">
          <q-input
            :model-value="profile.emergency_contact_name"
            label="Emergency Contact Name"
            outlined
            dense
            readonly
          />
        </div>
        <div class="col-6">
          <q-input
            :model-value="profile.emergency_contact_phone"
            label="Emergency Contact Phone"
            outlined
            dense
            readonly
          />
        </div>
      </div>
      <q-input
        :model-value="profile.private_health_fund_provider"
        label="Private health fund provider"
        outlined
        dense
        readonly
      />
      <q-input
        :model-value="profile.visit_reason"
        label="Reason for visit"
        outlined
        dense
        readonly
        type="textarea"
      />
      <div class="row">
        <div class="col-sm-7 col-xs-12 q-pl-sm-md">
          <PainPointMarker :painPoints="painPoints" :readonly="true" />
        </div>
        <div class="col-sm-5 col-xs-12">
          <q-input
            :model-value="profile.areas_of_soreness"
            label="Areas of Soreness"
            dense
            type="textarea"
            :autogrow="false"
            :input-style="
              $q.screen.gt.xs ? 'min-height: 310px;' : 'min-height: 120px;'
            "
            readonly
          />
        </div>
      </div>
      <div class="row q-pt-md">
        <div class="col-12">
          <q-input
            :model-value="profile.medical_history"
            label="Medical History"
            outlined
            dense
            type="textarea"
            readonly
          />
        </div>
        <div class="col-12 q-pb-md row justify-end">
          <AttachmentViewer :attachments="attachments" />
        </div>
      </div>
      <q-input
        :model-value="profile.others"
        label="Others"
        outlined
        dense
        type="textarea"
        readonly
      />
      <q-input
        :model-value="profile.notes"
        label="Notes"
        outlined
        dense
        type="textarea"
        readonly
      />
    </div>
  </q-card>
</template>

<script setup>
import { ref, nextTick } from "vue";
import { useQuasar } from "quasar";
import PainPointMarker from "components/PainPointMarker.vue";
import AttachmentViewer from "./AttachmentViewer.vue";
import html2canvas from "html2canvas";

const props = defineProps({
  profile: { type: Object, required: true },
  painPoints: { type: Array, required: true },
  attachments: { type: Array, required: true },
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
</script>

<style scoped>
.q-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
</style>
