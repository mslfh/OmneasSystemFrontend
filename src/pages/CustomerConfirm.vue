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
          </q-card-section>
        </q-card>

        <!-- 订单项目列表 -->
        <q-card class="q-mb-lg shadow-2 rounded-borders-lg">
          <q-card-section class="q-pa-md">
            <div class="text-h6 q-pb-md ">Your Items</div>
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

                <div class="col">
                  <div class="text-weight-medium text-body1">
                    {{ item.title }}
                  </div>
                  <div class="text-caption text-grey-6 q-mb-sm">
                    {{ item.description }}
                  </div>

                  <!-- 定制选项显示 -->
                  <div
                    v-if="item.customizations && item.customizations.length > 0"
                    class="q-mb-sm"
                  >
                    <div
                      class="text-caption text-weight-medium text-deep-orange q-mb-xs"
                    >
                      Customizations:
                    </div>
                    <div class="customization-tags">
                      <q-chip
                        v-for="custom in item.customizations"
                        :key="custom.id"
                        size="sm"
                        :color="getCustomizationColor(custom)"
                        text-color="white"
                        class="q-mr-xs q-mb-xs"
                      >
                        {{ formatCustomization(custom) }}
                      </q-chip>
                    </div>
                  </div>

                  <!-- 数量和价格 -->
                  <div class="row items-center justify-between">
                    <div class="text-caption text-grey-6">
                      Qty: {{ item.quantity || 1 }}
                    </div>
                    <div class="text-weight-bold text-orange">
                      ${{ item.currentPrice.toFixed(2) }}
                    </div>
                  </div>

                  <!-- 操作按钮 -->
                  <div class="row items-center q-mt-sm">
                    <div class="col-auto">
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
                    </div>
                    <div class="col-auto q-ml-auto">
                      <q-btn
                        flat
                        dense
                        color="grey-6"
                        icon="delete"
                        size="sm"
                        @click="removeItem(index)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
           <q-card-section class="q-pa-md bg-deep-orange text-white">
            <div class="row items-center justify-between">
              <div class="text-h6">Order Total</div>
              <div class="text-h5 text-weight-bold">
                ${{ totalAmount.toFixed(2) }}
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
            label="Proceed to Checkout"
            icon="arrow_forward"
            class="q-px-xl"
            :disable="orderItems.length === 0"
            @click="proceedToCheckout"
          />
        </div>
      </div>
    </div>

    <!-- Reusable dialogs -->
    <CustomizeDialog
      :modelValue="showCustomDialog"
      :item="currentItem"
      :groupedIngredients="groupedIngredients"
      @update:modelValue="(val) => (showCustomDialog = val)"
      @open-replacement="(ing) => showReplacementDialog(ing)"
      @increase-quantity="increaseQuantity"
      @decrease-quantity="decreaseQuantity"
      @close="closeCustomization"
    />

    <ReplacementSelectDialog
      :modelValue="showReplacementSelectDialog"
      :ingredient="currentReplaceIngredient"
      @update:modelValue="(val) => (showReplacementSelectDialog = val)"
      @select="selectReplacement"
      @close="closeReplacementDialog"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import CustomizeDialog from "src/components/CustomizeDialog.vue";
import ReplacementSelectDialog from "src/components/ReplacementSelectDialog.vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL;

const router = useRouter();
const $q = useQuasar();

// ====================
// 响应式数据定义
// ====================

/** 定制弹窗显示状态 */
const showCustomDialog = ref(false);

/** 替换选择弹窗显示状态 */
const showReplacementSelectDialog = ref(false);

/** 当前正在定制的商品索引 */
const currentItemIndex = ref(-1);

/** 当前正在替换的配料 */
const currentReplaceIngredient = ref(null);

/** 订单商品列表 */
const orderItems = ref(
  JSON.parse(sessionStorage.getItem("pendingOrder"))?.items || []
);

/** 就餐类型 */
const diningType = ref("takeaway");

/** 所有配料详细信息缓存 */
const bulkItemsCache = ref(new Map());

// ====================
// 计算属性
// ====================

