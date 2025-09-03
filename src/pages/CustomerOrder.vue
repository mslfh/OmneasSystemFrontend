<template>
  <q-page class="bg-grey-1">
    <!-- 统一的页面容器 -->
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <!-- 页面标题 -->
        <div class="text-h4 text-weight-bold text-grey-7 q-mb-lg text-center">
          Order Menu
        </div>

        <!-- 就餐方式显示 -->
        <q-card class="q-mb-lg shadow-2 rounded-borders-lg">
          <q-card-section class="q-pa-md bg-deep-orange text-white">
            <div class="row items-center justify-between">
              <div class="row items-center">
                <q-icon
                  :name="
                    diningType === 'takeaway' ? 'shopping_bag' : 'restaurant'
                  "
                  size="sm"
                  class="q-mr-sm"
                />
                <span class="text-h6">
                  {{
                    diningType === "takeaway"
                      ? "Take Away Order"
                      : "Dine In Order"
                  }}
                </span>
              </div>
              <q-btn
                flat
                dense
                icon="edit"
                text-color="white"
                @click="changeDiningType"
                class="q-ml-sm"
              >
                <q-tooltip>Change dining type</q-tooltip>
              </q-btn>
            </div>
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
          <q-scroll-area style="height: 60px" class="bg-white rounded-borders">
            <div class="row no-wrap q-pa-sm q-gutter-sm">
              <q-chip
                v-for="category in categories"
                :key="category.id"
                :color="
                  selectedCategory === category.id ? 'deep-orange' : 'grey-3'
                "
                :text-color="
                  selectedCategory === category.id ? 'white' : 'grey-8'
                "
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
        <q-tab-panels class="bg-grey-1" v-model="currentTab" animated>
          <!-- 已点菜品 -->
          <q-tab-panel name="ordered" class="q-pa-none">
            <div
              v-if="historicalOrderedItems.length === 0"
              class="text-center q-py-xl"
            >
              <q-icon
                name="restaurant_menu"
                size="4rem"
                color="grey-4"
                class="q-mb-md"
              />
              <div class="text-h6 text-grey-6">No items ordered yet</div>
              <div class="text-body2 text-grey-5">
                Browse our menu to start ordering
              </div>
            </div>
            <div v-else>
              <!-- 如果有当前购物车商品，显示购物车标题 -->
              <div
                v-if="orderedItems.length > 0"
                class="text-h6 text-grey-8 q-mb-md"
              >
                Current Order
              </div>
              <!-- 如果显示的是历史商品，显示历史标题 -->
              <div v-else-if="userOrderedItems.length > 0" class="q-mb-md">
                <div class="text-h6 text-grey-8 q-mb-xs">
                  Your Previous Orders
                </div>
                <div class="text-body2 text-grey-6">
                  Click "Add to Cart" to order again
                </div>
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
          <q-tab-panel name="popular" class="q-pa-sm">
            <div class="row q-col-gutter-md">
              <div
                class="col-6 col-md-4"
                v-for="item in popularItems"
              >
                <product-card
                  :key="`popular-${item.id}`"
                  :product="item"
                  :is-popular="true"
                  @add-to-cart="addToCart"
                  @remove-from-cart="removeFromCart"
                />
              </div>
            </div>
          </q-tab-panel>

          <!-- 所有菜品 -->
          <q-tab-panel name="all" class="q-pa-sm">
            <div class="row q-col-gutter-md">
              <div
                class="col-6 col-md-4"
                v-for="item in filteredProducts"
              >
                <product-card
                  :key="`all-${item.id}`"
                  :product="item"
                  @add-to-cart="addToCart"
                  @remove-from-cart="removeFromCart"
                  class="col-4"
                />
              </div>
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
            :label="
              cartItemsWithDetails.reduce((sum, item) => sum + item.quantity, 0)
            "
            floating
          />
        </q-btn>
      </q-page-sticky>

      <!-- 购物车弹窗 -->
      <q-dialog v-model="showCart" position="bottom">
        <q-card
          style="width: 100%; max-width: 500px"
          class="rounded-borders-top"
        >
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">
              Your Cart ({{
                cartItemsWithDetails.reduce(
                  (sum, item) => sum + item.quantity,
                  0
                )
              }})
            </div>
            <q-space />
            <q-btn icon="close" flat round dense @click="showCart = false" />
          </q-card-section>

          <q-card-section>
            <div
              v-if="cartItemsWithDetails.length === 0"
              class="text-center q-py-md"
            >
              <q-icon
                name="shopping_cart"
                size="3rem"
                color="grey-4"
                class="q-mb-sm"
              />
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
                  <q-item-label class="text-weight-medium">{{
                    item.title
                  }}</q-item-label>
                  <q-item-label caption
                    >${{ item.price.toFixed(2) }}</q-item-label
                  >
                  <!-- 显示定制化标签 -->
                  <div v-if="item.customized && item.customizations && item.customizations.length > 0"
                       class="q-mt-xs">
                    <q-chip
                      v-for="(custom, index) in item.customizations"
                      :key="index"
                      :color="getCustomizationColor(custom)"
                      text-color="white"
                      dense
                      size="xs"
                      class="q-mr-xs"
                    >
                      {{ formatCustomization(custom) }}
                    </q-chip>
                  </div>
                  <div v-else-if="item.customized" class="q-mt-xs">
                    <q-chip
                      color="orange"
                      text-color="white"
                      dense
                      size="xs"
                    >
                      Customized
                    </q-chip>
                  </div>
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
                    <div class="text-weight-medium q-mx-sm">
                      {{ item.quantity }}
                    </div>
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

            <div
              class="row items-center justify-between text-h6 text-weight-bold"
            >
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
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import ProductCard from "../components/ProductCard.vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import axios from "axios";
const VITE_API_URL = import.meta.env.VITE_API_URL;

