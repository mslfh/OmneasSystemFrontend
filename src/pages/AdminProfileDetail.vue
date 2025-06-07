<template>
  <q-page>
    <ConfidentialClientCard
      :profile="profile"
      :painPoints="painPoints"
      :attachments="attachments"
    />
    <q-dialog v-model="zoomDialog">
      <q-card
        style="
          background: transparent;
          box-shadow: none;
          max-width: 95vw;
          max-height: 95vh;
        "
      >
        <q-card-section class="flex flex-center" style="padding: 0">
          <div
            style="
              overflow: auto;
              max-width: 90vw;
              max-height: 90vh;
              display: flex;
              align-items: center;
              justify-content: center;
            "
          >
            <img
              v-if="zoomImg"
              :src="zoomImg"
              :style="{
                maxWidth: '100%',
                maxHeight: '90vh',
                background: '#fff',
                borderRadius: '8px',
                border: '1px solid #eee',
                cursor: 'zoom-out',
              }"
              @click="zoomDialog = false"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-space style="height: 50px" />
  </q-page>
</template>

<script setup>
import { onMounted, ref, nextTick } from "vue";
import axios from "axios";
import { useQuasar } from "quasar";
import { useRoute } from "vue-router";
import ConfidentialClientCard from "components/ConfidentialClientCard.vue";

const VITE_API_URL = import.meta.env.VITE_API_URL;
const $q = useQuasar();
const route = useRoute();

const profile = ref({});
const painPoints = ref([]);
const attachments = ref([]);
const showAttachmentDialog = ref(false);
const zoomDialog = ref(false);
const zoomImg = ref("");

const id = route.query.id;

function openZoom(img) {
  zoomImg.value = img;
  zoomDialog.value = true;
}

onMounted(async () => {
  const id = route.query.id;
  if (!id) {
    $q.notify({ type: "negative", message: "Profile ID is required" });
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
</script>

<style scoped>
.q-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
</style>
