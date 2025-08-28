<template>
  <q-page padding class="bg-grey-1">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <!-- 页面标题 -->
        <div class="text-h4 text-weight-bold text-grey-8 q-mb-lg text-center">
          Checkout & Payment
        </div>

        <!-- 订单摘要卡片 -->
        <q-card class="q-mb-lg shadow-2 rounded-borders-lg">
          <q-card-section class="q-pa-md bg-deep-orange text-white">
            <div class="row items-center justify-between">
              <div class="text-h6">Order Summary</div>
              <div class="text-h6">${{ totalAmount.toFixed(2) }}</div>
            </div>
          </q-card-section>

          <q-card-section class="q-pa-md">
            <!-- 就餐方式 -->
            <div class="row items-center q-mb-md">
              <q-icon
                :name="diningType === 'takeaway' ? 'shopping_bag' : 'restaurant'"
                color="deep-orange"
                size="sm"
                class="q-mr-sm"
              />
              <span class="text-weight-medium">
                {{ diningType === 'takeaway' ? 'Take Away' : 'Dine In' }}
              </span>
            </div>

            <!-- 订单项目简要 -->
            <div class="text-caption text-grey-6">
              {{ orderItems.length }} item(s) • Estimated {{ diningType === 'takeaway' ? 'pickup' : 'ready' }}: {{ estimatedTime }}
            </div>
          </q-card-section>
        </q-card>

        <!-- 客户信息卡片 -->
        <q-card class="q-mb-lg shadow-2 rounded-borders-lg">
          <q-card-section class="q-pa-md bg-deep-orange text-white">
            <div class="text-h6">Contact Information</div>
          </q-card-section>

          <q-card-section class="q-pa-md">
            <div class="row q-gutter-md">
              <div class="col-12">
                <q-input
                  v-model="customerInfo.name"
                  label="Full Name *"
                  outlined
                  dense
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="customerInfo.notes"
                  label="Any Comments"
                  outlined
                  dense
                  type="textarea"
                  rows="3"
                  hint="Please leave any comments or special requests here"
                />

                <!-- Preset Comment Chips -->
                <div class="q-mt-md">
                  <div class="text-caption text-grey-6 q-mb-sm">Quick Options:</div>
                  <div class="row q-gutter-xs">
                    <q-chip
                      v-for="chip in commentChips"
                      :key="chip"
                      :selected="selectedChips.includes(chip)"
                      clickable
                      color="deep-orange"
                      text-color="white"
                      size="sm"
                      @click="toggleChip(chip)"
                      :outline="!selectedChips.includes(chip)"
                    >
                      {{ chip }}
                    </q-chip>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 订单项列表 -->
        <div class="q-gutter-md">
          <q-card
            v-for="(orderItem, index) in orderItems"
            :key="index"
            flat
            bordered
            class="rounded-borders-lg shadow-2"
          >
            <q-card-section class="q-pa-md">
              <!-- 餐品基本信息 -->
              <div class="row items-start q-gutter-md">
                <!-- 餐品图片 -->
                <div class="col-auto">
                  <q-img
                    :src="orderItem.image"
                    style="width: 80px; height: 80px"
                    class="rounded-borders"
                    fit="cover"
                  >
                    <template v-slot:error>
                      <div class="absolute-full flex flex-center bg-grey-3">
                        <q-icon name="restaurant" size="sm" color="grey-6" />
                      </div>
                    </template>
                  </q-img>
                </div>

                <!-- 餐品详情 -->
                <div class="col">
                  <div class="text-h6 text-weight-medium q-mb-xs">
                    {{ orderItem.title }}
                  </div>
                  <div class="text-body2 text-grey-6 q-mb-sm">
                    {{ orderItem.description }}
                  </div>
                  <div class="row items-center q-gutter-sm">
                    <q-chip
                      color="green"
                      text-color="white"
                      size="sm"
                      dense
                    >
                      ${{ orderItem.currentPrice.toFixed(2) }}
                    </q-chip>
                    <q-chip
                      v-if="orderItem.originalPrice !== orderItem.currentPrice"
                      color="grey-4"
                      text-color="grey-8"
                      size="sm"
                      dense
                    >
                      Original: ${{ orderItem.originalPrice.toFixed(2) }}
                    </q-chip>
                    <q-chip
                      v-if="orderItem.customizable"
                      color="blue"
                      text-color="white"
                      size="sm"
                      dense
                      icon="tune"
                    >
                      Customizable
                    </q-chip>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="col-auto">
                  <div class="column q-gutter-xs">
                    <q-btn
                      flat
                      dense
                      color="primary"
                      icon="tune"
                      label="Custom"
                      size="sm"
                      @click="openCustomization(index)"
                      :disable="!orderItem.customizable"
                    />
                    <q-btn
                      flat
                      dense
                      color="negative"
                      icon="delete"
                      label="Remove"
                      size="sm"
                      @click="removeItem(index)"
                    />
                  </div>
                </div>
              </div>

              <!-- 当前定制信息 -->
              <div
                v-if="orderItem.customizations.length > 0"
                class="q-mt-md q-pt-md border-top"
              >
                <div class="text-subtitle2 text-grey-7 q-mb-xs">
                  Current Customizations:
                </div>
                <div class="row q-gutter-xs">
                  <q-chip
                    v-for="custom in orderItem.customizations"
                    :key="custom.id"
                    color="blue-1"
                    text-color="blue-8"
                    size="sm"
                    dense
                  >
                    {{ formatCustomization(custom) }}
                  </q-chip>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- 底部操作按钮 -->
        <div class="row justify-center q-mt-xl q-gutter-md">
          <q-btn
            color="grey-6"
            outline
            size="lg"
            label="Continue Shopping"
            icon="shopping_cart"
            class="q-px-xl"
            @click="continueShopping"
          />
          <q-btn
            color="primary"
            size="lg"
            label="Place Order"
            icon="check_circle"
            class="q-px-xl"
            :loading="processing"
            @click="placeOrder"
          />
        </div>
      </div>
    </div>

    <!-- 定制弹窗 -->
    <q-dialog v-model="showCustomDialog" persistent>
      <q-card style="min-width: 600px; max-width: 90vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Customize {{ currentItem?.title }}</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeCustomization" />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-body2 text-grey-6 q-mb-md">
            Adjust ingredients according to your preferences
          </div>

          <!-- 不可定制提示 -->
          <div
            v-if="!currentItem?.customizable"
            class="text-center q-pa-lg bg-grey-3 rounded-borders"
          >
            <q-icon name="lock" size="md" color="grey-6" class="q-mb-sm" />
            <div class="text-grey-6">This item cannot be customized</div>
          </div>

          <!-- 定制选项 -->
          <div v-else>
            <q-list separator>
              <q-item
                v-for="ingredient in currentItem?.ingredients || []"
                :key="ingredient.id"
                class="q-py-md"
              >
                <q-item-section>
                  <!-- 配料基本信息 -->
                  <div class="row items-center justify-between q-mb-sm">
                    <div class="text-body1 text-weight-medium">
                      {{ ingredient.name }}
                      <q-chip
                        size="sm"
                        color="grey-4"
                        text-color="black"
                        dense
                        class="q-ml-xs"
                      >
                        {{ ingredient.type }}
                      </q-chip>
                    </div>
                    <q-chip
                      color="green"
                      text-color="white"
                      size="sm"
                      dense
                    >
                      ${{ ingredient.price.toFixed(2) }}
                    </q-chip>
                  </div>

                  <!-- 定制模式标识 -->
                  <div class="q-mb-sm">
                    <q-chip
                      :color="getCustomizationModeColor(ingredient.customizationMode)"
                      :text-color="getCustomizationModeTextColor(ingredient.customizationMode)"
                      size="sm"
                      dense
                      :icon="getCustomizationModeIcon(ingredient.customizationMode)"
                    >
                      {{ getCustomizationModeLabel(ingredient.customizationMode) }}
                    </q-chip>
                  </div>

                  <!-- Fixed 模式 -->
                  <div v-if="ingredient.customizationMode === 'fixed'">
                    <div class="text-caption text-grey-6 q-pa-sm bg-grey-2 rounded-borders">
                      <q-icon name="lock" class="q-mr-xs" size="xs" />
                      This ingredient cannot be modified
                    </div>
                  </div>

                  <!-- Variable 模式 -->
                  <div v-else-if="ingredient.customizationMode === 'variable'">
                    <div class="row items-center q-gutter-md">
                      <div class="text-body2">Quantity:</div>
                      <div class="row items-center q-gutter-xs">
                        <q-btn
                          round
                          dense
                          color="grey-6"
                          icon="remove"
                          size="sm"
                          @click="decreaseQuantity(ingredient)"
                          :disable="ingredient.currentQuantity <= 0"
                        />
                        <div class="text-body1 text-weight-medium q-px-md">
                          {{ ingredient.currentQuantity }}
                        </div>
                        <q-btn
                          round
                          dense
                          color="primary"
                          icon="add"
                          size="sm"
                          @click="increaseQuantity(ingredient)"
                          :disable="ingredient.currentQuantity >= 10"
                        />
                      </div>
                      <div class="text-caption text-grey-6">
                        {{ getQuantityPriceInfo(ingredient) }}
                      </div>
                    </div>
                  </div>

                  <!-- Replaceable 模式 -->
                  <div v-else-if="ingredient.customizationMode === 'replaceable'">
                    <!-- 替换按钮 -->
                    <div class="row items-center justify-between q-mb-sm">
                      <div class="text-body2">{{ getCurrentReplacementName(ingredient) }}</div>
                      <q-btn
                        flat
                        dense
                        color="primary"
                        icon="swap_horiz"
                        label="Change"
                        size="sm"
                        @click="showReplacementDialog(ingredient)"
                      />
                    </div>
                  </div>

                  <!-- Replaceable + Variable 模式 -->
                  <div v-else-if="ingredient.customizationMode === 'replaceable_variable'">
                    <!-- 替换按钮 -->
                    <div class="row items-center justify-between q-mb-sm">
                      <div class="text-body2">{{ getCurrentReplacementName(ingredient) }}</div>
                      <q-btn
                        flat
                        dense
                        color="primary"
                        icon="swap_horiz"
                        label="Change"
                        size="sm"
                        @click="showReplacementDialog(ingredient)"
                      />
                    </div>

                    <!-- 数量调整 -->
                    <div class="row items-center q-gutter-md q-mt-sm">
                      <div class="text-body2">Quantity:</div>
                      <div class="row items-center q-gutter-xs">
                        <q-btn
                          round
                          dense
                          color="grey-6"
                          icon="remove"
                          size="sm"
                          @click="decreaseQuantity(ingredient)"
                          :disable="ingredient.currentQuantity <= 0"
                        />
                        <div class="text-body1 text-weight-medium q-px-md">
                          {{ ingredient.currentQuantity }}
                        </div>
                        <q-btn
                          round
                          dense
                          color="primary"
                          icon="add"
                          size="sm"
                          @click="increaseQuantity(ingredient)"
                          :disable="ingredient.currentQuantity >= 10"
                        />
                      </div>
                      <div class="text-caption text-grey-6">
                        {{ getQuantityPriceInfo(ingredient) }}
                      </div>
                    </div>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" @click="closeCustomization" />
          <q-btn
            color="primary"
            label="Apply Changes"
            @click="applyCustomization"
            :disable="!currentItem?.customizable"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 替换选择弹窗 -->
    <q-dialog v-model="showReplacementSelectDialog" persistent>
      <q-card style="min-width: 400px; max-width: 90vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Change {{ currentReplaceIngredient?.name }}</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeReplacementDialog" />
        </q-card-section>

        <q-card-section>
          <div class="text-body2 text-grey-6 q-mb-md">
            Select a replacement for this ingredient
          </div>

          <q-list separator>
            <q-item
              v-for="option in currentReplaceIngredient?.replacementOptions || []"
              :key="option.value"
              clickable
              @click="selectReplacement(option)"
              :class="option.value === currentReplaceIngredient?.replacementId ? 'bg-blue-1' : ''"
            >
              <q-item-section side>
                <q-radio
                  :model-value="currentReplaceIngredient?.replacementId"
                  :val="option.value"
                  color="primary"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">
                  {{ option.label.replace(' (Original)', '') }}
                </q-item-label>
                <q-item-label caption>
                  Base price: ${{ option.price.toFixed(2) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="column items-end">
                  <q-chip
                    v-if="option.priceDiff !== 0"
                    :color="option.priceDiff > 0 ? 'orange' : 'green'"
                    text-color="white"
                    size="sm"
                    dense
                  >
                    {{ option.priceDiff >= 0 ? '+' : '' }}${{ option.priceDiff.toFixed(2) }}
                  </q-chip>
                  <q-chip
                    v-else
                    color="grey-4"
                    text-color="grey-8"
                    size="sm"
                    dense
                  >
                    No extra cost
                  </q-chip>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" @click="closeReplacementDialog" />
          <q-btn
            color="primary"
            label="Confirm"
            @click="confirmReplacement"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()

// 响应式数据
const showCustomDialog = ref(false)
const showReplacementSelectDialog = ref(false)
const currentItemIndex = ref(-1)
const currentReplaceIngredient = ref(null)
const orderItems = ref([])
const processing = ref(false)
const diningType = ref('takeaway')
const estimatedTime = ref('')

// 客户信息
const customerInfo = ref({
  name: '',
  phone: '',
  pickupTime: '',
  tableNumber: '',
  notes: ''
})

// 预设的备注选项
const commentChips = [
  'Extra Sauce',
  'Mild',
  'Not Spicy',
  'Less Salt',
  'Extra Cheese',
  'No Onions',
  'Well Done',
  'Medium Rare',
  'Extra Hot',
  'On the Side',
  'No Ice',
  'Less Sugar'
]

const selectedChips = ref([])

// 假数据
const mockOrderItems = [
  {
    id: 1,
    title: "Margherita Pizza",
    description: "Classic pizza with fresh tomatoes, mozzarella, and basil",
    image: "/src/assets/products/jeroen-den-otter-iKmm0okt6Q4-unsplash.jpg",
    originalPrice: 18.99,
    currentPrice: 18.99,
    customizable: true,
    customizations: [],
    ingredients: [
      {
        id: 1,
        name: "Mozzarella Cheese",
        type: "Cheese",
        price: 2.5,
        extra_price: 1.5,
        originalQuantity: 2,
        currentQuantity: 2,
        customizationMode: "variable",
        replacementId: null,
        replacementOptions: []
      },
      {
        id: 2,
        name: "Fresh Tomatoes",
        type: "Vegetable",
        price: 1.8,
        extra_price: 1.0,
        originalQuantity: 3,
        currentQuantity: 3,
        customizationMode: "replaceable_variable",
        replacementId: 2,
        replacementOptions: [
          { label: "Fresh Tomatoes (Original)", value: 2, price: 1.8, priceDiff: 0 },
          { label: "Cherry Tomatoes", value: 7, price: 2.2, priceDiff: 0.4 },
          { label: "Sun-dried Tomatoes", value: 8, price: 3.0, priceDiff: 1.2 }
        ]
      },
      {
        id: 3,
        name: "Fresh Basil",
        type: "Herb",
        price: 0.5,
        extra_price: 0.3,
        originalQuantity: 1,
        currentQuantity: 1,
        customizationMode: "replaceable",
        replacementId: 3,
        replacementOptions: [
          { label: "Fresh Basil (Original)", value: 3, price: 0.5, priceDiff: 0 },
          { label: "Oregano", value: 9, price: 0.3, priceDiff: 0 },
          { label: "Thyme", value: 10, price: 0.8, priceDiff: 0.3 }
        ]
      },
      {
        id: 4,
        name: "Pizza Dough",
        type: "Base",
        price: 3.0,
        extra_price: 0,
        originalQuantity: 1,
        currentQuantity: 1,
        customizationMode: "fixed",
        replacementId: null,
        replacementOptions: []
      }
    ]
  },
  {
    id: 2,
    title: "Chicken Caesar Salad",
    description: "Grilled chicken breast with romaine lettuce, croutons and caesar dressing",
    image: "/src/assets/products/c-d-x-PDX_a_82obo-unsplash.jpg",
    originalPrice: 14.99,
    currentPrice: 14.99,
    customizable: true,
    customizations: [],
    ingredients: [
      {
        id: 5,
        name: "Grilled Chicken Breast",
        type: "Protein",
        price: 6.0,
        extra_price: 4.0,
        originalQuantity: 1,
        currentQuantity: 1,
        customizationMode: "variable",
        replacementId: null,
        replacementOptions: []
      },
      {
        id: 6,
        name: "Romaine Lettuce",
        type: "Vegetable",
        price: 1.5,
        extra_price: 0.5,
        originalQuantity: 2,
        currentQuantity: 2,
        customizationMode: "fixed",
        replacementId: null,
        replacementOptions: []
      }
    ]
  },
  {
    id: 3,
    title: "Chocolate Brownie",
    description: "Rich chocolate brownie with vanilla ice cream",
    image: "/src/assets/products/frankie-valentine-VghbBAYqUJ0-unsplash.jpg",
    originalPrice: 8.99,
    currentPrice: 8.99,
    customizable: false,
    customizations: [],
    ingredients: []
  }
]

// 计算属性
const currentItem = computed(() => {
  return currentItemIndex.value >= 0 ? orderItems.value[currentItemIndex.value] : null
})

const totalAmount = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.currentPrice, 0)
})


