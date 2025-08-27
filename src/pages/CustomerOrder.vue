<template>
  <q-page class="bg-grey-1">
    <!-- 顶部导航栏 -->
    <q-header elevated class="bg-deep-orange text-white">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
        <q-toolbar-title class="text-weight-bold">Order Now</q-toolbar-title>
        <q-btn flat round dense icon="person" />
      </q-toolbar>
    </q-header>

    <div class="q-pa-md">
      <!-- 就餐方式显示 -->
      <q-card flat bordered class="q-mb-md bg-orange-1">
        <q-card-section class="row items-center q-py-sm">
          <q-icon
            :name="diningType === 'takeaway' ? 'shopping_bag' : 'restaurant'"
            color="deep-orange"
            class="q-mr-sm"
          />
          <div class="text-body1 text-weight-medium">
            {{ diningType === 'takeaway' ? 'Take Away' : 'Dine In' }}
          </div>
          <q-space />
          <q-btn
            flat
            dense
            color="deep-orange"
            label="Change"
            size="sm"
            @click="changeDiningType"
          />
        </q-card-section>
      </q-card>

      <!-- 分类标签页 -->
      <q-tabs
        v-model="currentTab"
        dense
        class="text-deep-orange q-mb-md"
        active-color="deep-orange"
        indicator-color="deep-orange"
        align="justify"
      >
        <q-tab name="ordered" label="Ordered" />
        <q-tab name="popular" label="Popular" />
        <q-tab name="all" label="All Items" />
      </q-tabs>

      <!-- 分类过滤器 (仅在 All Items 标签页显示) -->
      <div v-if="currentTab === 'all'" class="q-mb-md">
        <q-scroll-area
          style="height: 60px"
          class="bg-white rounded-borders"
        >
          <div class="row no-wrap q-pa-sm q-gutter-sm">
            <q-chip
              v-for="category in categories"
              :key="category.id"
              :color="selectedCategory === category.id ? 'deep-orange' : 'grey-3'"
              :text-color="selectedCategory === category.id ? 'white' : 'grey-8'"
              clickable
              @click="selectCategory(category.id)"
              size="md"
            >
              {{ category.name }}
            </q-chip>
          </div>
        </q-scroll-area>
      </div>

      <!-- 菜品列表 -->
      <q-tab-panels v-model="currentTab" animated>
        <!-- 已点菜品 -->
        <q-tab-panel name="ordered" class="q-pa-none">
          <div v-if="historicalOrderedItems.length === 0" class="text-center q-py-xl">
            <q-icon name="restaurant_menu" size="4rem" color="grey-4" class="q-mb-md" />
            <div class="text-h6 text-grey-6">No items ordered yet</div>
            <div class="text-body2 text-grey-5">Browse our menu to start ordering</div>
          </div>
          <div v-else>
            <!-- 如果有当前购物车商品，显示购物车标题 -->
            <div v-if="orderedItems.length > 0" class="text-h6 text-grey-8 q-mb-md">
              Current Order
            </div>
            <!-- 如果显示的是历史商品，显示历史标题 -->
            <div v-else-if="userOrderedItems.length > 0" class="q-mb-md">
              <div class="text-h6 text-grey-8 q-mb-xs">Your Previous Orders</div>
              <div class="text-body2 text-grey-6">Click "Add to Cart" to order again</div>
            </div>

            <div class="row q-gutter-md">
              <product-card
                v-for="item in historicalOrderedItems"
                :key="`ordered-${item.id}`"
                :product="item"
                :is-ordered="!item.isHistorical"
                @add-to-cart="addToCart"
                @remove-from-cart="removeFromCart"
                class="col-12 col-sm-6 col-md-4"
              />
            </div>
          </div>
        </q-tab-panel>

        <!-- 热销推荐 -->
        <q-tab-panel name="popular" class="q-pa-none">
          <div class="row q-gutter-md">
            <product-card
              v-for="item in popularItems"
              :key="`popular-${item.id}`"
              :product="item"
              :is-popular="true"
              @add-to-cart="addToCart"
              @remove-from-cart="removeFromCart"
              class="col-12 col-sm-6 col-md-4"
            />
          </div>
        </q-tab-panel>

        <!-- 所有菜品 -->
        <q-tab-panel name="all" class="q-pa-none">
          <div class="row q-gutter-md">
            <product-card
              v-for="item in filteredProducts"
              :key="`all-${item.id}`"
              :product="item"
              @add-to-cart="addToCart"
              @remove-from-cart="removeFromCart"
              class="col-12 col-sm-6 col-md-4"
            />
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <!-- 悬浮购物车按钮 -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        fab
        icon="shopping_cart"
        color="deep-orange"
        @click="showCart = true"
        :disable="cartItemsWithDetails.length === 0"
      >
        <q-badge
          v-if="cartItemsWithDetails.length > 0"
          color="red"
          :label="cartItemsWithDetails.reduce((sum, item) => sum + item.quantity, 0)"
          floating
        />
      </q-btn>
    </q-page-sticky>    <!-- 购物车弹窗 -->
    <q-dialog v-model="showCart" position="bottom">
      <q-card style="width: 100%; max-width: 500px" class="rounded-borders-top">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Your Cart ({{ cartItemsWithDetails.reduce((sum, item) => sum + item.quantity, 0) }})</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="showCart = false" />
        </q-card-section>

        <q-card-section>
          <div v-if="cartItemsWithDetails.length === 0" class="text-center q-py-md">
            <q-icon name="shopping_cart" size="3rem" color="grey-4" class="q-mb-sm" />
            <div class="text-body1 text-grey-6">Your cart is empty</div>
          </div>

          <q-list v-else separator>
            <q-item v-for="item in cartItemsWithDetails" :key="item.id">
              <q-item-section avatar>
                <q-img
                  :src="item.image"
                  style="width: 50px; height: 50px"
                  class="rounded-borders"
                  fit="cover"
                >
                  <template v-slot:error>
                    <div class="absolute-full flex flex-center bg-grey-3">
                      <q-icon name="restaurant" size="sm" color="grey-6" />
                    </div>
                  </template>
                </q-img>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium">{{ item.title }}</q-item-label>
                <q-item-label caption>${{ item.price.toFixed(2) }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row items-center q-gutter-xs">
                  <q-btn
                    round
                    dense
                    color="grey-6"
                    icon="remove"
                    size="sm"
                    @click="decreaseQuantity(item)"
                  />
                  <div class="text-weight-medium q-mx-sm">{{ item.quantity }}</div>
                  <q-btn
                    round
                    dense
                    color="deep-orange"
                    icon="add"
                    size="sm"
                    @click="increaseQuantity(item)"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <q-separator class="q-my-md" />

          <div class="row items-center justify-between text-h6 text-weight-bold">
            <div>Total:</div>
            <div class="text-deep-orange">${{ totalAmount.toFixed(2) }}</div>
          </div>
        </q-card-section>

        <q-card-actions class="q-pa-md">
          <q-btn
            color="deep-orange"
            label="Proceed to Checkout"
            class="full-width"
            size="lg"
            :disable="cartItemsWithDetails.length === 0"
            @click="proceedToCheckout"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ProductCard from '../components/ProductCard.vue'
import { useRouter } from "vue-router";
const router = useRouter();
// 响应式数据
const diningType = ref('')
const currentTab = ref('popular')
const selectedCategory = ref('all')
const showCart = ref(false)
const cartItems = ref([])

// 假数据
const categories = ref([
  { id: 'all', name: 'All' },
  { id: 'appetizers', name: 'Appetizers' },
  { id: 'mains', name: 'Main Courses' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'beverages', name: 'Beverages' }
])

const products = ref([
  {
    id: 1,
    title: "Margherita Pizza",
    description: "Fresh tomatoes, mozzarella, and basil",
    price: 18.99,
    image: "/src/assets/products/jeroen-den-otter-iKmm0okt6Q4-unsplash.jpg",
    category: "mains",
    isPopular: true,
    rating: 4.5,
    cookTime: "15-20 min"
  },
  {
    id: 2,
    title: "Caesar Salad",
    description: "Crispy romaine lettuce with classic caesar dressing",
    price: 14.99,
    image: "/src/assets/products/c-d-x-PDX_a_82obo-unsplash.jpg",
    category: "appetizers",
    isPopular: true,
    rating: 4.2,
    cookTime: "5-10 min"
  },
  {
    id: 3,
    title: "Chocolate Brownie",
    description: "Rich chocolate brownie with vanilla ice cream",
    price: 8.99,
    image: "/src/assets/products/frankie-valentine-VghbBAYqUJ0-unsplash.jpg",
    category: "desserts",
    isPopular: false,
    rating: 4.8,
    cookTime: "5 min"
  },
  {
    id: 4,
    title: "Grilled Salmon",
    description: "Fresh Atlantic salmon with herbs and lemon",
    price: 24.99,
    image: "/src/assets/products/giorgio-trovato-K62u25Jk6vo-unsplash.jpg",
    category: "mains",
    isPopular: true,
    rating: 4.7,
    cookTime: "20-25 min"
  },
  {
    id: 5,
    title: "Craft Beer",
    description: "Local craft beer selection",
    price: 6.99,
    image: "/src/assets/products/john-fornander-m2WpKnlLcEc-unsplash .jpg",
    category: "beverages",
    isPopular: false,
    rating: 4.1,
    cookTime: "Ready"
  },
  {
    id: 6,
    title: "Truffle Pasta",
    description: "Handmade pasta with truffle oil and parmesan",
    price: 22.99,
    image: "/src/assets/products/marek-szturc-0iIV1goIodE-unsplash.jpg",
    category: "mains",
    isPopular: true,
    rating: 4.6,
    cookTime: "18-22 min"
  }
])

// 用户点过的餐品（从localStorage加载）
const userOrderedItems = ref([])

// 计算属性
const popularItems = computed(() => {
  return products.value.filter(item => item.isPopular)
    .map(product => {
      const cartItem = cartItems.value.find(item => item.id === product.id)
      return {
        ...product,
        quantity: cartItem ? cartItem.quantity : 0
      }
    })
})

const orderedItems = computed(() => {
  return cartItems.value.filter(item => item.quantity > 0)
    .map(cartItem => {
      const product = products.value.find(p => p.id === cartItem.id)
      return { ...product, quantity: cartItem.quantity }
    })
})

// 用户历史点过的餐品（显示在"Ordered"标签页中，如果当前购物车为空）
const historicalOrderedItems = computed(() => {
  // 如果购物车有商品，显示购物车中的商品
  if (orderedItems.value.length > 0) {
    return orderedItems.value
  }

  // 否则显示历史点过的餐品
  return userOrderedItems.value.map(item => {
    const cartItem = cartItems.value.find(ci => ci.id === item.id)
    return {
      ...item,
      quantity: cartItem ? cartItem.quantity : 0,
      isHistorical: true // 标记为历史餐品
    }
  })
})

const filteredProducts = computed(() => {
  let filtered = []
  if (selectedCategory.value === 'all') {
    filtered = products.value
  } else {
    filtered = products.value.filter(item => item.category === selectedCategory.value)
  }

  // 添加购物车数量信息到每个产品
  return filtered.map(product => {
    const cartItem = cartItems.value.find(item => item.id === product.id)
    return {
      ...product,
      quantity: cartItem ? cartItem.quantity : 0
    }
  })
})

const cartItemsCount = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

const totalAmount = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    const product = products.value.find(p => p.id === item.id)
    return sum + (product ? product.price * item.quantity : 0)
  }, 0)
})

