<template>
  <div class="relative-position">
    <div class="q-pb-xs text-grey text-italic info-tip">
      <div v-if="!props.readonly">
        <q-icon name="info" /> Please click to add your pain point (double-click
        to zoom in).
      </div>
      <div v-else>
        <q-icon name="info" />
        Hover over or click on a point to see the note.
      </div>
    </div>
    <q-icon
      v-if="zoomed"
      name="zoom_in_map"
      clickable
      @click="resetZoom"
      class="zoom-icon"
    />
    <div
      class="bg-grey-1 marker-container"
      ref="container"
      :style="{
        border: '1px solid #ccc',
        width: containerWidth + 'px',
        height: containerHeight + 'px',
      }"
    ></div>
    <div
      v-if="noteTooltip.show && props.readonly"
      :style="{
        position: 'absolute',
        left: noteTooltip.x + 'px',
        top: noteTooltip.y + 'px',
        background: '#fff',
        color: '#333',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '4px 8px',
        fontSize: '12px',
        zIndex: 200,
        pointerEvents: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }"
    >
      {{ noteTooltip.text }}
    </div>

    <div
      v-if="selectedPoint !== null"
      :style="{
        width: containerWidth + 'px',
      }"
      class="q-pa-xs"
    >
      <div class="q-pb-xs q-pt-xs text-grey info-tip">
        <q-icon name="info" />
        Drag to move the pain point.
      </div>
      <span class="text-grey-6 text-bold info-tip"> * Pain Level </span>
      <div class="text-grey info-tip">
        <q-radio
          v-for="(level, index) in levels"
          :key="index"
          size="33px"
          keep-color
          v-model="painPoints[selectedPoint].level"
          :val="level.value"
          :label="level.label"
          :color="level.color"
          @update:model-value="drawPoints()"
        />
      </div>
      <span class="text-grey-6 text-bold info-tip"> * Pain Scope</span>
      <q-slider
        v-model="painPoints[selectedPoint].size"
        :min="5"
        :max="25"
        label="Point Size"
        dense
        @update:model-value="drawPoints()"
      />
      <q-input
        v-model="painPoints[selectedPoint].note"
        label="Note"
        input-class="text-grey-8 text-caption q-ma-xs"
        stack-label
        dense
        @update:model-value="drawPoints()"
      />
      <q-btn
        size="sm"
        dense
        outline
        color="red-5"
        @click="deletePoint"
        label="remove"
        class="q-mt-sm float-right"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import Konva from "konva";
import { QBtn, QSelect, QInput, QSlider } from "quasar";

const props = defineProps({
  painPoints: {
    type: Array,
    default: () => [],
  },
  readonly: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["update:painPoints"]);

const container = ref(null);
let stage, layer, backgroundImage, pointsLayer;

const bodyFrontSrc = new URL("../assets/body.png", import.meta.url).href;

const painPoints = ref(props.painPoints ? [...props.painPoints] : []);
const selectedPoint = ref(null);
const scaleRatio = ref(1);
const zoomed = ref(false);

const containerWidth = 320;
const containerHeight = 320;

const noteTooltip = ref({ show: false, text: "", x: 0, y: 0 });

watch(
  () => props.painPoints,
  (val) => {
    if (val && JSON.stringify(val) !== JSON.stringify(painPoints.value)) {
      painPoints.value = [...val];
      drawPoints();
    }
  },
  { deep: true }
);

watch(
  painPoints,
  (val) => {
    emit("update:painPoints", val);
  },
  { deep: true }
);

// yellow → orange → orange-red → red → dark red
const colors = ref([
  "#ffff00", // yellow
  "#ffa726", // orange-red
  "#f44538", // red
  "#b71c1c", // dark red
]);

const levels = [
  { label: "Mild", value: 1, color: "yellow-7" },
  { label: "Moderate", value: 2, color: "orange-5" },
  { label: "Severe", value: 3, color: "red" },
  { label: "Extreme", value: 4, color: "red-10" },
];

let imageCanvas = document.createElement("canvas");
let imageCtx = imageCanvas.getContext("2d");

function updateImageData(image) {
  imageCanvas.width = image.width;
  imageCanvas.height = image.height;
  imageCtx.drawImage(image, 0, 0);
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => resolve(img);
  });
}

function getColorByLevel(level) {
  return colors.value[level - 1] || "#000";
}