/** 当前正在定制的商品 */
const currentItem = computed(() => {
  return currentItemIndex.value >= 0
    ? orderItems.value[currentItemIndex.value]
    : null;
});

/** 按可更改性和类型分组的配料列表 */
const groupedIngredients = computed(() => {
  if (!currentItem.value || !currentItem.value.ingredients) {
    return {};
  }

  const groups = {
    customizable: [], // 可更改的配料
    fixed: [], // 不可更改的配料
  };

  // 按可更改性分组
  currentItem.value.ingredients.forEach((ingredient) => {
    if (ingredient.mode === "fixed") {
      groups.fixed.push(ingredient);
    } else {
      groups.customizable.push(ingredient);
    }
  });

  // 对每个组内的配料按类型分组
  const groupByType = (ingredients) => {
    const typeGroups = {};
    ingredients.forEach((ingredient) => {
      // 使用配料对象的type属性
      const ingredientType = ingredient.type || "Other";

      if (!typeGroups[ingredientType]) {
        typeGroups[ingredientType] = [];
      }
      typeGroups[ingredientType].push(ingredient);
    });
    return typeGroups;
  };

  return {
    customizable: groupByType(groups.customizable),
    fixed: groupByType(groups.fixed),
  };
});

/** 订单总金额 */
const totalAmount = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.currentPrice, 0);
});

// ====================
// 定制弹窗相关方法
// ====================

/**
 * 打开定制弹窗
 * @param {number} index - 商品在订单列表中的索引
 */
function openCustomization(index) {
  currentItemIndex.value = index;
  showCustomDialog.value = true;
}

/**
 * 关闭定制弹窗
 */
function closeCustomization() {
  // 在关闭弹窗时保存更改
  saveChangesToSessionStorage();

  showCustomDialog.value = false;
  currentItemIndex.value = -1;
}

/**
 * 从订单中移除商品
 * @param {number} index - 要移除的商品索引
 */
function removeItem(index) {
  orderItems.value.splice(index, 1);

  // 如果没有商品了，提示用户
  if (orderItems.value.length === 0) {
    $q.notify({
      type: "info",
      message: "Your cart is empty. Redirecting to menu...",
      position: "top",
    });
  }
  // 保存更改
  saveChangesToSessionStorage();
}

// ====================
// 配料定制模式相关方法
// ====================

/**
 * 获取定制模式的颜色
 * @param {string} mode - 定制模式
 * @returns {string} 颜色类名
 */
function getCustomizationModeColor(mode) {
  const colors = {
    fixed: "grey-4",
    variable: "blue",
    replaceable: "orange",
    replaceable_variable: "purple",
  };

  return colors[mode] || "grey";
}

/**
 * 获取定制模式文本颜色
 * @param {string} mode - 定制模式
 * @returns {string} 文本颜色类名
 */
function getCustomizationModeTextColor(mode) {
  const colors = {
    fixed: "grey-8",
    variable: "white",
    replaceable: "white",
    replaceable_variable: "white",
  };

  return colors[mode] || "white";
}

/**
 * 获取定制模式的图标
 * @param {string} mode - 定制模式
 * @returns {string} 图标名称
 */
function getCustomizationModeIcon(mode) {
  const icons = {
    fixed: "lock",
    variable: "tune",
    replaceable: "swap_horiz",
    replaceable_variable: "settings",
  };

  return icons[mode] || "help";
}

/**
 * 获取定制模式的标签文本
 * @param {string} mode - 定制模式
 * @returns {string} 标签文本
 */
function getCustomizationModeLabel(mode) {
  const labels = {
    fixed: "Fixed",
    variable: "Variable",
    replaceable: "Replaceable",
    replaceable_variable: "Replaceable + Variable",
  };

  return labels[mode] || "Unknown";
}

// ====================
// 数量调整相关方法
// ====================

/**
 * 增加配料数量
 * @param {Object} ingredient - 配料对象
 */
function increaseQuantity(ingredient) {
  if (ingredient.currentQuantity < 10) {
    ingredient.currentQuantity++;
    recalculateItemPrice();
    autoApplyCustomization();
  }
}

/**
 * 减少配料数量
 * @param {Object} ingredient - 配料对象
 */
