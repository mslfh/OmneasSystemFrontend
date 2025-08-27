<template>
  <q-page padding class="bg-grey-1">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <!-- 页面标题 -->
        <div class="text-h4 text-weight-bold text-grey-8 q-mb-lg">
          My Profile
        </div>

        <!-- 标签页 -->
        <q-tabs
          v-model="activeTab"
          dense
          class="text-primary q-mb-lg bg-white rounded-borders shadow-1"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="profile" label="Profile" icon="person" />
          <q-tab name="orders" label="Order History" icon="receipt_long" />
          <q-tab name="preferences" label="Preferences" icon="settings" />
        </q-tabs>

        <q-tab-panels v-model="activeTab" animated>
          <!-- 个人资料标签页 -->
          <q-tab-panel name="profile" class="q-pa-none">
            <q-card class="shadow-2 rounded-borders-lg">
              <q-card-section class="q-pa-lg">
                <div class="text-h6 q-mb-md">Personal Information</div>

                <div class="row q-gutter-md">
                  <div class="col-12 text-center q-mb-md">
                    <q-avatar size="100px" class="q-mb-sm">
                      <img v-if="profile.avatar" :src="profile.avatar" />
                      <q-icon v-else name="person" size="50px" />
                    </q-avatar>
                    <div>
                      <q-btn
                        flat
                        dense
                        color="primary"
                        icon="camera_alt"
                        label="Change Photo"
                        size="sm"
                        @click="changeAvatar"
                      />
                    </div>
                  </div>

                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="profile.firstName"
                      label="First Name *"
                      outlined
                      dense
                      :readonly="!editMode"
                      :rules="[val => !!val || 'First name is required']"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="profile.lastName"
                      label="Last Name *"
                      outlined
                      dense
                      :readonly="!editMode"
                      :rules="[val => !!val || 'Last name is required']"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="profile.email"
                      label="Email Address *"
                      type="email"
                      outlined
                      dense
                      :readonly="!editMode"
                      :rules="[val => !!val || 'Email is required']"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="profile.phone"
                      label="Phone Number *"
                      outlined
                      dense
                      :readonly="!editMode"
                      :rules="[val => !!val || 'Phone number is required']"
                    />
                  </div>
                  <div class="col-12">
                    <q-input
                      v-model="profile.address"
                      label="Address"
                      outlined
                      dense
                      :readonly="!editMode"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="profile.dateOfBirth"
                      label="Date of Birth"
                      type="date"
                      outlined
                      dense
                      :readonly="!editMode"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="profile.gender"
                      :options="genderOptions"
                      label="Gender"
                      outlined
                      dense
                      :readonly="!editMode"
                    />
                  </div>
                </div>

                <div class="row justify-end q-mt-lg q-gutter-sm">
                  <q-btn
                    v-if="!editMode"
                    color="primary"
                    label="Edit Profile"
                    icon="edit"
                    @click="toggleEditMode"
                  />
                  <template v-else>
                    <q-btn
                      color="grey-6"
                      outline
                      label="Cancel"
                      @click="cancelEdit"
                    />
                    <q-btn
                      color="primary"
                      label="Save Changes"
                      icon="save"
                      :loading="saving"
                      @click="saveProfile"
                    />
                  </template>
                </div>
              </q-card-section>
            </q-card>
          </q-tab-panel>

          <!-- 订单历史标签页 -->
          <q-tab-panel name="orders" class="q-pa-none">
            <div class="q-gutter-md">
              <!-- 订单筛选 -->
              <q-card flat bordered class="bg-blue-1">
                <q-card-section class="q-pa-md">
                  <div class="row items-center q-gutter-md">
                    <div class="col-auto">
                      <q-select
                        v-model="orderFilter.status"
                        :options="orderStatusOptions"
                        label="Status"
                        outlined
                        dense
                        clearable
                        style="min-width: 120px"
                      />
                    </div>
                    <div class="col-auto">
                      <q-select
                        v-model="orderFilter.period"
                        :options="orderPeriodOptions"
                        label="Period"
                        outlined
                        dense
                        style="min-width: 120px"
                      />
                    </div>
                    <div class="col">
                      <q-input
                        v-model="orderFilter.search"
                        label="Search orders..."
                        outlined
                        dense
                        clearable
                      >
                        <template v-slot:prepend>
                          <q-icon name="search" />
                        </template>
                      </q-input>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- 订单列表 -->
              <div v-if="filteredOrders.length === 0" class="text-center q-py-xl">
                <q-icon name="receipt_long" size="4rem" color="grey-4" class="q-mb-md" />
                <div class="text-h6 text-grey-6">No orders found</div>
                <div class="text-body2 text-grey-5">Your order history will appear here</div>
                <q-btn
                  color="primary"
                  label="Start Ordering"
                  icon="restaurant_menu"
                  class="q-mt-md"
                  @click="goToMenu"
                />
              </div>

              <q-card
                v-for="order in filteredOrders"
                :key="order.id"
                class="shadow-2 rounded-borders-lg"
              >
                <q-card-section class="q-pa-md">
                  <!-- 订单头部 -->
                  <div class="row items-center justify-between q-mb-md">
                    <div>
                      <div class="text-h6 text-weight-bold">{{ order.orderNumber }}</div>
                      <div class="text-caption text-grey-6">
                        {{ formatDateTime(order.createdAt) }}
                      </div>
                    </div>
                    <div class="text-right">
                      <q-chip
                        :color="getOrderStatusColor(order.status)"
                        text-color="white"
                        size="sm"
                        :label="order.status.toUpperCase()"
                      />
                      <div class="text-h6 text-weight-bold text-primary q-mt-xs">
                        ${{ order.total.toFixed(2) }}
                      </div>
                    </div>
                  </div>

                  <!-- 订单详情 -->
                  <div class="row items-center q-mb-md">
                    <q-icon
                      :name="order.type === 'takeaway' ? 'shopping_bag' : 'restaurant'"
                      class="q-mr-sm"
                      size="sm"
                    />
                    <span class="text-weight-medium">
                      {{ order.type === 'takeaway' ? 'Take Away' : 'Dine In' }}
                    </span>
                    <q-space />
                    <span class="text-body2 text-grey-6">
                      {{ order.items.length }} item{{ order.items.length > 1 ? 's' : '' }}
                    </span>
                  </div>

                  <!-- 订单项目预览 -->
                  <div class="text-body2 text-grey-7 q-mb-md">
                    {{ order.items.map(item => item.title).join(', ') }}
                  </div>

                  <!-- 操作按钮 -->
                  <div class="row q-gutter-sm">
                    <q-btn
                      flat
                      dense
                      color="primary"
                      icon="visibility"
                      label="View Details"
                      size="sm"
                      @click="viewOrderDetails(order)"
                    />
                    <q-btn
                      v-if="order.status === 'pending' || order.status === 'preparing'"
                      flat
                      dense
                      color="green"
                      icon="track_changes"
                      label="Track Order"
                      size="sm"
                      @click="trackOrder(order.orderNumber)"
                    />
                    <q-btn
                      flat
                      dense
                      color="orange"
                      icon="refresh"
                      label="Order Again"
                      size="sm"
                      @click="reorder(order)"
                    />
                  </div>
                </q-card-section>
              </q-card>

              <!-- 加载更多 -->
              <div v-if="hasMoreOrders" class="text-center q-mt-lg">
                <q-btn
                  color="primary"
                  outline
                  label="Load More Orders"
                  :loading="loadingMore"
                  @click="loadMoreOrders"
                />
              </div>
            </div>
          </q-tab-panel>

          <!-- 偏好设置标签页 -->
          <q-tab-panel name="preferences" class="q-pa-none">
            <div class="q-gutter-md">
              <!-- 通知设置 -->
              <q-card class="shadow-2 rounded-borders-lg">
                <q-card-section class="q-pa-md">
                  <div class="text-h6 q-mb-md">Notification Preferences</div>

                  <div class="q-gutter-md">
                    <q-toggle
                      v-model="preferences.notifications.email"
                      label="Email notifications for order updates"
                      color="primary"
                    />
                    <q-toggle
                      v-model="preferences.notifications.sms"
                      label="SMS notifications for order status"
                      color="primary"
                    />
                    <q-toggle
                      v-model="preferences.notifications.push"
                      label="Push notifications"
                      color="primary"
                    />
                    <q-toggle
                      v-model="preferences.notifications.marketing"
                      label="Marketing emails and promotions"
                      color="primary"
                    />
                  </div>
                </q-card-section>
              </q-card>

              <!-- 饮食偏好 -->
              <q-card class="shadow-2 rounded-borders-lg">
                <q-card-section class="q-pa-md">
                  <div class="text-h6 q-mb-md">Dietary Preferences</div>

                  <div class="row q-gutter-md">
                    <div class="col-12">
                      <q-option-group
                        v-model="preferences.dietary"
                        :options="dietaryOptions"
                        color="primary"
                        type="checkbox"
                      />
                    </div>
                    <div class="col-12">
                      <q-input
                        v-model="preferences.allergies"
                        label="Food Allergies"
                        type="textarea"
                        outlined
                        dense
                        rows="2"
                        hint="Please specify any food allergies or intolerances"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- 默认设置 -->
              <q-card class="shadow-2 rounded-borders-lg">
                <q-card-section class="q-pa-md">
                  <div class="text-h6 q-mb-md">Default Settings</div>

                  <div class="row q-gutter-md">
                    <div class="col-12 col-sm-6">
                      <q-select
                        v-model="preferences.defaultDiningType"
                        :options="diningTypeOptions"
                        label="Preferred Order Type"
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-12 col-sm-6">
                      <q-input
                        v-model="preferences.defaultPickupTime"
                        label="Preferred Pickup Time"
                        type="time"
                        outlined
                        dense
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- 保存按钮 -->
              <div class="text-center">
                <q-btn
                  color="primary"
                  size="lg"
                  label="Save Preferences"
                  icon="save"
                  :loading="savingPreferences"
                  @click="savePreferences"
                />
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>

    <!-- 订单详情对话框 -->
    <q-dialog v-model="showOrderDialog" persistent>
      <q-card style="min-width: 400px; max-width: 90vw" class="rounded-borders-lg">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Order Details</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="showOrderDialog = false" />
        </q-card-section>

        <q-card-section v-if="selectedOrder">
          <div class="q-gutter-md">
            <div>
              <div class="text-weight-bold">{{ selectedOrder.orderNumber }}</div>
              <div class="text-caption text-grey-6">
                {{ formatDateTime(selectedOrder.createdAt) }}
              </div>
            </div>

            <q-separator />

            <div>
              <div class="text-subtitle2">Items Ordered</div>
              <div class="q-gutter-sm q-mt-sm">
                <div
                  v-for="item in selectedOrder.items"
                  :key="item.id"
                  class="row items-center justify-between"
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

            <q-separator />

            <div class="row items-center justify-between">
              <div class="text-weight-bold">Total:</div>
              <div class="text-h6 text-weight-bold text-primary">
                ${{ selectedOrder.total.toFixed(2) }}
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Order Again"
            color="primary"
            @click="reorderFromDialog"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