function drawPoints() {
  pointsLayer.destroyChildren();
  painPoints.value.forEach((pt, idx) => {
    const isSelected = selectedPoint.value === idx;
    const circle = new Konva.Circle({
      x: pt.x * scaleRatio.value,
      y: pt.y * scaleRatio.value,
      radius: (pt.size || 5) * scaleRatio.value,
      fill: getColorByLevel(pt.level),
      stroke: isSelected ? "blue" : "white",
      strokeWidth: 2,
      draggable: !props.readonly,
      id: `point-${idx}`,
    });
    if (!props.readonly) {
      circle.on("dragmove", (e) => {
        pt.x = Number((e.target.x() / scaleRatio.value).toFixed(2));
        pt.y = Number((e.target.y() / scaleRatio.value).toFixed(2));
      });
      circle.on("click tap", () => {
        selectedPoint.value = idx;
        drawPoints();
      });
    } else {
      // readonly: show note on hover or click if note exists
      if (pt.note && pt.note.trim()) {
        circle.on("mouseenter", (e) => {
          noteTooltip.value = {
            show: true,
            text: pt.note,
            x: e.evt ? e.evt.offsetX + 10 : pt.x * scaleRatio.value + 10,
            y: e.evt ? e.evt.offsetY - 10 : pt.y * scaleRatio.value - 10,
          };
        });
        circle.on("mouseleave", () => {
          noteTooltip.value.show = false;
        });
        circle.on("click tap", (e) => {
          noteTooltip.value = {
            show: true,
            text: pt.note,
            x: e.evt ? e.evt.offsetX + 10 : pt.x * scaleRatio.value + 10,
            y: e.evt ? e.evt.offsetY - 10 : pt.y * scaleRatio.value - 10,
          };
          setTimeout(() => {
            noteTooltip.value.show = false;
          }, 2000);
        });
      }
    }
    pointsLayer.add(circle);
  });
  pointsLayer.draw();
}

function addPoint(pos) {
  if (props.readonly) return;
  // Keep x and y to 2 decimal places
  painPoints.value.push({
    x: Number(pos.x.toFixed(2)),
    y: Number(pos.y.toFixed(2)),
    level: 2,
    note: "",
    size: 10,
  });
  emit("update:painPoints", painPoints.value);
  drawPoints();
}

function deselectPoint() {
  selectedPoint.value = null;
  drawPoints();
}

function deletePoint() {
  if (props.readonly) return;
  if (selectedPoint.value !== null) {
    painPoints.value.splice(selectedPoint.value, 1);
    selectedPoint.value = null;
    emit("update:painPoints", painPoints.value);
    drawPoints();
  }
}

function resetZoom() {
  const img = backgroundImage.image();
  const ratioX = containerWidth / img.width;
  const ratioY = containerHeight / img.height;
  scaleRatio.value = Math.min(ratioX, ratioY);
  backgroundImage.width(img.width * scaleRatio.value);
  backgroundImage.height(img.height * scaleRatio.value);
  stage.position({ x: 0, y: 0 });
  layer.draw();
  drawPoints();
  zoomed.value = false;
}