// 购物车中的完整商品信息
const cartItemsWithDetails = computed(() => {
  return cartItems.value.map(cartItem => {
    const product = products.value.find(p => p.id === cartItem.id)
    if (product) {
      return {
        ...product,
        quantity: cartItem.quantity
      }
    }
    // 如果在products中找不到，尝试从历史商品中查找
    const historicalItem = userOrderedItems.value.find(item => item.id === cartItem.id)
    if (historicalItem) {
      return {
        ...historicalItem,
        quantity: cartItem.quantity
      }
    }
    // 如果都找不到，返回一个默认对象
    return {
      id: cartItem.id,
      title: 'Unknown Item',
      price: 0,
      image: '',
      quantity: cartItem.quantity
    }
  })
})

// 方法
function changeDiningType() {
  // 跳转回就餐方式选择页面
  router.push('/')
}

function selectCategory(categoryId) {
  selectedCategory.value = categoryId
}

function addToCart(product) {
  const existingItem = cartItems.value.find(item => item.id === product.id)
  if (existingItem) {
    existingItem.quantity++
  } else {
    cartItems.value.push({
      id: product.id,
      quantity: 1
    })
  }
}

function removeFromCart(product) {
  const existingItem = cartItems.value.find(item => item.id === product.id)
  if (existingItem) {
    if (existingItem.quantity > 1) {
      existingItem.quantity--
    } else {
      const index = cartItems.value.indexOf(existingItem)
      cartItems.value.splice(index, 1)
    }
  }
}