// 方法
function toggleChip(chip) {
  const index = selectedChips.value.indexOf(chip)
  if (index > -1) {
    // 如果已选中，则移除
    selectedChips.value.splice(index, 1)
  } else {
    // 如果未选中，则添加
    selectedChips.value.push(chip)
  }

  // 更新notes字段，将选中的chips添加到现有notes中
  const existingNotes = customerInfo.value.notes.replace(/,?\s*(Extra Sauce|Mild|Not Spicy|Less Salt|Extra Cheese|No Onions|Well Done|Medium Rare|Extra Hot|On the Side|No Ice|Less Sugar)/g, '').trim()
  const chipText = selectedChips.value.length > 0 ? selectedChips.value.join(', ') : ''

  if (existingNotes && chipText) {
    customerInfo.value.notes = existingNotes + ', ' + chipText
  } else if (chipText) {
    customerInfo.value.notes = chipText
  } else {
    customerInfo.value.notes = existingNotes
  }
}

function openCustomization(index) {
  currentItemIndex.value = index
  showCustomDialog.value = true
}

function closeCustomization() {
  showCustomDialog.value = false
  currentItemIndex.value = -1
}

function removeItem(index) {
  orderItems.value.splice(index, 1)
}

function getCustomizationModeColor(mode) {
  const colors = {
    fixed: 'grey-4',
    variable: 'blue',
    replaceable: 'orange',
    replaceable_variable: 'purple'
  }
  return colors[mode] || 'grey'
}

