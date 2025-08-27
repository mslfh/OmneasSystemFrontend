<template>
  <q-page padding class="bg-grey-1">
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <!-- 页面标题 -->
        <div class="text-center q-mb-lg">
          <div class="text-h4 text-weight-bold text-grey-8 q-mb-sm">
            Track Your Order
          </div>
          <div class="text-body1 text-grey-6">
            Order #{{ orderNumber }}
          </div>
        </div>

        <!-- 订单状态卡片 -->
        <q-card class="q-mb-lg shadow-2 rounded-borders-lg">
          <q-card-section class="q-pa-md">
            <!-- 当前状态 -->
            <div class="text-center q-mb-lg">
              <q-icon
                :name="getCurrentStatusIcon()"
                size="4rem"
                :color="getCurrentStatusColor()"
                class="q-mb-sm"
              />
              <div class="text-h5 text-weight-bold">
                {{ getCurrentStatusText() }}
              </div>
              <div class="text-body2 text-grey-6">
                {{ getCurrentStatusDescription() }}
              </div>

              <!-- 预计时间 -->
              <div v-if="estimatedTime" class="q-mt-md">
                <q-chip
                  :color="isOrderReady() ? 'green' : 'orange'"
                  text-color="white"
                  size="lg"
                >
                  <q-icon name="schedule" class="q-mr-xs" />
                  {{ isOrderReady() ? 'Ready for pickup!' : `Ready by ${estimatedTime}` }}
                </q-chip>
              </div>
            </div>

            <!-- 进度步骤 -->
            <q-stepper
              v-model="currentStep"
              vertical
              color="deep-orange"
              active-color="primary"
              done-color="green"
              class="bg-transparent"
            >
              <q-step
                :name="1"
                title="Order Received"
                icon="receipt"
                :done="currentStep > 1"
                :active="currentStep === 1"
              >
                <div class="text-body2 text-grey-6">
                  {{ formatStepTime(statusHistory.received) }}
                </div>
                <div class="text-caption">
                  Your order has been received and is being processed.
                </div>
              </q-step>

              <q-step
                :name="2"
                title="Payment Confirmed"
                icon="payment"
                :done="currentStep > 2"
                :active="currentStep === 2"
              >
                <div class="text-body2 text-grey-6">
                  {{ formatStepTime(statusHistory.paid) }}
                </div>
                <div class="text-caption">
                  Payment has been processed successfully.
                </div>
              </q-step>

              <q-step
                :name="3"
                title="Preparing Order"
                icon="restaurant"
                :done="currentStep > 3"
                :active="currentStep === 3"
              >
                <div class="text-body2 text-grey-6">
                  {{ formatStepTime(statusHistory.preparing) }}
                </div>
                <div class="text-caption">
                  Your food is being freshly prepared by our kitchen.
                </div>
              </q-step>

              <q-step
                :name="4"
                title="Ready for Pickup"
                icon="check_circle"
                :done="currentStep > 4"
                :active="currentStep === 4"
              >
                <div class="text-body2 text-grey-6">
                  {{ formatStepTime(statusHistory.ready) }}
                </div>
                <div class="text-caption">
                  Your order is ready! Please come to collect it.
                </div>
              </q-step>

              <q-step
                :name="5"
                title="Order Complete"
                icon="done_all"
                :done="currentStep >= 5"
                :active="currentStep === 5"
              >
                <div class="text-body2 text-grey-6">
                  {{ formatStepTime(statusHistory.completed) }}
                </div>
                <div class="text-caption">
                  Order has been collected. Thank you for your business!
                </div>
              </q-step>
            </q-stepper>
          </q-card-section>
        </q-card>

        <!-- 订单详情 -->
        <q-card class="q-mb-lg shadow-2 rounded-borders-lg">
          <q-card-section class="q-pa-md">
            <div class="text-h6 q-mb-md">Order Details</div>

            <div class="row q-gutter-md q-mb-md">
              <div class="col">
                <div class="text-caption text-grey-6">Order Time</div>
                <div class="text-body1">{{ formatDateTime(orderInfo.orderTime) }}</div>
              </div>
              <div class="col">
                <div class="text-caption text-grey-6">Order Type</div>
                <div class="text-body1">
                  {{ orderInfo.diningType === 'takeaway' ? 'Take Away' : 'Dine In' }}
                </div>
              </div>
            </div>

            <div class="q-mb-md">
              <div class="text-caption text-grey-6">Customer</div>
              <div class="text-body1">{{ orderInfo.customerName }}</div>
              <div class="text-body2 text-grey-6">{{ orderInfo.customerPhone }}</div>
            </div>

            <q-separator class="q-my-md" />

            <!-- 订单项目 -->
            <div class="q-mb-md">
              <div class="text-caption text-grey-6 q-mb-sm">Items</div>
              <div class="q-gutter-sm">
                <div
                  v-for="item in orderInfo.items"
                  :key="item.id"
                  class="row items-center justify-between q-py-sm"
                >
                  <div class="col">
                    <div class="text-weight-medium">{{ item.title }}</div>
                    <div class="text-caption text-grey-6" v-if="item.customizations">
                      {{ item.customizations }}
                    </div>
                  </div>
                  <div class="col-auto text-weight-bold">
                    ${{ item.price.toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <div class="row items-center justify-between">
              <div class="text-h6 text-weight-bold">Total:</div>
              <div class="text-h6 text-weight-bold text-primary">
                ${{ orderInfo.total.toFixed(2) }}
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 操作按钮 -->
        <div class="q-gutter-md">
          <!-- 刷新按钮 -->
          <q-btn
            color="primary"
            outline
            size="lg"
            label="Refresh Status"
            icon="refresh"
            class="full-width"
            :loading="refreshing"
            @click="refreshOrderStatus"
          />

          <!-- 联系餐厅 -->
          <div class="row q-gutter-sm">
            <q-btn
              color="orange"
              outline
              size="md"
              label="Call Restaurant"
              icon="phone"
              class="col"
              @click="callRestaurant"
            />
            <q-btn
              color="blue"
              outline
              size="md"
              label="Get Directions"
              icon="directions"
              class="col"
              @click="getDirections"
            />
          </div>

          <!-- 其他操作 -->
          <div class="row q-gutter-sm">
            <q-btn
              flat
              color="grey-8"
              size="md"
              label="Order History"
              icon="history"
              class="col"
              @click="goToHistory"
            />
            <q-btn
              flat
              color="grey-8"
              size="md"
              label="New Order"
              icon="add"
              class="col"
              @click="newOrder"
            />
          </div>
        </div>

        <!-- 餐厅信息 -->
        <q-card flat bordered class="q-mt-lg bg-blue-1">
          <q-card-section class="q-pa-md">
            <div class="text-h6 q-mb-sm">Restaurant Information</div>
            <div class="text-body2 text-grey-8">
              <div class="row items-center q-mb-xs">
                <q-icon name="location_on" class="q-mr-sm" />
                <span>123 Main Street, Sydney NSW 2000</span>
              </div>
              <div class="row items-center q-mb-xs">
                <q-icon name="phone" class="q-mr-sm" />
                <span>(02) 1234 5678</span>
              </div>
              <div class="row items-center">
                <q-icon name="schedule" class="q-mr-sm" />
                <span>Open: Mon-Sun 10:00 AM - 10:00 PM</span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 自动刷新提示 -->
    <div class="fixed-bottom-right q-ma-md" v-if="autoRefresh">
      <q-chip color="green" text-color="white" icon="autorenew">
        Auto-refresh enabled
      </q-chip>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

// 响应式数据
const orderNumber = ref('')
const currentStep = ref(3)
const refreshing = ref(false)
const autoRefresh = ref(true)
const refreshInterval = ref(null)
const estimatedTime = ref('')

const statusHistory = ref({
  received: new Date(Date.now() - 15 * 60000), // 15分钟前
  paid: new Date(Date.now() - 12 * 60000),     // 12分钟前
  preparing: new Date(Date.now() - 8 * 60000), // 8分钟前
  ready: null,
  completed: null
})

const orderInfo = ref({
  orderTime: new Date(Date.now() - 15 * 60000),
  diningType: 'takeaway',
  customerName: 'John Doe',
  customerPhone: '(02) 9876 5432',
  items: [],
  total: 0
})

// 计算属性
const isOrderReady = computed(() => currentStep.value >= 4)

// 方法
function getCurrentStatusIcon() {
  switch (currentStep.value) {
    case 1: return 'receipt'
    case 2: return 'payment'
    case 3: return 'restaurant'
    case 4: return 'check_circle'
    case 5: return 'done_all'
    default: return 'help'
  }
}

function getCurrentStatusColor() {
  switch (currentStep.value) {
    case 1: return 'orange'
    case 2: return 'blue'
    case 3: return 'purple'
    case 4: return 'green'
    case 5: return 'green'
    default: return 'grey'
  }
}

function getCurrentStatusText() {
  switch (currentStep.value) {
    case 1: return 'Order Received'
    case 2: return 'Payment Confirmed'
    case 3: return 'Preparing Your Order'
    case 4: return 'Ready for Pickup'
    case 5: return 'Order Complete'
    default: return 'Processing...'
  }
}

function getCurrentStatusDescription() {
  switch (currentStep.value) {
    case 1: return 'We\'ve received your order and are processing it'
    case 2: return 'Your payment has been confirmed'
    case 3: return 'Our kitchen is preparing your delicious food'
    case 4: return 'Your order is ready! Please come to collect it'
    case 5: return 'Thank you for your order!'
    default: return 'Please wait...'
  }
}

function formatStepTime(time) {
  if (!time) return 'Pending...'

  return time.toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

function formatDateTime(date) {
  return new Date(date).toLocaleString('en-AU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

async function refreshOrderStatus() {
  refreshing.value = true

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟状态更新
    const now = new Date()

    // 随机推进状态
    if (currentStep.value < 5 && Math.random() > 0.3) {
      currentStep.value++

      if (currentStep.value === 4) {
        statusHistory.value.ready = now
        $q.notify({
          type: 'positive',
          message: 'Your order is ready for pickup!',
          position: 'top',
          icon: 'check_circle'
        })
      } else if (currentStep.value === 5) {
        statusHistory.value.completed = now
        $q.notify({
          type: 'positive',
          message: 'Order completed. Thank you!',
          position: 'top',
          icon: 'done_all'
        })
      }
    }

  } catch (error) {
    console.error('Failed to refresh order status:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to refresh status. Please try again.',
      position: 'top'
    })
  } finally {
    refreshing.value = false
  }
}

function callRestaurant() {
  $q.notify({
    type: 'info',
    message: 'Calling restaurant: (02) 1234 5678',
    position: 'top',
    actions: [
      {
        icon: 'close',
        color: 'white'
      }
    ]
  })
}

function getDirections() {
  // 打开地图应用或显示方向
  const address = '123 Main Street, Sydney NSW 2000'
  const mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}`
  window.open(mapsUrl, '_blank')
}

function goToHistory() {
  router.push('/profile?tab=orders')
}

function newOrder() {
  router.push('/')
}

function calculateEstimatedTime() {
  if (currentStep.value >= 4) {
    return 'Ready now!'
  }

  const now = new Date()
  const prepTime = 10 - ((currentStep.value - 1) * 2) // 剩余准备时间
  now.setMinutes(now.getMinutes() + prepTime)

  return now.toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

function startAutoRefresh() {
  refreshInterval.value = setInterval(() => {
    if (currentStep.value < 5) {
      refreshOrderStatus()
    } else {
      stopAutoRefresh()
    }
  }, 30000) // 每30秒刷新一次
}

function stopAutoRefresh() {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
    autoRefresh.value = false
  }
}

// 生命周期
onMounted(() => {
  orderNumber.value = route.query.orderNumber || 'ORD-12345'

  // 尝试从localStorage获取订单数据
  try {
    const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]')
    const currentOrder = orderHistory.find(order => order.orderNumber === orderNumber.value)

    if (currentOrder) {
      // 使用实际订单数据
      orderInfo.value = {
        orderTime: new Date(currentOrder.createdAt),
        diningType: currentOrder.diningType,
        customerName: currentOrder.customerInfo.name,
        customerPhone: currentOrder.customerInfo.phone,
        items: currentOrder.items.map(item => ({
          id: item.id,
          title: item.title,
          price: item.currentPrice,
          customizations: formatItemCustomizations(item.customizations)
        })),
        total: currentOrder.total
      }

      // 根据订单状态设置当前步骤
      setCurrentStepByStatus(currentOrder.status)
    } else {
      // 使用模拟数据作为后备
      loadMockOrderData()
    }
  } catch (error) {
    console.error('Failed to load order data:', error)
    loadMockOrderData()
  }

  // 计算预计时间
  estimatedTime.value = calculateEstimatedTime()

  // 开始自动刷新
  if (currentStep.value < 5) {
    startAutoRefresh()
  }
})

function loadMockOrderData() {
  // 模拟订单数据
  orderInfo.value = {
    orderTime: new Date(Date.now() - 15 * 60000),
    diningType: 'takeaway',
    customerName: 'John Doe',
    customerPhone: '(02) 9876 5432',
    items: [
      {
        id: 1,
        title: 'Margherita Pizza',
        price: 18.99,
        customizations: ''
      },
      {
        id: 2,
        title: 'Caesar Salad',
        price: 14.99,
        customizations: 'Extra chicken'
      }
    ],
    total: 33.98
  }
}

function formatItemCustomizations(customizations) {
  if (!customizations || customizations.length === 0) return ''

  return customizations.map(c => {
    if (c.type === 'quantity') {
      return `${c.ingredientName} ${c.change}`
    } else if (c.type === 'replacement') {
      return `${c.originalName} → ${c.replacementName}`
    }
    return c.toString()
  }).join(', ')
}

function setCurrentStepByStatus(status) {
  switch (status) {
    case 'pending':
      currentStep.value = 1
      break
    case 'paid':
      currentStep.value = 2
      statusHistory.value.paid = new Date(Date.now() - 10 * 60000)
      break
    case 'preparing':
      currentStep.value = 3
      statusHistory.value.paid = new Date(Date.now() - 12 * 60000)
      statusHistory.value.preparing = new Date(Date.now() - 8 * 60000)
      break
    case 'ready':
      currentStep.value = 4
      statusHistory.value.paid = new Date(Date.now() - 15 * 60000)
      statusHistory.value.preparing = new Date(Date.now() - 10 * 60000)
      statusHistory.value.ready = new Date(Date.now() - 2 * 60000)
      break
    case 'completed':
      currentStep.value = 5
      statusHistory.value.paid = new Date(Date.now() - 20 * 60000)
      statusHistory.value.preparing = new Date(Date.now() - 15 * 60000)
      statusHistory.value.ready = new Date(Date.now() - 5 * 60000)
      statusHistory.value.completed = new Date(Date.now() - 1 * 60000)
      break
    default:
      currentStep.value = 1
  }
}

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
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

/* 步骤器样式自定义 */
.q-stepper {
  box-shadow: none;
}

.q-stepper .q-step__header {
  padding: 12px 16px;
}

.q-stepper .q-step__content {
  padding: 0 16px 16px 48px;
}

/* 状态图标脉动动画 */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.q-icon {
  animation: pulse 2s infinite;
}

/* 按钮样式 */
.q-btn {
  font-weight: 500;
}

/* 自动刷新提示样式 */
.fixed-bottom-right {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 1000;
}

/* 响应式调整 */
@media (max-width: 600px) {
  .text-h4 {
    font-size: 1.5rem;
  }

  .text-h5 {
    font-size: 1.25rem;
  }

  .row.q-gutter-sm .col {
    min-width: 48%;
  }
}
</style>
