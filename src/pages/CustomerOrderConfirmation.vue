<template>
  <q-page padding class="bg-grey-1">
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <!-- 成功图标和标题 -->
        <div class="text-center q-mb-lg">
          <q-icon
            name="check_circle"
            size="5rem"
            :color="orderStatus === 'paid' ? 'green' : 'orange'"
            class="q-mb-md"
          />
          <div class="text-h4 text-weight-bold text-grey-8 q-mb-sm">
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
              <q-chip
                :color="getStatusColor()"
                text-color="white"
                :label="orderStatus.toUpperCase()"
                size="sm"
              />
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
            <div class="q-mb-md" v-if="estimatedTime">
              <div class="text-caption text-grey-6">
                {{ orderInfo.diningType === 'takeaway' ? 'Estimated Pickup Time' : 'Estimated Ready Time' }}
              </div>
              <div class="text-h6 text-primary text-weight-bold">
                {{ estimatedTime }}
              </div>
            </div>

            <q-separator class="q-my-md" />

            <!-- 就餐方式 -->
            <div class="row items-center q-mb-md">
              <q-icon
                :name="orderInfo.diningType === 'takeaway' ? 'shopping_bag' : 'restaurant'"
                color="primary"
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
              <div class="text-h6 text-weight-bold text-primary">
                ${{ orderInfo.total.toFixed(2) }}
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 下一步操作 -->
        <div class="q-gutter-md">
          <!-- 跟踪订单按钮 -->
          <q-btn
            color="primary"
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
            color="primary"
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
                color="primary"
                icon="phone"
                label="Call Us"
                size="sm"
                @click="callRestaurant"
              />
              <q-btn
                flat
                dense
                color="primary"
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

    <!-- SMS/Email 通知对话框 -->
    <q-dialog v-model="showNotificationDialog">
      <q-card class="q-pa-md" style="min-width: 300px">
        <q-card-section class="q-pb-none">
          <div class="text-h6">Order Notifications</div>
        </q-card-section>

        <q-card-section>
          <div class="text-body2 q-mb-md">
            Get updates about your order status
          </div>

          <q-toggle
            v-model="notifications.sms"
            label="SMS notifications"
            color="primary"
          />
          <q-toggle
            v-model="notifications.email"
            label="Email notifications"
            color="primary"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Skip" v-close-popup />
          <q-btn color="primary" label="Save" @click="saveNotificationSettings" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

// 响应式数据
const orderNumber = ref('')
const orderStatus = ref('pending')
const orderTime = ref(new Date())
const estimatedTime = ref('')
const showNotificationDialog = ref(false)

const notifications = ref({
  sms: true,
  email: false
})

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
      return 'Order Confirmed!'
    case 'pending':
      return 'Order Received!'
    case 'preparing':
      return 'Order Being Prepared!'
    default:
      return 'Order Placed!'
  }
}

function getStatusMessage() {
  switch (orderStatus.value) {
    case 'paid':
      return 'Your payment has been processed and your order is being prepared.'
    case 'pending':
      return 'We\'ve received your order. Please pay when you collect your food or at the counter.'
    case 'preparing':
      return 'Your order is being freshly prepared by our kitchen team.'
    default:
      return 'Your order has been placed successfully.'
  }
}

function getStatusColor() {
  switch (orderStatus.value) {
    case 'paid':
      return 'green'
    case 'pending':
      return 'orange'
    case 'preparing':
      return 'blue'
    case 'ready':
      return 'purple'
    default:
      return 'grey'
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
  router.push({
    path: '/order-tracking',
    query: { orderNumber: orderNumber.value }
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

function saveNotificationSettings() {
  // 保存通知设置
  console.log('Notification settings:', notifications.value)
  $q.notify({
    type: 'positive',
    message: 'Notification preferences saved',
    position: 'top'
  })
  showNotificationDialog.value = false
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

// 生命周期
onMounted(() => {
  // 从路由参数获取订单信息
  orderNumber.value = route.query.orderNumber || 'ORD-12345'
  orderStatus.value = route.query.status || 'pending'

  // 尝试从localStorage获取最新订单数据
  try {
    const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]')
    const currentOrder = orderHistory.find(order => order.orderNumber === orderNumber.value)

    if (currentOrder) {
      // 使用实际订单数据
      orderInfo.value = {
        diningType: currentOrder.diningType,
        items: currentOrder.items,
        total: currentOrder.total
      }

      customerInfo.value = {
        name: currentOrder.customerInfo.name,
        phone: currentOrder.customerInfo.phone,
        tableNumber: currentOrder.customerInfo.tableNumber,
        notes: currentOrder.customerInfo.notes
      }

      orderTime.value = new Date(currentOrder.createdAt)
    } else {
      // 使用模拟数据作为后备
      loadMockData()
    }
  } catch (error) {
    console.error('Failed to load order data:', error)
    loadMockData()
  }

  // 计算预计时间
  estimatedTime.value = calculateEstimatedTime()

  // 2秒后显示通知设置对话框（如果需要）
  setTimeout(() => {
    if (orderStatus.value === 'pending') {
      showNotificationDialog.value = true
    }
  }, 2000)
})

function loadMockData() {
  // 模拟订单数据（作为后备）
  orderInfo.value = {
    diningType: 'takeaway',
    items: [
      {
        id: 1,
        title: 'Margherita Pizza',
        currentPrice: 18.99,
        customizations: []
      },
      {
        id: 2,
        title: 'Caesar Salad',
        currentPrice: 14.99,
        customizations: [
          { type: 'quantity', ingredientName: 'Chicken', change: '+1', priceChange: 4.00 }
        ]
      }
    ],
    total: 33.98
  }

  customerInfo.value = {
    name: 'John Doe',
    phone: '(02) 9876 5432',
    tableNumber: '',
    notes: 'No onions please'
  }
}
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
