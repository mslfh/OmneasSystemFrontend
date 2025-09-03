<template>
  <q-card
    class="product-card shadow-2 rounded-borders-lg overflow-hidden"
    @click="openDetails"
  >
    <!-- 产品图片 -->
    <div class="relative-position">
      <q-img
        :src="product.image"
        :style="{ height: $q.screen.lt.sm ? '120px' : '140px' }"
        fit="cover"
        class="product-image"
      >
        <template v-slot:error>
          <div class="absolute-full flex flex-center bg-grey-3">
            <q-icon name="restaurant" size="3rem" color="grey-6" />
          </div>
        </template>
      </q-img>

      <!-- 热销标签 -->
      <q-badge
        v-if="product.isPopular"
        color="red"
        :class="['absolute-top-left', $q.screen.lt.sm ? 'q-ma-xs' : 'q-ma-sm']"
        label="Popular"
      />

      <!-- 已点标签 -->
      <q-badge
        v-if="isOrdered"
        color="green"
        :class="['absolute-top-left', $q.screen.lt.sm ? 'q-ma-xs' : 'q-ma-sm']"
        label="Ordered"
      />

      <!-- 历史订购标签 -->
      <q-badge
        v-if="product.isHistorical"
        color="purple"
        :class="['absolute-top-left', $q.screen.lt.sm ? 'q-ma-xs' : 'q-ma-sm']"
        label="Previously Ordered"
      />

      <!-- 库存状态 -->
      <q-badge
        v-if="product.stock <= 5 && product.stock > 0"
        color="orange"
        :class="['absolute-top-right', $q.screen.lt.sm ? 'q-ma-xs' : 'q-ma-sm']"
        :label="`Only ${product.stock} left`"
        size="sm"
      />
      <q-badge
        v-else-if="product.stock === 0"
        color="negative"
        :class="['absolute-top-right', $q.screen.lt.sm ? 'q-ma-xs' : 'q-ma-sm']"
        label="Out of Stock"
        size="sm"
      />

      <!-- <div class="absolute-top-right q-ma-sm">
        <q-chip outline color="amber" text-color="black"  dense size="sm">
          <q-icon name="star" color="amber" size="xs" class="q-mr-xs" />
          {{ product.rating }}
        </q-chip>
      </div> -->
    </div>

    <!-- 产品信息 -->
    <q-card-section
      :class="['q-pb-none', $q.screen.lt.sm ? 'q-pa-sm' : 'q-pa-md']"
    >
      <div class="row items-center q-mb-xs">
        <div
          :class="[
            'text-weight-medium ellipsis',
            $q.screen.lt.sm ? 'text-subtitle1' : 'text-h6',
          ]"
        >
          {{ product.title }}
        </div>
        <q-chip
          outline
          v-if="product.code"
          color="orange-5"
          size="sm"
          dense
          :class="[$q.screen.lt.sm ? 'q-ml-xs' : 'q-ml-sm']"
        >
          {{ product.code }}
        </q-chip>
      </div>
      <div
        :class="[
          'q-mb-sm ellipsis-2-lines',
          $q.screen.lt.sm ? 'text-caption' : 'text-body2 text-grey-6',
        ]"
      >
        {{ product.description }}
      </div>

      <div v-if="product.tags && product.tags.length > 0" class="q-mb-sm">
        <q-chip
          v-for="tag in product.tags"
          :key="tag"
          color="grey-2"
          text-color="grey-7"
          size="sm"
          dense
          class="q-mr-xs q-mb-xs q-screen-lt-sm:q-mr-xs q-screen-lt-sm:q-mb-xs"
        >
          {{ tag }}
        </q-chip>
      </div>

      <div class="row items-center justify-between">
        <div
          :class="[
            'text-weight-bold text-deep-orange',
            $q.screen.lt.sm ? 'text-subtitle1' : 'text-h6',
          ]"
        >
          <div
            v-if="
              product.originalPrice && product.originalPrice !== product.price
            "
            :class="[
              'row items-center',
              $q.screen.lt.sm ? 'q-gutter-xs' : 'q-gutter-xs',
            ]"
          >
            <span
              :class="[
                'text-grey-6',
                $q.screen.lt.sm ? 'text-caption' : 'text-body2',
              ]"
              style="text-decoration: line-through"
            >
              ${{ product.originalPrice.toFixed(2) }}
            </span>
            <span
              :class="[
                'text-weight-bold text-deep-orange',
                $q.screen.lt.sm ? 'text-subtitle1' : 'text-h6',
              ]"
            >
              ${{ product.price.toFixed(2) }}
            </span>
          </div>
          <div
            v-else
            :class="[
              'text-weight-bold text-deep-orange',
              $q.screen.lt.sm ? 'text-subtitle1' : 'text-h6',
            ]"
          >
            ${{ product.price.toFixed(2) }}
          </div>
        </div>
      </div>

      <!-- 历史餐品额外信息 -->
      <div
        v-if="product.isHistorical"
        :class="[
          'text-purple-8 q-mb-sm',
          $q.screen.lt.sm ? 'text-body2' : 'text-caption',
        ]"
      >
        <div v-if="product.lastOrdered">
          Last ordered: {{ formatLastOrdered(product.lastOrdered) }}
        </div>
        <div v-if="product.totalSpent">
          Total spent: ${{ product.totalSpent.toFixed(2) }}
        </div>
      </div>
    </q-card-section>

    <!-- 操作按钮 -->
    <q-card-actions
      :class="['q-pt-none', $q.screen.lt.sm ? 'q-pa-sm' : 'q-pa-md']"
    >
      <div v-if="currentQuantity === 0" class="full-width">
        <q-btn
          color="deep-orange"
          label="Add to Cart"
          icon="add_shopping_cart"
          :class="['full-width', $q.screen.lt.sm ? 'text-caption' : '']"
          :size="$q.screen.lt.sm ? 'sm' : 'md'"
          @click.stop="addToCart"
        />
      </div>

      <div v-else class="row items-center justify-between full-width">
        <q-btn
          round
          dense
          color="grey-6"
          icon="remove"
          :size="$q.screen.lt.sm ? 'sm' : 'md'"
          @click.stop="removeFromCart"
        />
        <div
          :class="[
            'text-weight-bold',
            $q.screen.lt.sm ? 'text-subtitle1 q-mx-sm' : 'text-h6 q-mx-md',
          ]"
        >
          {{ currentQuantity }}
        </div>
        <q-btn
          round
          dense
          color="deep-orange"
          icon="add"
          :size="$q.screen.lt.sm ? 'sm' : 'md'"
          @click.stop="addToCart"
        />
      </div>
    </q-card-actions>
  </q-card>

  <!-- Details bottom sheet -->
  <q-dialog
    v-model="showDetailsDialog"
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card
      :style="$q.screen.lt.sm ? { maxWidth: '100%' } : { width: '400px' }"
      class="rounded-borders-lg"
    >
      <q-card-section class="q-pa-md">
        <div class="row items-center justify-between">
          <div class="row items-center">
            <q-img
              :src="localProduct.image"
              style="width: 96px; height: 96px"
              fit="cover"
            />
            <div class="q-ml-md">
              <div class="text-h6 text-weight-medium">
                {{ localProduct.title }}
              </div>
              <div class="text-caption text-grey-6">
                {{ localProduct.code }}
              </div>
            </div>
          </div>
          <q-btn dense flat round icon="close" @click="closeDetails" />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="text-body2 q-mb-sm">{{ localProduct.description }}</div>

        <div class="q-mb-md">
          <div class="text-caption text-grey-6 q-mb-xs">Price</div>
          <div class="text-h6 text-deep-orange">
            ${{
              (localProduct.currentPrice || localProduct.price || 0).toFixed(2)
            }}
          </div>
        </div>

        <div
          v-if="localProduct.ingredients && localProduct.ingredients.length > 0"
        >
          <div class="ingredients-scroll q-gutter-sm">
            <div
              v-if="Object.keys(grouped.customizable || {}).length > 0"
              class="ingredient-group"
            >
              <div class="group-header">
                <q-icon name="tune" color="deep-orange" class="q-mr-sm" />
                <span class="group-title text-deep-orange"
                  >Customizable Ingredients</span
                >
              </div>

              <div
                v-for="(ingredients, type) in grouped.customizable"
                :key="`customizable-${type}`"
                class="type-section"
              >
                <div class="type-header">{{ type }}</div>
                <div
                  v-for="ingredient in ingredients"
                  :key="ingredient.id"
                  class="q-pl-sm text-grey-8"
                  style="background: white; border-radius: 6px"
                >
                  <div class="row items-center justify-between q-mt-xs">
                    <div class="text-weight-medium">
                      {{ getCurrentReplacementName(ingredient) }}
                      <q-chip
                        v-if=" ingredient.replacementId && ingredient.replacementId !== ingredient.id"
                        dense
                        size="sm"
                        color="orange"
                        text-color="white"
                        class="q-ml-xs"
                      >
                        Changed
                      </q-chip>
                    </div>

                    <!-- dotted connector to show relation between name and actions -->
                    <div
                      class="connector dotted q-mx-sm"
                      aria-hidden="true"
                    ></div>

                    <!--ingredient action -->
                    <div class="row items-center q-gutter-sm action-group">
                      <div
                        v-if="
                          ingredient.mode === 'variable' ||
                          ingredient.mode === 'replaceable_variable'
                        "
                        class="row items-center q-gutter-xs"
                      >
                        <q-btn
                          round
                          dense
                          size="6px"
                          icon="remove"
                          color="grey-6"
                          @click.stop="decrease(ingredient)"
                        />
                        <span class="text-weight-medium text-caption">{{
                          ingredient.currentQuantity
                        }}</span>
                        <q-btn
                          round
                          dense
                          size="6px"
                          icon="add"
                          color="deep-orange-6"
                          @click.stop="increase(ingredient)"
                        />
                      </div>

                      <q-btn
                        dense
                        flat
                        color="deep-orange"
                        label="Change"
                        v-if="
                          ingredient.replacementOptions &&
                          ingredient.replacementOptions.length
                        "
                        @click.stop="openReplacementDialog(ingredient)"
                      />
                    </div>
                  </div>

                  <div
                    v-if="
                      ingredient.mode === 'variable' ||
                      ingredient.mode === 'replaceable_variable'
                    "
                    class="text-caption text-grey-6 q-ml-xs"
                  >
                    {{ getQuantityPriceInfo(ingredient) || "Standard portion" }}
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="Object.keys(grouped.fixed || {}).length > 0"
              class="ingredient-group"
            >
              <div class="group-header">
                <q-icon name="flatware" color="deep-orange-6" class="q-mr-sm" />
                <span class="group-title text-deep-orange-6"
                  >Fixed Ingredients</span
                >
              </div>

              <div class="info-notice">
                <div class="row items-center">
                  <span class="text-caption text-grey-7"
                    ><q-icon name="info" color="grey-6" size="xs" />
                    <strong> Note:</strong>Please add special requests when
                    checkout if you'd like to change these.</span
                  >
                </div>
              </div>

              <div
                v-for="(ingredients, type) in grouped.fixed"
                :key="`fixed-${type}`"
                class="type-section"
              >
                <div class="type-header">{{ type }}</div>
                <div
                  v-for="ingredient in ingredients"
                  :key="ingredient.id"
                  class="q-pa-sm"
                  style="background: white; border-radius: 6px"
                >
                  <div class="row items-center justify-between">
                    <div class="text-weight-medium text-grey-6">
                      {{ ingredient.name }}
                    </div>
                    <div class="text-caption text-grey-5">
                      Standard • Qty: {{ ingredient.currentQuantity }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 定制化摘要 -->
        <div
          v-if="
            localProduct.customizations &&
            localProduct.customizations.length > 0
          "
          class="q-mt-md"
        >
          <div class="text-subtitle2 text-weight-medium text-deep-orange q-mb-sm">
           <q-icon name="edit" /> Changes
          </div>
          <div class="customization-tags">
            <q-chip
              v-for="(custom, index) in localProduct.customizations"
              :key="index"
              :color="getCustomizationColor(custom)"
              text-color="white"
              dense
              size="sm"
            >
              {{ formatCustomization(custom) }}
            </q-chip>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          color="deep-orange"
          label="Add to Cart"
          class="q-mr-sm"
          @click="addFromDetails"
          :disable="localProduct.stock === 0"
        />
        <q-btn flat label="Close" color="grey" @click="closeDetails" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <ReplacementSelectDialog
    :modelValue="showReplacementDialog"
    :ingredient="selectedReplacement"
    @update:model-value="(val) => (showReplacementDialog.value = val)"
    @select="onReplacementSelected"
    @close="showReplacementDialog.value = false"
  />
</template>

<script setup>
import { computed, ref, watch } from "vue";
import axios from "axios";
import ReplacementSelectDialog from "src/components/ReplacementSelectDialog.vue";

const VITE_API_URL = import.meta.env.VITE_API_URL;

// Props
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  isPopular: {
    type: Boolean,
    default: false,
  },
  isOrdered: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["add-to-cart", "remove-from-cart"]);