function getCustomizationModeTextColor(mode) {
  const colors = {
    fixed: 'grey-8',
    variable: 'white',
    replaceable: 'white',
    replaceable_variable: 'white'
  }
  return colors[mode] || 'white'
}

function getCustomizationModeIcon(mode) {
  const icons = {
    fixed: 'lock',
    variable: 'tune',
    replaceable: 'swap_horiz',
    replaceable_variable: 'settings'
  }
  return icons[mode] || 'help'
}

function getCustomizationModeLabel(mode) {
  const labels = {
    fixed: 'Fixed',
    variable: 'Variable',
    replaceable: 'Replaceable',
    replaceable_variable: 'Replaceable + Variable'
  }
  return labels[mode] || 'Unknown'
}

function updateIngredientQuantity(ingredient) {
  // 重新计算价格
  recalculateItemPrice()
}

function updateIngredientReplacement(ingredient) {
  // 重新计算价格
  recalculateItemPrice()
}

// 新增方法：增加数量
function increaseQuantity(ingredient) {
  if (ingredient.currentQuantity < 10) {
    ingredient.currentQuantity++
    recalculateItemPrice()
  }
}

// 新增方法：减少数量
function decreaseQuantity(ingredient) {
  if (ingredient.currentQuantity > 0) {
    ingredient.currentQuantity--
    recalculateItemPrice()
  }
}