// 响应式数据
const activeTab = ref('profile')
const editMode = ref(false)
const saving = ref(false)
const savingPreferences = ref(false)
const loadingMore = ref(false)
const hasMoreOrders = ref(true)
const showOrderDialog = ref(false)
const selectedOrder = ref(null)

const profile = ref({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@email.com',
  phone: '(02) 9876 5432',
  address: '123 Main Street, Sydney NSW 2000',
  dateOfBirth: '1990-01-01',
  gender: 'Male',
  avatar: null
})

const profileBackup = ref({})

const orderFilter = ref({
  status: null,
  period: 'All time',
  search: ''
})

const preferences = ref({
  notifications: {
    email: true,
    sms: true,
    push: false,
    marketing: false
  },
  dietary: [],
  allergies: '',
  defaultDiningType: 'takeaway',
  defaultPickupTime: '18:00'
})

const orders = ref([])

// 选项数据
const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say']

const orderStatusOptions = [
  'All',
  { label: 'Pending', value: 'pending' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Ready', value: 'ready' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' }
]

const orderPeriodOptions = [
  'All time',
  'Last 30 days',
  'Last 3 months',
  'Last 6 months',
  'This year'
]

const dietaryOptions = [
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Gluten-free', value: 'gluten-free' },
  { label: 'Dairy-free', value: 'dairy-free' },
  { label: 'Low-carb', value: 'low-carb' },
  { label: 'Halal', value: 'halal' },
  { label: 'Kosher', value: 'kosher' }
]

