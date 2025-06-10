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
                style="
                  width: 350px;
                  border-radius: 8px;
                  border: 1px solid #eee;
                  cursor: zoom-in;
                "
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
      <q-card
        style="
          background: transparent;
          box-shadow: none;
          max-width: 95vw;
          max-height: 95vh;
        "
      >
        <q-card-section class="flex flex-center" style="padding: 0; position: relative;">
          <q-btn
            v-if="attachments.length > 1"
            icon="chevron_left"
            flat
            round
            size="md"
            style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); z-index: 2;"
            @click.stop="prevZoomImg"
          />
          <div
            style="
              overflow: auto;
              max-width: 90vw;
              max-height: 90vh;
              display: flex;
              align-items: flex-start;
              justify-content: center;
              width: 100%;
              height: 100%;
              background: transparent;
            "
          >
            <img
              v-if="zoomImg"
              :src="zoomImg"
              style="
                background: #fff;
                border-radius: 8px;
                border: 1px solid #eee;
                cursor: zoom-out;
                display: block;
                max-width: 100%;
                width: auto;
                height: auto;
                object-fit: contain;
                margin: auto;
              "
              @click="zoomDialog = false"
            />
          </div>
          <q-btn
            v-if="attachments.length > 1"
            icon="chevron_right"
            flat
            round
            size="md"
            style="position: absolute; right: 0; top: 50%; transform: translateY(-50%); z-index: 2;"
            @click.stop="nextZoomImg"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
    <div v-if="attachments.length === 0" class="text-grey">
      No medical files uploaded.
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
const props = defineProps({
  attachments: { type: Array, required: true },
});
const showAttachmentDialog = ref(false);
const carouselIndex = ref(
  props.attachments.length > 0 ? props.attachments[0] : null
);
const zoomDialog = ref(false);
const zoomImg = ref("");
const zoomIndex = ref(0); // 新增：追踪当前zoom图片索引

watch(
  () => props.attachments,
  (val) => {
    carouselIndex.value = val.length > 0 ? val[0] : null;
  }
);

function openZoom(img) {
  zoomIndex.value = props.attachments.findIndex((a) => a === img); // 新增
  zoomImg.value = img;
  zoomDialog.value = true;
}

function nextZoomImg() {
  if (props.attachments.length === 0) return;
  zoomIndex.value = (zoomIndex.value + 1) % props.attachments.length;
  zoomImg.value = props.attachments[zoomIndex.value];
}

function prevZoomImg() {
  if (props.attachments.length === 0) return;
  zoomIndex.value = (zoomIndex.value - 1 + props.attachments.length) % props.attachments.length;
  zoomImg.value = props.attachments[zoomIndex.value];
}

// 支持键盘左右键切换
function handleKeydown(e) {
  if (!zoomDialog.value) return;
  if (e.key === 'ArrowRight') nextZoomImg();
  if (e.key === 'ArrowLeft') prevZoomImg();
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>
