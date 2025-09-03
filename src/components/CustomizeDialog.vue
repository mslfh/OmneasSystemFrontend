<template>
  <q-dialog :model-value="modelValue" @update:model-value="onDialogUpdate">
    <q-card :style="$q.screen.lt.sm ? {minWidth: '330px', maxWidth: '600px' } : { minWidth: '400px', maxWidth: '600px' }">
      <q-card-section class="bg-deep-orange text-white">
        <div class="text-h6">Customize {{ item?.title }}</div>
      </q-card-section>

      <q-card-section class="q-py-md" v-if="item">
        <div class="q-gutter-md">
          <div v-if="Object.keys(grouped.customizable || {}).length > 0" class="ingredient-group">
            <div class="group-header">
              <q-icon name="tune" color="deep-orange" class="q-mr-sm" />
              <span class="group-title text-deep-orange">Customizable Ingredients</span>
            </div>

            <div v-for="(ingredients, type) in grouped.customizable" :key="`customizable-${type}`" class="type-section">
              <div class="type-header">{{ type }}</div>

              <div v-for="ingredient in ingredients" :key="ingredient.id" class="q-mb-md q-pa-sm" style="background: white; border-radius: 6px;">
                <div class="row items-center justify-between q-mb-sm">
                  <div class="text-weight-medium">
                    {{ ingredient.name }}
                  </div>

                  <div class="row items-center q-gutter-sm">
                    <div v-if="ingredient.mode === 'variable' || ingredient.mode === 'replaceable_variable'" class="row items-center q-gutter-xs">
                      <q-btn round dense size="8px" icon="remove" color="grey-6" @click="decrease(ingredient)" />
                      <span class="text-weight-medium text-caption">{{ ingredient.currentQuantity }}</span>
                      <q-btn round dense size="8px" icon="add" color="deep-orange-6" @click="increase(ingredient)" />
                    </div>

                    <q-btn dense flat color="deep-orange" label="Change" v-if="ingredient.replacementOptions && ingredient.replacementOptions.length" @click="openReplacement(ingredient)" />
                  </div>
                </div>

                <div v-if="ingredient.mode === 'variable' || ingredient.mode === 'replaceable_variable'" class="text-caption text-grey-6 q-mb-sm">
                  {{ getQuantityPriceInfo ? getQuantityPriceInfo(ingredient) : 'Standard portion' }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="Object.keys(grouped.fixed || {}).length > 0" class="ingredient-group">
            <div class="group-header">
              <q-icon name="flatware" color="deep-orange-6" class="q-mr-sm" />
              <span class="group-title text-deep-orange-6">Standard Ingredients</span>
            </div>

            <div class="info-notice">
              <div class="row items-center">
                <span class="text-caption text-grey-7"><q-icon name="info" color="grey-6" size="xs" /> <strong> Note:</strong>Please add special requests when checkout if you'd like to change these.</span>
              </div>
            </div>

            <div v-for="(ingredients, type) in grouped.fixed" :key="`fixed-${type}`" class="type-section">
              <div class="type-header">{{ type }}</div>
              <div v-for="ingredient in ingredients" :key="ingredient.id" class="q-mb-md q-pa-sm" style="background: white; border-radius: 6px;">
                <div class="row items-center justify-between">
                  <div class="text-weight-medium text-grey-6">{{ ingredient.name }}</div>
                  <div class="text-caption text-grey-5">Standard • Qty: {{ ingredient.currentQuantity }}</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Close" color="grey" @click="close" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, toRef } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  item: { type: Object, default: () => ({}) },
  groupedIngredients: { type: Object, default: null },
  getQuantityPriceInfo: { type: Function, default: null }
})

const emit = defineEmits(['update:modelValue', 'open-replacement', 'increase-quantity', 'decrease-quantity', 'close', 'update-product'])

const $q = useQuasar()

const modelValue = toRef(props, 'modelValue')

function onDialogUpdate (val) {
  emit('update:modelValue', val)
}

const grouped = computed(() => {
  if (props.groupedIngredients) return props.groupedIngredients
  const groups = { customizable: {}, fixed: {} }
  const ingredients = props.item?.ingredients || []
  const byType = (arr) => {
    const r = {}
    arr.forEach(i => {
      const t = i.type || 'Other'
      ;(r[t] = r[t] || []).push(i)
    })
    return r
  }
  const customizable = ingredients.filter(i => i.mode !== 'fixed')
  const fixed = ingredients.filter(i => i.mode === 'fixed')
  groups.customizable = byType(customizable)
  groups.fixed = byType(fixed)
  return groups
})

function close () {
  emit('update:modelValue', false)
  emit('close')
}

function openReplacement (ingredient) {
  emit('open-replacement', ingredient)
}

function applyCustomization() {
  emit('update-product', { ...item });
  close();
}

function increase(ingredient) {
  ingredient.currentQuantity++;
  emit('update-product', { ...item });
}

function decrease(ingredient) {
  if (ingredient.currentQuantity > 0) {
    ingredient.currentQuantity--;
    emit('update-product', { ...item });
  }
}
</script>

<style scoped>
.ingredient-group { margin-bottom: 8px }
.group-header { display:flex; align-items:center; margin-bottom:8px }
.group-title { font-weight:600 }
.type-section { margin-bottom:12px }
.type-header { font-weight:600; margin-bottom:6px }
.info-notice { background:#fff7ed; padding:8px; border-radius:6px; margin-bottom:12px }
</style>