// 新增方法：显示替换弹窗
function showReplacementDialog(ingredient) {
  currentReplaceIngredient.value = ingredient
  showReplacementSelectDialog.value = true
}

// 新增方法：关闭替换弹窗
function closeReplacementDialog() {
  showReplacementSelectDialog.value = false
  currentReplaceIngredient.value = null
}

// 新增方法：选择替换选项
function selectReplacement(option) {
  if (currentReplaceIngredient.value) {
    currentReplaceIngredient.value.replacementId = option.value
  }
}

// 新增方法：确认替换
function confirmReplacement() {
  if (currentReplaceIngredient.value) {
    // 更新 ingredient 的显示信息
    const selectedReplacement = currentReplaceIngredient.value.replacementOptions.find(
      opt => opt.value === currentReplaceIngredient.value.replacementId
    )

    if (selectedReplacement) {
      // 更新名称和价格显示
      currentReplaceIngredient.value.name = selectedReplacement.label.replace(' (Original)', '')
      currentReplaceIngredient.value.price = selectedReplacement.price
    }

    recalculateItemPrice()
  }
  closeReplacementDialog()
}

// 新增方法：获取当前替换选项名称
function getCurrentReplacementName(ingredient) {
  const current = ingredient.replacementOptions.find(
    opt => opt.value === ingredient.replacementId
  )
  return current ? current.label.replace(' (Original)', '') : ingredient.name
}

