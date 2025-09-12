<template>
  <q-page padding class="bg-grey-1">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <!-- 页面标题 -->
        <div class="text-h4 text-weight-bold text-grey-7 q-mb-lg text-center">
          Checkout
          <!-- & Payment -->
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
                :name="
                  diningType === 'takeaway' ? 'shopping_bag' : 'restaurant'
                "
                color="deep-orange"
                size="sm"
                class="q-mr-sm"
              />
              <span class="text-weight-medium">
                {{ diningType === "takeaway" ? "Take Away" : "Dine In" }}
              </span>
            </div>

            <!-- 订单项目列表 -->
            <div class="q-mt-md">
              <div
                v-for="(orderItem, index) in sortedOrderItems"
                :key="index"
                class="row items-start justify-between q-py-sm"
                :class="{ 'border-bottom': index < sortedOrderItems.length - 1 }"
              >
                <!-- 商品信息 -->
                <div class="col q-pl-md">
                  <div class="text-body2 text-weight-medium">
                   • {{ orderItem.title }}
                    <span class="text-grey-6"
                      > x {{ orderItem.quantity || 1 }}</span
                    >
                  </div>

                  <!-- 定制信息 -->
                  <div
                    v-if="
                      orderItem.customizations &&
                      orderItem.customizations.length > 0
                    "
                    class="q-mt-xs q-ml-sm"
                  >
                    <div class="text-caption">
                      <span
                        v-for="(custom, idx) in orderItem.customizations"
                        :key="custom.id"
                        :class="getCustomizationSimpleColor(custom)"
                      >
                        {{ formatCustomizationSimple(custom) }}
                        <span v-if="idx < orderItem.customizations.length - 1" class="text-grey-6">, </span>
                      </span>
                    </div>
                  </div>
                </div>


                <!-- 价格 -->
                <div class="col-auto text-right">
                  <div class="text-weight-bold">
                    ${{ orderItem.currentPrice.toFixed(2) }}
                  </div>
                </div>
              </div>
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

                <!-- Preset Comment Chips -->
                <div class="col-12 q-mt-md q-pl-xs">
                  <div class="text-caption text-grey-6">
                    Quick Options:
                  </div>
                  <div class="row q-gutter-xs q-mt-xs">
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
              </div>
            </div>
          </q-card-section>
        </q-card>

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
            color="deep-orange-5"
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
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL;

const router = useRouter();
const $q = useQuasar();

// 响应式数据
const orderItems = ref([]);
const processing = ref(false);
const diningType = ref("takeaway");

// 客户信息
const customerInfo = ref({
  name: "",
  phone: "",
  pickupTime: "",
  tableNumber: "",
  notes: "",
});

// 预设的备注选项
const commentChips = [
  "Extra Sauce",
  "Mild",
  "Not Spicy",
  "Less Salt",
  "No Onions",
  "Well Done",
  "Medium Rare",
  "Extra Hot",
  "On the Side",
  "No Ice",
  "Less Sugar",
];

const selectedChips = ref([]);


// 计算属性
const totalAmount = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.currentPrice, 0);
});

// 排序后的订单项目 - 有定制的菜品放在最后
const sortedOrderItems = computed(() => {
  return [...orderItems.value].sort((a, b) => {
    const aHasCustomizations = a.customizations && a.customizations.length > 0;
    const bHasCustomizations = b.customizations && b.customizations.length > 0;

    if (!aHasCustomizations && bHasCustomizations) return -1;
    if (aHasCustomizations && !bHasCustomizations) return 1;
    return 0;
  });
});

// 方法
function toggleChip(chip) {
  const index = selectedChips.value.indexOf(chip);
  if (index > -1) {
    selectedChips.value.splice(index, 1);
  } else {
    selectedChips.value.push(chip);
  }

  // 更新notes字段
  const existingNotes = customerInfo.value.notes
    .replace(
      /,?\s*(Extra Sauce|Mild|Not Spicy|Less Salt|No Onions|Well Done|Medium Rare|Extra Hot|On the Side|No Ice|Less Sugar)/g,
      ""
    )
    .trim();
  const chipText = selectedChips.value.length > 0 ? selectedChips.value.join(", ") : "";

  if (existingNotes && chipText) {
    customerInfo.value.notes = existingNotes + ", " + chipText;
  } else if (chipText) {
    customerInfo.value.notes = chipText;
  } else {
    customerInfo.value.notes = existingNotes;
  }
}

