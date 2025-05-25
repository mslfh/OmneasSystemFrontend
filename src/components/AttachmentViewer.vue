<template>
  <div>
    <q-btn
      v-if="attachments.length > 0"
      size="10px"
      icon="attach_file"
      color="primary"
      label="View Attachments"
      dense
      flat
      @click="showAttachmentDialog = true"
    />
    <q-dialog v-if="attachments.length > 0" v-model="showAttachmentDialog">
      <q-card>
        <q-card-section>
          <q-carousel
            v-model="carouselIndex"
            :slides="attachments"
            animated
            infinite
            swipeable
            control-color="blue"
            arrows
            navigation
          >
            <q-carousel-slide
              v-for="(img, idx) in attachments"
              :key="idx"
              :name="img"
              class="column flex-center"
            >
              <q-img
                :src="img"
                style="width: 350px; border-radius: 8px; border: 1px solid #eee; cursor: zoom-in;"
                @click="openZoom(img)"
              />
            </q-carousel-slide>
          </q-carousel>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-if="attachments.length > 0" v-model="zoomDialog">
      <q-card style="background: transparent; box-shadow: none; max-width: 95vw; max-height: 95vh;">
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
              style="background: #fff; border-radius: 8px; border: 1px solid #eee; cursor: zoom-out; display: block;"
              @click="zoomDialog = false"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <div v-if="attachments.length === 0" class="text-grey">No medical files uploaded.</div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
const props = defineProps({
  attachments: { type: Array, required: true }
});
const showAttachmentDialog = ref(false);
const carouselIndex = ref(props.attachments.length > 0 ? props.attachments[0] : null);
const zoomDialog = ref(false);
const zoomImg = ref("");

watch(() => props.attachments, (val) => {
  carouselIndex.value = val.length > 0 ? val[0] : null;
});

function openZoom(img) {
  zoomImg.value = img;
  zoomDialog.value = true;
}
</script>