const router = useRouter();
const $q = useQuasar();

// 响应式数据
const diningType = ref("");
const currentTab = ref("popular");
const selectedCategory = ref("all");
const showCart = ref(false);
const cartItems = ref([]);

// 假数据
const categories = ref([
  { id: "all", name: "All" },
  { id: "appetizers", name: "Appetizers" },
  { id: "mains", name: "Main Courses" },
  { id: "desserts", name: "Desserts" },
  { id: "beverages", name: "Beverages" },
]);

const products = ref([]);

// 用户点过的餐品（从localStorage加载）
const userOrderedItems = ref([]);

// 计算属性
const popularItems = computed(() => {
  return products.value
    .filter((item) => item.isPopular)
    .map((product) => {
      const cartItem = cartItems.value.find((item) => item.id === product.id);
      return {
        ...product,
        quantity: cartItem ? cartItem.quantity : 0,
      };
    });
});

const orderedItems = computed(() => {
  return cartItems.value
    .filter((item) => item.quantity > 0)
    .map((cartItem) => {
      const product = products.value.find((p) => p.id === cartItem.id);
      return { ...product, quantity: cartItem.quantity };
    });
});

const historicalOrderedItems = computed(() => {
  if (orderedItems.value.length > 0) {
    return orderedItems.value;
  }
  return userOrderedItems.value.map((item) => {
    const cartItem = cartItems.value.find((ci) => ci.id === item.id);
    return {
      ...item,
      quantity: cartItem ? cartItem.quantity : 0,
      isHistorical: true,
    };
  });
});

const filteredProducts = computed(() => {
  let filtered = [];
  if (selectedCategory.value === "all") {
    filtered = products.value;
  } else {
    filtered = products.value.filter(
      (item) => item.category === selectedCategory.value
    );
  }
  return filtered.map((product) => {
    const cartItem = cartItems.value.find((item) => item.id === product.id);
    return {
      ...product,
      quantity: cartItem ? cartItem.quantity : 0,
    };
  });
});

const cartItemsCount = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity, 0);
});

