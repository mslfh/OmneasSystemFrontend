<template>
  <q-page padding>
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="row items-center justify-between q-mr-md-md q-ml-md-md">
          <div class="text-h6">Product Details</div>
          <div class="q-gutter-sm">
            <q-btn
              v-if="!isEditing"
              flat
              icon="edit"
              color="primary"
              label="Edit"
              @click="toggleEdit()"
            />
            <q-btn
              v-if="!isEditing"
              flat
              icon="tune"
              color="secondary"
              label="Advanced Edit"
              @click="
                router.push({
                  path: '/admin/product/edit',
                  query: { id: product.id },
                })
              "
            />
            <q-btn
              v-if="isEditing"
              flat
              icon="save"
              color="positive"
              label="Save"
              @click="saveProduct()"
              :loading="saving"
            />
            <q-btn
              v-if="isEditing"
              flat
              icon="cancel"
              color="negative"
              label="Cancel"
              @click="cancelEdit()"
            />
            <q-btn
              flat
              icon="arrow_back"
              color="grey"
              label="Back"
              @click="router.go(-1)"
            />
          </div>
        </div>

        <div class="q-pa-md" v-if="product">
          <q-form @submit="saveProduct" class="q-gutter-md">
            <q-list>
              <!-- Basic Information -->
              <q-expansion-item
                popup
                default-opened
                icon="info"
                label="Basic Information"
                caption="Product basic details"
                class="q-mb-md"
              >
                <q-separator />
                <q-card flat bordered class="bg-grey-1">
                  <q-card-section class="q-pa-md">
                    <div class="row q-col-gutter-md q-row-gutter-md">
                      <div class="col-12">
                        <q-input
                          v-model="editableProduct.code"
                          label="Product Code"
                          :readonly="!isEditing"
                          outlined
                          dense
                        />
                      </div>

                      <div class="col-12 col-md-12">
                        <q-input
                          v-model="editableProduct.title"
                          label="Title"
                          :readonly="!isEditing"
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
                          v-model="editableProduct.second_title"
                          label="Second Title"
                          :readonly="!isEditing"
                          outlined
                          dense
                        />
                      </div>

                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="editableProduct.acronym"
                          label="Acronym"
                          :readonly="!isEditing"
                          outlined
                          dense
                        />
                      </div>

                      <div class="col-12">
                        <q-input
                          v-model="editableProduct.description"
                          label="Description"
                          :readonly="!isEditing"
                          outlined
                          type="textarea"
                          rows="3"
                        />
                      </div>

                      <div class="col-12">
                        <q-input
                          v-model="editableProduct.tip"
                          label="Tip"
                          :readonly="!isEditing"
                          outlined
                          dense
                        />
                      </div>

                      <!-- Categories -->
                      <div class="col-12">
                        <div class="text-subtitle2 q-mb-sm">Categories</div>
                        <div
                          v-if="
                            product &&
                            product.categories &&
                            product.categories.length > 0
                          "
                          class="q-gutter-xs"
                        >
                          <q-chip
                            v-for="category in product.categories"
                            :key="category.id"
                            size="md"
                            color="blue-2"
                            text-color="blue-8"
                            :label="category.title"
                            icon="category"
                          />
                        </div>
                        <div v-else class="text-grey-6">
                          No categories assigned
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <!-- Ingredients -->
              <q-expansion-item
                popup
                default-opened
                icon="restaurant"
                label="Ingredients"
                caption="Product ingredients"
                class="q-mb-md"
              >
                <q-separator />
                <q-card flat bordered class="bg-grey-1">
                  <q-card-section class="q-pa-md">
                    <div class="row q-col-gutter-md q-row-gutter-md">
                      <!-- Ingredient Details -->
                      <div class="col-12">
                        <div class="text-subtitle2 q-mb-sm">
                          Ingredient Details
                        </div>
                        <div
                          v-if="
                            product && product.items && product.items.length > 0
                          "
                        >
                          <div
                            v-for="(items, type) in groupedItems"
                            :key="type"
                            class="q-mb-md"
                          >
                            <div class="text-subtitle2 q-mb-sm text-primary">
                              {{ type }}
                            </div>
                            <div class="row q-gutter-sm">
                              <q-card
                                v-for="item in items"
                                :key="item.id"
                                flat
                                bordered
                                class="col-12 col-md-3"
                              >
                                <q-card-section class="q-pa-sm">
                                  <div class="row items-center">
                                    <div class="col">
                                      <div class="text-weight-medium">
                                        {{ item.name }}
                                      </div>
                                      <div class="text-caption text-grey-6">
                                        {{ item.description }}
                                      </div>
                                    </div>
                                  </div>
                                </q-card-section>
                              </q-card>
                            </div>
                          </div>
                        </div>
                        <div v-else class="text-grey-6">
                          No ingredients assigned
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <!-- Customization Options -->
              <q-expansion-item
                popup
                v-if="product && product.customizable"
                icon="o_dining"
                label="Customization Options"
                caption="Ingredient customization settings"
                class="q-mb-md"
              >
                <q-separator />
                <q-card flat bordered class="bg-grey-1">
                  <q-card-section class="q-pa-md">
                    <div
                      v-if="
                        product.customization_items &&
                        product.customization_items.length > 0
                      "
                    >
                      <q-card
                        v-for="customization in product.customization_items"
                        :key="customization.id"
                        flat
                        bordered
                        class="q-mb-md"
                      >
                        <q-card-section>
                          <div class="text-weight-medium q-mb-sm">
                            {{ getItemName(customization.item_id) }}
                            <q-chip
                              size="sm"
                              :color="getModeColor(customization.mode)"
                              text-color="white"
                              :label="getModeLabel(customization.mode)"
                              class="q-ml-sm"
                            />
                          </div>

                          <!-- Base Item Price Information -->
                          <div class="q-mb-sm">
                            <div class="text-caption text-grey-7 q-mb-xs">
                              Base Item:
                            </div>
                            <q-chip
                              size="sm"
                              color="grey-2"
                              text-color="grey-8"
                              class="q-mr-xs"
                            >
                              <template v-slot:default>
                                {{ getItemName(customization.item_id) }} -
                                Price: ${{
                                  getItemPrices(customization.item_id).price
                                }}
                                | Extra: ${{
                                  getItemPrices(customization.item_id)
                                    .extra_price
                                }}
                              </template>
                            </q-chip>
                          </div>

                          <!-- Replacement Options for "replaceable" mode -->
                          <div
                            v-if="
                              customization.mode === 'replaceable' &&
                              customization.replacement_list &&
                              customization.replacement_list.length > 0
                            "
                            class="q-mb-sm"
                          >
                            <div class="text-caption text-grey-7 q-mb-xs">
                              Available Replacements (replaceable mode):
                            </div>
                            <div class="q-gutter-xs">
                              <q-chip
                                v-for="replacementId in customization.replacement_list"
                                :key="replacementId"
                                size="sm"
                                color="blue-1"
                                text-color="blue-8"
                                class="q-mr-xs q-mb-xs"
                              >
                                <template v-slot:default>
                                  {{ getItemName(replacementId) }}
                                  <span
                                    v-if="
                                      customization.replacement_diff &&
                                      customization.replacement_diff[
                                        replacementId
                                      ] !== undefined
                                    "
                                    class="text-green-7"
                                  >
                                    | Extra Cost: +${{
                                      customization.replacement_diff[
                                        replacementId
                                      ]
                                    }}
                                  </span>
                                </template>
                              </q-chip>
                            </div>
                          </div>

                          <!-- Replacement Options for "replaceable_variable" mode -->
                          <div
                            v-if="
                              customization.mode === 'replaceable_variable' &&
                              customization.replacement_list &&
                              customization.replacement_list.length > 0
                            "
                            class="q-mb-sm"
                          >
                            <div class="text-caption text-grey-7 q-mb-xs">
                              Available Replacements (replaceable + variable
                              mode):
                            </div>
                            <div class="q-gutter-xs">
                              <q-chip
                                v-for="replacementId in customization.replacement_list"
                                :key="replacementId"
                                size="sm"
                                color="purple-1"
                                text-color="purple-8"
                                class="q-mr-xs q-mb-xs"
                              >
                                <template v-slot:default>
                                  {{ getItemName(replacementId) }}
                                  <span
                                    v-if="
                                      customization.replacement_diff &&
                                      customization.replacement_diff[
                                        replacementId
                                      ] !== undefined
                                    "
                                    class="text-green-7"
                                  >
                                    | Replace Cost: +${{
                                      customization.replacement_diff[
                                        replacementId
                                      ]
                                    }}
                                  </span>
                                  <span
                                    v-if="
                                      customization.replacement_extra &&
                                      customization.replacement_extra[
                                        replacementId
                                      ] !== undefined
                                    "
                                    class="text-orange-7"
                                  >
                                    | Quantity Extra: ${{
                                      customization.replacement_extra[
                                        replacementId
                                      ]
                                    }}
                                  </span>
                                </template>
                              </q-chip>
                            </div>
                          </div>

                          <!-- Quantity Pricing for "variable" and "replaceable_variable" modes -->
                          <div
                            v-if="
                              customization.mode.includes('variable') &&
                              customization.quantity_price
                            "
                            class="q-mb-sm"
                          >
                            <div class="text-caption text-grey-7 q-mb-xs">
                              Quantity Pricing (without replacement):
                            </div>
                            <div class="row q-gutter-sm">
                              <q-chip
                                size="sm"
                                color="green-1"
                                text-color="green-8"
                                :label="`Add Quantity: +$${customization.quantity_price.extra}`"
                              />
                              <q-chip
                                size="sm"
                                color="red-1"
                                text-color="red-8"
                                :label="`Reduce Quantity: -$${customization.quantity_price.reduce}`"
                              />
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                    <div v-else class="text-grey-6">
                      No customization options configured
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <!-- Pricing Information -->
              <PricingInformation
                v-if="isEditing"
                :pricing="{
                  price: editableProduct.price,
                  discount: editableProduct.discount,
                  selling_price: editableProduct.selling_price,
                  tax_rate: editableProduct.tax_rate,
                  profile_id: editableProduct.profile_id,
                }"
                @update:pricing="updatePricing"
              />
              <q-expansion-item
                v-else
                popup
                icon="attach_money"
                label="Pricing Information"
                caption="Price, discount, and selling price"
                class="q-mb-md"
              >
                <q-separator />
                <q-card flat bordered class="bg-grey-1">
                  <q-card-section class="q-pa-md">
                    <div class="row q-col-gutter-md q-row-gutter-md">
                      <div class="col-12 col-md-3">
                        <q-input
                          :model-value="editableProduct.price"
                          label="Price"
                          readonly
                          outlined
                          dense
                          type="text"
                          prefix="$"
                        />
                      </div>

                      <div class="col-12 col-md-3">
                        <q-input
                          :model-value="editableProduct.discount"
                          label="Discount"
                          readonly
                          outlined
                          dense
                          type="text"
                          prefix="$"
                        />
                      </div>

                      <div class="col-12 col-md-3">
                        <q-input
                          :model-value="editableProduct.selling_price"
                          label="Selling Price"
                          readonly
                          outlined
                          dense
                          type="text"
                          prefix="$"
                        />
                      </div>
                    </div>
                    <!-- Tax Information -->
                    <div class="row q-col-gutter-md q-mt-sm">
                      <div class="col-12 col-md-3">
                        <q-input
                          :model-value="editableProduct.tax_rate"
                          label="Tax Rate (%)"
                          readonly
                          outlined
                          dense
                          type="text"
                          suffix="%"
                        />
                      </div>
                      <div class="col-12 col-md-3">
                        <q-input
                          :model-value="taxSales"
                          label="Tax Sales"
                          outlined
                          dense
                          type="text"
                          prefix="$"
                          readonly
                          class="bg-grey-2"
                        />
                      </div>
                      <div class="col-12 col-md-3">
                        <q-input
                          :model-value="taxFee"
                          label="Tax Fee"
                          outlined
                          dense
                          type="text"
                          prefix="$"
                          readonly
                          class="bg-grey-2"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <!-- Inventory & Status -->
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
                        <q-input
                          v-if="isEditing"
                          v-model.number="editableProduct.stock"
                          label="Stock (-1 for unlimited)"
                          outlined
                          dense
                          type="number"
                          :rules="[
                            (val) =>
                              val >= -1 || 'Stock must be -1 or positive',
                          ]"
                          hint="-1 for unlimited stock"
                        />
                        <q-input
                          v-else
                          :model-value="stockDisplayValue"
                          label="Stock"
                          readonly
                          outlined
                          dense
                        />
                      </div>

                      <div class="col-12 col-md-4">
                        <q-select
                          v-model="editableProduct.status"
                          label="Status"
                          :readonly="!isEditing"
                          outlined
                          dense
                          :options="[
                            { label: 'Active', value: 'active' },
                            { label: 'Inactive', value: 'inactive' },
                          ]"
                          option-value="value"
                          option-label="label"
                          map-options
                          emit-value
                        />
                      </div>

                      <div class="col-12 col-md-4">
                        <q-select
                          v-if="isEditing"
                          v-model="editableProduct.sort"
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
                        <q-input
                          v-else
                          :model-value="getSortLabel(editableProduct.sort)"
                          label="Priority Level"
                          readonly
                          outlined
                          dense
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <!-- Additional Options -->
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
                      <div class="col-12 col-md-4">
                        <q-checkbox
                          v-model="editableProduct.is_featured"
                          label="Popular Product"
                          :disable="!isEditing"
                        />
                      </div>

                      <div class="col-12 col-md-4">
                        <q-checkbox
                          v-model="editableProduct.viewable"
                          label="Viewable for Customers"
                          :disable="!isEditing"
                        />
                      </div>

                      <div class="col-12">
                        <q-input
                          v-model="editableProduct.tag"
                          label="Tags (comma separated)"
                          :readonly="!isEditing"
                          outlined
                          dense
                          hint="Separate tags with commas"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <!-- Images -->
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
                          v-model="editableProduct.image"
                          label="Main Image URL"
                          :readonly="!isEditing"
                          outlined
                          dense
                        />
                      </div>

                      <div class="col-12">
                        <q-input
                          v-model="imageListString"
                          label="Image Gallery URLs (one per line)"
                          :readonly="!isEditing"
                          outlined
                          type="textarea"
                          rows="3"
                          hint="Enter one image URL per line"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <!-- Timestamps -->
              <q-expansion-item
                popup
                icon="schedule"
                label="Timestamps"
                caption="Creation and update information"
                class="q-mb-md"
              >
                <q-separator />
                <q-card flat bordered class="bg-grey-1">
                  <q-card-section class="q-pa-md">
                    <div class="row q-col-gutter-md q-row-gutter-md">
                      <div class="col-12 col-md-6">
                        <q-input
                          :model-value="formatDate(product.created_at)"
                          label="Created At"
                          readonly
                          outlined
                          dense
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-input
                          :model-value="formatDate(product.updated_at)"
                          label="Updated At"
                          readonly
                          outlined
                          dense
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
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
import { onMounted, ref, computed, watch } from "vue";
import { api } from "boot/axios";
import { useRouter, useRoute } from "vue-router";
import PricingInformation from "components/PricingInformation.vue";

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const product = ref(null);
const editableProduct = ref({});
const originalProduct = ref({});
const isEditing = ref(false);
const loading = ref(true);
const saving = ref(false);

