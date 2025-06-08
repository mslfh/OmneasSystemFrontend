<template>
  <q-page>
    <ConfidentialClientCard
      :profileId="profile_id"
      :editable="true"
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
import { onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { useRoute } from "vue-router";
import ConfidentialClientCard from "components/ConfidentialClientCard.vue";

const $q = useQuasar();
const route = useRoute();
const profile_id = route.query.id;

const showAttachmentDialog = ref(false);
const zoomDialog = ref(false);
const zoomImg = ref("");

function openZoom(img) {
  zoomImg.value = img;
  zoomDialog.value = true;
}


</script>

<style scoped>
.q-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
</style>
