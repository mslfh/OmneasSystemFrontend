<template>
  <q-page padding>
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="row items-center justify-between q-mr-md-md q-ml-md-md">
          <div class="text-h6">Edit Product</div>
          <div class="q-gutter-sm">
            <q-btn
              flat
              icon="save"
              color="positive"
              label="Save Changes"
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
        <div class="q-pa-md" v-if="product">
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
                                      style="width: 50px"
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
                    <div class="row q-col-gutter-md q-row-gutter-md">
                      <div class="col-12 col-md-4">
                        <div class="row items-center q-gutter-sm">
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
                          <div class="col-auto">
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
                      <div class="col-12 col-md-4 flex items-center">
                        <q-toggle
                          v-model="product.status"
                          true-value="active"
                          false-value="inactive"
                          color="primary"
                          label="Active Status"
                          left-label
                        />
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
                        <q-checkbox
                          v-model="product.is_featured"
                          label="Featured Product"
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-checkbox
                          v-model="product.viewable"
                          label="Viewable"
                        />
                      </div>
                      <div class="col-12">
                        <q-input
                          v-model="product.tag"
                          label="Tags"
                          outlined
                          dense
                          hint="Separate tags with commas (e.g., Popular,Asian,Spicy)"
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

    <!-- Loading State -->
    <q-card v-if="!product && loading" class="q-pa-md">
      <q-card-section class="text-center">
        <q-spinner color="primary" size="50px" />
        <div class="q-mt-md">Loading product details...</div>
      </q-card-section>
    </q-card>

    <!-- Not Found State -->
    <q-card v-if="!product && !loading" class="q-pa-md">
      <q-card-section class="text-center">
        <q-icon name="error" size="50px" color="negative" />
        <div class="q-mt-md text-h6">Product not found</div>
        <q-btn
          flat
          color="primary"
          label="Go Back"
          @click="router.go(-1)"
          class="q-mt-md"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { ref, computed, watch, onMounted } from "vue";
import { api } from "boot/axios";
import { useRouter, useRoute } from "vue-router";
import ProductCustomizationOptions from "components/ProductCustomizationOptions.vue";
import PricingInformation from "components/PricingInformation.vue";

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const formRef = ref(null);

// State refs
const saving = ref(false);
const loading = ref(true);
const categorySelected = ref(null);
const categoryExpanded = ref([]);
const loadingCategories = ref(false);
const loadingIngredients = ref(false);

// Optimized data structures
const ingredientMap = ref(new Map());
const ingredientsByType = ref(new Map());
const selectedIngredientsMap = ref(new Map());
const customizationsMap = ref(new Map());

// Product data model
const product = ref({
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
  stock: 0,
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
});

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
  product.value.ingredients.forEach((ing) => {
    selectedIngredientsMap.value.set(ing.id, ing);
  });
}

function buildCustomizationsMap() {
  customizationsMap.value.clear();
  product.value.customizations.forEach((custom) => {
    customizationsMap.value.set(custom.ingredientId, custom);
  });
}

function initializeMaps() {
  buildSelectedIngredientsMap();
  buildCustomizationsMap();
}

// Pricing update handler
function updatePricing(newPricing) {
  Object.assign(product.value, newPricing);
}

// Ingredient management functions
function toggleIngredient(item) {
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
  }
}

function updateIngredientUnit(itemId, unit) {
  const ingredient = selectedIngredientsMap.value.get(itemId);
  if (ingredient) {
    ingredient.unit = unit;
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

async function fetchProductDetail(id) {
  try {
    loading.value = true;
    const response = await api.get(`/api/products/${id}`);

    // 处理API响应的数据结构
    if (response.data.success && response.data.data) {
      const productData = response.data.data;

      // Transform the data to match AdminProductAdd structure
      product.value = {
        id: productData.id,
        code: productData.code,
        title: productData.title,
        second_title: productData.second_title || "",
        acronym: productData.acronym || "",
        description: productData.description || "",
        tip: productData.tip || "",
        price: Number(productData.price).toFixed(2),
        discount: Number(productData.discount).toFixed(2),
        selling_price: Number(productData.selling_price).toFixed(2),
        tax_rate: Number(productData.tax_rate || 10).toFixed(2),
        stock: Number(productData.stock),
        status: productData.status,
        viewable: Boolean(productData.viewable),
        image: productData.image || "",
        image_list: productData.image_list || [],
        tag: productData.tag || "",
        sort: Number(productData.sort || 3),
        is_featured: Boolean(productData.is_featured),
        customizable: Boolean(productData.customizable),
        categories: productData.categories ? productData.categories.map(cat => cat.id) : [],
        ingredients: [],
        customizations: [],
      };

      // Initialize tax profile
      if(productData.profiles && Array.isArray(productData.profiles)) {
        const matchedProfile = productData.profiles.find(
          profile => profile.type === "tax"
        )
        product.value.profile_id = matchedProfile ? matchedProfile.id : null;
      }

      // Transform items to ingredients format
      if (productData.items && Array.isArray(productData.items)) {
        product.value.ingredients = productData.items.map(item => ({
          id: item.id,
          quantity: 1, // Default quantity since API doesn't provide it
          unit: "several" // Default unit
        }));
      }

      // Transform customization_items to customizations format
      if (productData.customization_items && Array.isArray(productData.customization_items)) {
        product.value.customizations = productData.customization_items.map(customItem => ({
          ingredientId: customItem.item_id,
          mode: customItem.mode,
          type: customItem.type !== undefined ? customItem.type : 0, // Include type field with default value
          replacements: customItem.replacement_diff || {},
          enabledReplacements: customItem.replacement_list || [],
          replacementExtras: customItem.replacement_extra || {},
          quantityPricing: customItem.quantity_price || { extra: 0, reduce: 0 },
        }));
      }

    } else {
      throw new Error("Invalid API response format");
    }

  } catch (error) {
    console.error("Error fetching product details:", error);
    $q.notify({
      type: "negative",
      message: "Error fetching product details",
      position: "top",
      timeout: 3000,
    });
  } finally {
    loading.value = false;
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

    const response = await api.put(`/api/products/${product.value.id}`, submitData);

    $q.notify({
      type: "positive",
      message: "Product updated successfully",
      position: "top",
      timeout: 3000,
    });

    router.push({
      path: "/admin/product/detail",
      query: { id: product.value.id },
    });
  } catch (error) {
    console.error("Error updating product:", error);
    $q.notify({
      type: "negative",
      message: error.response?.data?.message || "Error updating product",
      position: "top",
      timeout: 3000,
    });
  } finally {
    saving.value = false;
  }
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

// Lifecycle hooks
onMounted(async () => {
  const id = route.query.id;
  if (!id) {
    $q.notify({
      type: "negative",
      message: "Product ID is required",
      position: "top",
      timeout: 3000,
    });
    router.push("/admin/product");
    return;
  }

  await Promise.all([fetchCategories(), fetchIngredients()]);
  await fetchProductDetail(id);
  initializeMaps();
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