// Item details map to store bulk API data
const itemDetailsMap = ref(new Map());

// Computed property for image list string
const imageListString = computed({
  get() {
    if (
      editableProduct.value.image_list &&
      Array.isArray(editableProduct.value.image_list)
    ) {
      return editableProduct.value.image_list.join("\n");
    }
    return "";
  },
  set(value) {
    if (value) {
      editableProduct.value.image_list = value
        .split("\n")
        .filter((url) => url.trim());
    } else {
      editableProduct.value.image_list = [];
    }
  },
});

// Computed property for stock display
const stockDisplayValue = computed(() => {
  if (editableProduct.value.stock === -1) {
    return "unlimited";
  }
  return editableProduct.value.stock?.toString() || "0";
});

// Sort options
const sortOptions = ref([
  { label: "Hot", value: 1 },
  { label: "High", value: 2 },
  { label: "Medium", value: 3 },
  { label: "Low", value: 4 },
]);

// Tax calculations
const taxSales = computed(() => {
  const sellingPrice = parseFloat(editableProduct.value.selling_price) || 0;
  const taxRate = parseFloat(editableProduct.value.tax_rate) || 0;

  if (sellingPrice <= 0 || taxRate < 0) return "0.00";

  const taxSales = sellingPrice / (1 + taxRate / 100);
  return (Math.floor(taxSales * 100) / 100).toFixed(2);
});

