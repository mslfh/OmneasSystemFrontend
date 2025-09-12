<template>
  <q-page padding>
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="row items-center justify-between q-mr-md-md q-ml-md-md">
          <div class="text-h6">Add New Product</div>
          <div class="q-gutter-sm">
            <q-btn
              flat
              icon="refresh"
              color="grey-7"
              label="Reset Form"
              @click="resetForm()"
              :disable="saving"
            />
            <q-btn
              flat
              icon="save"
              color="positive"
              label="Save Product"
              @click="saveProduct()"
              :loading="saving"
              :disable="!isFormValid"
            />
            <q-btn
              flat
              icon="cancel"
              color="negative"
              label="Cancel"
              @click="router.go(-1)"
            />
            <!-- removed extra closing div tag -->
          </div>
        </div>
        <div class="q-pa-md">
          <q-form @submit="saveProduct" class="q-gutter-md" ref="formRef">
            <q-list>
              <q-expansion-item
                popup
                default-opened
                icon="info"
                label="Basic Information"
                caption="Required fields for product"
                class="q-mb-md"
              >
                <q-separator />
                <q-card flat bordered class="bg-grey-1">
                  <q-card-section class="q-pa-md">
                    <q-gutter class="q-col-gutter-md q-row-gutter-md">
                      <div class="row q-col-gutter-md q-row-gutter-md">
                        <div class="col-12">
                          <q-input
                            v-model="product.code"
                            label="Product Code *"
                            outlined
                            dense
                            :rules="[
                              (val) =>
                                (val && val.length > 0) ||
                                'Product code is required',
                            ]"
                            hint="Unique product identifier"
                          />
                        </div>
                        <div class="col-12 col-md-12">
                          <q-input
                            v-model="product.title"
                            label="Title *"
                            outlined
                            dense
                            :rules="[
                              (val) =>
                                (val && val.length > 0) || 'Title is required',
                            ]"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="product.second_title"
                            label="Second Title"
                            outlined
                            dense
                            hint="Alternative or translated title"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="product.acronym"
                            label="Acronym"
                            outlined
                            dense
                            hint="Short hotkey of the product for search"
                          />
                        </div>
                        <div class="col-12">
                          <q-input
                            v-model="product.description"
                            label="Description"
                            outlined
                            type="textarea"
                            rows="3"
                            hint="Detailed product description"
                          />
                        </div>
                        <div class="col-12">
                          <q-input
                            v-model="product.tip"
                            label="Tip"
                            outlined
                            dense
                            hint="Usage tips or important notes"
                          />
                        </div>
                      </div>
                    </q-gutter>
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <!-- Categories & Ingredients -->
              <q-expansion-item
                popup
                default-opened
                icon="category"
                label="Categories & Ingredients"
                caption="Select product categories and ingredients"
                class="q-mb-md"
              >
                <q-separator />
                <q-card flat bordered class="bg-grey-1">
                  <q-card-section class="q-pa-md">
                    <div class="row q-col-gutter-md q-row-gutter-md">
                      <div class="col-12 col-md-6">
                        <div class="text-subtitle2 q-mb-sm">Category</div>
                        <q-tree
                          :nodes="categoryTree"
                          node-key="id"
                          label-key="title"
                          children-key="children"
                          tick-strategy="leaf"
                          v-model:ticked="product.categories"
                          v-model:selected="categorySelected"
                          v-model:expanded="categoryExpanded"
                          :loading="loadingCategories"
                          :ticked-color="'primary'"
                        >
                          <template v-slot:default-header="{ node }">
                            <div class="row items-center">
                              <div class="col">
                                <span>{{ node.title }}</span>
                                <span
                                  v-if="node.hint"
                                  class="text-grey-7 q-ml-sm"
                                  style="font-size: 12px"
                                  >{{ node.hint }}</span
                                >
                              </div>
                            </div>
                          </template>
                        </q-tree>
                      </div>
                      <div class="col-12 col-md-6">
                        <div class="text-subtitle2 q-mb-sm">Ingredients</div>
                        <div
                          v-for="(items, type) in groupedIngredients"
                          :key="type"
                          class="q-mb-sm"
                        >
                          <q-expansion-item
                            popup
                            :label="type"
                            :caption="getSelectedItemsCaption(type)"
                            dense
                            class="text-caption bg-grey-1 rounded-borders"
                          >
                            <q-list dense>
                              <q-item
                                v-for="item in items"
                                :key="item.id"
                                :class="
                                  isIngredientSelected(item.id)
                                    ? 'bg-blue-1'
                                    : ''
                                "
                                dense
                              >
                                <q-item-section side>
                                  <q-checkbox
                                    :model-value="isIngredientSelected(item.id)"
                                    @update:model-value="
                                      () => toggleIngredient(item)
                                    "
                                    color="primary"
                                    size="sm"
                                  />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-subtitle3">{{
                                    item.label
                                  }}</q-item-label>
                                </q-item-section>
                                <q-item-section side style="min-width: 120px">
                                  <div
                                    v-if="isIngredientSelected(item.id)"
                                    class="row q-gutter-xs items-center"
                                  >
                                    <q-input
                                      :model-value="
                                        getIngredientQuantity(item.id)
                                      "
                                      @update:model-value="
                                        (val) =>
                                          updateIngredientQuantity(item.id, val)
                                      "
                                      type="number"
                                      min="1"
                                      max="99"
                                      dense
                                      outlined
                                      style="width: 60px"
                                    />
                                    <q-select
                                      :model-value="getIngredientUnit(item.id)"
                                      @update:model-value="
                                        (val) =>
                                          updateIngredientUnit(item.id, val)
                                      "
                                      :options="unitOptions"
                                      dense
                                      outlined
                                      emit-value
                                      map-options
                                      style="width: 120px"
                                    />
                                  </div>
                                </q-item-section>
                                <q-item-section side>
                                  <q-chip
                                    color="green"
                                    text-color="white"
                                    size="sm"
                                    dense
                                  >
                                    ${{ item.price }}
                                  </q-chip>
                                </q-item-section>
                              </q-item>
                            </q-list>
                          </q-expansion-item>
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <!-- Customization Options Component -->
              <ProductCustomizationOptions
                v-model:customizable="product.customizable"
                v-model:customizations="product.customizations"
                :selected-ingredients="product.ingredients"
                :ingredient-map="ingredientMap"
                :ingredients-by-type="ingredientsByType"
                :unit-options="unitOptions"
                @customization-changed="buildCustomizationsMap"
              />

              <!-- Pricing Information Component -->
              <PricingInformation
                :pricing="{
                  price: product.price,
                  discount: product.discount,
                  selling_price: product.selling_price,
                  tax_rate: product.tax_rate,
                  profile_id: product.profile_id
                }"
                @update:pricing="updatePricing"
              />

              <q-expansion-item
                popup
                icon="inventory_2"
                label="Inventory & Status"
                caption="Stock, status, and sort order"
                class="q-mb-md"
              >
                <q-separator />
                <q-card flat bordered class="bg-grey-1">
                  <q-card-section class="q-pa-md">
                    <div class="row q-col-gutter-md justify-between q-row-gutter-md">
                      <div class="col-12 col-md-4">
                        <div class="row items-center justify-between q-gutter-sm">
                          <div class="col">
                            <q-input
                              v-model.number="product.stock"
                              label="Stock *"
                              outlined
                              dense
                              type="number"
                              :disable="product.stock === -1"
                              :rules="[
                                (val) =>
                                  val >= 0 ||
                                  val === -1 ||
                                  'Stock must be positive or unlimited',
                              ]"
                            />
                          </div>
                           <div class="col-auto text-caption">
                            <q-checkbox
                              :model-value="product.stock === -1"
                              @update:model-value="
                                (val) => (product.stock = val ? -1 : 0)
                              "
                              label="Unlimited"
                              color="primary"
                            />
                          </div>
                        </div>
                      </div>

                      <div class="col-12 col-md-4">
                        <q-select
                          v-model="product.sort"
                          :options="sortOptions"
                          option-label="label"
                          option-value="value"
                          emit-value
                          map-options
                          label="Priority Level"
                          outlined
                          dense
                          hint="Hot has highest priority"
                        />
                      </div>

                        <div class="col-12 col-md-3">
                        <q-toggle
                          v-model="product.status"
                          true-value="active"
                          false-value="inactive"
                          color="primary"
                          label="Active Status"
                          left-label
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <q-expansion-item
                popup
                icon="tune"
                label="Additional Options"
                caption="Tags, featured, and viewable"
                class="q-mb-md"
              >
                <q-separator />
                <q-card flat bordered class="bg-grey-1">
                  <q-card-section class="q-pa-md">
                    <div class="row q-col-gutter-md q-row-gutter-md">
                      <div class="col-12 col-md-6">
                        <q-icon name="star" />
                        <q-checkbox
                          v-model="product.is_featured"
                          label="Popular Product"
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-checkbox
                          v-model="product.viewable"
                          label="Viewable for Customers"
                        />
                      </div>
                      <div class="col-12">
                        <q-input
                          v-model="product.tag"
                          label="Tags"
                          outlined
                          dense
                          hint="Separate tags with commas (e.g., Sweet, Asian, Spicy)"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <q-expansion-item
                popup
                icon="image"
                label="Images"
                caption="Main and gallery images"
                class="q-mb-md"
              >
                <q-separator />
                <q-card flat bordered class="bg-grey-1">
                  <q-card-section class="q-pa-md">
                    <div class="row q-col-gutter-md q-row-gutter-md">
                      <div class="col-12">
                        <q-input
                          v-model="product.image"
                          label="Main Image URL"
                          outlined
                          dense
                          hint="URL for the main product image"
                        />
                      </div>
                      <div class="col-12">
                        <q-input
                          v-model="imageListString"
                          label="Image Gallery URLs"
                          outlined
                          type="textarea"
                          rows="3"
                          hint="Enter one image URL per line for additional product images"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
            <div>
              <!-- Preview Section -->
              <div class="col-12" v-if="product.image">
                <div class="text-subtitle1 q-mb-sm">Image Preview</div>
                <q-separator class="q-mb-md" />
                <div class="row q-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-img
                      :src="product.image"
                      :alt="product.title"
                      style="height: 200px; max-width: 100%"
                      class="rounded-borders"
                      @error="imageError"
                    >
                      <template v-slot:error>
                        <div
                          class="absolute-full flex flex-center bg-grey-3 text-grey-6"
                        >
                          <div class="text-center">
                            <q-icon name="broken_image" size="50px" />
                            <div>Invalid image URL</div>
                          </div>
                        </div>
                      </template>
                    </q-img>
                  </div>
                </div>
              </div>
            </div>
          </q-form>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { api } from "boot/axios";