function recalculateItemPrice() {
  if (!currentItem.value) return

  let totalPrice = currentItem.value.originalPrice
  let priceAdjustment = 0

  currentItem.value.ingredients.forEach(ingredient => {
    // 数量变化的价格调整
    const quantityDiff = ingredient.currentQuantity - ingredient.originalQuantity
    if (quantityDiff !== 0) {
      priceAdjustment += quantityDiff * ingredient.extra_price
    }

    // 替换的价格调整
    if (ingredient.replacementId && ingredient.replacementId !== ingredient.id) {
      const replacement = ingredient.replacementOptions.find(
        opt => opt.value === ingredient.replacementId
      )
      if (replacement) {
        priceAdjustment += replacement.priceDiff
      }
    }
  })

  currentItem.value.currentPrice = Math.max(0, totalPrice + priceAdjustment)
}

function getQuantityPriceInfo(ingredient) {
  const quantityDiff = ingredient.currentQuantity - ingredient.originalQuantity
  if (quantityDiff > 0) {
    const extraCost = quantityDiff * ingredient.extra_price
    return `+$${extraCost.toFixed(2)} for extra`
  } else if (quantityDiff < 0) {
    return `Reduced portion`
  }
  return 'Standard portion'
}

function applyCustomization() {
  if (!currentItem.value) return

  // 更新定制信息
  const customizations = []

  currentItem.value.ingredients.forEach(ingredient => {
    // 记录数量变化
    if (ingredient.currentQuantity !== ingredient.originalQuantity) {
      const diff = ingredient.currentQuantity - ingredient.originalQuantity
      customizations.push({
        id: `qty_${ingredient.id}`,
        type: 'quantity',
        ingredientName: ingredient.name,
        change: diff > 0 ? `+${diff}` : `${diff}`,
        priceChange: diff * ingredient.extra_price
      })
    }

    // 记录替换
    if (ingredient.replacementId && ingredient.replacementId !== ingredient.id) {
      const replacement = ingredient.replacementOptions.find(
        opt => opt.value === ingredient.replacementId
      )
      if (replacement) {
        customizations.push({
          id: `rep_${ingredient.id}`,
          type: 'replacement',
          originalName: ingredient.name,
          replacementName: replacement.label.replace(' (Original)', ''),
          priceChange: replacement.priceDiff
        })
      }
    }
  })

  currentItem.value.customizations = customizations
  closeCustomization()
}