onMounted(async () => {
  stage = new Konva.Stage({
    container: container.value,
    width: containerWidth,
    height: containerHeight,
  });

  layer = new Konva.Layer();
  stage.add(layer);

  const img = await loadImage(bodyFrontSrc);

  const ratioX = containerWidth / img.width;
  const ratioY = containerHeight / img.height;
  scaleRatio.value = Math.min(ratioX, ratioY);

  backgroundImage = new Konva.Image({
    x: 0,
    y: 0,
    image: img,
    width: img.width * scaleRatio.value,
    height: img.height * scaleRatio.value,
  });

  updateImageData(img);

  layer.add(backgroundImage);

  pointsLayer = new Konva.Layer();
  stage.add(pointsLayer);

  layer.draw();

  let justZoomed = false;
  let lastAddTime = 0;
  const ADD_POINT_COOLDOWN = 300;
  let justAddedPoint = false;
  let isPinching = false;

  if (!props.readonly) {
    stage.on("click tap", (e) => {
      if (justZoomed) {
        justZoomed = false;
        selectedPoint.value = null;
        drawPoints();
        return;
      }
      if (isPinching) {
        selectedPoint.value = null;
        drawPoints();
        return;
      }
      const now = Date.now();
      if (now - lastAddTime < ADD_POINT_COOLDOWN) {
        selectedPoint.value = null;
        drawPoints();
        return;
      }
      if (e.target === backgroundImage) {
        const pointerPos = stage.getPointerPosition();
        const stagePos = stage.position();
        const x = (pointerPos.x - stagePos.x) / scaleRatio.value;
        const y = (pointerPos.y - stagePos.y) / scaleRatio.value;
        const pixel = imageCtx.getImageData(x, y, 1, 1).data;
        const alpha = pixel[3];
        if (alpha > 0) {
          addPoint({ x, y });
          lastAddTime = now;
          justAddedPoint = true;
          setTimeout(() => {
            justAddedPoint = false;
          }, ADD_POINT_COOLDOWN);
          selectedPoint.value = null;
          drawPoints();
        } else {
          selectedPoint.value = null;
          drawPoints();
        }
      } else if (
        !e.target.getClassName ||
        e.target.getClassName() !== "Circle"
      ) {
        selectedPoint.value = null;
        drawPoints();
      }
    });

    const isMobile =
      /mobile|android|iphone|ipad|phone|touch/i.test(navigator.userAgent) ||
      (navigator.userAgent.includes("Macintosh") && "ontouchend" in document);

    if (!isMobile) {
      stage.on("dblclick", (e) => {
        if (justAddedPoint) {
          return;
        }
        if (e.evt) {
          e.evt.preventDefault();
          e.evt.stopPropagation();
        }
        if (e.target === backgroundImage) {
          justZoomed = true;
          setTimeout(() => {
            justZoomed = false;
          }, 100);
          if (!zoomed.value) {
            const pointerPos = stage.getPointerPosition();
            const scale = 2;
            const baseScale = Math.min(
              containerWidth / backgroundImage.image().width,
              containerHeight / backgroundImage.image().height
            );
            scaleRatio.value = baseScale * scale;
            backgroundImage.width(
              backgroundImage.image().width * scaleRatio.value
            );
            backgroundImage.height(
              backgroundImage.image().height * scaleRatio.value
            );
            stage.position({
              x: containerWidth / 2 - pointerPos.x * scale,
              y: containerHeight / 2 - pointerPos.y * scale,
            });
            layer.draw();
            drawPoints();
            zoomed.value = true;
          } else {
            resetZoom();
          }
          selectedPoint.value = null;
          drawPoints();
        }
      });
    }

    if (isMobile) {
      let lastDist = null;
      let lastCenter = null;
      let lastStagePos = null;
      let lastScale = null;
      stage.getContent().addEventListener("touchstart", function (evt) {
        if (evt.touches.length === 2) {
          isPinching = true;
          lastDist = Math.hypot(
            evt.touches[0].clientX - evt.touches[1].clientX,
            evt.touches[0].clientY - evt.touches[1].clientY
          );
          const stageBox = stage.container().getBoundingClientRect();
          lastCenter = {
            x:
              (evt.touches[0].clientX + evt.touches[1].clientX) / 2 -
              stageBox.left,
            y:
              (evt.touches[0].clientY + evt.touches[1].clientY) / 2 -
              stageBox.top,
          };
          lastStagePos = { ...stage.position() };
          lastScale = scaleRatio.value;
        }
      });
      stage.getContent().addEventListener(
        "touchmove",
        function (evt) {
          if (
            evt.touches.length === 2 &&
            lastDist &&
            lastCenter &&
            lastStagePos &&
            lastScale
          ) {
            evt.preventDefault();
            const newDist = Math.hypot(
              evt.touches[0].clientX - evt.touches[1].clientX,
              evt.touches[0].clientY - evt.touches[1].clientY
            );
            const stageBox = stage.container().getBoundingClientRect();
            const newCenter = {
              x:
                (evt.touches[0].clientX + evt.touches[1].clientX) / 2 -
                stageBox.left,
              y:
                (evt.touches[0].clientY + evt.touches[1].clientY) / 2 -
                stageBox.top,
            };
            const scaleChange = newDist / lastDist;
            let newScale = lastScale * scaleChange;
            newScale = Math.max(0.5, Math.min(3, newScale));
            scaleRatio.value = newScale;
            backgroundImage.width(
              backgroundImage.image().width * scaleRatio.value
            );
            backgroundImage.height(
              backgroundImage.image().height * scaleRatio.value
            );
            const dx = newCenter.x - lastCenter.x;
            const dy = newCenter.y - lastCenter.y;
            const scaleOffsetX =
              (lastCenter.x - lastStagePos.x) * (newScale / lastScale - 1);
            const scaleOffsetY =
              (lastCenter.y - lastStagePos.y) * (newScale / lastScale - 1);
            stage.position({
              x: lastStagePos.x + dx - scaleOffsetX,
              y: lastStagePos.y + dy - scaleOffsetY,
            });
            layer.draw();
            drawPoints();
          }
        },
        { passive: false }
      );
      stage.getContent().addEventListener("touchend", function (evt) {
        if (evt.touches.length < 2) {
          isPinching = false;
          lastDist = null;
          lastCenter = null;
          lastStagePos = null;
          lastScale = null;
        }
      });
    }
  }
});
</script>

<style scoped>
.marker-container {
  position: relative;
  overflow: visible;
}
.zoom-icon {
  position: absolute;
  left: 2px;
  top: 22px;
  z-index: 100;
  background: white;
  color: grey;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
  padding: 4px;
  cursor: pointer;
}
.info-tip {
  font-size: 10px;
}
</style>