const diningTypeOptions = [
  { label: 'Take Away', value: 'takeaway' },
  { label: 'Dine In', value: 'dinein' }
]

// 计算属性
const filteredOrders = computed(() => {
  let filtered = orders.value

  // 状态筛选
  if (orderFilter.value.status && orderFilter.value.status !== 'All') {
    filtered = filtered.filter(order => order.status === orderFilter.value.status)
  }

  // 搜索筛选
  if (orderFilter.value.search) {
    const search = orderFilter.value.search.toLowerCase()
    filtered = filtered.filter(order =>
      order.orderNumber.toLowerCase().includes(search) ||
      order.items.some(item => item.title.toLowerCase().includes(search))
    )
  }

  // 时间筛选（这里可以根据需要实现）

  return filtered
})

// 方法
function toggleEditMode() {
  editMode.value = true
  profileBackup.value = { ...profile.value }
}

function cancelEdit() {
  editMode.value = false
  profile.value = { ...profileBackup.value }
}

async function saveProfile() {
  saving.value = true

  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 保存到localStorage
    const customerData = {
      name: `${profile.value.firstName} ${profile.value.lastName}`.trim(),
      phone: profile.value.phone,
      email: profile.value.email,
      address: profile.value.address,
      dateOfBirth: profile.value.dateOfBirth,
      gender: profile.value.gender,
      lastUpdated: new Date().toISOString()
    }
    localStorage.setItem('customerInfo', JSON.stringify(customerData))

    editMode.value = false
    $q.notify({
      type: 'positive',
      message: 'Profile updated successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to save profile:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to update profile. Please try again.',
      position: 'top'
    })
  } finally {
    saving.value = false
  }
}