import { useRouter } from "vue-router";
import ProductCustomizationOptions from "components/ProductCustomizationOptions.vue";
import PricingInformation from "components/PricingInformation.vue";
import StatusBanner from "components/StatusBanner.vue";
import { useFormCache, useFormLeaveConfirm } from "../composables/useFormCache.js";
import { debounce } from "../utils/helpers.js";

const router = useRouter();
const $q = useQuasar();
const formRef = ref(null);

// 初始产品数据模型
const initialProductData = {
  code: "",
  title: "",
  second_title: "",
  acronym: "",
  description: "",
  tip: "",
  price: "0.00",
  discount: "0.00",
  selling_price: "0.00",
  tax_rate: "10.00",
  profile_id: null,
  stock: -1,
  status: "active",
  viewable: true,
  image: "",
  image_list: [],
  tag: "",
  sort: 3,
  is_featured: false,
  customizable: true,
  categories: [],
  ingredients: [],
  customizations: [],
}

// 缓存管理
const CACHE_KEY = 'admin_product_add'
const {
  loadFromCache,
  saveToCache,
  clearCache,
  hasCache,
  getCacheTimestamp
} = useFormCache(CACHE_KEY, initialProductData)

// State refs
const saving = ref(false);
const categorySelected = ref(null);
const categoryExpanded = ref([]);
const loadingCategories = ref(false);
const loadingIngredients = ref(false);
const hasUnsavedChanges = ref(false);