function decreaseQuantity(ingredient) {
  if (ingredient.currentQuantity > 0) {
    ingredient.currentQuantity--;
    recalculateItemPrice();
    autoApplyCustomization();
  }
}

/**
 * 获取数量价格信息
 * @param {Object} ingredient - 配料对象
 * @returns {string} 价格信息文本
 */
function getQuantityPriceInfo(ingredient) {
  const quantityDiff = ingredient.currentQuantity - ingredient.originalQuantity;

  if (quantityDiff > 0) {
    const extraCost = quantityDiff * ingredient.extra_price;
    return `+$${extraCost.toFixed(2)} for extra`;
  } else if (quantityDiff < 0) {
    return "Reduced portion";
  }

  return "Standard portion";
}

// ====================
// 替换选择相关方法
// ====================

/**
 * 显示替换选择弹窗
 * @param {Object} ingredient - 要替换的配料对象
 */
function showReplacementDialog(ingredient) {
  currentReplaceIngredient.value = ingredient;
  showReplacementSelectDialog.value = true;
  // 数据已经在缓存中，不需要再次调用API
}

/**
 * 关闭替换选择弹窗
 */
function closeReplacementDialog() {
  showReplacementSelectDialog.value = false;
  currentReplaceIngredient.value = null;
}

/**
 * 选择替换选项
 * @param {number|string} value - 选中的替换项ID
 */
function selectReplacement(value) {
  if (currentReplaceIngredient.value) {
    currentReplaceIngredient.value.replacementId = value;

    // 立即应用更改
    const selectedReplacement =
      currentReplaceIngredient.value.replacementOptions.find(
        (opt) => opt.value === value
      );

    if (selectedReplacement) {
      currentReplaceIngredient.value.displayName = selectedReplacement.name;
    }

    recalculateItemPrice();
    autoApplyCustomization();

    // 显示成功提示
    $q.notify({
      type: "positive",
      color: "orange-8",
      message: `Replaced with ${
        selectedReplacement?.name || "selected option"
      }`,
      position: "top",
    });

    // 关闭弹窗
    closeReplacementDialog();
  }
}

/**
 * 获取当前替换配料的显示名称
 * @param {Object} ingredient - 配料对象
 * @returns {string} 显示名称
 */
function getCurrentReplacementName(ingredient) {
  if (!ingredient.replacementOptions) {
    return ingredient.name;
  }

  const current = ingredient.replacementOptions.find(
    (opt) => opt.value === ingredient.replacementId
  );

  return current ? current.name : ingredient.name;
}

// ====================
// 价格计算相关方法
// ====================

/**
 * 重新计算当前商品的价格
 */
function recalculateItemPrice() {
  if (!currentItem.value) {
    return;
  }

  let totalPrice = currentItem.value.originalPrice;
  let priceAdjustment = 0;

  currentItem.value.ingredients.forEach((ingredient) => {
    // 数量变化的价格调整
    const quantityDiff =
      ingredient.currentQuantity - ingredient.originalQuantity;
    if (quantityDiff !== 0) {
      priceAdjustment += quantityDiff * ingredient.extra_price;
    }

    // 替换的价格调整
    if (
      ingredient.replacementId &&
      ingredient.replacementId !== ingredient.id
    ) {
      const replacement = ingredient.replacementOptions.find(
        (opt) => opt.value === ingredient.replacementId
      );

      if (replacement) {
        priceAdjustment += replacement.price_change || 0;
      }
    }
  });

  currentItem.value.currentPrice = Math.max(0, totalPrice + priceAdjustment);
}

// ====================
// 定制应用相关方法
// ====================

/**
 * 自动应用定制更改
 */
