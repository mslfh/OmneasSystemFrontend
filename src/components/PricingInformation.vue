<template>
  <q-expansion-item
    popup
    icon="attach_money"
    label="Pricing Information"
    caption="Set price, discount, and selling price"
    class="q-mb-md"
  >
    <q-separator />
    <q-card flat bordered class="bg-grey-1">
      <q-card-section class="q-pa-md">
        <div class="row q-col-gutter-md q-row-gutter-md">
          <div class="col-12 col-md-3">
            <q-input
              v-model="localPricing.price"
              label="Price *"
              outlined
              dense
              type="text"
              step="0.01"
              prefix="$"
              :rules="[
                (val) =>
                  (!isNaN(Number(val)) && Number(val) >= 0) ||
                  'Price must be positive',
              ]"
              @blur="onAllPriceBlur"
              @input="handlePriceInput('price', $event)"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="localPricing.discount"
              label="Discount"
              outlined
              dense
              type="text"
              step="0.01"
              prefix="$"
              :rules="[
                (val) =>
                  (!isNaN(Number(val)) && Number(val) >= 0) ||
                  'Discount must be positive',
              ]"
              @blur="onAllPriceBlur"
              @input="handleDiscountInput('discount', $event)"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="localPricing.selling_price"
              label="Selling Price *"
              outlined
              dense
              type="text"
              step="0.01"
              prefix="$"
              :rules="[
                (val) =>
                  (!isNaN(Number(val)) && Number(val) >= 0) ||
                  'Selling price must be positive',
              ]"
              @blur="onAllPriceBlur"
              @input="handleSellingPriceInput('selling_price', $event)"
            />
          </div>
        </div>
        <!-- Tax Rate -->
        <div class="row q-col-gutter-md q-mt-sm">
          <div class="col-12 col-md-3">
            <q-select
              v-model="selectedProfile"
              :options="profileOptions"
              option-label="name"
              option-value="id"
              emit-value
              map-options
              label="Tax Profile"
              outlined
              dense
              clearable
              @update:model-value="onProfileChange"
              :loading="loadingProfiles"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                    <q-item-label caption v-if="scope.opt.id !== 'customize'">
                      Tax Rate: {{ getTaxRateFromSettings(scope.opt.settings) }}%
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="localPricing.tax_rate"
              label="Tax Rate (%)"
              outlined
              dense
              type="text"
              step="0.01"
              suffix="%"
              :readonly="selectedProfile !== 'customize'"
              :class="selectedProfile !== 'customize' ? 'bg-grey-2' : ''"
              :rules="[
                (val) =>
                  (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100) ||
                  'Tax rate must be between 0% and 100%',
              ]"
              @blur="onAllPriceBlur"
              @input="handleTaxRateInput('tax_rate', $event)"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-input
              :model-value="taxSales"
              label="Tax Sales"
              outlined
              dense
              type="text"
              prefix="$"
              readonly
              class="bg-grey-2"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-input
              :model-value="taxFee"
              label="Tax Fee"
              outlined
              dense
              type="text"
              prefix="$"
              readonly
              class="bg-grey-2"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-expansion-item>
</template>

<script setup>
import { ref, computed, watch, reactive, nextTick, onMounted } from 'vue'
import { api } from 'boot/axios'

// Define props
const props = defineProps({
  pricing: {
    type: Object,
    default: () => ({
      price: '0.00',
      discount: '0.00',
      selling_price: '0.00',
      tax_rate: '10.00',
      profile_id: null
    })
  }
})

// Define emits
const emit = defineEmits(['update:pricing'])

// Local reactive pricing data
const localPricing = reactive({
  price: props.pricing.price || '0.00',
  discount: props.pricing.discount || '0.00',
  selling_price: props.pricing.selling_price || '0.00',
  tax_rate: props.pricing.tax_rate || '10.00',
  profile_id: props.pricing.profile_id || null
})

// Profile related data
const profileOptions = ref([])
const selectedProfile = ref(props.pricing.profile_id || 'customize')
const loadingProfiles = ref(false)

// Flag to track if selling_price was manually edited
const sellingPriceManuallyEdited = ref(false)

// Watch for props changes and update local data
watch(
  () => props.pricing,
  (newPricing) => {
    if (newPricing) {
      Object.assign(localPricing, {
        price: newPricing.price || '0.00',
        discount: newPricing.discount || '0.00',
        selling_price: newPricing.selling_price || '0.00',
        tax_rate: newPricing.tax_rate || '10.00',
        profile_id: newPricing.profile_id || null
      })
      // 如果没有profile_id，默认选择customize
      selectedProfile.value = newPricing.profile_id || 'customize'
      // 初始化时也计算一次selling_price
      nextTick(() => {
        calculateSellingPrice()
      })
    }
  },
  { deep: true, immediate: true }
)

// Watch for local changes and emit updates
watch(
  localPricing,
  (newPricing) => {
    emit('update:pricing', { ...newPricing })
  },
  { deep: true }
)

// Watch for price and discount changes to auto-calculate selling price
watch(
  [() => localPricing.price, () => localPricing.discount],
  () => {
    console.log('Price or discount changed, recalculating...')
    calculateSellingPrice()
  },
  { flush: 'sync' }
)