function formatCustomization(custom) {
  if (custom.type === 'quantity') {
    const sign = custom.priceChange >= 0 ? '+' : ''
    return `${custom.ingredientName} ${custom.change} (${sign}$${custom.priceChange.toFixed(2)})`
  } else if (custom.type === 'replacement') {
    const sign = custom.priceChange >= 0 ? '+' : ''
    return `${custom.originalName} → ${custom.replacementName} (${sign}$${custom.priceChange.toFixed(2)})`
  }
  return custom.toString()
}

function continueShopping() {
  // 保存当前订单状态
  const orderData = {
    items: orderItems.value,
    total: totalAmount.value
  }
  sessionStorage.setItem('pendingOrder', JSON.stringify(orderData))

  // 返回到订单页面
  router.push('/customer/order')
}

function proceedToPayment() {
  // 保存当前订单状态到sessionStorage
  const orderData = {
    items: orderItems.value,
    total: totalAmount.value
  }
  sessionStorage.setItem('checkoutOrder', JSON.stringify(orderData))

  // 跳转到支付页面
  router.push('/customer/payment')
}

async function placeOrder() {
  if (!customerInfo.value.name.trim()) {
    $q.notify({
      type: 'negative',
      message: 'Please fill in your name and phone number',
      position: 'top'
    })
    return
  }

  processing.value = true

  try {
    // 生成订单号
    const orderNumber = generateOrderNumber()

    // 创建订单数据
    const orderData = {
      orderNumber,
      customerInfo: customerInfo.value,
      diningType: diningType.value,
      items: orderItems.value,
      total: totalAmount.value,
      status: 'pending', // 不处理支付，直接设为pending
      createdAt: new Date().toISOString()
    }

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 保存订单到localStorage（作为订单历史）
    saveOrderToHistory(orderData)

    // 保存客户信息到localStorage
    saveCustomerInfo(customerInfo.value)

    // 保存用户点过的餐品信息
    saveOrderedItems(orderItems.value)

    // 清除购物车缓存
    sessionStorage.removeItem('pendingOrder')
    sessionStorage.removeItem('checkoutOrder')

    $q.notify({
      type: 'positive',
      message: 'Order placed successfully!',
      position: 'top'
    })

    // 跳转到订单确认页面
    router.push({
      path: '/confirmation',
      query: {
        orderNumber: orderData.orderNumber,
        status: orderData.status
      }
    })

  } catch (error) {
    console.error('Order placement failed:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to place order. Please try again.',
      position: 'top'
    })
  } finally {
    processing.value = false
  }
}