function autoApplyCustomization() {
  if (!currentItem.value) {
    return;
  }

  // 更新定制信息
  const customizations = [];

  currentItem.value.ingredients.forEach((ingredient) => {
    // 记录数量变化
    if (ingredient.currentQuantity !== ingredient.originalQuantity) {
      const change =
        ingredient.currentQuantity > ingredient.originalQuantity
          ? `+${ingredient.currentQuantity - ingredient.originalQuantity}`
          : `${ingredient.currentQuantity - ingredient.originalQuantity}`;

      const priceChange =
        (ingredient.currentQuantity - ingredient.originalQuantity) *
        ingredient.extra_price;

      // 使用替换后的名称（如果有替换）或原始名称
      const displayName = getCurrentReplacementName(ingredient);

      customizations.push({
        type: "quantity",
        ingredientName: displayName,
        change: change,
        priceChange: priceChange,
        originalQuantity: ingredient.originalQuantity,
        currentQuantity: ingredient.currentQuantity,
      });
    }

    // 记录替换
    if (
      ingredient.replacementId &&
      ingredient.replacementId !== ingredient.id
    ) {
      const replacement = ingredient.replacementOptions.find(
        (opt) => opt.value === ingredient.replacementId
      );

      if (replacement) {
        customizations.push({
          type: "replacement",
          originalName: ingredient.name,
          replacementName: replacement.name,
          priceChange: replacement.price_change || 0,
        });
      }
    }
  });

  currentItem.value.customizations = customizations;

  // 立即保存更改到 sessionStorage
  saveChangesToSessionStorage();
}

/**
 * 保存当前更改到 sessionStorage
 */
function saveChangesToSessionStorage() {
  const orderData = {
    items: orderItems.value,
    total: totalAmount.value,
    diningType: diningType.value,
  };

  sessionStorage.setItem("pendingOrder", JSON.stringify(orderData));
  console.log("Saved changes to sessionStorage:", orderData); // 调试日志
}

/**
 * 格式化定制信息显示文本
 * @param {Object} custom - 定制对象
 * @returns {string} 格式化后的文本
 */
function formatCustomization(custom) {
  if (custom.type === "quantity") {
    // 解析change字符串，获取数量变化
    const changeNum = parseInt(custom.change);
    const ingredientName = custom.ingredientName;

    if (changeNum === 0) {
      return `${ingredientName} (Standard)`;
    } else if (changeNum < 0) {
      // 如果减少到0，显示"No itemName"
      if (custom.currentQuantity === 0) {
        return `No ${ingredientName}`;
      } else {
        return `Less ${ingredientName} (${changeNum})`;
      }
    } else {
      // 如果增加，显示"Extra itemName"
      return `Extra ${ingredientName} (+${changeNum})`;
    }
  } else if (custom.type === "replacement") {
    const sign = custom.priceChange >= 0 ? "+" : "";
    return `${custom.originalName} → ${custom.replacementName}`;
  }

  return custom.toString();
}

/**
 * 获取定制标签的颜色
 * @param {Object} custom - 定制对象
 * @returns {string} Quasar颜色名称
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

// ====================
// 数据获取相关方法
// ====================

/**
 * 从缓存中获取配料详细信息
 * @param {Array} ids - 配料ID数组
 * @returns {Map} 配料详细信息映射
 */
function getBulkItemsDetails(ids) {
  const details = new Map();

  // 从缓存中获取数据
  ids.forEach((id) => {
    if (bulkItemsCache.value.has(id)) {
      details.set(id, bulkItemsCache.value.get(id));
    }
  });

  return details;
}

/**
 * 构建配料对象列表
 * @param {Object} data - API返回的定制数据
 * @returns {Array} 配料对象数组
 */
