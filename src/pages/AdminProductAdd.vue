<template>
  <q-page padding>
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="row items-center justify-between q-mr-md-md q-ml-md-md">
          <div class="text-h6">Add New Product</div>
          <div class="q-gutter-sm">
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

              <q-expansion-item
                popup
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
                          default-expand-all
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
                        <div class="text-subtitle2 q-mb-sm">
                          Ingredients by Type
                        </div>
                        <div
                          v-for="(items, type) in groupedIngredients"
                          :key="type"
                          class="q-mb-sm"
                        >
                          <q-expansion-item
                            popup
                            :label="type"
                            :caption="`${items.length} items available`"
                            dense
                            class="bg-grey-1 rounded-borders"
                          >
                            <q-list dense>
                              <q-item
                                v-for="item in items"
                                :key="item.id"
                                clickable
                                @click="toggleIngredient(item)"
                                :class="
                                  product.ingredients.includes(item.id)
                                    ? 'bg-blue-1'
                                    : ''
                                "
                                dense
                              >
                                <q-item-section side>
                                  <q-checkbox
                                    :model-value="
                                      product.ingredients.includes(item.id)
                                    "
                                    @update:model-value="
                                      () => toggleIngredient(item)
                                    "
                                    color="primary"
                                    size="sm"
                                  />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-body2">{{
                                    item.label
                                  }}</q-item-label>
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

              <q-expansion-item
                popup
                icon="build"
                label="Customization Options"
                caption="Configure customizable items for this product"
                class="q-mb-md"
              >
                <q-separator />
                <q-card flat bordered class="bg-grey-1">
                  <q-card-section class="q-pa-md">
                    <div class="row q-col-gutter-md q-row-gutter-md">
                      <div class="col-12">
                        <div class="text-subtitle2 q-mb-sm">Customizable Items</div>
                        <q-tree
                          :nodes="customizationTree"
                          node-key="id"
                          label-key="name"
                          children-key="children"
                          tick-strategy="leaf"
                          v-model:ticked="product.customizations"
                          v-model:selected="customizationSelected"
                          v-model:expanded="customizationExpanded"
                          :loading="loadingCustomizations"
                          :ticked-color="'primary'"
                          default-expand-all
                        >
                          <template v-slot:default-header="{ node }">
                            <div class="row items-center">
                              <div class="col">
                                <span>{{ node.name || node.type }}</span>
                                <span v-if="node.price" class="text-green-7 q-ml-sm" style="font-size: 12px">
                                  +${{ node.price }}
                                </span>
                                <span v-if="node.description" class="text-grey-7 q-ml-sm" style="font-size: 12px">
                                  - {{ node.description }}
                                </span>
                              </div>
                            </div>
                          </template>
                        </q-tree>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <q-expansion-item
                popup
                icon="attach_money"
                label="Pricing Information"
                caption="Set price, discount, and selling price"
                class="q-mb-md"
              >
                <q-separator  />
                <q-card flat bordered class="bg-grey-1">
                  <q-card-section class="q-pa-md">
                    <div class="row q-col-gutter-md q-row-gutter-md">
                      <div class="col-12 col-md-4">
                        <q-input
                          v-model="product.price"
                          label="Price *"
                          outlined
                          dense
                          type="text"
                          step="0.01"
                          prefix="$"
                          :rules="[
                            (val) =>
                              (!isNaN(Number(val)) && Number(val) >= 0) ||
                              'Price must be positive',
                          ]"
                          @blur="onAllPriceBlur"
                          @input="onPriceInput('price', $event)"
                        />
                      </div>
                      <div class="col-12 col-md-4">
                        <q-input
                          v-model="product.discount"
                          label="Discount"
                          outlined
                          dense
                          type="text"
                          step="0.01"
                          prefix="$"
                          :rules="[
                            (val) =>
                              (!isNaN(Number(val)) && Number(val) >= 0) ||
                              'Discount must be positive',
                          ]"
                          @blur="onAllPriceBlur"
                          @input="
                            onPriceInput('discount', $event);
                            calculateSellingPrice();
                          "
                        />
                      </div>
                      <div class="col-12 col-md-4">
                        <q-input
                          v-model="product.selling_price"
                          label="Selling Price *"
                          outlined
                          dense
                          type="text"
                          step="0.01"
                          prefix="$"
                          :rules="[
                            (val) =>
                              (!isNaN(Number(val)) && Number(val) >= 0) ||
                              'Selling price must be positive',
                          ]"
                          @blur="onAllPriceBlur"
                          @input="onPriceInput('selling_price', $event)"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>

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
                        <q-input
                          v-model.number="product.sort"
                          label="Sort Order"
                          outlined
                          dense
                          type="number"
                          hint="Lower numbers appear first"
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
  </q-page>
</template>

<script setup>
const categorySelected = ref(null);
const categoryExpanded = ref([]);
const customizationSelected = ref(null);
const customizationExpanded = ref([]);
const customizationTree = ref([]);
const loadingCustomizations = ref(false);

