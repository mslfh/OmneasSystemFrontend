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
                                  <q-item-label class="text-body2">{{
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

              <q-expansion-item
                popup
                default-opened
                icon="o_dining"
                label="Customization Options"
                caption="Configure customization settings for selected ingredients"
                class="q-mb-md"
              >
                <q-separator />
                <q-card flat bordered class="bg-grey-1">
                  <q-card-section class="q-pa-sm">
                    <div class="row q-col-gutter-sm q-row-gutter-sm">
                      <div class="col-12">
                        <!-- Customizable Toggle -->
                        <div class="row items-center justify-between q-mb-md">
                          <div class="text-subtitle2">
                            Ingredient Customization Settings
                          </div>
                          <q-toggle
                            v-model="product.customizable"
                            color="primary"
                            label="Enable Customization"
                            left-label
                          />
                        </div>

                        <div
                          v-if="!product.customizable"
                          class="text-grey-6 text-center q-pa-lg bg-grey-3 rounded-borders"
                        >
                          <q-icon name="o_lock" size="md" class="q-mb-sm" />
                          <div>Product customization is disabled</div>
                          <div class="text-caption">Enable customization to configure ingredient options</div>
                        </div>

                        <div
                          v-else-if="product.ingredients.length === 0"
                          class="text-grey-6 text-center q-pa-md"
                        >
                          Please select ingredients first to configure
                          customization options
                        </div>
                        <q-list v-else-if="product.customizable" separator>
                          <q-item
                            v-for="ingredient in selectedIngredientsWithDetails"
                            :key="ingredient.id"
                            class="q-pa-sm"
                          >
                            <q-item-section>
                              <div class="row q-col-gutter-sm q-row-gutter-xs">
                                <!-- 父节点：Ingredient 信息 -->
                                <div class="col-8">
                                  <div
                                    class="text-body1 text-weight-medium text-primary"
                                  >
                                    {{ ingredient.name }}
                                    <q-chip
                                      size="sm"
                                      color="grey-4"
                                      text-color="black"
                                      dense
                                      class="q-ml-xs"
                                    >
                                      {{ ingredient.type }}
                                    </q-chip>
                                    <span
                                      class="text-caption text-grey-7 q-ml-sm"
                                    >
                                      ({{
                                        formatQuantityUnit(
                                          ingredient.quantity,
                                          ingredient.unit
                                        )
                                      }}
                                      - ${{ ingredient.price }})
                                    </span>
                                  </div>
                                </div>

                                <!-- 配置选项 -->
                                <div class="col-4">
                                  <q-select
                                    :model-value="
                                      getCustomizationMode(ingredient.id)
                                    "
                                    @update:model-value="
                                      (val) =>
                                        updateCustomizationMode(
                                          ingredient.id,
                                          val
                                        )
                                    "
                                    :options="customizationModes"
                                    outlined
                                    dense
                                    emit-value
                                    map-options
                                  />
                                </div>

                                <!-- 子节点：替换选项或数量配置 -->
                                <div class="col-12">
                                  <q-expansion-item
                                    v-if="
                                      getCustomizationMode(ingredient.id) !==
                                      'fixed'
                                    "
                                    popup
                                    icon="o_dashboard_customize"
                                    :label="getCustomizationLabel(ingredient.id)"
                                    :caption="getCustomizationCaption(ingredient.id)"
                                    dense
                                    class="bg-grey-2 rounded-borders"
                                    default-opened
                                  >
                                    <div class="q-pa-sm">
                                      <!-- Replaceable Mode -->
                                      <div
                                        v-if="
                                          getCustomizationMode(
                                            ingredient.id
                                          ) === 'replaceable' ||
                                          getCustomizationMode(
                                            ingredient.id
                                          ) === 'replaceable_variable'
                                        "
                                      >
                                        <!-- 全选/全不选按钮 -->
                                        <div
                                          class="row items-center justify-between q-mb-sm"
                                        >
                                          <div
                                            class="text-body2 text-weight-medium"
                                          >
                                            Select replacement options:
                                          </div>
                                          <div class="q-gutter-xs">
                                            <q-btn
                                              size="xs"
                                              dense
                                              flat
                                              color="primary"
                                              icon="o_circle"
                                              label="All"
                                              @click="
                                                selectAllReplacements(
                                                  ingredient.id,
                                                  true
                                                )
                                              "
                                            />
                                            <q-btn
                                              size="xs"
                                              dense
                                              flat
                                              color="negative"
                                              icon="o_block"
                                              label="None"
                                              @click="
                                                selectAllReplacements(
                                                  ingredient.id,
                                                  false
                                                )
                                              "
                                            />
                                          </div>
                                        </div>

                                        <div class="row q-col-gutter-xs">
                                          <div
                                            v-for="replacement in getReplacementOptions(
                                              ingredient
                                            )"
                                            :key="replacement.id"
                                            class="col-12 col-md-6"
                                          >
                                            <q-card
                                              flat
                                              bordered
                                              class="q-pa-xs"
                                              :class="
                                                isReplacementEnabled(
                                                  ingredient.id,
                                                  replacement.id
                                                )
                                                  ? 'bg-blue-1'
                                                  : ''
                                              "
                                            >
                                              <div class="row items-center no-wrap">
                                                <div class="col-auto q-mr-xs">
                                                  <q-checkbox
                                                    :model-value="
                                                      isReplacementEnabled(
                                                        ingredient.id,
                                                        replacement.id
                                                      )
                                                    "
                                                    @update:model-value="
                                                      (val) =>
                                                        toggleReplacement(
                                                          ingredient.id,
                                                          replacement.id,
                                                          val
                                                        )
                                                    "
                                                    color="primary"
                                                    size="sm"
                                                  />
                                                </div>
                                                <div class="col q-mr-sm text-left" style="min-width: 0;">
                                                  <div class="text-body2 ellipsis">
                                                    {{ replacement.name }}
                                                  </div>
                                                  <div class="text-caption text-grey-6 ellipsis">
                                                    ${{ replacement.price || 0 }} - {{ replacement.description }}
                                                  </div>
                                                </div>
                                                <div class="col-auto q-mr-xs">
                                                  <q-input
                                                    :model-value="
                                                      getReplacementPriceDiff(
                                                        ingredient.id,
                                                        replacement.id
                                                      )
                                                    "
                                                    @update:model-value="
                                                      (val) =>
                                                        updateReplacementPriceDiff(
                                                          ingredient.id,
                                                          replacement.id,
                                                          val
                                                        )
                                                    "
                                                    label="Diff"
                                                    prefix="$"
                                                    type="number"
                                                    step="0.5"
                                                    dense
                                                    outlined
                                                    style="width: 65px"
                                                    :disable="
                                                      !isReplacementEnabled(
                                                        ingredient.id,
                                                        replacement.id
                                                      )
                                                    "
                                                  />
                                                </div>
                                                <!-- Extra price input for replaceable_variable mode -->
                                                <div
                                                  v-if="getCustomizationMode(ingredient.id) === 'replaceable_variable'"
                                                  class="col-auto"
                                                >
                                                  <q-input
                                                    :model-value="
                                                      getReplacementExtraPrice(
                                                        ingredient.id,
                                                        replacement.id
                                                      )
                                                    "
                                                    @update:model-value="
                                                      (val) =>
                                                        updateReplacementExtraPrice(
                                                          ingredient.id,
                                                          replacement.id,
                                                          val
                                                        )
                                                    "
                                                    label="Extra"
                                                    prefix="$"
                                                    type="number"
                                                    step="0.5"
                                                    dense
                                                    outlined
                                                    style="width: 65px"
                                                    :disable="
                                                      !isReplacementEnabled(
                                                        ingredient.id,
                                                        replacement.id
                                                      )
                                                    "
                                                  />
                                                </div>
                                              </div>
                                            </q-card>
                                          </div>
                                        </div>
                                      </div>

                                      <!-- Variable Mode -->
                                      <div
                                        v-else-if="
                                          getCustomizationMode(
                                            ingredient.id
                                          ) === 'variable'
                                        "
                                      >
                                        <div class="row q-col-gutter-sm">
                                          <div class="col-12 col-md-6">
                                            <q-input
                                              :model-value="
                                                getQuantityPricing(
                                                  ingredient.id,
                                                  'extra'
                                                )
                                              "
                                              @update:model-value="
                                                (val) =>
                                                  updateQuantityPricing(
                                                    ingredient.id,
                                                    'extra',
                                                    val
                                                  )
                                              "
                                              label="Extra Price"
                                              prefix="$"
                                              type="number"
                                              step="0.5"
                                              dense
                                              outlined
                                              hint="Per additional unit"
                                            />
                                          </div>
                                          <div class="col-12 col-md-6">
                                            <q-input
                                              :model-value="
                                                getQuantityPricing(
                                                  ingredient.id,
                                                  'reduce'
                                                )
                                              "
                                              @update:model-value="
                                                (val) =>
                                                  updateQuantityPricing(
                                                    ingredient.id,
                                                    'reduce',
                                                    val
                                                  )
                                              "
                                              label="Reduce Price"
                                              prefix="$"
                                              type="number"
                                              step="0.5"
                                              dense
                                              outlined
                                              hint="Per unit removed"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </q-expansion-item>

                                  <div
                                    v-else-if="
                                      getCustomizationMode(ingredient.id) ===
                                      'fixed'
                                    "
                                    class="q-mt-xs"
                                  >
                                    <div
                                      class="text-caption text-grey-6 q-pa-sm bg-grey-2 rounded-borders"
                                    >
                                      <q-icon
                                        name="lock"
                                        class="q-mr-xs"
                                        size="xs"
                                      />
                                      This ingredient cannot be customized by
                                      customers.
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </q-item-section>
                          </q-item>
                        </q-list>
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
                <q-separator />
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

// 优化：使用 Map 进行快速查找
const ingredientMap = ref(new Map());
const ingredientsByType = ref(new Map());
const selectedIngredientsMap = ref(new Map());
const customizationsMap = ref(new Map());

// 按type分组的ingredients计算属性 - 优化版
const groupedIngredients = computed(() => {
  return Object.fromEntries(ingredientsByType.value);
});

// 优化：创建 ingredient 查找映射
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

// 优化：创建选中 ingredients 映射
function buildSelectedIngredientsMap() {
  selectedIngredientsMap.value.clear();
  product.value.ingredients.forEach((ing) => {
    selectedIngredientsMap.value.set(ing.id, ing);
  });
}

// 优化：创建 customizations 映射
function buildCustomizationsMap() {
  customizationsMap.value.clear();
  product.value.customizations.forEach((custom) => {
    customizationsMap.value.set(custom.ingredientId, custom);
  });
}

// 规格单位选项
const unitOptions = ref([
  { label: "Piece", value: "piece" },
  { label: "Several", value: "several" },
]);

// 定制化模式选项
const customizationModes = ref([
  {
    label: "Replaceable + Variable",
    value: "replaceable_variable",
    description: "Customer can change quantity and replace with other items",
  },
  {
    label: "Replaceable",
    value: "replaceable",
    description: "Customer can replace with other items",
  },
  {
    label: "Variable",
    value: "variable",
    description: "Customer can change quantity",
  },
  { label: "Fixed", value: "fixed", description: "Cannot be customized" },
]);

// 切换ingredient选中状态 - 优化版
function toggleIngredient(item) {
  const existingIndex = product.value.ingredients.findIndex(
    (ing) => ing.id === item.id
  );

  if (existingIndex > -1) {
    product.value.ingredients.splice(existingIndex, 1);
    selectedIngredientsMap.value.delete(item.id);
    // 同时删除相关的customization
    const customIndex = product.value.customizations.findIndex(c => c.ingredientId === item.id);
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

// 检查ingredient是否被选中 - 优化版
function isIngredientSelected(itemId) {
  return selectedIngredientsMap.value.has(itemId);
}

// 获取ingredient的数量 - 优化版
function getIngredientQuantity(itemId) {
  const ingredient = selectedIngredientsMap.value.get(itemId);
  return ingredient ? ingredient.quantity : 1;
}

// 获取ingredient的单位 - 优化版
function getIngredientUnit(itemId) {
  const ingredient = selectedIngredientsMap.value.get(itemId);
  return ingredient ? ingredient.unit : "several";
}

// 更新ingredient数量 - 优化版
function updateIngredientQuantity(itemId, quantity) {
  const ingredient = selectedIngredientsMap.value.get(itemId);
  if (ingredient) {
    ingredient.quantity = Math.max(1, Math.min(99, parseInt(quantity) || 1));
  }
}

// 更新ingredient单位 - 优化版
function updateIngredientUnit(itemId, unit) {
  const ingredient = selectedIngredientsMap.value.get(itemId);
  if (ingredient) {
    ingredient.unit = unit;
  }
}

// 格式化数量和单位显示
function formatQuantityUnit(quantity, unit) {
  const unitLabel =
    unitOptions.value.find((opt) => opt.value === unit)?.label || "Several";
  return `${quantity} ${unitLabel}`;
}

// 获取选中的 ingredients 的详细信息 - 优化版
const selectedIngredientsWithDetails = computed(() => {
  return product.value.ingredients.map((ing) => {
    const itemDetail = ingredientMap.value.get(ing.id);
    return {
      ...ing,
      name: itemDetail?.name || itemDetail?.label || "Unknown",
      type: itemDetail?.type || "Other",
      price: itemDetail?.price || 0,
      description: itemDetail?.description || "",
    };
  });
});

// 获取定制化模式 - 优化版
function getCustomizationMode(ingredientId) {
  const customization = customizationsMap.value.get(ingredientId);
  return customization ? customization.mode : "replaceable_variable"; // 修改默认模式
}

// 获取定制化标签
function getCustomizationLabel(ingredientId) {
  const mode = getCustomizationMode(ingredientId);
  switch (mode) {
    case 'replaceable':
      return 'Available Replacements';
    case 'variable':
      return 'Quantity Pricing';
    case 'replaceable_variable':
      return 'Replacements & Quantity';
    default:
      return 'Configuration';
  }
}

// 获取定制化说明
function getCustomizationCaption(ingredientId) {
  const mode = getCustomizationMode(ingredientId);
  switch (mode) {
    case 'replaceable':
      return 'Configure replacement options';
    case 'variable':
      return 'Set pricing for quantity changes';
    case 'replaceable_variable':
      return 'Configure replacements and quantity pricing';
    default:
      return 'Configure customization options';
  }
}

// 更新定制化模式 - 优化版
function updateCustomizationMode(ingredientId, mode) {
  let customization = customizationsMap.value.get(ingredientId);

  if (customization) {
    customization.mode = mode;
  } else {
    customization = {
      ingredientId: ingredientId,
      mode: mode,
      replacements: {},
      enabledReplacements: [],
      replacementExtras: {}, // 新增：存储每个替换选项的extra价格
      quantityPricing: {
        extra: 0,
        reduce: 0,
      },
    };
    product.value.customizations.push(customization);
    customizationsMap.value.set(ingredientId, customization);
  }

  // 确保新增的属性存在
  if (!customization.replacementExtras) {
    customization.replacementExtras = {};
  }
}// 获取替换选项 - 优化版，使用缓存
const replacementOptionsCache = ref(new Map());

function getReplacementOptions(ingredient) {
  const cacheKey = `${ingredient.type}_${ingredient.id}`;
  if (replacementOptionsCache.value.has(cacheKey)) {
    return replacementOptionsCache.value.get(cacheKey);
  }

  const typeIngredients = ingredientsByType.value.get(ingredient.type) || [];
  const options = typeIngredients.filter(item => item.id !== ingredient.id);

  replacementOptionsCache.value.set(cacheKey, options);
  return options;
}

// 全选/全不选替换选项 - 优化版
function selectAllReplacements(ingredientId, selectAll) {
  let customization = customizationsMap.value.get(ingredientId);

  if (!customization) {
    customization = {
      ingredientId: ingredientId,
      mode: "replaceable",
      replacements: {},
      enabledReplacements: [],
      replacementExtras: {},
      quantityPricing: { extra: 0, reduce: 0 },
    };
    product.value.customizations.push(customization);
    customizationsMap.value.set(ingredientId, customization);
  }

  if (!customization.enabledReplacements) {
    customization.enabledReplacements = [];
  }
  if (!customization.replacements) {
    customization.replacements = {};
  }
  if (!customization.replacementExtras) {
    customization.replacementExtras = {};
  }

  // 获取当前 ingredient 的详细信息
  const ingredientDetail = ingredientMap.value.get(ingredientId);
  if (ingredientDetail) {
    const replacementOptions = getReplacementOptions(ingredientDetail);
    const originalPrice = parseFloat(ingredientDetail.price) || 0;

    if (selectAll) {
      // 全选：添加所有未选中的替换选项并自动计算价格差
      replacementOptions.forEach((replacement) => {
        if (!customization.enabledReplacements.includes(replacement.id)) {
          customization.enabledReplacements.push(replacement.id);

          // 自动计算价格差
          const replacementPrice = parseFloat(replacement.price) || 0;
          const priceDiff = Math.max(0, replacementPrice - originalPrice);
          customization.replacements[replacement.id] = priceDiff;

          // 为replaceable_variable模式初始化extra价格
          if (customization.mode === 'replaceable_variable') {
            if (!customization.replacementExtras[replacement.id]) {
              customization.replacementExtras[replacement.id] = 0;
            }
          }
        }
      });
    } else {
      // 全不选：移除所有替换选项
      const replacementIds = new Set(replacementOptions.map(r => r.id));
      customization.enabledReplacements = customization.enabledReplacements.filter(
        id => !replacementIds.has(id)
      );
    }
  }
}// 检查替换选项是否启用 - 优化版
function isReplacementEnabled(ingredientId, replacementId) {
  const customization = customizationsMap.value.get(ingredientId);
  if (!customization || !customization.enabledReplacements) {
    return true; // 默认全选
  }
  return customization.enabledReplacements.includes(replacementId);
}

// 切换替换选项的启用状态 - 优化版
function toggleReplacement(ingredientId, replacementId, enabled) {
  let customization = customizationsMap.value.get(ingredientId);

  if (!customization) {
    customization = {
      ingredientId: ingredientId,
      mode: "replaceable",
      replacements: {},
      enabledReplacements: [],
      replacementExtras: {},
      quantityPricing: { extra: 0, reduce: 0 },
    };
    product.value.customizations.push(customization);
    customizationsMap.value.set(ingredientId, customization);
  }

  if (!customization.enabledReplacements) {
    customization.enabledReplacements = [];
  }
  if (!customization.replacements) {
    customization.replacements = {};
  }
  if (!customization.replacementExtras) {
    customization.replacementExtras = {};
  }

  const index = customization.enabledReplacements.indexOf(replacementId);
  if (enabled && index === -1) {
    customization.enabledReplacements.push(replacementId);

    // 自动计算价格差：使用缓存的ingredient数据
    const originalIngredient = ingredientMap.value.get(ingredientId);
    const replacementIngredient = ingredientMap.value.get(replacementId);

    if (originalIngredient && replacementIngredient) {
      const originalPrice = parseFloat(originalIngredient.price) || 0;
      const replacementPrice = parseFloat(replacementIngredient.price) || 0;
      const priceDiff = Math.max(0, replacementPrice - originalPrice);
      customization.replacements[replacementId] = priceDiff;

      // 为replaceable_variable模式初始化extra价格
      if (customization.mode === 'replaceable_variable') {
        if (!customization.replacementExtras[replacementId]) {
          customization.replacementExtras[replacementId] = 0;
        }
      }
    }
  } else if (!enabled && index > -1) {
    customization.enabledReplacements.splice(index, 1);
  }
}// 获取替换价格差 - 优化版
function getReplacementPriceDiff(ingredientId, replacementId) {
  const customization = customizationsMap.value.get(ingredientId);

  // 如果已经设置了价格差，直接返回
  if (
    customization &&
    customization.replacements &&
    customization.replacements[replacementId] !== undefined
  ) {
    return customization.replacements[replacementId];
  }

  // 如果没有设置，自动计算默认价格差
  const originalIngredient = ingredientMap.value.get(ingredientId);
  const replacementIngredient = ingredientMap.value.get(replacementId);

  if (originalIngredient && replacementIngredient) {
    const originalPrice = parseFloat(originalIngredient.price) || 0;
    const replacementPrice = parseFloat(replacementIngredient.price) || 0;
    return Math.max(0, replacementPrice - originalPrice);
  }

  return 0;
}

// 获取替换选项的额外价格
function getReplacementExtraPrice(ingredientId, replacementId) {
  const customization = customizationsMap.value.get(ingredientId);
  if (customization && customization.replacementExtras) {
    return customization.replacementExtras[replacementId] || 0;
  }
  return 0;
}

// 更新替换选项的额外价格
function updateReplacementExtraPrice(ingredientId, replacementId, extraPrice) {
  let customization = customizationsMap.value.get(ingredientId);

  if (!customization) {
    customization = {
      ingredientId: ingredientId,
      mode: "replaceable_variable",
      replacements: {},
      enabledReplacements: [],
      replacementExtras: {},
      quantityPricing: { extra: 0, reduce: 0 },
    };
    product.value.customizations.push(customization);
    customizationsMap.value.set(ingredientId, customization);
  }

  if (!customization.replacementExtras) {
    customization.replacementExtras = {};
  }

  customization.replacementExtras[replacementId] = parseFloat(extraPrice) || 0;
}
// 更新替换价格差 - 优化版
function updateReplacementPriceDiff(ingredientId, replacementId, priceDiff) {
  let customization = customizationsMap.value.get(ingredientId);

  if (!customization) {
    customization = {
      ingredientId: ingredientId,
      mode: "replaceable",
      replacements: {},
      enabledReplacements: [],
      replacementExtras: {},
      quantityPricing: { extra: 0, reduce: 0 },
    };
    product.value.customizations.push(customization);
    customizationsMap.value.set(ingredientId, customization);
  }

  if (!customization.replacements) {
    customization.replacements = {};
  }
  if (!customization.enabledReplacements) {
    customization.enabledReplacements = [];
  }
  if (!customization.replacementExtras) {
    customization.replacementExtras = {};
  }

  customization.replacements[replacementId] = parseFloat(priceDiff) || 0;
}// 获取数量定价 - 优化版
function getQuantityPricing(ingredientId, type) {
  const customization = customizationsMap.value.get(ingredientId);
  return customization && customization.quantityPricing
    ? customization.quantityPricing[type] || 0
    : 0;
}

// 更新数量定价 - 优化版
function updateQuantityPricing(ingredientId, type, price) {
  let customization = customizationsMap.value.get(ingredientId);

  if (!customization) {
    customization = {
      ingredientId: ingredientId,
      mode: "variable",
      replacements: {},
      enabledReplacements: [],
      replacementExtras: {},
      quantityPricing: { extra: 0, reduce: 0 },
    };
    product.value.customizations.push(customization);
    customizationsMap.value.set(ingredientId, customization);
  }

  if (!customization.quantityPricing) {
    customization.quantityPricing = { extra: 0, reduce: 0 };
  }
  if (!customization.replacementExtras) {
    customization.replacementExtras = {};
  }

  customization.quantityPricing[type] = parseFloat(price) || 0;
}import { useQuasar } from "quasar";
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
  customizable: true, // 新增：控制是否启用自定义功能
  categories: [], // 必须始终为数组
  ingredients: [], // 改为对象数组，包含 id、quantity 和 unit
  customizations: [], // 改为对象数组，包含 ingredient 定制化配置
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
        name: item.name,
      }));

      // 构建优化的映射
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

fetchCategories();
fetchIngredients();

// 初始化映射
function initializeMaps() {
  buildSelectedIngredientsMap();
  buildCustomizationsMap();
}

// 组件挂载时初始化映射
initializeMaps();

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

// Watch for customizable changes to clear customizations when disabled
watch(() => product.value.customizable, (newValue) => {
  if (!newValue) {
    // Clear all customizations when customizable is disabled
    product.value.customizations = [];
    customizationsMap.value.clear();
  }
});

// Watch for ingredients changes to maintain maps
watch(() => product.value.ingredients, () => {
  buildSelectedIngredientsMap();
}, { deep: true });

// Watch for customizations changes to maintain maps
watch(() => product.value.customizations, () => {
  buildCustomizationsMap();
}, { deep: true });

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
    submitData.customizable = submitData.customizable ? 1 : 0;

    // 确保 ingredients 数据格式正确（如果后端期望的是简单的ID数组，需要转换）
    // 如果后端支持数量信息，保持原格式；如果只需要ID，可以解注释下面的行
    // submitData.ingredients = submitData.ingredients.map(ing => ing.id);

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