function formatCustomizationSimple(custom) {
  if (custom.type === "quantity") {
    const change = parseInt(custom.change);
    if (custom.currentQuantity === 0) {
      return `No ${custom.ingredientName}`;
    } else if (change > 0) {
      return `Extra ${custom.ingredientName} (+${change})`;
    } else if (change < 0) {
      return `Less ${custom.ingredientName} (${change})`;
    }
  } else if (custom.type === "replacement") {
    return `${custom.originalName} → ${custom.replacementName}`;
  }
  return custom.toString();
}

function getCustomizationSimpleColor(custom) {
  if (custom.type === "quantity") {
    const change = parseInt(custom.change);
    if (custom.currentQuantity === 0) {
      return "text-red-4";
    } else if (change > 0) {
      return "text-green-4";
    }
  }
  return "text-deep-orange-4";
}

function continueShopping() {
  router.push("/order");
}

// 清理订单数据，移除不必要的字段
function cleanOrderItems(items) {
  return items.map(item => {
    const cleanedItem = { ...item };

    // 如果有 ingredients，清理其中的 replacementOptions
    if (cleanedItem.ingredients && Array.isArray(cleanedItem.ingredients)) {
      cleanedItem.ingredients = cleanedItem.ingredients.map(ingredient => {
        const { replacementOptions, ...cleanedIngredient } = ingredient;
        return cleanedIngredient;
      });
    }

    // 如果有 customizations，也可以进一步清理
    if (cleanedItem.customizations && Array.isArray(cleanedItem.customizations)) {
      cleanedItem.customizations = cleanedItem.customizations.map(custom => {
        // 保留必要的定制信息，移除UI相关的字段
        const { replacementOptions, ...cleanedCustom } = custom;
        return cleanedCustom;
      });
    }

    return cleanedItem;
  });
}