// 从缓存加载或使用初始数据
const product = ref(loadFromCache());

// Optimized data structures
const ingredientMap = ref(new Map());
const ingredientsByType = ref(new Map());
const selectedIngredientsMap = ref(new Map());
const customizationsMap = ref(new Map());

// Product data model - removed since we're using cached data

// Data refs
const categoryOptions = ref([]);
const categoryTree = ref([]);
const ingredientOptions = ref([]);

// Options
const unitOptions = ref([
  { label: "Several", value: "several" },
  { label: "Piece", value: "piece" },
]);

const sortOptions = ref([
  { label: "Hot", value: 1 },
  { label: "High", value: 2 },
  { label: "Medium", value: 3 },
  { label: "Low", value: 4 },
]);

// Computed properties
const groupedIngredients = computed(() => {
  return Object.fromEntries(ingredientsByType.value);
});

const imageListString = computed({
  get() {
    if (product.value.image_list && Array.isArray(product.value.image_list)) {
      return product.value.image_list.join("\n");
    }
    return "";
  },
  set(value) {
    if (value) {
      product.value.image_list = value.split("\n").filter((url) => url.trim());
    } else {
      product.value.image_list = [];
    }
  },
});

const isFormValid = computed(() => {
  return (
    product.value.code &&
    product.value.title &&
    product.value.price >= 0 &&
    product.value.selling_price >= 0 &&
    product.value.status
  );
});

