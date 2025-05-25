<template>
<q-card class="bg-grey-1 no-shadow" bordered>
  <q-card-section class="text-center text-h6 text-black">
    <q-icon name="shopping_cart" class="q-mr-sm" />
    Summary
  </q-card-section>
  <q-card-section horizontal>
    <q-card-section class="col-4 flex flex-center">
      <q-img
        height="80px"
        class="rounded-borders"
        src="../assets/miamassage.png"
      />
    </q-card-section>
    <q-card-section>
      <div class="text-subtitle1 text-weight-bold">
        Mia's Massage Launceston
      </div>
      <q-label class="text-weight-bold text-orange-10">4.9</q-label>
      <q-rating :value="ratingModel" color="orange-6" readonly />
      <div class="text-subtitle2 text-grey-9 q-mt-xs">
        Shop 2, 198-216 Charles Street, Launceston
      </div>
      <div class="text-weight-bold  text-caption text-grey-9 q-mt-xs">+61 466 605 855</div>
    </q-card-section>
  </q-card-section>
  <q-separator v-if="selectedService.id" />
  <q-card-section v-if="selectedService.id" horizontal >
    <q-card-section class="col-9">
      <div class="text-subtitle1">
        <q-icon q-pt-xs name="check_circle" color="teal-7" />
        {{ selectedService.title }} | {{ selectedService.duration }} min
        <q-icon
          color="teal-7"
          name="border_color"
          @click="$emit('editService')"
        />
      </div>
      <div class="text-subtitle2 text-weight-regular text-grey-7">
        {{ selectedService.description }}
      </div>
    </q-card-section>
    <q-card-section class="col-1">
      <div class="text-subtitle2 q-mb-xs q-pt-xs">
        ${{ selectedService.price }}
      </div>
    </q-card-section>
  </q-card-section>
  <q-separator />
  <q-card-section v-if="selectedStaff.id || availableStaff.length">
    <q-lable class="text-subtitle1">
      <q-icon name="check_circle" color="teal-7" /> Date
    </q-lable>
    <q-chip
      outline
      color="teal"
      text-color="white"
      icon="alarm"
      :label="showTime(time) ? showTime(time) + ', ' + showDate() : showDate()"
      clickable
      @click="$emit('editDate')"
    >
    </q-chip>
  </q-card-section>
  <q-separator v-if="selectedStaff.id" />
  <q-card-section v-if="selectedStaff.id || availableStaff.length" horizontal>
    <q-card-section>
      <q-lable class="text-subtitle1">
        <q-icon name="check_circle" color="teal-7" /> Therapist
      </q-lable>
      <q-chip color="teal-1" clickable @click="$emit('editTherapist')">
        <!-- <q-avatar v-if="selectedStaff.id" size="30px">
          <img :src="selectedStaff.profile_photo_url" />
        </q-avatar> -->
        {{ selectedStaff.id ? selectedStaff.name : "Any therapist" }}
      </q-chip>
    </q-card-section>
  </q-card-section>
  <q-separator />
  <q-card-section class="row">
    <div class="col-12 text-h6 full-width">
      <div class="float-right q-mr-md">
        Total :
        <span class="text-teal">${{ selectedService.price ?? 0 }}</span>
      </div>
    </div>
  </q-card-section>
    </q-card>
</template>

<script setup>
defineProps({
  ratingModel: Number,
  selectedService: Object,
  selectedStaff: Object,
  time: String,
  showTime: Function,
  showDate: Function,
  availableStaff: Array,
});
</script>
