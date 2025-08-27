<template>
  <q-page padding class="bg-grey-1">
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <!-- 页面标题 -->
        <div class="text-h4 text-weight-bold text-grey-8 q-mb-lg text-center">
          Confirm Your Order
        </div>

        <!-- 就餐方式显示 -->
        <q-card class="q-mb-lg shadow-2 rounded-borders-lg">
          <q-card-section class="q-pa-md bg-deep-orange text-white">
            <div class="row items-center">
              <q-icon
                :name="diningType === 'takeaway' ? 'shopping_bag' : 'restaurant'"
                size="sm"
                class="q-mr-sm"
              />
              <span class="text-h6">
                {{ diningType === 'takeaway' ? 'Take Away Order' : 'Dine In Order' }}
              </span>
            </div>
          </q-card-section>
        </q-card>

        <!-- 订单项目列表 -->
        <q-card class="q-mb-lg shadow-2 rounded-borders-lg">
          <q-card-section class="q-pa-md">
            <div class="text-h6 q-mb-md">Your Items</div>

            <div class="q-gutter-md">
              <div
                v-for="(item, index) in orderItems"
                :key="item.id"
                class="row items-start q-gutter-md border rounded-borders q-pa-md bg-white"
              >
                <!-- 商品图片 -->
                <q-img
                  :src="item.image"
                  class="rounded-borders"
                  style="width: 80px; height: 80px"
                  fit="cover"
                />

                <!-- 商品信息 -->
                <div class="col">
                  <div class="text-weight-medium text-body1">{{ item.title }}</div>
                  <div class="text-caption text-grey-6 q-mb-sm">{{ item.description }}</div>

                  <!-- 定制选项显示 -->
                  <div v-if="item.customizations.length > 0" class="q-mb-sm">
                    <div class="text-caption text-weight-medium text-deep-orange">Customizations:</div>
                    <div class="text-caption text-grey-7">
                      <div v-for="custom in item.customizations" :key="custom.id" class="q-mb-xs">
                        {{ formatCustomization(custom) }}
                      </div>
                    </div>
                  </div>

                  <!-- 数量和价格 -->
                  <div class="row items-center justify-between">
                    <div class="text-caption text-grey-6">Qty: {{ item.quantity || 1 }}</div>
                    <div class="text-weight-bold text-primary">${{ item.currentPrice.toFixed(2) }}</div>
                  </div>

                  <!-- 操作按钮 -->
                  <div class="row items-center justify-between q-mt-sm">
                    <q-btn
                      v-if="item.customizable"
                      flat
                      dense
                      color="deep-orange"
                      label="Customize"
                      icon="tune"
                      size="sm"
                      @click="openCustomization(index)"
                    />
                    <q-btn
                      flat
                      dense
                      color="negative"
                      icon="delete"
                      size="sm"
                      @click="removeItem(index)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- 总价 -->
            <q-separator class="q-my-lg" />
            <div class="row items-center justify-between">
              <div class="text-h6 text-weight-bold">Total:</div>
              <div class="text-h6 text-weight-bold text-deep-orange">${{ totalAmount.toFixed(2) }}</div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 操作按钮 -->
        <div class="q-gutter-md">
          <q-btn
            color="grey-6"
            label="Continue Shopping"
            icon="arrow_back"
            outline
            size="lg"
            class="full-width"
            @click="continueShopping"
          />
          <q-btn
            color="deep-orange"
            label="Proceed to Checkout"
            icon="arrow_forward"
            size="lg"
            class="full-width"
            :disable="orderItems.length === 0"
            @click="proceedToCheckout"
          />
        </div>
      </div>
    </div>

    <!-- 定制弹窗 -->
    <q-dialog v-model="showCustomDialog" persistent>
      <q-card style="min-width: 400px; max-width: 600px">
        <q-card-section class="q-pb-none">
          <div class="text-h6">Customize {{ currentItem?.title }}</div>
        </q-card-section>

        <q-card-section class="q-py-md" v-if="currentItem">
          <div class="q-gutter-md">
            <!-- 配料定制 -->
            <div v-for="ingredient in currentItem.ingredients" :key="ingredient.id">
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-weight-medium">{{ ingredient.name }}</div>
                <q-chip
                  :color="getCustomizationModeColor(ingredient.mode)"
                  :text-color="getCustomizationModeTextColor(ingredient.mode)"
                  :icon="getCustomizationModeIcon(ingredient.mode)"
                  size="sm"
                >
                  {{ getCustomizationModeLabel(ingredient.mode) }}
                </q-chip>
              </div>

              <!-- 数量调整 -->
              <div v-if="ingredient.mode === 'variable' || ingredient.mode === 'replaceable_variable'">
                <div class="row items-center q-gutter-sm q-mb-sm">
                  <q-btn
                    round
                    dense
                    size="sm"
                    icon="remove"
                    color="grey-6"
                    @click="decreaseQuantity(ingredient)"
                  />
                  <span class="text-weight-medium">{{ ingredient.currentQuantity }}</span>
                  <q-btn
                    round
                    dense
                    size="sm"
                    icon="add"
                    color="primary"
                    @click="increaseQuantity(ingredient)"
                  />
                </div>
                <div class="text-caption text-grey-6">
                  {{ getQuantityPriceInfo(ingredient) }}
                </div>
              </div>

              <!-- 替换选项 -->
              <div v-if="ingredient.mode === 'replaceable' || ingredient.mode === 'replaceable_variable'">
                <q-btn
                  flat
                  dense
                  color="deep-orange"
                  :label="`Replace with: ${getCurrentReplacementName(ingredient)}`"
                  icon="swap_horiz"
                  class="full-width"
                  @click="showReplacementDialog(ingredient)"
                />
              </div>

              <q-separator class="q-my-md" />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" @click="closeCustomization" />
          <q-btn label="Apply Changes" color="deep-orange" @click="applyCustomization" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 替换选择弹窗 -->
    <q-dialog v-model="showReplacementSelectDialog" persistent>
      <q-card style="min-width: 300px">
        <q-card-section class="q-pb-none">
          <div class="text-h6">Replace {{ currentReplaceIngredient?.name }}</div>
        </q-card-section>

        <q-card-section>
          <q-option-group
            v-model="currentReplaceIngredient.replacementId"
            :options="currentReplaceIngredient?.replacementOptions || []"
            color="deep-orange"
            @update:model-value="selectReplacement"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" @click="closeReplacementDialog" />
          <q-btn label="Confirm" color="deep-orange" @click="confirmReplacement" />
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
const diningType = ref('takeaway')

