<template>
  <q-card class="no-shadow" bordered >
    <q-img :src="data.img" height="200px">
      <q-chip
        v-if="data.chip"
        :class="data.chip_class"
        :color="data.chip_color"
        :label="data.chip"
      ></q-chip>
    </q-img>

    <q-card-section>
      <q-avatar
        size="30px"
        color="teal"
        class="absolute"
        style="top: 0; right: 12px; transform: translateY(-50%)"
      >
        J
      </q-avatar>
    </q-card-section>

    <q-card-section>
      <div class="text-h6">
        {{ data.title }}
      </div>
      <div class="text-subtitle1 text-justify q-mt-sm">
        {{ data.caption }}
      </div>
      <div>
        <q-rating
          v-model="data.rating"
          max="5"
          size="1.5em"
          color="yellow"
          icon="star_border"
          icon-selected="star"
          icon-half="star_half"
          readonly
          no-dimming
        />
      </div>
    </q-card-section>
    <q-card-section>
      <div class="col-12">
        <span class="text-h6">{{ data.amount }}</span>
        <span class="text-h6 float-right">
          <q-chip clickable color="primary" text-color="white" icon="event" @click="navigateToBook">
            Book
          </q-chip>
        </span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { defineStore } from "pinia";
import { toRefs } from "vue";
import { useRouter } from "vue-router";
import { useProductStore } from "../../stores/ProductStore";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const { data } = toRefs(props);
const router = useRouter();
const productStore = useProductStore();

const navigateToBook = () => {
  const product = data.value;
  productStore.setSelectedProduct(product);
  router.push({
    path: "/book",
  });
};
</script>

<style scoped></style>