async function placeOrder() {
  if (!customerInfo.value.name.trim()) {
    $q.notify({
      type: "negative",
      message: "Please fill in your name and phone number",
      position: "top",
    });
    return;
  }

  processing.value = true;
  try {
    // 清理订单数据，移除不必要的字段如 replacementOptions
    const cleanedItems = cleanOrderItems(orderItems.value);

    const orderData = {
      customerInfo: customerInfo.value,
      diningType: diningType.value,
      items: cleanedItems,
      total: totalAmount.value,
      createdAt: new Date().toISOString(),
    };

    // 调用真实API
    const response = await axios.post(`${VITE_API_URL}/api/place-order`, orderData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // 检查响应状态
    if (response.status === 200 || response.status === 201) {
      // 使用API返回的订单信息
      const apiResponseData = response.data.data;
      console.log("Order placed successfully:", apiResponseData);
      // 从API响应中提取订单号和状态
      const orderNumber = apiResponseData.order_no;
      const orderStatus = apiResponseData.status;
      const orderId = apiResponseData.id;
      console.log("Extracted order details:", { orderNumber, orderStatus, orderId });

      // 构建完整的订单数据用于本地存储
      const completeOrderData = {
        ...orderData,
        orderNumber: orderNumber,
        status: orderStatus,
        id: orderId,
      };

      // 保存数据到本地缓存
      saveOrderToHistory(completeOrderData);
      saveCustomerInfo(customerInfo.value);
      saveOrderedItems(orderItems.value);

      // 清除购物车缓存
      sessionStorage.removeItem("pendingOrder");
      sessionStorage.removeItem("checkoutOrder");

      $q.notify({
        type: "positive",
        message: "Order placed successfully!",
        position: "top",
      });

      router.push({
        path: "/confirmation"
      });
    } else {
      throw new Error(`API returned status: ${response.status}`);
    }
  } catch (error) {
    console.error("Order placement failed:", error);

    let errorMessage = "Failed to place order. Please try again.";

    // 根据不同的错误类型显示不同的错误信息
    if (error.response) {
      // 服务器返回了错误响应
      if (error.response.status === 400) {
        errorMessage = "Invalid order data. Please check your information.";
      } else if (error.response.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else {
        errorMessage = `Server error (${error.response.status}). Please try again.`;
      }
    } else if (error.request) {
      // 网络错误
      errorMessage = "Network error. Please check your connection and try again.";
    }

    $q.notify({
      type: "negative",
      message: errorMessage,
      position: "top",
    });
  } finally {
    processing.value = false;
  }
}

function saveOrderToHistory(orderData) {
  try {
    const existingOrders = JSON.parse(localStorage.getItem("orderHistory") || "[]");
    existingOrders.unshift(orderData);

    if (existingOrders.length > 50) {
      existingOrders.splice(50);
    }

    localStorage.setItem("orderHistory", JSON.stringify(existingOrders));

  } catch (error) {
    console.error("Failed to save order to history:", error);
  }
}

function saveCustomerInfo(info) {
  try {
    const customerData = {
      name: info.name,
      phone: info.phone,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem("customerInfo", JSON.stringify(customerData));
  } catch (error) {
    console.error("Failed to save customer info:", error);
  }
}

function saveOrderedItems(items) {
  try {
    const existingItems = JSON.parse(localStorage.getItem("orderedItems") || "[]");

    items.forEach((item) => {
      const existingIndex = existingItems.findIndex((existing) => existing.id === item.id);

      if (existingIndex >= 0) {
        existingItems[existingIndex].lastOrdered = new Date().toISOString();
        existingItems[existingIndex].orderCount = (existingItems[existingIndex].orderCount || 1) + 1;
        existingItems[existingIndex].totalSpent = (existingItems[existingIndex].totalSpent || item.currentPrice) + item.currentPrice;
      } else {
        existingItems.push({
          id: item.id,
          title: item.title,
          description: item.description || "",
          image: item.image || "",
          price: item.originalPrice || item.currentPrice,
          category: item.category || "mains",
          rating: item.rating || 4.0,
          cookTime: item.cookTime || "15-20 min",
          lastOrdered: new Date().toISOString(),
          orderCount: 1,
          totalSpent: item.currentPrice,
          customizations: item.customizations || [],
        });
      }
    });

    existingItems.sort((a, b) => new Date(b.lastOrdered) - new Date(a.lastOrdered));

    if (existingItems.length > 30) {
      existingItems.splice(30);
    }

    localStorage.setItem("orderedItems", JSON.stringify(existingItems));
  } catch (error) {
    console.error("Failed to save ordered items:", error);
  }
}

function loadSavedCustomerInfo() {
  try {
    const customerData = localStorage.getItem("customerInfo");
    if (customerData) {
      const parsedData = JSON.parse(customerData);
      customerInfo.value = { ...customerInfo.value, ...parsedData };
    }
  } catch (error) {
    console.error("Failed to load customer info:", error);
  }
}

// 生命周期
onMounted(() => {
  // 从sessionStorage加载订单数据
  const pendingOrder = sessionStorage.getItem("pendingOrder");
  if (pendingOrder) {
    try {
      const orderData = JSON.parse(pendingOrder);
      orderItems.value = orderData.items;
      diningType.value = orderData.diningType || "takeaway";
    } catch (error) {
      console.error("Failed to load pending order:", error);
      orderItems.value = [];
    }
  } else {
    orderItems.value = [];
  }

  // 加载保存的客户信息
  loadSavedCustomerInfo();

  // 设置默认取餐时间为30分钟后
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  if (!customerInfo.value.pickupTime) {
    customerInfo.value.pickupTime = now.toTimeString().slice(0, 5);
  }
});
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}

/* 响应式调整 */
@media (max-width: 600px) {
  .text-h4 {
    font-size: 1.5rem;
  }
}
</style>