// Utility functions
function buildCategoryTree(list) {
  const map = {};
  const roots = [];
  list.forEach((item) => {
    map[item.id] = { ...item, children: [] };
  });
  list.forEach((item) => {
    if (item.parent_id && map[item.parent_id]) {
      map[item.parent_id].children.push(map[item.id]);
    } else {
      roots.push(map[item.id]);
    }
  });
  return roots;
}

function buildIngredientMaps() {
  ingredientMap.value.clear();
  ingredientsByType.value.clear();

  ingredientOptions.value.forEach((item) => {
    ingredientMap.value.set(item.id, item);

    const type = item.type || "Other";
    if (!ingredientsByType.value.has(type)) {
      ingredientsByType.value.set(type, []);
    }
    ingredientsByType.value.get(type).push(item);
  });
}

function buildSelectedIngredientsMap() {
  selectedIngredientsMap.value.clear();
  if (product.value.ingredients && Array.isArray(product.value.ingredients)) {
    product.value.ingredients.forEach((ing) => {
      selectedIngredientsMap.value.set(ing.id, ing);
    });
  }
}

function buildCustomizationsMap() {
  customizationsMap.value.clear();
  if (product.value.customizations && Array.isArray(product.value.customizations)) {
    product.value.customizations.forEach((custom) => {
      customizationsMap.value.set(custom.ingredientId, custom);
    });
  }
}

function initializeMaps() {
  // Ensure arrays exist before building maps
  if (!product.value.ingredients) {
    product.value.ingredients = [];
  }
  if (!product.value.customizations) {
    product.value.customizations = [];
  }

  buildSelectedIngredientsMap();
  buildCustomizationsMap();
}

// Pricing update handler
function updatePricing(newPricing) {
  Object.assign(product.value, newPricing);
  autosaveToCache();
}

// Ingredient management functions
function toggleIngredient(item) {
  // Ensure ingredients array exists
  if (!product.value.ingredients) {
    product.value.ingredients = [];
  }
  if (!product.value.customizations) {
    product.value.customizations = [];
  }

  const existingIndex = product.value.ingredients.findIndex(
    (ing) => ing.id === item.id
  );

  if (existingIndex > -1) {
    product.value.ingredients.splice(existingIndex, 1);
    selectedIngredientsMap.value.delete(item.id);

    const customIndex = product.value.customizations.findIndex(
      (c) => c.ingredientId === item.id
    );
    if (customIndex > -1) {
      product.value.customizations.splice(customIndex, 1);
      customizationsMap.value.delete(item.id);
    }
  } else {
    const newIngredient = {
      id: item.id,
      quantity: 1,
      unit: unitOptions.value[0].label,
    };
    product.value.ingredients.push(newIngredient);
    selectedIngredientsMap.value.set(item.id, newIngredient);
  }

  // 手动触发缓存保存
  autosaveToCache();
}