function buildIngredients(data) {
  const { items, customizationItems } = data;

  // 创建customizationItems的映射
  const customMap = {};
  customizationItems.forEach((custom) => {
    customMap[custom.item_id] = custom;
  });

  // 收集所有需要的配料IDs
  const allIngredientIds = new Set();

  // 添加所有基础配料
  items.forEach((item) => {
    allIngredientIds.add(item.id);
  });

  // 添加所有可替换的配料
  customizationItems.forEach((custom) => {
    if (
      custom.mode === "replaceable" ||
      custom.mode === "replaceable_variable"
    ) {
      const replacementList = custom.replacement_list || [];
      replacementList.forEach((id) => allIngredientIds.add(id));
    }
  });

  // 获取所有配料的详细信息
  const ingredientDetails = getBulkItemsDetails(Array.from(allIngredientIds));

  return items.map((item) => {
    const custom = customMap[item.id];
    const details = ingredientDetails.get(item.id);

    const ingredient = {
      id: item.id,
      name: details ? details.name : item.name,
      type: details ? details.type : "Other",
      mode: custom ? custom.mode : "fixed",
      originalQuantity: item.quantity || 1,
      currentQuantity: item.quantity || 1,
      extra_price: 0,
      displayName: details ? details.name : item.name,
    };

    if (custom) {
      try {
        const quantityPrice = custom.quantity_price || {};
        ingredient.extra_price = quantityPrice.extra || 0;
      } catch (e) {
        console.error("Error parsing quantity_price:", e);
      }

      if (
        custom.mode === "replaceable" ||
        custom.mode === "replaceable_variable"
      ) {
        ingredient.replacementId = item.id;
        ingredient.replacementOptions = [
          {
            label: `${details ? details.name : item.name} (Original)`,
            value: item.id,
            price_change: 0,
            name: details ? details.name : item.name,
            type: details ? details.type : "Original",
            description: details ? details.description : "Original ingredient",
          },
        ];

        try {
          const replacementList = custom.replacement_list || [];
          const replacementDiff = custom.replacement_diff || {};

          replacementList.forEach((repId) => {
            const repDetails = ingredientDetails.get(repId);
            const priceChange =
              replacementDiff[repId.toString()] || replacementDiff[repId] || 0;

            ingredient.replacementOptions.push({
              label: repDetails ? repDetails.name : `Item ${repId}`,
              value: repId,
              price_change: priceChange,
              name: repDetails ? repDetails.name : `Item ${repId}`,
              type: repDetails ? repDetails.type : "Alternative",
              description: repDetails
                ? repDetails.description
                : "Alternative ingredient",
            });
          });
        } catch (e) {
          console.error("Error parsing replacement data:", e);
        }
      }
    }

    return ingredient;
  });
}

// ====================
// 导航相关方法
// ====================

/**
 * 继续购物，返回菜单页面
 */
function continueShopping() {
  // 保存当前订单状态
  const orderData = {
    items: orderItems.value,
    total: totalAmount.value,
    diningType: diningType.value,
  };

  sessionStorage.setItem("pendingOrder", JSON.stringify(orderData));

  // 返回到订单页面
  router.push("/order");
}

/**
 * 继续结账流程
 */
function proceedToCheckout() {
  if (orderItems.value.length === 0) {
    $q.notify({
      type: "negative",
      message: "Your cart is empty",
      position: "top",
    });

    return;
  }

  // 保存确认后的订单状态到sessionStorage
  const orderData = {
    items: orderItems.value,
    total: totalAmount.value,
    diningType: diningType.value,
  };

  sessionStorage.setItem("confirmedOrder", JSON.stringify(orderData));

  // 跳转到支付页面（填写个人信息）
  router.push("/checkout");
}

// ====================
// 生命周期钩子
// ====================

/**
 * 组件挂载时的初始化逻辑
 */