// 计算属性
const currentItem = computed(() => {
  return currentItemIndex.value >= 0 ? orderItems.value[currentItemIndex.value] : null
})

const totalAmount = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.currentPrice, 0)
})

// 方法
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

  // 如果没有商品了，返回到菜单页面
  if (orderItems.value.length === 0) {
    $q.notify({
      type: 'info',
      message: 'Your cart is empty. Redirecting to menu...',
      position: 'top'
    })
    setTimeout(() => {
      router.push('/')
    }, 1500)
  }
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

function increaseQuantity(ingredient) {
  if (ingredient.currentQuantity < 10) {
    ingredient.currentQuantity++
    recalculateItemPrice()
  }
}

function decreaseQuantity(ingredient) {
  if (ingredient.currentQuantity > 0) {
    ingredient.currentQuantity--
    recalculateItemPrice()
  }
}

function showReplacementDialog(ingredient) {
  currentReplaceIngredient.value = ingredient
  showReplacementSelectDialog.value = true
}

function closeReplacementDialog() {
  showReplacementSelectDialog.value = false
  currentReplaceIngredient.value = null
}

function selectReplacement(option) {
  if (currentReplaceIngredient.value) {
    currentReplaceIngredient.value.replacementId = option
  }
}

function confirmReplacement() {
  if (currentReplaceIngredient.value) {
    const selectedReplacement = currentReplaceIngredient.value.replacementOptions.find(
      opt => opt.value === currentReplaceIngredient.value.replacementId
    )

    if (selectedReplacement) {
      currentReplaceIngredient.value.displayName = selectedReplacement.label.replace(' (Original)', '')
    }

    recalculateItemPrice()
  }
  closeReplacementDialog()
}

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
      const replacement = ingredient.replacementOptions.find(opt => opt.value === ingredient.replacementId)
      if (replacement) {
        priceAdjustment += replacement.price_change || 0
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
      const change = ingredient.currentQuantity > ingredient.originalQuantity ?
        `+${ingredient.currentQuantity - ingredient.originalQuantity}` :
        `${ingredient.currentQuantity - ingredient.originalQuantity}`
      const priceChange = (ingredient.currentQuantity - ingredient.originalQuantity) * ingredient.extra_price

      customizations.push({
        type: 'quantity',
        ingredientName: ingredient.name,
        change: change,
        priceChange: priceChange
      })
    }

    // 记录替换
    if (ingredient.replacementId && ingredient.replacementId !== ingredient.id) {
      const replacement = ingredient.replacementOptions.find(opt => opt.value === ingredient.replacementId)
      if (replacement) {
        customizations.push({
          type: 'replacement',
          originalName: ingredient.name,
          replacementName: replacement.label.replace(' (Original)', ''),
          priceChange: replacement.price_change || 0
        })
      }
    }
  })

  currentItem.value.customizations = customizations

  $q.notify({
    type: 'positive',
    message: 'Customization applied!',
    position: 'top'
  })

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
    total: totalAmount.value,
    diningType: diningType.value
  }
  sessionStorage.setItem('pendingOrder', JSON.stringify(orderData))

  // 返回到订单页面
  router.push('/')
}