function isIngredientSelected(itemId) {
  return selectedIngredientsMap.value.has(itemId);
}

function getIngredientQuantity(itemId) {
  const ingredient = selectedIngredientsMap.value.get(itemId);
  return ingredient ? ingredient.quantity : 1;
}

function getIngredientUnit(itemId) {
  const ingredient = selectedIngredientsMap.value.get(itemId);
  return ingredient ? ingredient.unit : "several";
}

function updateIngredientQuantity(itemId, quantity) {
  const ingredient = selectedIngredientsMap.value.get(itemId);
  if (ingredient) {
    ingredient.quantity = Math.max(1, Math.min(99, parseInt(quantity) || 1));
    // 手动触发缓存保存
    autosaveToCache();
  }
}

function updateIngredientUnit(itemId, unit) {
  const ingredient = selectedIngredientsMap.value.get(itemId);
  if (ingredient) {
    ingredient.unit = unit;
    // 手动触发缓存保存
    autosaveToCache();
  }
}

function formatQuantityUnit(quantity, unit) {
  const unitLabel =
    unitOptions.value.find((opt) => opt.value === unit)?.label || "Several";
  return `${quantity} ${unitLabel}`;
}

// Get selected items caption for a specific type
function getSelectedItemsCaption(type) {
  const typeItems = ingredientsByType.value.get(type) || [];
  const selectedItems = typeItems.filter(item => isIngredientSelected(item.id));

  if (selectedItems.length === 0) {
    return `${typeItems.length} items available`;
  } else if (selectedItems.length <= 3) {
    const names = selectedItems.map(item => item.name || item.label).join(', ');
    return ` ${names}`;
  } else {
    const firstThree = selectedItems.slice(0, 3).map(item => item.name || item.label).join(', ');
    return ` ${firstThree} +${selectedItems.length - 3} more`;
  }
}

// API functions
async function fetchCategories() {
  loadingCategories.value = true;
  try {
    const res = await api.get("/api/categories/active");
    if (res.data.data) {
      categoryOptions.value = res.data.data;
      categoryTree.value = buildCategoryTree(categoryOptions.value);
    } else {
      categoryOptions.value = [];
      categoryTree.value = [];
    }
  } catch (e) {
    categoryOptions.value = [];
  } finally {
    loadingCategories.value = false;
  }
}

async function fetchIngredients() {
  loadingIngredients.value = true;
  try {
    const res = await api.get("/api/items/active");
    if (Array.isArray(res.data.data)) {
      ingredientOptions.value = res.data.data.map((item) => ({
        label: item.name,
        value: item.id,
        description: item.description,
        type: item.type,
        price: item.price,
        extra_price: item.extra_price,
        id: item.id,
        name: item.name,
      }));

      buildIngredientMaps();
    } else {
      ingredientOptions.value = [];
    }
  } catch (e) {
    ingredientOptions.value = [];
  } finally {
    loadingIngredients.value = false;
  }
}

