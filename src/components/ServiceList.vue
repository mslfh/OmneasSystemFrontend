<template>
  <div>
    <q-card
      flat
      bordered
      class="q-mb-md"
      v-for="pkg in packages"
      :key="pkg.id"
    >
      <q-card-section class="q-pa-sm" @click="toggleExpanded(pkg.id)">
        <div class="text-subtitle1 text-weight-bold q-mt-sm q-mb-xs text-blue-9">
          {{ pkg.title }}
        </div>
        <div class="text-caption text-grey">{{ pkg.hint }}</div>
      </q-card-section>
      <q-card-actions align="right" class="q-pa-none">
        <q-btn
          color="grey"
          round
          flat
          dense
          :icon="expandedStates[pkg.id] ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          @click="toggleExpanded(pkg.id)"
        />
      </q-card-actions>
      <q-slide-transition>
        <div v-show="expandedStates[pkg.id]">
          <q-list bordered>
            <q-expansion-item
              v-for="service in pkg.services"
              :key="service.id"
              :label="`* ${service.title} | ${service.duration} Minutes`"
              expand-icon="add"
              expanded-icon="keyboard_arrow_up"
              header-class="text-primary text-subtitle1 text-weight-medium"
            >
              <q-card>
                <q-card-section class="q-pt-none q-pb-none">
                  <div class="text-subtitle2 text-weight-regular text-grey-7">
                    {{ service.description }}
                  </div>
                  <div align="right">
                    <q-span class="text-subtitle1 text-weight-bold text-grey-8">
                      ${{ service.price }}
                    </q-span>
                  </div>
                </q-card-section>
                <q-card-actions align="right" class="q-pa-none">
                  <q-btn
                    color="primary"
                    flat
                    dense
                    icon="arrow_forward"
                    label="Book Now"
                    @click="$emit('selectService', service)"
                  />
                </q-card-actions>
              </q-card>
            </q-expansion-item>
          </q-list>
        </div>
      </q-slide-transition>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  packages: Array,
});

const expandedStates = ref({});

const toggleExpanded = (pkgId) => {
  expandedStates.value[pkgId] = !expandedStates.value[pkgId];
};
</script>

<style scoped></style>
