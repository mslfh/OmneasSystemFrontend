<template>
  <q-page padding class="bg-grey-1">
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <!-- 成功图标和标题 -->
        <div class="text-center q-mb-lg">
          <q-icon
            name="check_circle"
            size="5rem"
            :color="getIconColor()"
            class="q-mb-md"
          />
          <div class="text-h4 text-weight-bold text-grey-7 q-mb-sm">
            {{ getStatusTitle() }}
          </div>
          <div class="text-body1 text-grey-6">
            {{ getStatusMessage() }}
          </div>
        </div>

        <!-- 订单信息卡片 -->
        <q-card class="q-mb-lg shadow-2 rounded-borders-lg">
          <q-card-section class="q-pa-md bg-deep-orange text-white">
            <div class="row items-center justify-between">
              <div class="text-h6">Order Details</div>
              <div class="row items-center q-gutter-sm">
                <q-spinner-dots
                  v-if="loading"
                  color="white"
                  size="1.2em"
                />
                <q-chip
                  :color="getStatusColor()"
                  text-color="white"
                  :label="orderStatus.toUpperCase()"
                  size="sm"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-pa-md">
            <!-- 订单号和时间 -->
            <div class="row q-gutter-md q-mb-md">
              <div class="col">
                <div class="text-caption text-grey-6">Order Number</div>
                <div class="text-h6 text-weight-bold">{{ orderNumber }}</div>
              </div>
              <div class="col">
                <div class="text-caption text-grey-6">Order Time</div>
                <div class="text-body1">{{ formatDateTime(orderTime) }}</div>
              </div>
            </div>

            <!-- 预计时间 -->
            <div class="q-mb-md" v-if="estimatedTime" hidden>
              <div class="text-caption text-grey-6">
                {{ orderInfo.diningType === 'takeaway' ? 'Estimated Pickup Time' : 'Estimated Ready Time' }}
              </div>
              <div class="text-h6 text-orange text-weight-bold">
                {{ estimatedTime }}
              </div>
            </div>

            <q-separator class="q-my-md" />

            <!-- 就餐方式 -->
            <div class="row items-center q-mb-md">
              <q-icon
                :name="orderInfo.diningType === 'takeaway' ? 'shopping_bag' : 'restaurant'"
                color="deep-orange"
                size="sm"
                class="q-mr-sm"
              />
              <span class="text-weight-medium">
                {{ orderInfo.diningType === 'takeaway' ? 'Take Away' : 'Dine In' }}
              </span>
              <q-space />
              <div v-if="orderInfo.diningType === 'dinein' && customerInfo.tableNumber">
                <q-chip color="blue" text-color="white" size="sm">
                  Table {{ customerInfo.tableNumber }}
                </q-chip>
              </div>
            </div>

            <!-- 客户信息 -->
            <div class="q-mb-md">
              <div class="text-caption text-grey-6">Customer</div>
              <div class="text-body1">{{ customerInfo.name }}</div>
              <div class="text-body2 text-grey-6">{{ customerInfo.phone }}</div>
              <div v-if="customerInfo.notes" class="text-body2 text-grey-6 q-mt-xs">
                <strong>Notes:</strong> {{ customerInfo.notes }}
              </div>
            </div>

            <q-separator class="q-my-md" />

            <!-- 订单项目 -->
            <div class="q-mb-md">
              <div class="text-caption text-grey-6 q-mb-sm">Items Ordered</div>
              <div class="q-gutter-sm">
                <div
                  v-for="item in orderInfo.items"
                  :key="item.id"
                  class="row items-center justify-between q-py-sm"
                >
                  <div class="col">
                    <div class="text-weight-medium">{{ item.title }}</div>
                    <div class="text-caption text-grey-6" v-if="item.customizations.length > 0">
                      {{ formatCustomizations(item.customizations) }}
                    </div>
                  </div>
                  <div class="col-auto text-weight-bold">
                    ${{ item.currentPrice.toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <!-- 总价 -->
            <div class="row items-center justify-between">
              <div class="text-h6 text-weight-bold">Total Paid:</div>
              <div class="text-h6 text-weight-bold text-orange">
                ${{ orderInfo.total.toFixed(2) }}
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 下一步操作 -->
        <div class="q-gutter-md">
          <!-- 跟踪订单按钮 -->
          <q-btn
            color="deep-orange"
            size="lg"
            label="Track Your Order"
            icon="track_changes"
            class="full-width"
            @click="trackOrder"
          />

          <!-- 其他操作 -->
          <div class="row q-gutter-sm">
            <q-btn
              color="grey-6"
              outline
              size="md"
              label="Order History"
              icon="history"
              class="col"
              @click="viewOrderHistory"
            />
            <q-btn
              color="green"
              outline
              size="md"
              label="Order Again"
              icon="refresh"
              class="col"
              @click="orderAgain"
            />
          </div>

          <!-- 回到首页 -->
          <q-btn
            flat
            color="deep-orange"
            size="md"
            label="Back to Menu"
            icon="restaurant_menu"
            class="full-width"
            @click="backToMenu"
          />
        </div>

        <!-- 联系信息 -->
        <q-card flat bordered class="q-mt-lg bg-blue-1">
          <q-card-section class="q-pa-md text-center">
            <div class="text-body2 text-grey-8 q-mb-sm">
              Need help with your order?
            </div>
            <div class="row justify-center q-gutter-sm">
              <q-btn
                flat
                dense
                color="deep-orange"
                icon="phone"
                label="Call Us"
                size="sm"
                @click="callRestaurant"
              />
              <q-btn
                flat
                dense
                color="deep-orange"
                icon="chat"
                label="Chat Support"
                size="sm"
                @click="openChat"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import axios from 'axios'

const VITE_API_URL = import.meta.env.VITE_API_URL

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

// 响应式数据
const orderNumber = ref('')
const orderStatus = ref('pending')
const orderTime = ref(new Date())
const estimatedTime = ref('')
const orderId = ref('')
const loading = ref(false)
const statusUpdateInterval = ref(null)

const orderInfo = ref({
  diningType: 'takeaway',
  items: [],
  total: 0
})

const customerInfo = ref({
  name: '',
  phone: '',
  tableNumber: '',
  notes: ''
})

// 方法
function getStatusTitle() {
  switch (orderStatus.value) {
    case 'paid':
    case 'confirmed':
      return 'Order Confirmed!'
    case 'pending':
      return 'Order Received!'
    case 'preparing':
    case 'in_progress':
      return 'Order Being Prepared!'
    case 'ready':
    case 'completed':
      return 'Order Ready!'
    case 'cancelled':
      return 'Order Cancelled'
    default:
      return 'Order Placed!'
  }
}

function getStatusMessage() {
  switch (orderStatus.value) {
    case 'paid':
    case 'confirmed':
      return 'Your payment has been processed and your order is being prepared.'
    case 'pending':
      return 'We\'ve received your order. Please pay when you collect your food or at the counter.'
    case 'preparing':
    case 'in_progress':
      return 'Your order is being freshly prepared by our kitchen team.'
    case 'ready':
    case 'completed':
      return orderInfo.value.diningType === 'takeaway'
        ? 'Your order is ready for pickup!'
        : 'Your order is ready and will be served shortly.'
    case 'cancelled':
      return 'Your order has been cancelled. Please contact us if you need assistance.'
    default:
      return 'Your order has been placed successfully.'
  }
}

function getStatusColor() {
  switch (orderStatus.value) {
    case 'paid':
    case 'confirmed':
      return 'green'
    case 'pending':
      return 'orange'
    case 'preparing':
    case 'in_progress':
      return 'blue'
    case 'ready':
    case 'completed':
      return 'purple'
    case 'cancelled':
      return 'red'
    default:
      return 'grey'
  }
}

function getIconColor() {
  switch (orderStatus.value) {
    case 'paid':
    case 'confirmed':
    case 'ready':
    case 'completed':
      return 'green'
    case 'preparing':
    case 'in_progress':
      return 'blue'
    case 'cancelled':
      return 'red'
    case 'pending':
    default:
      return 'orange'
  }
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

function formatCustomizations(customizations) {
  return customizations.map(c => {
    if (c.type === 'quantity') {
      return `${c.ingredientName} ${c.change}`
    } else if (c.type === 'replacement') {
      return `${c.originalName} → ${c.replacementName}`
    }
    return c.toString()
  }).join(', ')
}

function trackOrder() {
  const query = { orderNumber: orderNumber.value }
  if (orderId.value) {
    query.orderId = orderId.value
  }

  router.push({
    path: '/order-tracking',
    query: query
  })
}

function viewOrderHistory() {
  router.push('/profile?tab=orders')
}

function orderAgain() {
  // 将当前订单项目添加到购物车并返回菜单
  $q.notify({
    type: 'positive',
    message: 'Items added to cart!',
    position: 'top'
  })
  router.push('/')
}

function backToMenu() {
  router.push('/')
}

function callRestaurant() {
  // 这里可以打开电话应用或显示电话号码
  $q.notify({
    type: 'info',
    message: 'Restaurant: (02) 1234 5678',
    position: 'top',
    actions: [
      {
        icon: 'close',
        color: 'white'
      }
    ]
  })
}

function openChat() {
  // 这里可以打开聊天支持
  $q.notify({
    type: 'info',
    message: 'Chat support will be available soon',
    position: 'top'
  })
}


function calculateEstimatedTime() {
  const now = new Date()
  const prepTime = orderInfo.value.diningType === 'takeaway' ? 20 : 15 // 分钟
  now.setMinutes(now.getMinutes() + prepTime)

  return now.toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

// API调用函数
async function fetchOrderDetails(orderIdValue) {
  if (!orderIdValue) {
    console.warn('No order ID provided for API call')
    return null
  }

  try {
    loading.value = true
    const response = await axios.get(`${VITE_API_URL}/api/order-details/${orderIdValue}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (response.status === 200 && response.data) {
      return response.data
    }
    return null
  } catch (error) {
    console.error('Failed to fetch order details:', error)

    // 只在网络错误或服务器错误时显示通知，404等可能是正常情况
    if (error.response?.status !== 404) {
      $q.notify({
        type: 'warning',
        message: 'Unable to fetch latest order status. Showing cached data.',
        position: 'top',
        timeout: 3000
      })
    }
    return null
  } finally {
    loading.value = false
  }
}

// 更新订单状态
function updateOrderStatus(apiData) {
  if (!apiData) return

  // 更新状态
  if (apiData.status) {
    orderStatus.value = apiData.status
  }

  // 更新订单信息
  if (apiData.order_no || apiData.order_number) {
    orderNumber.value = apiData.order_no || apiData.order_number
  }

  // 更新订单时间
  if (apiData.created_at || apiData.createdAt) {
    orderTime.value = new Date(apiData.created_at || apiData.createdAt)
  }

  // 更新预计时间
  if (apiData.estimated_ready_time) {
    estimatedTime.value = new Date(apiData.estimated_ready_time).toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } else {
    estimatedTime.value = calculateEstimatedTime()
  }

  // 更新客户信息
  if (apiData.customer_info || apiData.customerInfo) {
    const customerData = apiData.customer_info || apiData.customerInfo
    if (customerData.name) customerInfo.value.name = customerData.name
    if (customerData.phone) customerInfo.value.phone = customerData.phone
    if (customerData.table_number) customerInfo.value.tableNumber = customerData.table_number
    if (customerData.notes) customerInfo.value.notes = customerData.notes
  }

  // 更新订单信息
  if (apiData.dining_type || apiData.diningType) {
    orderInfo.value.diningType = apiData.dining_type || apiData.diningType
  }
  if (apiData.total) {
    orderInfo.value.total = apiData.total
  }
  if (apiData.items && Array.isArray(apiData.items)) {
    orderInfo.value.items = apiData.items
  }
}

// 从本地缓存加载订单数据
function loadOrderFromCache() {
  try {
    // 首先尝试从orderHistory加载最新订单
    const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]')

    if (orderHistory.length > 0) {
      const latestOrder = orderHistory[0] // 最新的订单应该在数组的开头
      console.log('Found order history in cache:', latestOrder)
      // 设置基本信息
      orderNumber.value = latestOrder.orderNumber
      orderStatus.value = latestOrder.status
      orderId.value = latestOrder.id

      // 设置订单信息
      orderInfo.value = {
        diningType: latestOrder.diningType || 'takeaway',
        items: latestOrder.items || [],
        total: latestOrder.total || 0
      }

      // 设置客户信息
      customerInfo.value = {
        name: latestOrder.customerInfo?.name || '',
        phone: latestOrder.customerInfo?.phone || '',
        tableNumber: latestOrder.customerInfo?.tableNumber || '',
        notes: latestOrder.customerInfo?.notes || ''
      }

      // 设置订单时间
      orderTime.value = latestOrder.createdAt ? new Date(latestOrder.createdAt) : new Date()

      console.log('Loaded order from cache:', {
        orderNumber: orderNumber.value,
        orderId: orderId.value,
        status: orderStatus.value
      })

      return true
    }
    return false
  } catch (error) {
    console.error('Failed to load order from cache:', error)
    return false
  }
}

// 设置状态更新定时器
function setupStatusUpdates() {
  if (!orderId.value) {
    console.log('No order ID available, skipping status updates')
    return
  }

  // 立即获取一次最新状态
  fetchOrderDetails(orderId.value).then(apiData => {
    if (apiData) {
      updateOrderStatus(apiData)
    }
  })

  // 设置定时更新 - 每30秒检查一次状态
  statusUpdateInterval.value = setInterval(async () => {
    const apiData = await fetchOrderDetails(orderId.value)
    if (apiData) {
      updateOrderStatus(apiData)
    }
  }, 30000) // 30秒
}

// 清理定时器
function clearStatusUpdates() {
  if (statusUpdateInterval.value) {
    clearInterval(statusUpdateInterval.value)
    statusUpdateInterval.value = null
  }
}

// 生命周期
onMounted(() => {

  // 首先从本地缓存加载订单数据
  const cacheLoaded = loadOrderFromCache()

  if (!cacheLoaded) {
    // 如果缓存中没有数据，尝试从路由参数获取
    orderNumber.value = route.query.orderNumber || 'ORD-12345'
    orderStatus.value = route.query.status || 'pending'
    orderId.value = route.query.orderId || ''
  }

  // 计算预计时间（如果没有从API获取到）
  if (!estimatedTime.value) {
    estimatedTime.value = calculateEstimatedTime()
  }

  // 设置状态更新定时器
  setupStatusUpdates()
})

onUnmounted(() => {
  // 清理定时器
  clearStatusUpdates()
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

/* 状态图标动画 */
@keyframes checkmarkAnimation {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.q-icon {
  animation: checkmarkAnimation 0.6s ease-out;
}

/* 按钮样式 */
.q-btn {
  font-weight: 500;
}

/* 卡片悬停效果 */
.q-card {
  transition: transform 0.2s ease;
}

.q-card:hover {
  transform: translateY(-2px);
}

/* 响应式调整 */
@media (max-width: 600px) {
  .text-h4 {
    font-size: 1.5rem;
  }

  .row.q-gutter-sm .col {
    min-width: 48%;
  }
}
</style>