// Computed values for tax calculations
const taxSales = computed(() => {
  return calculateTaxSales()
})

const taxFee = computed(() => {
  return calculateTaxFee()
})

// Price handling functions
function onAllPriceBlur() {
  ['price', 'discount', 'selling_price', 'tax_rate'].forEach((field) => {
    let val = localPricing[field]
    if (val === '' || val === null || val === undefined || isNaN(Number(val))) {
      if (field === 'tax_rate') {
        localPricing[field] = '10.00'
      } else {
        localPricing[field] = '0.00'
      }
    } else {
      localPricing[field] = Number(val).toFixed(2)
    }
  })
}

function onPriceInput(field, val) {
  let filtered = String(val).replace(/[^\d.]/g, '')
  filtered = filtered.replace(/(\..*)\./g, '$1')
  localPricing[field] = filtered
}

function handlePriceInput(field, val) {
  onPriceInput(field, val)
  // 对于price和discount，立即重新计算selling_price
  if (field === 'price' || field === 'discount') {
    nextTick(() => {
      calculateSellingPrice()
    })
  }
}

function handleDiscountInput(field, val) {
  onPriceInput(field, val)
  // 立即重新计算selling_price
  nextTick(() => {
    calculateSellingPrice()
  })
}

function handleSellingPriceInput(field, val) {
  onPriceInput(field, val)
  // 标记selling_price被手动编辑
  sellingPriceManuallyEdited.value = true
  // 清除标志，允许下次自动计算
  setTimeout(() => {
    sellingPriceManuallyEdited.value = false
  }, 1000)
}

function handleTaxRateInput(field, val) {
  onPriceInput(field, val)
}

function calculateSellingPrice() {
  const price = parseFloat(localPricing.price) || 0
  const discount = parseFloat(localPricing.discount) || 0

  console.log('Calculating selling price:', { price, discount })

  if (price >= 0 && discount >= 0) {
    const newSellingPrice = Math.max(0, price - discount).toFixed(2)
    console.log('New selling price:', newSellingPrice)
    localPricing.selling_price = newSellingPrice
  }
}

function calculateTaxSales() {
  const sellingPrice = parseFloat(localPricing.selling_price) || 0
  const taxRate = parseFloat(localPricing.tax_rate) || 0

  if (sellingPrice <= 0 || taxRate < 0) return '0.00'

  const taxSales = sellingPrice / (1 + (taxRate / 100))
  return (Math.floor(taxSales * 100) / 100).toFixed(2) // 向下取整保留两位小数并格式化为字符串
}

function calculateTaxFee() {
  const sellingPrice = parseFloat(localPricing.selling_price) || 0
  const taxRate = parseFloat(localPricing.tax_rate) || 0

  if (sellingPrice <= 0 || taxRate < 0) return '0.00'

  const taxSalesAmount = sellingPrice / (1 + (taxRate / 100))
  const taxFee = sellingPrice - (Math.floor(taxSalesAmount * 100) / 100)
  return Math.max(0, taxFee).toFixed(2)
}

// Profile related functions
async function fetchProfiles() {
  try {
    loadingProfiles.value = true
    const response = await api.get('/api/profiles/active')

    let profiles = []
    if (response.data && Array.isArray(response.data)) {
      profiles = response.data
    } else if (response.data.data && Array.isArray(response.data.data)) {
      profiles = response.data.data
    }

    // 添加 Customize 选项到选项列表开头
    profileOptions.value = [
      {
        id: 'customize',
        name: 'Customize',
        description: 'Manual tax rate configuration',
        settings: null
      },
      ...profiles
    ]
  } catch (error) {
    console.error('Error fetching profiles:', error)
    profileOptions.value = [
      {
        id: 'customize',
        name: 'Customize',
        description: 'Manual tax rate configuration',
        settings: null
      }
    ]
  } finally {
    loadingProfiles.value = false
  }
}

function getTaxRateFromSettings(settings) {
  if (!settings) return '0'
  try {
    const parsed = typeof settings === 'string' ? JSON.parse(settings) : settings
    return parsed.tax_rate || '0'
  } catch (error) {
    return '0'
  }
}

function onProfileChange(profileId) {
  selectedProfile.value = profileId

  if (profileId === 'customize') {
    // 选择Customize时，设置profile_id为null，允许手动编辑税率
    localPricing.profile_id = null
  } else if (profileId) {
    // 选择具体profile时，设置profile_id并从settings获取税率
    localPricing.profile_id = profileId

    const selectedProfileData = profileOptions.value.find(p => p.id === profileId)
    if (selectedProfileData && selectedProfileData.settings) {
      const taxRate = getTaxRateFromSettings(selectedProfileData.settings)
      if (taxRate) {
        localPricing.tax_rate = Number(taxRate).toFixed(2)
      }
    }
  } else {
    // 清空选择时，设置profile_id为null
    localPricing.profile_id = null
  }
}// Lifecycle hooks
onMounted(() => {
  fetchProfiles()
})
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