const totalAmount = computed(() => {
  const total = cartItems.value.reduce((sum, item) => {
    // 如果是定制化商品，使用定制化价格
    if (item.snapshot) {
      const itemPrice = item.currentPrice || item.snapshot.currentPrice || item.snapshot.price || 0;
      return sum + (itemPrice * item.quantity);
    }

    // 普通商品，从 products 中获取价格
    const product = products.value.find((p) => p.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  return Number(total.toFixed(2));
});

const cartItemsWithDetails = computed(() => {
  return cartItems.value.map((cartItem) => {
    // If this cartItem contains a customization snapshot, prefer that data
    if (cartItem.snapshot) {
      return {
        id: cartItem.id,
        title: cartItem.snapshot.title || cartItem.snapshot.name || 'Item',
        price: cartItem.currentPrice || cartItem.snapshot.currentPrice || cartItem.snapshot.price || 0,
        image: cartItem.snapshot.image || '',
        quantity: cartItem.quantity,
        snapshot: cartItem.snapshot,
        customized: true,
        customizations: cartItem.snapshot.customizations || [],
      };
    }

    const product = products.value.find((p) => p.id === cartItem.id);
    if (product) {
      return {
        ...product,
        quantity: cartItem.quantity,
        customized: false,
      };
    }
    const historicalItem = userOrderedItems.value.find(
      (item) => item.id === cartItem.id
    );
    if (historicalItem) {
      return {
        ...historicalItem,
        quantity: cartItem.quantity,
        customized: false,
      };
    }
    return {
      id: cartItem.id,
      title: "Unknown Item",
      price: 0,
      image: "",
      quantity: cartItem.quantity,
      customized: false,
    };
  });
});

// 方法
function changeDiningType() {
  router.push("/");
}

function selectCategory(categoryId) {
  selectedCategory.value = categoryId;
}

function addToCart(product) {
  console.log('Adding to cart:', product); // 调试日志

  // product may be a simple product or a customized snapshot object
  if (product && product.customized && product.snapshot) {
    // push the customized snapshot as a cart item with its own id (keep original id for reference)
    cartItems.value.push({
      id: product.id,
      quantity: product.quantity || 1,
      snapshot: product.snapshot,
      currentPrice: product.currentPrice || product.snapshot.currentPrice || product.snapshot.price || 0,
      customized: true,
    });
    console.log('Added customized item to cart:', cartItems.value[cartItems.value.length - 1]);
    saveCartToSessionStorage(); // 保存到 sessionStorage
    return;
  }

  const existingItem = cartItems.value.find((item) => item.id === product.id && !item.snapshot);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cartItems.value.push({
      id: product.id,
      quantity: 1,
    });
  }
  saveCartToSessionStorage(); // 保存到 sessionStorage
}

function removeFromCart(product) {
  // product may be a cart detail object from the UI
  let existingItem = null;
  if (product && product.snapshot) {
    existingItem = cartItems.value.find((item) => item.snapshot === product.snapshot || (item.snapshot && item.snapshot.id === product.snapshot.id));
  } else {
    existingItem = cartItems.value.find((item) => item.id === product.id && !item.snapshot);
  }

  if (existingItem) {
    if (existingItem.quantity > 1) {
      existingItem.quantity--;
    } else {
      const index = cartItems.value.indexOf(existingItem);
      cartItems.value.splice(index, 1);
    }
    saveCartToSessionStorage(); // 保存到 sessionStorage
  }
}

function increaseQuantity(cartItem) {
  cartItem.quantity++;
  saveCartToSessionStorage(); // 保存到 sessionStorage
}

function decreaseQuantity(cartItem) {
  if (cartItem.quantity > 1) {
    cartItem.quantity--;
  } else {
    const index = cartItems.value.indexOf(cartItem);
    cartItems.value.splice(index, 1);
    if (cartItems.value.length === 0) {
      showCart.value = false;
    }
  }
  saveCartToSessionStorage(); // 保存到 sessionStorage
}

function proceedToCheckout() {
  if (cartItems.value.length === 0) {
    $q.notify({
      type: "negative",
      message: "Your cart is empty",
      position: "top",
    });
    return;
  }

  console.log('Processing checkout with cart items:', cartItems.value); // 调试日志

  // Build order data preserving snapshots for customized items
  const items = cartItems.value.map((cartItem) => {
    if (cartItem.snapshot) {
      // snapshot already contains ingredients and other metadata
      const itemPrice = cartItem.currentPrice || cartItem.snapshot.currentPrice || cartItem.snapshot.price || 0;
      const orderItem = {
        id: cartItem.id,
        title: cartItem.snapshot.title || 'Item',
        description: cartItem.snapshot.description || '',
        image: cartItem.snapshot.image || '',
        quantity: cartItem.quantity || 1,
        customizable: true,
        originalPrice: cartItem.snapshot.originalPrice || cartItem.snapshot.price || 0,
        price: itemPrice,
        currentPrice: Number((itemPrice * (cartItem.quantity || 1)).toFixed(2)),
        ingredients: cartItem.snapshot.ingredients || [],
        customizations: cartItem.snapshot.customizations || [],
      };

      console.log('Built customized order item:', orderItem); // 调试日志
      return orderItem;
    }

    const product = products.value.find((p) => p.id === cartItem.id) || {};
    const orderItem = {
      id: cartItem.id,
      title: product.title || 'Item',
      description: product.description || '',
      image: product.image || '',
      quantity: cartItem.quantity || 1,
      customizable: product.customizable || false,
      originalPrice: product.originalPrice || product.price || 0,
      price: product.price || 0,
      currentPrice: Number(((product.price || 0) * (cartItem.quantity || 1)).toFixed(2)),
      ingredients: [],
      customizations: [],
    };

    console.log('Built regular order item:', orderItem); // 调试日志
    return orderItem;
  });

  const orderData = {
    diningType: diningType.value,
    items,
    total: Number(totalAmount.value.toFixed(2)),
  };

  console.log('Final order data being saved to sessionStorage:', orderData); // 调试日志
  sessionStorage.setItem("pendingOrder", JSON.stringify(orderData));
  router.push("/confirm");
  showCart.value = false;
}

function handleAddToCart(updatedProduct) {
  const existingItem = cartItems.value.find(item => item.id === updatedProduct.id);
  if (existingItem) {
    Object.assign(existingItem, updatedProduct);
  } else {
    cartItems.value.push(updatedProduct);
  }
}

/**
 * 保存购物车状态到 sessionStorage
 */
function saveCartToSessionStorage() {
  // 如果购物车为空，清除 sessionStorage
  if (cartItems.value.length === 0) {
    sessionStorage.removeItem("pendingOrder");
    console.log('Cart is empty, removed pendingOrder from sessionStorage'); // 调试日志
    return;
  }

  // Build order data preserving snapshots for customized items
  const items = cartItems.value.map((cartItem) => {
    if (cartItem.snapshot) {
      // snapshot already contains ingredients and other metadata
      const itemPrice = cartItem.currentPrice || cartItem.snapshot.currentPrice || cartItem.snapshot.price || 0;
      return {
        id: cartItem.id,
        title: cartItem.snapshot.title || 'Item',
        description: cartItem.snapshot.description || '',
        image: cartItem.snapshot.image || '',
        quantity: cartItem.quantity || 1,
        customizable: true,
        originalPrice: cartItem.snapshot.originalPrice || cartItem.snapshot.price || 0,
        price: itemPrice,
        currentPrice: Number((itemPrice * (cartItem.quantity || 1)).toFixed(2)),
        ingredients: cartItem.snapshot.ingredients || [],
        customizations: cartItem.snapshot.customizations || [],
      };
    }

    const product = products.value.find((p) => p.id === cartItem.id) || {};
    return {
      id: cartItem.id,
      title: product.title || 'Item',
      description: product.description || '',
      image: product.image || '',
      quantity: cartItem.quantity || 1,
      customizable: product.customizable || false,
      originalPrice: product.originalPrice || product.price || 0,
      price: product.price || 0,
      currentPrice: Number(((product.price || 0) * (cartItem.quantity || 1)).toFixed(2)),
      ingredients: [],
      customizations: [],
    };
  });

  const orderData = {
    diningType: diningType.value,
    items,
    total: Number(totalAmount.value.toFixed(2)),
  };

  sessionStorage.setItem("pendingOrder", JSON.stringify(orderData));
  console.log('Cart state saved to sessionStorage:', orderData); // 调试日志
}

/**
 * 格式化定制信息显示文本 - 参考 CustomerConfirm.vue
 */
function formatCustomization(custom) {
  if (custom.type === "quantity") {
    const changeNum = parseInt(custom.change);
    const ingredientName = custom.ingredientName;

    if (changeNum === 0) {
      return `${ingredientName} (Standard)`;
    } else if (changeNum < 0) {
      if (custom.currentQuantity === 0) {
        return `No ${ingredientName}`;
      } else {
        return `${ingredientName} (${custom.currentQuantity})`;
      }
    } else {
      return `Extra ${ingredientName} (${custom.change})`;
    }
  } else if (custom.type === "replacement") {
    return `${custom.originalName} → ${custom.replacementName}`;
  }

  return custom.toString();
}

/**
 * 获取定制标签的颜色 - 参考 CustomerConfirm.vue
 */
function getCustomizationColor(custom) {
  if (custom.type === "quantity") {
    if (custom.currentQuantity === 0) return "negative";
    if (custom.currentQuantity > custom.originalQuantity) return "positive";
    if (custom.currentQuantity < custom.originalQuantity) return "warning";
    return "primary";
  } else if (custom.type === "replacement") {
    return "orange";
  }
  return "primary";
}

// 生命周期
onMounted(async () => {
  try {
    const response = await axios.get(`${VITE_API_URL}/api/get-products`);
    console.log(`${VITE_API_URL}/api/get-products`);
    if (response.data.success) {
      products.value = response.data.data
        .map((item) => ({
          id: item.id,
          title: item.title,
          tips: item.tips,
          description: item.description,
          originalPrice: parseFloat(item.price),
          price: parseFloat(item.selling_price),
          image: item.image,
          isPopular: item.is_featured,
          tags: item.tag ? item.tag.split(",").map((tag) => tag.trim().toLowerCase()) : [],
          code: item.code,
          stock: item.stock,
          sort: item.sort,
          customizable: item.customizable,
        }))
        .sort((a, b) => {
          if (a.sort !== b.sort) return a.sort - b.sort;
          if (b.isPopular !== a.isPopular) return b.isPopular - a.isPopular;
          return a.title.length - b.title.length;
        });
    } else {
      console.error("Failed to fetch products:", response.data.message);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }

  // 从localStorage加载用户历史订单
  const storedUserOrders = localStorage.getItem("userOrderedItems");
  if (storedUserOrders) {
    userOrderedItems.value = JSON.parse(storedUserOrders);
  }

  // 从 sessionStorage 加载购物车数据（如果有的话）
  const pendingOrder = sessionStorage.getItem("pendingOrder");
  if (pendingOrder) {
    try {
      const orderData = JSON.parse(pendingOrder);
      console.log('Loading cart data from sessionStorage:', orderData); // 调试日志

      // 重建购物车数据结构
      cartItems.value = [];

      (orderData.items || []).forEach(item => {
        if (item.customizable && item.ingredients && item.ingredients.length > 0) {
          // 定制化商品 - 构建 snapshot 结构
          const cartItem = {
            id: item.id,
            quantity: item.quantity || 1,
            snapshot: {
              id: item.id,
              title: item.title,
              description: item.description,
              image: item.image,
              price: item.price || item.originalPrice || 0,
              currentPrice: item.currentPrice || item.price || item.originalPrice || 0,
              originalPrice: item.originalPrice || item.price || 0,
              ingredients: item.ingredients || [],
              customizations: item.customizations || []
            },
            currentPrice: item.currentPrice || item.price || item.originalPrice || 0,
            customized: true
          };
          cartItems.value.push(cartItem);
          console.log('Added customized cart item:', cartItem);
        } else {
          // 普通商品
          const cartItem = {
            id: item.id,
            quantity: item.quantity || 1
          };
          cartItems.value.push(cartItem);
          console.log('Added regular cart item:', cartItem);
        }
      });

      console.log('Final cart items loaded:', cartItems.value);
    } catch (error) {
      console.error('Error loading cart data from sessionStorage:', error);
    }
  }

  // 初始化就餐类型，优先从 sessionStorage 获取，否则默认为外带
  const storedDiningType = sessionStorage.getItem("diningType");
  diningType.value = storedDiningType || "takeaway";
});
</script>

<style scoped>
/* 定制化标签样式 */
.q-chip {
  border-radius: 8px;
  font-weight: 500;
}

.q-chip.dense {
  font-size: 0.65rem;
  padding: 2px 6px;
}

/* 购物车项目样式 */
.q-item {
  border-radius: 8px;
  margin-bottom: 4px;
}

.q-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}
</style>