function proceedToCheckout() {
  if (orderItems.value.length === 0) {
    $q.notify({
      type: 'negative',
      message: 'Your cart is empty',
      position: 'top'
    })
    return
  }

  // 保存确认后的订单状态到sessionStorage
  const orderData = {
    items: orderItems.value,
    total: totalAmount.value,
    diningType: diningType.value
  }
  sessionStorage.setItem('confirmedOrder', JSON.stringify(orderData))

  // 跳转到支付页面（填写个人信息）
  router.push('/checkout')
}

// 生命周期
onMounted(() => {
  // 从sessionStorage加载订单数据
  const pendingOrder = sessionStorage.getItem('pendingOrder')
  if (pendingOrder) {
    const orderData = JSON.parse(pendingOrder)
    orderItems.value = orderData.items || []
    diningType.value = orderData.diningType || 'takeaway'
  } else {
    // 如果没有待处理的订单，使用模拟数据
    orderItems.value = [
      {
        id: 1,
        title: "Margherita Pizza",
        description: "Classic pizza with fresh tomatoes, mozzarella, and basil",
        image: "/src/assets/products/jeroen-den-otter-iKmm0okt6Q4-unsplash.jpg",
        originalPrice: 18.99,
        currentPrice: 18.99,
        customizable: true,
        customizations: [],
        quantity: 1,
        ingredients: [
          {
            id: 1,
            name: "Mozzarella Cheese",
            mode: "variable",
            originalQuantity: 1,
            currentQuantity: 1,
            extra_price: 2.50
          },
          {
            id: 2,
            name: "Tomato Sauce",
            mode: "replaceable",
            originalQuantity: 1,
            currentQuantity: 1,
            replacementId: 2,
            replacementOptions: [
              { label: "Tomato Sauce (Original)", value: 2, price_change: 0 },
              { label: "BBQ Sauce", value: 3, price_change: 1.00 },
              { label: "Pesto Sauce", value: 4, price_change: 2.00 }
            ]
          }
        ]
      }
    ]
  }

  // 如果没有商品，返回菜单页
  if (orderItems.value.length === 0) {
    $q.notify({
      type: 'info',
      message: 'Your cart is empty. Redirecting to menu...',
      position: 'top'
    })
    router.push('/')
  }
})
</script>

<style scoped>
.border {
  border: 1px solid #e0e0e0;
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
    gap: 8px;
  }

  .col-auto .column .q-btn {
    min-height: 36px;
  }
}
</style>