function generateOrderNumber() {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `ORD-${timestamp}-${random}`
}

function saveOrderToHistory(orderData) {
  try {
    const existingOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]')
    existingOrders.unshift(orderData) // 添加到数组开头

    // 限制历史记录数量（例如最多保存50个订单）
    if (existingOrders.length > 50) {
      existingOrders.splice(50)
    }

    localStorage.setItem('orderHistory', JSON.stringify(existingOrders))
  } catch (error) {
    console.error('Failed to save order to history:', error)
  }
}

function saveCustomerInfo(info) {
  try {
    // 保存客户基本信息
    const customerData = {
      name: info.name,
      phone: info.phone,
      lastUpdated: new Date().toISOString()
    }
    localStorage.setItem('customerInfo', JSON.stringify(customerData))
  } catch (error) {
    console.error('Failed to save customer info:', error)
  }
}

function saveOrderedItems(items) {
  try {
    // 获取现有的历史餐品
    const existingItems = JSON.parse(localStorage.getItem('orderedItems') || '[]')

    // 将当前订单的餐品添加到历史记录
    items.forEach(item => {
      // 检查是否已存在相同的餐品
      const existingIndex = existingItems.findIndex(existing => existing.id === item.id)

      if (existingIndex >= 0) {
        // 更新现有餐品的信息（更新最后订购时间，累计订购次数）
        existingItems[existingIndex].lastOrdered = new Date().toISOString()
        existingItems[existingIndex].orderCount = (existingItems[existingIndex].orderCount || 1) + 1
        existingItems[existingIndex].totalSpent = (existingItems[existingIndex].totalSpent || item.currentPrice) + item.currentPrice
      } else {
        // 添加新餐品到历史记录
        existingItems.push({
          id: item.id,
          title: item.title,
          description: item.description || '',
          image: item.image || '',
          price: item.originalPrice || item.currentPrice,
          category: item.category || 'mains',
          rating: item.rating || 4.0,
          cookTime: item.cookTime || '15-20 min',
          lastOrdered: new Date().toISOString(),
          orderCount: 1,
          totalSpent: item.currentPrice,
          customizations: item.customizations || []
        })
      }
    })

    // 按最后订购时间排序，最新的在前面
    existingItems.sort((a, b) => new Date(b.lastOrdered) - new Date(a.lastOrdered))

    // 限制历史记录数量（例如最多保存30个餐品）
    if (existingItems.length > 30) {
      existingItems.splice(30)
    }

    localStorage.setItem('orderedItems', JSON.stringify(existingItems))
  } catch (error) {
    console.error('Failed to save ordered items:', error)
  }
}