async function saveProduct() {
  try {
    const isValid = await formRef.value.validate();
    if (!isValid) {
      $q.notify({
        type: "negative",
        message: "Please fix the form errors before saving",
        position: "top",
        timeout: 3000,
      });
      return;
    }

    saving.value = true;

    const submitData = { ...product.value };

    // Ensure customizations have the type field
    if (submitData.customizations && Array.isArray(submitData.customizations)) {
      submitData.customizations = submitData.customizations.map(customization => ({
        ...customization,
        type: customization.type !== undefined ? customization.type : 0
      }));
    }

    submitData.is_featured = submitData.is_featured ? 1 : 0;
    submitData.viewable = submitData.viewable ? 1 : 0;
    submitData.customizable = submitData.customizable ? 1 : 0;

    if (typeof submitData.image_list === "string") {
      submitData.image_list = submitData.image_list
        .split("\n")
        .filter((url) => url.trim());
    }

    if (!submitData.image) delete submitData.image;
    if (!submitData.second_title) delete submitData.second_title;
    if (!submitData.acronym) delete submitData.acronym;
    if (!submitData.description) delete submitData.description;
    if (!submitData.tip) delete submitData.tip;
    if (!submitData.tag) delete submitData.tag;

    const response = await api.post("/api/products", submitData);

    // 保存成功后清除缓存
    clearCache();
    hasUnsavedChanges.value = false;

    $q.notify({
      type: "positive",
      message: "Product created successfully",
      position: "top",
      timeout: 3000,
    });

    router.push({
      path: "/admin/product/detail",
      query: { id: response.data.data.id },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    $q.notify({
      type: "negative",
      message: error.response?.data?.message || "Error creating product",
      position: "top",
      timeout: 3000,
    });
  } finally {
    saving.value = false;
  }
}

// 缓存管理函数
const debouncedAutosave = debounce(() => {
  saveToCache(product.value);
  hasUnsavedChanges.value = true;
}, 1000); // 1秒防抖

function autosaveToCache() {
  debouncedAutosave();
}

function showCacheRestoreDialog() {
  if (hasCache()) {
    const timestamp = getCacheTimestamp();
    const timeStr = timestamp ? new Date(timestamp).toLocaleString() : 'unknown time';

    $q.dialog({
      title: 'Cache Detected',
      message: `Unsaved data from previous session detected (saved at ${timeStr}). Do you want to restore it?`,
      cancel: {
        label: 'Do Not Restore',
        color: 'grey',
        flat: true
      },
      ok: {
        label: 'Restore Data',
        color: 'primary'
      },
      persistent: true
    }).onOk(() => {
      // 数据已经在初始化时加载了
      $q.notify({
        type: 'positive',
        message: 'Data restored from cache',
        position: 'top',
        timeout: 2000
      });
    }).onCancel(() => {
      // 重置为初始数据并清除缓存
      product.value = { ...initialProductData };
      clearCache();
      hasUnsavedChanges.value = false;
    });
  }
}

function resetForm() {
  $q.dialog({
    title: 'Reset Form',
    message: 'Are you sure you want to reset the form? All filled data will be cleared.',
    cancel: true,
    persistent: true
  }).onOk(() => {
    product.value = { ...initialProductData };
    clearCache();
    hasUnsavedChanges.value = false;
    // 重新初始化映射
    initializeMaps();
    $q.notify({
      type: 'info',
      message: 'Form has been reset',
      position: 'top',
      timeout: 2000
    });
  });
}

function imageError() {
  $q.notify({
    type: "warning",
    message: "Invalid image URL",
    position: "top",
    timeout: 2000,
  });
}

// Watchers - reduced to essential only
watch(
  () => product.value.customizable,
  (newValue) => {
    if (!newValue) {
      product.value.customizations = [];
      customizationsMap.value.clear();
    }
  }
);

// 监听产品数据变化并自动保存到缓存
watch(
  product,
  () => {
    autosaveToCache();
  },
  { deep: true }
);

// 页面离开确认
const { setupLeaveConfirm } = useFormLeaveConfirm(hasUnsavedChanges);
let cleanupLeaveConfirm = null;

// Lifecycle hooks
onMounted(async () => {
  // 设置页面离开确认
  cleanupLeaveConfirm = setupLeaveConfirm();

  await Promise.all([fetchCategories(), fetchIngredients()]);
  initializeMaps();

  // 检查是否有缓存数据需要恢复
  if (hasCache()) {
    showCacheRestoreDialog();
  }
});

onUnmounted(() => {
  // 清理页面离开监听器
  if (cleanupLeaveConfirm) {
    cleanupLeaveConfirm();
  }
});
</script>

<style scoped>
.q-form {
  max-width: 100%;
}

/* 为替换选项优化布局 */
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 紧凑的卡片样式 */
.q-card.q-pa-xs {
  padding: 6px !important;
}

/* 输入框紧凑样式 */
.q-field--dense .q-field__control {
  min-height: 32px;
}
</style>

<style scoped>
.exp-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #46525e;
  letter-spacing: 0.5px;
  vertical-align: middle;
}
</style>