// 计算当前数量（这里需要从父组件的购物车数据中获取）
const currentQuantity = computed(() => {
  return props.product.quantity || 0;
});

// 方法
function addToCart() {
  // 如果商品已经被定制化（有配料信息），传递定制化数据
  if (localProduct.value.ingredients && localProduct.value.ingredients.length > 0) {
    const customizedProduct = {
      id: localProduct.value.id,
      quantity: 1,
      snapshot: JSON.parse(JSON.stringify(localProduct.value)),
      customized: true,
      currentPrice: localProduct.value.currentPrice || localProduct.value.price || 0,
    };
    emit("add-to-cart", customizedProduct);
  } else {
    // 普通商品，传递简单结构
    emit("add-to-cart", {
      id: props.product.id,
      quantity: 1,
      customized: false,
    });
  }
}

function removeFromCart() {
  emit("remove-from-cart", props.product);
}

function formatLastOrdered(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString("en-AU", {
      month: "short",
      day: "numeric",
    });
  }
}

// local copy of product to avoid mutating parent object directly in dialogs
const localProduct = ref(JSON.parse(JSON.stringify(props.product || {})));

// details dialog visibility + loading / error state for ingredients
const showDetailsDialog = ref(false);
const isLoadingIngredients = ref(false);
const ingredientsError = ref(null);

