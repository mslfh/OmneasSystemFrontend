<template>
  <q-page class="bg-grey-1">
    <!-- 统一的页面容器 -->
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <!-- 页面标题 -->
        <div class="text-h4 text-weight-bold text-grey-8 q-mb-lg text-center">
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
                class="col-12 col-sm-6 col-md-4"
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
                class="col-12 col-sm-6 col-md-4"
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
import axios from "axios";
const { VITE_API_URL } = import.meta.env;

const router = useRouter();

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
    const product = products.value.find((p) => p.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  return Number(total.toFixed(2));
});

const cartItemsWithDetails = computed(() => {
  return cartItems.value.map((cartItem) => {
    const product = products.value.find((p) => p.id === cartItem.id);
    if (product) {
      return {
        ...product,
        quantity: cartItem.quantity,
      };
    }
    const historicalItem = userOrderedItems.value.find(
      (item) => item.id === cartItem.id
    );
    if (historicalItem) {
      return {
        ...historicalItem,
        quantity: cartItem.quantity,
      };
    }
    return {
      id: cartItem.id,
      title: "Unknown Item",
      price: 0,
      image: "",
      quantity: cartItem.quantity,
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
  const existingItem = cartItems.value.find((item) => item.id === product.id);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cartItems.value.push({
      id: product.id,
      quantity: 1,
    });
  }
}

function removeFromCart(product) {
  const existingItem = cartItems.value.find((item) => item.id === product.id);
  if (existingItem) {
    if (existingItem.quantity > 1) {
      existingItem.quantity--;
    } else {
      const index = cartItems.value.indexOf(existingItem);
      cartItems.value.splice(index, 1);
    }
  }
}

function increaseQuantity(cartItem) {
  cartItem.quantity++;
}

function decreaseQuantity(cartItem) {
  if (cartItem.quantity > 1) {
    cartItem.quantity--;
  } else {
    const index = cartItems.value.indexOf(cartItem);
    cartItems.value.splice(index, 1);
    if (cartItems.value.length === 0) {
      showCart.value = false;
      $q.notify({
        type: "info",
        message: "Your cart is empty. Redirecting to menu...",
        position: "top",
      });
      setTimeout(() => {
        router.push("/");
      }, 1200);
    }
  }
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

  const orderData = {
    diningType: diningType.value,
    items: cartItems.value.map((cartItem) => {
      const product = products.value.find((p) => p.id === cartItem.id);
      return {
        ...product,
        quantity: cartItem.quantity,
        currentPrice: Number((product.price * cartItem.quantity).toFixed(2)),
        customizations: [],
      };
    }),
    total: Number(totalAmount.value.toFixed(2)),
  };

  sessionStorage.setItem("pendingOrder", JSON.stringify(orderData));
  router.push("/confirm");
  showCart.value = false;
}

// 生命周期
onMounted(async () => {
  try {
    const response = await axios.get(`${VITE_API_URL}/api/get-products`);
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
          category: item.tag.split(",")[0].toLowerCase(),
          isPopular: item.is_featured,
          tags: item.tag.split(",").map((tag) => tag.trim().toLowerCase()),
          code: item.code,
          stock: item.stock,
          sort: item.sort,
          customizable: item.customizable,
        }))
        .sort((a, b) => {
          if (a.sort !== b.sort) return a.sort - b.sort;
          if (b.isPopular !== a.isPopular) return b.isPopular - a.isPopular;
          return a.id - b.id;
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
});
</script>