const taxFee = computed(() => {
  const sellingPrice = parseFloat(editableProduct.value.selling_price) || 0;
  const taxRate = parseFloat(editableProduct.value.tax_rate) || 0;

  if (sellingPrice <= 0 || taxRate < 0) return "0.00";

  const taxSalesAmount = sellingPrice / (1 + taxRate / 100);
  const taxFee = sellingPrice - Math.floor(taxSalesAmount * 100) / 100;
  return Math.max(0, taxFee).toFixed(2);
});

// Computed property for grouping items by type
const groupedItems = computed(() => {
  if (!product.value || !product.value.items) {
    return {};
  }

  const groups = {};
  product.value.items.forEach((item) => {
    const type = item.type || "OTHER";
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(item);
  });

  return groups;
});

// Helper functions for customization display
const getItemName = (itemId) => {
  // First try to get from itemDetailsMap (bulk API data)
  if (itemDetailsMap.value.has(itemId)) {
    return itemDetailsMap.value.get(itemId).name;
  }

  // Fallback to product items
  if (product.value && product.value.items) {
    const item = product.value.items.find((item) => item.id === itemId);
    if (item) {
      return item.name;
    }
  }

  return "Unknown Item";
};
const getModeLabel = (mode) => {
  const labels = {
    replaceable: "Replaceable",
    variable: "Variable Quantity",
    replaceable_variable: "Replaceable + Variable",
    fixed: "Fixed",
  };
  return labels[mode] || mode;
};