function increaseQuantity(cartItem) {
  cartItem.quantity++
}

function decreaseQuantity(cartItem) {
  if (cartItem.quantity > 1) {
    cartItem.quantity--
  } else {
    const index = cartItems.value.indexOf(cartItem)
    cartItems.value.splice(index, 1)
  }
}

function proceedToCheckout() {
  if (cartItems.value.length === 0) {
    $q.notify({
      type: 'negative',
      message: 'Your cart is empty',
      position: 'top'
    })
    return
  }

  // 准备订单数据
  const orderData = {
    diningType: diningType.value,
    items: cartItems.value.map(cartItem => {
      const product = products.value.find(p => p.id === cartItem.id)
      return {
        ...product,
        quantity: cartItem.quantity,
        currentPrice: product.price * cartItem.quantity,
        customizations: []
      }
    }),
    total: totalAmount.value
  }

  // 将订单数据存储到sessionStorage或pinia store
  sessionStorage.setItem('pendingOrder', JSON.stringify(orderData))

  // 跳转到确认页面
  router.push('/confirm')
  showCart.value = false
}

// 生命周期
onMounted(() => {
  // 从 sessionStorage 加载就餐方式
  const selectedDiningType = sessionStorage.getItem('selectedDiningType')
  if (selectedDiningType) {
    diningType.value = selectedDiningType
  } else {
    // 如果没有就餐方式，跳转回选择页面
    router.push('/')
    return
  }

  // 初始化数据
  console.log('Order page mounted')

  // 加载用户历史点过的餐品
  loadUserOrderedItems()

  // 尝试从sessionStorage恢复待处理的订单
  loadPendingOrder()

  // 从localStorage加载客户信息来设置默认就餐类型
  loadCustomerPreferences()

  // 如果用户有历史餐品但购物车为空，默认显示已点菜品标签页
  if (userOrderedItems.value.length > 0 && cartItems.value.length === 0) {
    currentTab.value = 'ordered'
  }
})