onMounted(async () => {
  console.log("CustomerConfirm mounted"); // 调试日志

  // 从sessionStorage加载订单数据
  const pendingOrder = sessionStorage.getItem("pendingOrder");

  if (pendingOrder) {
    const orderData = JSON.parse(pendingOrder);
    console.log("Loaded order data from sessionStorage:", orderData); // 调试日志

    orderItems.value = orderData.items || [];
    diningType.value = orderData.diningType || "takeaway";

    // 为每个商品初始化基本字段
    orderItems.value.forEach((item) => {
      console.log("Processing order item:", item); // 调试日志

      // 如果是定制化商品且已经有配料信息，保持不变
      if (item.ingredients && item.ingredients.length > 0) {
        console.log("Item already has ingredients, keeping existing data"); // 调试日志
      } else if (!item.ingredients) {
        // 如果没有配料信息，初始化空数组
        item.ingredients = [];
      }

      // 确保价格字段存在
      item.originalPrice = item.originalPrice || item.price || 0;
      item.currentPrice =
        item.currentPrice || item.price || item.originalPrice || 0;

      // 确保定制化数组存在
      item.customizations = item.customizations || [];
    });

    // 只为没有配料信息的可定制商品获取定制数据
    const customizableItems = orderItems.value.filter(
      (item) =>
        item.customizable &&
        (!item.ingredients || item.ingredients.length === 0)
    );

    console.log("Items needing customization data:", customizableItems); // 调试日志

    if (customizableItems.length > 0) {
      try {
        // 并行获取所有定制数据
        const customizationPromises = customizableItems.map(async (item) => {
          const response = await axios.get(
            `${VITE_API_URL}/api/get-product-customization/${item.id}`
          );

          if (response.data.success) {
            return { itemId: item.id, data: response.data.data };
          }

          return null;
        });

        const customizationResults = await Promise.all(customizationPromises);

        // 为没有配料信息的商品构建配料数据
        for (const result of customizationResults) {
          if (result) {
            const item = orderItems.value.find((i) => i.id === result.itemId);

            if (item && (!item.ingredients || item.ingredients.length === 0)) {
              console.log("Building ingredients for item:", item.id); // 调试日志

              // 获取需要的配料详细信息
              const { items, customizationItems } = result.data || {
                items: [],
                customizationItems: [],
              };
              const idsToFetch = new Set();
              items.forEach((it) => idsToFetch.add(it.id));
              (customizationItems || []).forEach((custom) => {
                if (
                  custom.mode === "replaceable" ||
                  custom.mode === "replaceable_variable"
                ) {
                  (custom.replacement_list || []).forEach((id) =>
                    idsToFetch.add(id)
                  );
                }
              });

              if (idsToFetch.size > 0) {
                try {
                  const formData = new FormData();
                  formData.append(
                    "ids",
                    Array.from(idsToFetch).join(",")
                  );
                  const bulkResponse = await axios.post(
                    `${VITE_API_URL}/api/get-bulk-items`,
                    formData,
                    {
                      headers: {
                        "Content-Type": "multipart/form-data",
                      },
                    }
                  );
                  if (bulkResponse.data && bulkResponse.data.success) {
                    (bulkResponse.data.data || []).forEach((it) =>
                      bulkItemsCache.value.set(it.id, it)
                    );
                  }
                } catch (e) {
                  console.error(
                    "Error fetching bulk items for item",
                    item.id,
                    e
                  );
                }
              }

              item.ingredients = buildIngredients(result.data);
              console.log("Built ingredients for item:", item.ingredients); // 调试日志
            }
          }
        }
      } catch (error) {
        console.error("Error fetching customizations:", error);
      }
    }
  } else {
    // 如果没有待处理的订单，设置空数组
    orderItems.value = [];
    console.log("No pending order found"); // 调试日志
  }

  console.log("Final order items:", orderItems.value); // 调试日志

  // 如果没有商品，返回菜单页
  if (orderItems.value.length === 0) {
    $q.notify({
      type: "info",
      message: "Your cart is empty. Redirecting to menu...",
      position: "top",
    });

    router.push("/order");
  }
});
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
  background-color: #ff5722 !important;
}

.text-deep-orange {
  color: #ff5722 !important;
}

/* 定制弹窗样式 */
.q-dialog .q-card {
  border-radius: 12px;
}

/* 分组样式 */
.ingredient-group {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.group-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.group-title {
  font-weight: 600;
  color: #424242;
}

.type-section {
  margin-bottom: 16px;
}

.type-header {
  font-weight: 500;
  color: #616161;
  margin-bottom: 8px;
  padding-left: 12px;
  border-left: 3px solid #ff5722;
}

/* 提示信息样式 */
.info-notice {
  background: linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%);
  border: 1px solid #bbdefb;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 12px 0;
  position: relative;
}

.info-notice::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to bottom, #2196f3, #1976d2);
  border-radius: 4px 0 0 4px;
}

.info-notice .q-icon {
  opacity: 0.8;
}

.info-notice .text-caption {
  line-height: 1.4;
  font-weight: 400;
}

/* 按钮组样式优化 */
.q-btn-toggle {
  border-radius: 8px;
}

/* 选项组样式 */
.q-option-group .q-radio {
  margin-bottom: 8px;
}

/* 定制标签样式 */
.customization-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.customization-tags .q-chip {
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.75rem;
  padding: 4px 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.customization-tags .q-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
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