function changeAvatar() {
  $q.notify({
    type: 'info',
    message: 'Photo upload feature coming soon',
    position: 'top'
  })
}

async function savePreferences() {
  savingPreferences.value = true

  try {
    // 这里应该调用API保存偏好设置
    await new Promise(resolve => setTimeout(resolve, 1000))

    $q.notify({
      type: 'positive',
      message: 'Preferences saved successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to save preferences:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to save preferences. Please try again.',
      position: 'top'
    })
  } finally {
    savingPreferences.value = false
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

function getOrderStatusColor(status) {
  switch (status) {
    case 'pending': return 'orange'
    case 'preparing': return 'blue'
    case 'ready': return 'purple'
    case 'completed': return 'green'
    case 'cancelled': return 'red'
    default: return 'grey'
  }
}

function viewOrderDetails(order) {
  selectedOrder.value = order
  showOrderDialog.value = true
}

function trackOrder(orderNumber) {
  router.push({
    path: '/customer/order-tracking',
    query: { orderNumber }
  })
}

function reorder(order) {
  // 将订单项目转换为购物车格式并保存到sessionStorage
  const cartData = {
    diningType: order.type,
    items: order.items.map(item => ({
      id: item.id,
      title: item.title,
      price: item.price,
      currentPrice: item.price,
      customizations: []
    })),
    total: order.total
  }

  sessionStorage.setItem('pendingOrder', JSON.stringify(cartData))

  $q.notify({
    type: 'positive',
    message: 'Items added to cart!',
    position: 'top'
  })
  router.push('/customer/order')
}

function reorderFromDialog() {
  if (selectedOrder.value) {
    reorder(selectedOrder.value)
    showOrderDialog.value = false
  }
}

function goToMenu() {
  router.push('/customer/order')
}

async function loadMoreOrders() {
  loadingMore.value = true

  try {
    // 模拟加载更多订单
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 这里应该从API获取更多订单
    hasMoreOrders.value = false // 模拟没有更多订单
  } catch (error) {
    console.error('Failed to load more orders:', error)
  } finally {
    loadingMore.value = false
  }
}

// 生命周期
onMounted(() => {
  // 检查路由参数设置默认标签页
  if (route.query.tab) {
    activeTab.value = route.query.tab
  }

  // 从localStorage加载客户信息
  loadCustomerInfo()

  // 从localStorage加载订单历史
  loadOrderHistory()
})

function loadCustomerInfo() {
  try {
    const saved = localStorage.getItem('customerInfo')
    if (saved) {
      const customerData = JSON.parse(saved)
      profile.value.firstName = customerData.name ? customerData.name.split(' ')[0] : ''
      profile.value.lastName = customerData.name ? customerData.name.split(' ').slice(1).join(' ') : ''
      profile.value.phone = customerData.phone || ''
    }
  } catch (error) {
    console.error('Failed to load customer info:', error)
  }
}

function loadOrderHistory() {
  try {
    const orderHistory = localStorage.getItem('orderHistory')
    if (orderHistory) {
      const historyData = JSON.parse(orderHistory)
      orders.value = historyData.map(order => ({
        id: order.orderNumber,
        orderNumber: order.orderNumber,
        createdAt: new Date(order.createdAt),
        status: order.status,
        type: order.diningType,
        total: order.total,
        items: order.items.map(item => ({
          id: item.id,
          title: item.title,
          price: item.currentPrice,
          customizations: formatItemCustomizations(item.customizations)
        }))
      }))
    }
  } catch (error) {
    console.error('Failed to load order history:', error)
    // 如果加载失败，使用空数组
    orders.value = []
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
</script>

<style scoped>
.rounded-borders-lg {
  border-radius: 12px;
}

.shadow-2 {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.shadow-1 {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

/* 标签页样式 */
.q-tabs {
  border-radius: 8px;
}

.q-tab-panels {
  background: transparent;
}

/* 头像样式 */
.q-avatar {
  border: 2px solid #e0e0e0;
}

/* 订单卡片悬停效果 */
.q-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.q-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* 按钮样式 */
.q-btn {
  font-weight: 500;
}

/* 表单字段样式 */
.q-field {
  margin-bottom: 0;
}

/* 响应式调整 */
@media (max-width: 600px) {
  .text-h4 {
    font-size: 1.5rem;
  }

  .q-tabs {
    flex-direction: column;
  }

  .q-tab {
    min-height: 40px;
  }
}
</style>