function loadPendingOrder() {
  try {
    const pendingOrder = sessionStorage.getItem('pendingOrder')
    if (pendingOrder) {
      const orderData = JSON.parse(pendingOrder)

      // 恢复购物车项目
      if (orderData.items && orderData.items.length > 0) {
        cartItems.value = orderData.items.map(item => ({
          id: item.id,
          quantity: item.quantity || 1
        }))

        // 切换到已点菜品标签页
        currentTab.value = 'ordered'
      }
    }
  } catch (error) {
    console.error('Failed to load pending order:', error)
  }
}

function loadUserOrderedItems() {
  try {
    const orderedItems = localStorage.getItem('orderedItems')
    if (orderedItems) {
      const items = JSON.parse(orderedItems)

      // 只取前10个最常点的餐品，按订购次数和最近订购时间排序
      userOrderedItems.value = items
        .sort((a, b) => {
          // 首先按订购次数排序
          if (b.orderCount !== a.orderCount) {
            return b.orderCount - a.orderCount
          }
          // 如果订购次数相同，按最近订购时间排序
          return new Date(b.lastOrdered) - new Date(a.lastOrdered)
        })
        .slice(0, 10) // 只显示前10个
    }
  } catch (error) {
    console.error('Failed to load user ordered items:', error)
  }
}

function loadCustomerPreferences() {
  try {
    const customerInfo = localStorage.getItem('customerInfo')
    if (customerInfo) {
      const customer = JSON.parse(customerInfo)
      // 这里可以根据客户偏好设置默认值
      // 例如默认就餐类型等
    }
  } catch (error) {
    console.error('Failed to load customer preferences:', error)
  }
}
</script>

<style scoped>
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.dining-option:hover {
  border-color: #FF5722;
}

.rounded-borders-lg {
  border-radius: 12px;
}

.rounded-borders-top {
  border-radius: 12px 12px 0 0;
}

.shadow-8 {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

/* 自定义深橙色调色板 */
.bg-deep-orange {
  background-color: #FF5722 !important;
}

.text-deep-orange {
  color: #FF5722 !important;
}

/* 标签页样式 */
.q-tabs {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 分类芯片样式 */
.q-chip {
  transition: all 0.2s ease;
}

.q-chip:hover {
  transform: scale(1.05);
}

/* 购物车按钮脉动动画 */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.q-btn.q-btn--fab:hover {
  animation: pulse 1s infinite;
}

/* 响应式调整 */
@media (max-width: 600px) {
  .dining-option {
    min-height: 120px;
  }
}
</style>