// replacement dialog state (lightweight hook for Customize button)
const showReplacementDialog = ref(false);
const selectedReplacement = ref(null);

// keep localProduct in sync if prop changes (shallow)
watch(
  () => props.product,
  (val) => {
    localProduct.value = JSON.parse(JSON.stringify(val || {}));
  }
);

const grouped = computed(() => {
  const groups = { customizable: {}, fixed: {} };
  const ingredients = localProduct.value?.ingredients || [];
  const byType = (arr) => {
    const r = {};
    arr.forEach((i) => {
      const t = i.type || "Other";
      (r[t] = r[t] || []).push(i);
    });
    return r;
  };

  const customizable = ingredients.filter((i) => i.mode !== "fixed");
  const fixed = ingredients.filter((i) => i.mode === "fixed");
  groups.customizable = byType(customizable);
  groups.fixed = byType(fixed);
  return groups;
});

function increase(ingredient) {
  ingredient.currentQuantity = (ingredient.currentQuantity || 0) + 1;
  const extra = ingredient.extraPrice || ingredient.extra_price || 0;
  localProduct.value.currentPrice = Number(
    (localProduct.value.currentPrice + extra).toFixed(2)
  );
  autoApplyCustomization();
}

function decrease(ingredient) {
  if ((ingredient.currentQuantity || 0) > 0) {
    ingredient.currentQuantity--;
    const extra = ingredient.extraPrice || ingredient.extra_price || 0;
    localProduct.value.currentPrice = Number(
      (localProduct.value.currentPrice - extra).toFixed(2)
    );
    if (localProduct.value.currentPrice < 0)
      localProduct.value.currentPrice = 0;
    autoApplyCustomization();
  }
}