// 按type分组的ingredients计算属性
const groupedIngredients = computed(() => {
  const groups = {};
  ingredientOptions.value.forEach((item) => {
    const type = item.type || "Other";
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(item);
  });
  return groups;
});

// 切换ingredient选中状态
function toggleIngredient(item) {
  const index = product.value.ingredients.indexOf(item.id);
  if (index > -1) {
    product.value.ingredients.splice(index, 1);
  } else {
    product.value.ingredients.push(item.id);
  }
}
import { useQuasar } from "quasar";
import { ref, computed, watch } from "vue";
import { api } from "boot/axios";
import { useRouter } from "vue-router";

const router = useRouter();
const $q = useQuasar();
const formRef = ref(null);

const saving = ref(false);

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
  stock: 0,
  status: "active",
  viewable: true,
  image: "",
  image_list: [],
  tag: "",
  sort: 1,
  is_featured: false,
  categories: [], // 必须始终为数组
  ingredients: [],
  customizations: [], // 可定制的项目
});

const categoryOptions = ref([]); // 原始数据
const categoryTree = ref([]); // 树结构数据
const ingredientOptions = ref([]);
const loadingCategories = ref(false);
const loadingIngredients = ref(false);

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
    // 扁平转树结构
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
        id: item.id,
      }));
    } else {
      ingredientOptions.value = [];
    }
  } catch (e) {
    ingredientOptions.value = [];
  } finally {
    loadingIngredients.value = false;
  }
}

fetchCategories();
fetchIngredients();
fetchCustomizations();

// 获取可定制化项目数据
async function fetchCustomizations() {
  loadingCustomizations.value = true;
  try {
    const res = await api.get("/api/items/active");
    if (Array.isArray(res.data.data)) {
      const items = res.data.data;
      customizationTree.value = buildCustomizationTree(items);
    } else {
      customizationTree.value = [];
    }
  } catch (e) {
    customizationTree.value = [];
  } finally {
    loadingCustomizations.value = false;
  }
}

// 构建定制化项目树结构 (type作为父节点，item作为子节点)
function buildCustomizationTree(items) {
  const typeMap = {};

  items.forEach(item => {
    const type = item.type || 'Other';
    if (!typeMap[type]) {
      typeMap[type] = {
        id: `type_${type}`,
        type: type,
        name: type,
        children: []
      };
    }
    typeMap[type].children.push({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      type: item.type
    });
  });

  return Object.values(typeMap);
}

function onAllPriceBlur() {
  ["price", "discount", "selling_price"].forEach((field) => {
    let val = product.value[field];
    if (val === "" || val === null || val === undefined || isNaN(Number(val))) {
      product.value[field] = "0.00";
    } else {
      product.value[field] = Number(val).toFixed(2);
    }
  });
}
function onPriceInput(field, val) {
  let filtered = String(val).replace(/[^\d.]/g, "");
  filtered = filtered.replace(/(\..*)\./g, "$1");
  product.value[field] = filtered;
}

// Computed property for image list string
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

// Computed property to check if form is valid
const isFormValid = computed(() => {
  return (
    product.value.code &&
    product.value.title &&
    product.value.price >= 0 &&
    product.value.selling_price >= 0 &&
    product.value.stock >= 0 &&
    product.value.status
  );
});

// Auto-calculate selling price when price or discount changes
const calculateSellingPrice = () => {
  if (product.value.price && product.value.discount >= 0) {
    product.value.selling_price = Math.max(
      0,
      product.value.price - product.value.discount
    );
  }
};

// Watch for price changes to auto-calculate selling price
watch(() => product.value.price, calculateSellingPrice);
watch(() => product.value.discount, calculateSellingPrice);

const saveProduct = async () => {
  try {
    // Validate form
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

    // Prepare data for submission
    const submitData = { ...product.value };

    // Convert boolean values to integers for backend
    submitData.is_featured = submitData.is_featured ? 1 : 0;
    submitData.viewable = submitData.viewable ? 1 : 0;

    // Ensure image_list is an array
    if (typeof submitData.image_list === "string") {
      submitData.image_list = submitData.image_list
        .split("\n")
        .filter((url) => url.trim());
    }

    // Remove empty strings and ensure proper data types
    if (!submitData.image) delete submitData.image;
    if (!submitData.second_title) delete submitData.second_title;
    if (!submitData.acronym) delete submitData.acronym;
    if (!submitData.description) delete submitData.description;
    if (!submitData.tip) delete submitData.tip;
    if (!submitData.tag) delete submitData.tag;

    const response = await api.post("/api/products", submitData);

    $q.notify({
      type: "positive",
      message: "Product created successfully",
      position: "top",
      timeout: 3000,
    });

    // Navigate to product detail page
    router.push({
      path: "/admin/product/detail",
      query: { id: response.data.id },
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
};

const imageError = () => {
  $q.notify({
    type: "warning",
    message: "Invalid image URL",
    position: "top",
    timeout: 2000,
  });
};
</script>

<style scoped>
.q-form {
  max-width: 100%;
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
