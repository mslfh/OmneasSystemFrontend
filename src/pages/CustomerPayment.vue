<template>
  <q-page padding class="bg-grey-1">
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <!-- 页面标题 -->
        <div class="text-h4 text-weight-bold text-grey-8 q-mb-lg text-center">
          Payment
        </div>

        <!-- 订单摘要 -->
        <q-card class="q-mb-lg shadow-2 rounded-borders-lg">
          <q-card-section class="q-pa-md bg-primary text-white">
            <div class="text-h6">Order Summary</div>
          </q-card-section>

          <q-card-section class="q-pa-md">
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
            </div>

            <!-- 订单项目 -->
            <div class="q-gutter-sm">
              <div
                v-for="item in orderInfo.items"
                :key="item.id"
                class="row items-center justify-between"
              >
                <div class="col">
                  <div class="text-weight-medium">{{ item.title }}</div>
                  <div class="text-caption text-grey-6" v-if="item.customizations.length > 0">
                    {{ formatCustomizations(item.customizations) }}
                  </div>
                </div>
                <div class="col-auto">
                  <span class="text-weight-bold">${{ item.currentPrice.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <!-- 总价 -->
            <div class="row items-center justify-between">
              <div class="text-h6 text-weight-bold">Total:</div>
              <div class="text-h6 text-weight-bold text-primary">
                ${{ orderInfo.total.toFixed(2) }}
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 客户信息 -->
        <q-card class="q-mb-lg shadow-2 rounded-borders-lg">
          <q-card-section class="q-pa-md">
            <div class="text-h6 q-mb-md">Contact Information</div>

            <div class="row q-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="customerInfo.name"
                  label="Full Name *"
                  outlined
                  dense
                  :rules="[val => !!val || 'Name is required']"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="customerInfo.phone"
                  label="Phone Number *"
                  outlined
                  dense
                  :rules="[val => !!val || 'Phone number is required']"
                />
              </div>
              <div class="col-12" v-if="orderInfo.diningType === 'takeaway'">
                <q-input
                  v-model="customerInfo.pickupTime"
                  label="Preferred Pickup Time"
                  outlined
                  dense
                  type="time"
                />
              </div>
              <div class="col-12" v-if="orderInfo.diningType === 'dinein'">
                <q-input
                  v-model="customerInfo.tableNumber"
                  label="Table Number"
                  outlined
                  dense
                  type="number"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="customerInfo.notes"
                  label="Special Instructions"
                  outlined
                  dense
                  type="textarea"
                  rows="2"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 支付方式 -->
        <q-card class="q-mb-lg shadow-2 rounded-borders-lg">
          <q-card-section class="q-pa-md">
            <div class="text-h6 q-mb-md">Payment Method</div>

            <q-option-group
              v-model="selectedPaymentMethod"
              :options="paymentMethods"
              color="primary"
              type="radio"
            >
              <template v-slot:label="opt">
                <div class="row items-center">
                  <q-icon :name="opt.icon" class="q-mr-sm" />
                  <div>
                    <div class="text-weight-medium">{{ opt.label }}</div>
                    <div class="text-caption text-grey-6">{{ opt.description }}</div>
                  </div>
                </div>
              </template>
            </q-option-group>
          </q-card-section>
        </q-card>

        <!-- 支付详情 -->
        <q-card v-if="selectedPaymentMethod === 'card'" class="q-mb-lg shadow-2 rounded-borders-lg">
          <q-card-section class="q-pa-md">
            <div class="text-h6 q-mb-md">Card Details</div>

            <div class="row q-gutter-md">
              <div class="col-12">
                <q-input
                  v-model="cardDetails.number"
                  label="Card Number"
                  outlined
                  dense
                  mask="#### #### #### ####"
                  placeholder="1234 5678 9012 3456"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="cardDetails.expiry"
                  label="Expiry Date"
                  outlined
                  dense
                  mask="##/##"
                  placeholder="MM/YY"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="cardDetails.cvv"
                  label="CVV"
                  outlined
                  dense
                  mask="###"
                  type="password"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="cardDetails.name"
                  label="Cardholder Name"
                  outlined
                  dense
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 操作按钮 -->
        <div class="row q-gutter-md">
          <q-btn
            class="col"
            color="grey-6"
            outline
            size="lg"
            label="Back to Cart"
            icon="arrow_back"
            @click="goBack"
          />
          <q-btn
            class="col"
            color="primary"
            size="lg"
            label="Place Order"
            icon="payment"
            :loading="processing"
            :disable="!isFormValid"
            @click="processPayment"
          />
        </div>
      </div>
    </div>

    <!-- 处理中对话框 -->
    <q-dialog v-model="showProcessingDialog" persistent>
      <q-card class="q-pa-lg text-center" style="min-width: 300px">
        <q-spinner-hourglass size="50px" color="primary" class="q-mb-md" />
        <div class="text-h6 q-mb-sm">Processing Payment</div>
        <div class="text-body2 text-grey-6">Please wait while we process your order...</div>
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
const processing = ref(false)
const showProcessingDialog = ref(false)
const selectedPaymentMethod = ref('card')

const customerInfo = ref({
  name: '',
  phone: '',
  pickupTime: '',
  tableNumber: '',
  notes: ''
})

const cardDetails = ref({
  number: '',
  expiry: '',
  cvv: '',
  name: ''
})

const orderInfo = ref({
  diningType: 'takeaway', // 从上一页传递过来
  items: [],
  total: 0
})

// 支付方式选项
const paymentMethods = ref([
  {
    label: 'Credit/Debit Card',
    value: 'card',
    icon: 'credit_card',
    description: 'Pay securely with your card'
  },
  {
    label: 'Cash on Pickup',
    value: 'cash',
    icon: 'payments',
    description: 'Pay when you collect your order'
  },
  {
    label: 'Pay at Counter',
    value: 'counter',
    icon: 'store',
    description: 'Pay at the restaurant counter'
  }
])

// 计算属性
const isFormValid = computed(() => {
  const hasCustomerInfo = customerInfo.value.name && customerInfo.value.phone

  if (selectedPaymentMethod.value === 'card') {
    return hasCustomerInfo &&
           cardDetails.value.number &&
           cardDetails.value.expiry &&
           cardDetails.value.cvv &&
           cardDetails.value.name
  }

  return hasCustomerInfo
})

// 方法
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

function goBack() {
  router.go(-1)
}

async function processPayment() {
  if (!isFormValid.value) {
    $q.notify({
      type: 'negative',
      message: 'Please fill in all required fields',
      position: 'top'
    })
    return
  }

  processing.value = true
  showProcessingDialog.value = true

  try {
    // 模拟支付处理
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 创建订单数据
    const orderData = {
      customerInfo: customerInfo.value,
      paymentMethod: selectedPaymentMethod.value,
      paymentDetails: selectedPaymentMethod.value === 'card' ? cardDetails.value : null,
      orderInfo: orderInfo.value,
      orderNumber: generateOrderNumber(),
      status: selectedPaymentMethod.value === 'card' ? 'paid' : 'pending',
      createdAt: new Date().toISOString()
    }

    // 这里应该调用API保存订单
    console.log('Order placed:', orderData)

    // 跳转到订单确认页面
    router.push({
      path: '/customer/order-confirmation',
      query: {
        orderNumber: orderData.orderNumber,
        status: orderData.status
      }
    })

  } catch (error) {
    console.error('Payment failed:', error)
    $q.notify({
      type: 'negative',
      message: 'Payment failed. Please try again.',
      position: 'top'
    })
  } finally {
    processing.value = false
    showProcessingDialog.value = false
  }
}

function generateOrderNumber() {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `ORD-${timestamp}-${random}`
}

// 生命周期
onMounted(() => {
  // 这里应该从路由参数或状态管理中获取订单信息
  // 模拟订单数据
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

  // 设置默认取餐时间为1小时后
  const now = new Date()
  now.setHours(now.getHours() + 1)
  customerInfo.value.pickupTime = now.toTimeString().slice(0, 5)
})
</script>

<style scoped>
.rounded-borders-lg {
  border-radius: 12px;
}

.shadow-2 {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 支付方式选项样式 */
.q-radio {
  width: 100%;
}

.q-radio .q-radio__inner {
  font-size: 16px;
}

/* 表单样式优化 */
.q-field {
  margin-bottom: 0;
}

/* 按钮样式 */
.q-btn {
  font-weight: 500;
}

/* 响应式调整 */
@media (max-width: 600px) {
  .text-h4 {
    font-size: 1.5rem;
  }

  .row.q-gutter-md {
    flex-direction: column;
  }

  .row.q-gutter-md .col {
    width: 100%;
  }
}
</style>