const getModeColor = (mode) => {
  const colors = {
    replaceable: "blue-6",
    variable: "green-6",
    replaceable_variable: "purple-6",
    fixed: "grey-6",
  };
  return colors[mode] || "grey-6";
};

const getSortLabel = (sortValue) => {
  const sortOption = sortOptions.value.find(
    (option) => option.value === sortValue
  );
  return sortOption ? sortOption.label : `Level ${sortValue}`;
};

// Helper function to get item price and extra price
const getItemPrices = (itemId) => {
  if (!product.value || !product.value.items) {
    return { price: 0, extra_price: 0 };
  }

  const item = product.value.items.find((item) => item.id === itemId);
  return item
    ? {
        price: parseFloat(item.price) || 0,
        extra_price: parseFloat(item.extra_price) || 0,
      }
    : { price: 0, extra_price: 0 };
};

// Pricing update handler
const updatePricing = (newPricing) => {
  Object.assign(editableProduct.value, newPricing);
};

// Function to fetch bulk item details
const fetchBulkItemDetails = async () => {
  if (!product.value) return;

  const allItemIds = new Set();

  // Add items from product.items
  if (product.value.items) {
    product.value.items.forEach((item) => allItemIds.add(item.id));
  }

  // Add items from customization_items replacement_list
  if (product.value.customization_items) {
    product.value.customization_items.forEach((customization) => {
      // Add the base item
      if (customization.item_id) {
        allItemIds.add(customization.item_id);
      }

      // Add replacement items
      if (
        customization.replacement_list &&
        Array.isArray(customization.replacement_list)
      ) {
        customization.replacement_list.forEach((replacementId) => {
          allItemIds.add(replacementId);
        });
      }
    });
  }

  if (allItemIds.size === 0) return;

  try {
    const formData = new FormData();
    formData.append("ids", Array.from(allItemIds).join(","));

    const bulkResp = await api.post("/api/get-bulk-items", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (
      bulkResp.data &&
      bulkResp.data.success &&
      Array.isArray(bulkResp.data.data)
    ) {
      // Clear the map and populate with new data
      itemDetailsMap.value.clear();
      bulkResp.data.data.forEach((item) => {
        itemDetailsMap.value.set(item.id, item);
      });
    }
  } catch (error) {
    console.error("Error fetching bulk item details:", error);
  }
};

const fetchProductDetail = async (id) => {
  try {
    loading.value = true;
    const response = await api.get(`/api/products/${id}`);

    // 处理API响应的数据结构
    if (response.data.success && response.data.data) {
      product.value = response.data.data;
    } else {
      product.value = response.data;
    }
    // Initialize profile
    if (product.value.profiles && Array.isArray(product.value.profiles)) {
      const matchedProfile = product.value.profiles.find(
        (profile) => profile.type === "tax"
      );
      product.value.profile_id = matchedProfile ? matchedProfile.id : null;
    }

    editableProduct.value = { ...product.value };
    originalProduct.value = { ...product.value };

    // Ensure boolean values are properly set
    editableProduct.value.is_featured = Boolean(
      editableProduct.value.is_featured
    );
    editableProduct.value.viewable = Boolean(editableProduct.value.viewable);
    editableProduct.value.customizable = Boolean(
      editableProduct.value.customizable
    );

    // Ensure pricing values are properly formatted as strings for PricingInformation component
    editableProduct.value.price = Number(editableProduct.value.price).toFixed(
      2
    );
    editableProduct.value.discount = Number(
      editableProduct.value.discount
    ).toFixed(2);
    editableProduct.value.selling_price = Number(
      editableProduct.value.selling_price
    ).toFixed(2);
    editableProduct.value.tax_rate = Number(
      editableProduct.value.tax_rate || 10
    ).toFixed(2);
    editableProduct.value.stock = Number(editableProduct.value.stock);
    editableProduct.value.sort = Number(editableProduct.value.sort || 3);

    // Fetch bulk item details for replacement items
    await fetchBulkItemDetails();
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
};

const toggleEdit = () => {
  isEditing.value = true;
  editableProduct.value = { ...originalProduct.value };

  // Ensure boolean values are properly set
  editableProduct.value.is_featured = Boolean(
    editableProduct.value.is_featured
  );
  editableProduct.value.viewable = Boolean(editableProduct.value.viewable);
  editableProduct.value.customizable = Boolean(
    editableProduct.value.customizable
  );

  // Ensure pricing values are properly formatted as strings for PricingInformation component
  editableProduct.value.price = Number(editableProduct.value.price).toFixed(2);
  editableProduct.value.discount = Number(
    editableProduct.value.discount
  ).toFixed(2);
  editableProduct.value.selling_price = Number(
    editableProduct.value.selling_price
  ).toFixed(2);
  editableProduct.value.tax_rate = Number(
    editableProduct.value.tax_rate || 10
  ).toFixed(2);
};

const cancelEdit = () => {
  isEditing.value = false;
  editableProduct.value = { ...originalProduct.value };
};

const saveProduct = async () => {
  try {
    saving.value = true;

    // Prepare data for submission - only include editable fields
    const submitData = {
      code: editableProduct.value.code,
      title: editableProduct.value.title,
      second_title: editableProduct.value.second_title,
      acronym: editableProduct.value.acronym,
      description: editableProduct.value.description,
      tip: editableProduct.value.tip,
      price: editableProduct.value.price,
      discount: editableProduct.value.discount,
      selling_price: editableProduct.value.selling_price,
      tax_rate: editableProduct.value.tax_rate,
      profile_id: editableProduct.value.profile_id,
      stock: editableProduct.value.stock,
      status: editableProduct.value.status,
      image: editableProduct.value.image,
      image_list: editableProduct.value.image_list,
      tag: editableProduct.value.tag,
      sort: editableProduct.value.sort,
      is_featured: editableProduct.value.is_featured ? 1 : 0,
      viewable: editableProduct.value.viewable ? 1 : 0,
      customizable: editableProduct.value.customizable ? 1 : 0,
    };

    // Ensure image_list is an array
    if (typeof submitData.image_list === "string") {
      submitData.image_list = submitData.image_list
        .split("\n")
        .filter((url) => url.trim());
    }

    // Remove empty optional fields
    if (!submitData.second_title) delete submitData.second_title;
    if (!submitData.acronym) delete submitData.acronym;
    if (!submitData.description) delete submitData.description;
    if (!submitData.tip) delete submitData.tip;
    if (!submitData.image) delete submitData.image;
    if (!submitData.tag) delete submitData.tag;

    const response = await api.put(
      `/api/products/${product.value.id}`,
      submitData
    );

    // Update the product data
    if (response.data.success && response.data.data) {
      product.value = response.data.data;
    } else {
      product.value = response.data;
    }

    originalProduct.value = { ...product.value };
    editableProduct.value = { ...product.value };

    // Ensure boolean values are properly set
    editableProduct.value.is_featured = Boolean(
      editableProduct.value.is_featured
    );
    editableProduct.value.viewable = Boolean(editableProduct.value.viewable);
    editableProduct.value.customizable = Boolean(
      editableProduct.value.customizable
    );

    // Ensure pricing values are properly formatted as strings for PricingInformation component
    editableProduct.value.price = Number(editableProduct.value.price).toFixed(
      2
    );
    editableProduct.value.discount = Number(
      editableProduct.value.discount
    ).toFixed(2);
    editableProduct.value.selling_price = Number(
      editableProduct.value.selling_price
    ).toFixed(2);
    editableProduct.value.tax_rate = Number(
      editableProduct.value.tax_rate || 10
    ).toFixed(2);

    isEditing.value = false;

    $q.notify({
      type: "positive",
      message: "Product updated successfully",
      position: "top",
      timeout: 3000,
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
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString();
};

onMounted(() => {
  const id = route.query.id;
  if (id) {
    fetchProductDetail(id);
  } else {
    loading.value = false;
  }
});
</script>