function getQuantityPriceInfo(ingredient) {
  try {
    if (!ingredient) return null;
    const extra = ingredient.extra_price || 0;
    if (extra === 0) return null;
    return `Extra $${extra.toFixed(2)} per extra portion`;
  } catch (e) {
    return null;
  }
}

async function loadIngredientsForProduct(productId) {
  if (!productId) return;
  isLoadingIngredients.value = true;
  ingredientsError.value = null;

  try {
    const resp = await axios.get(
      `${VITE_API_URL}/api/get-product-customization/${productId}`
    );
    if (!resp.data || !resp.data.success) {
      ingredientsError.value = "No customization data";
      localProduct.value.ingredients = [];
      return;
    }

    const data = resp.data.data || { items: [], customizationItems: [] };

    // build ingredients similarly to CustomerConfirm.buildIngredients
    const { items, customizationItems } = data;

    const customMap = {};
    (customizationItems || []).forEach((c) => {
      customMap[c.item_id] = c;
    });

    const allIngredientIds = new Set();
    (items || []).forEach((it) => allIngredientIds.add(it.id));
    (customizationItems || []).forEach((custom) => {
      if (
        custom.mode === "replaceable" ||
        custom.mode === "replaceable_variable"
      ) {
        (custom.replacement_list || []).forEach((id) =>
          allIngredientIds.add(id)
        );
      }
    });

    // fetch bulk item details if needed
    const ingredientDetails = new Map();
    if (allIngredientIds.size > 0) {
      try {
        const formData = new FormData();
        formData.append('ids', Array.from(allIngredientIds).join(","));
        const bulkResp = await axios.post(
          `${VITE_API_URL}/api/get-bulk-items`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        if (
          bulkResp.data &&
          bulkResp.data.success &&
          Array.isArray(bulkResp.data.data)
        ) {
          bulkResp.data.data.forEach((it) => ingredientDetails.set(it.id, it));
        }
      } catch (e) {
        // non-fatal: continue with available data
        console.error("Error fetching bulk items:", e);
      }
    }

    const built = (items || []).map((item) => {
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
          ingredient.extra_price =
            (custom.quantity_price && custom.quantity_price.extra) || 0;
        } catch (e) {}

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
              description: details
                ? details.description
                : "Original ingredient",
            },
          ];

          try {
            const replacementList = custom.replacement_list || [];
            const replacementDiff = custom.replacement_diff || {};
            replacementList.forEach((repId) => {
              const repDetails = ingredientDetails.get(repId);
              const priceChange =
                replacementDiff[repId.toString()] ||
                replacementDiff[repId] ||
                0;
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

    localProduct.value.ingredients = built;
    // 确保设置正确的当前价格
    if (!localProduct.value.currentPrice) {
      localProduct.value.currentPrice = localProduct.value.price || 0;
    }

    // 初始化定制化信息
    autoApplyCustomization();
  } catch (err) {
    console.error("Error loading customization:", err);
    ingredientsError.value = "Failed to load ingredients";
    localProduct.value.ingredients = [];
  } finally {
    isLoadingIngredients.value = false;
  }
}

async function openDetails() {
  localProduct.value = JSON.parse(JSON.stringify(props.product || {}));
  // load ingredients from API before showing dialog
  await loadIngredientsForProduct(localProduct.value.id);
  showDetailsDialog.value = true;
}

function closeDetails() {
  showDetailsDialog.value = false;
}

function openReplacementDialog(ingredient) {
  selectedReplacement.value = ingredient;
  showReplacementDialog.value = true;
}

function onReplacementSelected(val) {
  if (selectedReplacement.value) {
    const ingredient = localProduct.value.ingredients.find(
      (i) => i.id === selectedReplacement.value.id
    );
    if (ingredient && ingredient.replacementOptions) {
      const oldOption = ingredient.replacementOptions.find(
        (opt) => opt.value === ingredient.replacementId
      );
      const newOption = ingredient.replacementOptions.find(
        (opt) => opt.value === val
      );

      if (newOption) {
        // 计算价格变化 - 使用 price_change 而不是 price
        const oldPriceChange = oldOption ? oldOption.price_change || 0 : 0;
        const newPriceChange = newOption.price_change || 0;
        const priceDifference = newPriceChange - oldPriceChange;

        // 更新配料信息
        ingredient.replacementId = val;
        ingredient.displayName = newOption.name;

        // 更新价格
        localProduct.value.currentPrice = Number(
          (localProduct.value.currentPrice + priceDifference).toFixed(2)
        );
        if (localProduct.value.currentPrice < 0) {
          localProduct.value.currentPrice = 0;
        }

        // 应用定制化信息
        autoApplyCustomization();

        // 显示成功通知
        console.log(`Replaced with ${newOption.name}`);
      }
    }
  }
  showReplacementDialog.value = false;
}

function updateIngredient(ingredientId, updatedData) {
  const ingredient = localProduct.value.ingredients.find(
    (i) => i.id === ingredientId
  );
  if (ingredient) {
    Object.assign(ingredient, updatedData);
    autoApplyCustomization();
  }
}

/**
 * 自动应用定制更改 - 参考 CustomerConfirm.vue 的实现
 */
function autoApplyCustomization() {
  if (!localProduct.value) {
    return;
  }

  // 更新定制信息
  const customizations = [];

  (localProduct.value.ingredients || []).forEach((ingredient) => {
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
      const replacement = ingredient.replacementOptions?.find(
        (opt) => opt.value === ingredient.replacementId
      );

      if (replacement) {
        customizations.push({
          type: "replacement",
          originalName:
            ingredient.replacementOptions?.find(
              (opt) => opt.value === ingredient.id
            )?.name || ingredient.name,
          replacementName: replacement.name,
          priceChange: replacement.price_change || 0,
        });
      }
    }
  });

  localProduct.value.customizations = customizations;
}

/**
 * 获取当前替换配料的显示名称 - 参考 CustomerConfirm.vue
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

/**
 * 格式化定制信息显示文本 - 参考 CustomerConfirm.vue
 * @param {Object} custom - 定制对象
 * @returns {string} 格式化后的文本
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

function addFromDetails() {
  // 构建定制化商品数据结构，参考 CustomerOrder.vue 的期望格式
  const customizedProduct = {
    id: localProduct.value.id,
    quantity: 1,
    snapshot: JSON.parse(JSON.stringify(localProduct.value)), // 深拷贝完整的商品快照
    customized: true,
    currentPrice: localProduct.value.currentPrice || localProduct.value.price || 0,
  };

  emit("add-to-cart", customizedProduct);
  showDetailsDialog.value = false;
}
</script>

<style scoped>
.product-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.product-image {
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ellipsis-2-lines {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  height: 2.8em;
}

.ingredient-group {
  margin-bottom: 8px;
}
.group-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.group-title {
  font-weight: 600;
}
.type-section {
  margin-bottom: 12px;
}
.type-header {
  font-weight: 600;
}
.info-notice {
  background: #fff7ed;
  padding: 8px;
  border-radius: 6px;
  margin-bottom: 12px;
}

/* scrollable ingredients area similar to CustomizeDialog */
.ingredients-scroll {
  max-height: 320px;
  overflow: auto;
  padding-right: 6px; /* avoid hiding content behind scrollbar */
}

@media (max-width: 600px) {
  .ingredients-scroll {
    max-height: 220px;
  }
}

/* 按钮动画 */
.q-btn {
  transition: all 0.2s ease;
}

.q-btn:hover {
  transform: scale(1.05);
}

/* 标签动画 */
.q-badge {
  animation: fadeInDown 0.5s ease;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

/* dotted connector between ingredient name and actions */
.connector {
  flex: 1 1 auto;
  height: 1px;
  align-self: center;
  min-width: 8px;
}
.connector.dotted {
  /* thicker, more visible dotted line */
  border-bottom: 2px dotted rgba(0, 0, 0, 0.32);
  margin-left: 8px;
  margin-right: 8px;
}
.action-group {
  flex: 0 0 auto; /* prevent actions from shrinking */
  display: flex;
  align-items: center;
  gap: 6px;
}

@media (max-width: 600px) {
  .connector {
    display: none; /* hide connector on small screens to save space */
  }
}
</style>