function loadSavedCustomerInfo() {
  try {
    const customerData = localStorage.getItem('customerInfo')
    if (customerData) {
      const parsedData = JSON.parse(customerData)
      customerInfo.value = { ...customerInfo.value, ...parsedData }
    }
  } catch (error) {
    console.error('Failed to load customer info:', error)
  }
}

function calculateEstimatedTime() {
  const now = new Date()
  const prepTime = diningType.value === 'takeaway' ? 20 : 15 // 分钟
  now.setMinutes(now.getMinutes() + prepTime)

  return now.toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

// 生命周期
onMounted(() => {
  // 从sessionStorage加载确认的订单数据
  const confirmedOrder = sessionStorage.getItem('confirmedOrder')
  if (confirmedOrder) {
    const orderData = JSON.parse(confirmedOrder)
    orderItems.value = orderData.items || []
    diningType.value = orderData.diningType || 'takeaway'
  } else {
    // 如果没有确认的订单数据，使用模拟数据进行测试
    console.log('No order data found, using mock data for testing')
    orderItems.value = mockOrderItems
    diningType.value = 'takeaway'
  }

  // 加载保存的客户信息
  loadSavedCustomerInfo()

  // 计算估算时间
  estimatedTime.value = calculateEstimatedTime()

  // 设置默认取餐时间为30分钟后
  const now = new Date()
  now.setMinutes(now.getMinutes() + 30)
  if (!customerInfo.value.pickupTime) {
    customerInfo.value.pickupTime = now.toTimeString().slice(0, 5)
  }
})

// 生命周期
onMounted(() => {
  // 从sessionStorage加载订单数据
  const pendingOrder = sessionStorage.getItem('pendingOrder')
  if (pendingOrder) {
    try {
      const orderData = JSON.parse(pendingOrder)
      orderItems.value = orderData.items || [...mockOrderItems]
      diningType.value = orderData.diningType || 'takeaway'
    } catch (error) {
      console.error('Failed to load pending order:', error)
      orderItems.value = [...mockOrderItems]
    }
  } else {
    // 如果没有待处理订单，使用模拟数据
    orderItems.value = [...mockOrderItems]
  }

  // 加载保存的客户信息
  loadSavedCustomerInfo()

  // 设置默认取餐时间为30分钟后
  const now = new Date()
  now.setMinutes(now.getMinutes() + 30)
  if (!customerInfo.value.pickupTime) {
    customerInfo.value.pickupTime = now.toTimeString().slice(0, 5)
  }
})
</script>

<style scoped>
.border-top {
  border-top: 1px solid #e0e0e0;
}

.rounded-borders-lg {
  border-radius: 12px;
}

.shadow-2 {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.bg-deep-orange {
  background-color: #FF5722 !important;
}

.text-deep-orange {
  color: #FF5722 !important;
}

/* 定制弹窗样式 */
.q-dialog .q-card {
  border-radius: 12px;
}

/* 按钮组样式优化 */
.q-btn-toggle {
  border-radius: 8px;
}

/* 选项组样式 */
.q-option-group .q-radio {
  margin-bottom: 8px;
}

/* 响应式调整 */
@media (max-width: 600px) {
  .text-h4 {
    font-size: 1.5rem;
  }

  .col-auto .column {
    flex-direction: row;
  }

  .col-auto .column .q-btn {
    min-width: auto;
    padding: 4px 8px;
  }
}
</style>
