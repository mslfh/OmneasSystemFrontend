<template>
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
                :model-value="customizable"
                @update:model-value="(val) => $emit('update:customizable', val)"
                color="primary"
                label="Enable Customization"
                left-label
              />
            </div>

            <div
              v-if="!customizable"
              class="text-grey-6 text-center q-pa-lg bg-grey-3 rounded-borders"
            >
              <q-icon name="o_lock" size="md" class="q-mb-sm" />
              <div>Product customization is disabled</div>
              <div class="text-caption">
                Enable customization to configure ingredient options
              </div>
            </div>

            <div
              v-else-if="selectedIngredients.length === 0"
              class="text-grey-6 text-center q-pa-md"
            >
              Please select ingredients first to configure customization options
            </div>
            <q-list v-else-if="customizable" separator>
              <q-item
                v-for="ingredient in selectedIngredientsWithDetails"
                :key="ingredient.id"
                class="q-pa-sm"
              >
                <q-item-section>
                  <div class="row q-col-gutter-sm q-row-gutter-xs">
                    <!-- 父节点：Ingredient 信息 -->
                    <div class="col-8">
                      <div class="text-body1 text-weight-medium text-primary">
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
                        <span class="text-caption text-grey-7 q-ml-sm">
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
                        :model-value="getCustomizationMode(ingredient.id)"
                        @update:model-value="
                          (val) => updateCustomizationMode(ingredient.id, val)
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
                        v-if="getCustomizationMode(ingredient.id) !== 'fixed'"
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
                              getCustomizationMode(ingredient.id) ===
                                'replaceable' ||
                              getCustomizationMode(ingredient.id) ===
                                'replaceable_variable'
                            "
                          >
                            <!-- 全选/全不选按钮 -->
                            <div
                              class="row items-center justify-between q-mb-sm"
                            >
                              <div class="text-body2 text-weight-medium">
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
                                    selectAllReplacements(ingredient.id, true)
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
                                    selectAllReplacements(ingredient.id, false)
                                  "
                                />
                              </div>
                            </div>

                            <!-- Price Sync Toggle for Replaceable modes -->
                            <div class="row q-col-gutter-md q-mb-xs items-center">
                              <div class="text-caption text-grey-7">
                                Sync With Item Price:
                              </div>
                              <div>
                                <q-toggle
                                  :model-value="
                                    getCustomizationType(ingredient.id)
                                  "
                                  @update:model-value="
                                    (val) =>
                                      updateCustomizationType(
                                        ingredient.id,
                                        val
                                      )
                                  "
                                  color="primary"
                                  :true-value="0"
                                  :false-value="1"
                                  size="sm"
                                  dense
                                />
                              </div>
                              <div class="text-caption text-grey-6">
                                {{
                                  getCustomizationType(ingredient.id) === 0
                                    ? "Auto"
                                    : "Manual"
                                }}
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
                                    <div
                                      class="col q-mr-sm text-left"
                                      style="min-width: 0"
                                    >
                                      <div class="text-body2 ellipsis">
                                        {{ replacement.name }}
                                      </div>
                                      <div
                                        class="text-caption text-grey-6 ellipsis"
                                      >
                                        ${{ replacement.price || 0 }}
                                        -
                                        {{ replacement.description }}
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
                                        style="width: 75px"
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
                                      v-if="
                                        getCustomizationMode(ingredient.id) ===
                                        'replaceable_variable'
                                      "
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
                                        style="width: 75px"
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
                              getCustomizationMode(ingredient.id) === 'variable'
                            "
                          >
                            <!-- Price Sync Toggle for Variable mode -->
                            <div
                              class="row items-center justify-between q-mb-sm"
                            >
                              <div class="text-caption text-grey-7">
                                Price Sync:
                              </div>
                              <q-toggle
                                :model-value="
                                  getCustomizationType(ingredient.id)
                                "
                                @update:model-value="
                                  (val) =>
                                    updateCustomizationType(ingredient.id, val)
                                "
                                color="primary"
                                :true-value="1"
                                :false-value="0"
                                size="sm"
                                dense
                              />
                              <div class="text-caption text-grey-6">
                                {{
                                  getCustomizationType(ingredient.id) === 0
                                    ? "Auto"
                                    : "Manual"
                                }}
                              </div>
                            </div>

                            <div class="row q-col-gutter-sm">
                              <div class="col-12 col-md-6">
                                <q-input
                                  :model-value="
                                    getQuantityPricing(ingredient.id, 'extra')
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
                                    getQuantityPricing(ingredient.id, 'reduce')
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
                          getCustomizationMode(ingredient.id) === 'fixed'
                        "
                        class="q-mt-xs"
                      >
                        <div
                          class="text-caption text-grey-6 q-pa-sm bg-grey-2 rounded-borders"
                        >
                          <q-icon name="lock" class="q-mr-xs" size="xs" />
                          This ingredient cannot be customized by customers.
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
</template>

<script setup>
import { computed } from "vue";

// Props
const props = defineProps({
  customizable: {
    type: Boolean,
    default: true,
  },
  selectedIngredients: {
    type: Array,
    default: () => [],
  },
  customizations: {
    type: Array,
    default: () => [],
  },
  ingredientMap: {
    type: Map,
    default: () => new Map(),
  },
  ingredientsByType: {
    type: Map,
    default: () => new Map(),
  },
  unitOptions: {
    type: Array,
    default: () => [],
  },
});

// Emits
const emit = defineEmits([
  "update:customizable",
  "update:customizations",
  "customization-changed",
]);

// Data
const customizationModes = [
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
];

const replacementOptionsCache = new Map();

// Computed
const customizationsMap = computed(() => {
  const map = new Map();
  props.customizations.forEach((custom) => {
    map.set(custom.ingredientId, custom);
  });
  return map;
});

const selectedIngredientsWithDetails = computed(() => {
  return props.selectedIngredients.map((ing) => {
    const itemDetail = props.ingredientMap.get(ing.id);
    return {
      ...ing,
      name: itemDetail?.name || itemDetail?.label || "Unknown",
      type: itemDetail?.type || "Other",
      price: itemDetail?.price || 0,
      description: itemDetail?.description || "",
    };
  });
});

// Methods
function formatQuantityUnit(quantity, unit) {
  const unitLabel =
    props.unitOptions.find((opt) => opt.value === unit)?.label || "Several";
  return `${quantity} ${unitLabel}`;
}

function getCustomizationMode(ingredientId) {
  const customization = customizationsMap.value.get(ingredientId);
  return customization ? customization.mode : "fixed";
}

function getCustomizationType(ingredientId) {
  const customization = customizationsMap.value.get(ingredientId);
  return customization && customization.type !== undefined
    ? customization.type
    : 0;
}

function updateCustomizationType(ingredientId, type) {
  const customizations = [...props.customizations];
  let customization = customizations.find(
    (c) => c.ingredientId === ingredientId
  );

  if (!customization) {
    // Get ingredient details to access extra_price
    const ingredientDetail = props.ingredientMap.get(ingredientId);
    const defaultExtraPrice = parseFloat(ingredientDetail?.extra_price) || 0;

    customization = {
      ingredientId: ingredientId,
      mode: "replaceable", // Default mode when creating from type toggle
      type: type,
      replacements: {},
      enabledReplacements: [],
      replacementExtras: {},
      quantityPricing: { extra: defaultExtraPrice, reduce: 0 },
    };
    customizations.push(customization);
  } else {
    customization.type = type;
  }

  emit("update:customizations", customizations);
  emit("customization-changed");
}

function getCustomizationLabel(ingredientId) {
  const mode = getCustomizationMode(ingredientId);
  const labels = {
    replaceable: "Available Replacements",
    variable: "Quantity Pricing",
    replaceable_variable: "Replacements & Quantity",
    fixed: "No Customization",
    default: "Select Customization Mode",
  };
  return labels[mode] || labels.default;
}

function getCustomizationCaption(ingredientId) {
  const mode = getCustomizationMode(ingredientId);
  const captions = {
    replaceable: "Configure replacement options",
    variable: "Set pricing for quantity changes",
    replaceable_variable: "Configure replacements and quantity pricing",
    fixed: "This ingredient cannot be customized",
    default: "Choose a customization mode from the dropdown above",
  };
  return captions[mode] || captions.default;
}

function updateCustomizationMode(ingredientId, mode) {
  const customizations = [...props.customizations];
  let customization = customizations.find(
    (c) => c.ingredientId === ingredientId
  );

  // Get ingredient details to access extra_price
  const ingredientDetail = props.ingredientMap.get(ingredientId);
  const defaultExtraPrice =
    mode === "variable" || mode === "replaceable_variable"
      ? parseFloat(ingredientDetail?.extra_price) || 0
      : 0;

  if (customization) {
    const oldMode = customization.mode;
    customization.mode = mode;

    // Ensure type field exists, default to 0 (sync with product)
    if (customization.type === undefined) {
      customization.type = 0;
    }

    // Update extra price when mode changes to variable or replaceable_variable
    if (
      (mode === "variable" || mode === "replaceable_variable") &&
      oldMode !== "variable" &&
      oldMode !== "replaceable_variable"
    ) {
      if (!customization.quantityPricing) {
        customization.quantityPricing = { extra: defaultExtraPrice, reduce: 0 };
      } else {
        customization.quantityPricing.extra = defaultExtraPrice;
      }
    }

    // Initialize replacementExtras when switching to replaceable_variable mode
    if (mode === "replaceable_variable" && oldMode !== "replaceable_variable") {
      if (!customization.replacementExtras) {
        customization.replacementExtras = {};
      }
      // Initialize extra prices for already enabled replacements
      if (
        customization.enabledReplacements &&
        customization.enabledReplacements.length > 0
      ) {
        customization.enabledReplacements.forEach((replacementId) => {
          if (customization.replacementExtras[replacementId] === undefined) {
            const replacementDetail = props.ingredientMap.get(replacementId);
            const replacementExtraPrice =
              parseFloat(replacementDetail?.extra_price) || 0;
            customization.replacementExtras[replacementId] =
              replacementExtraPrice;
          }
        });
      }
    }
  } else {
    customization = {
      ingredientId: ingredientId,
      mode: mode,
      type: 0, // Default to sync with product
      replacements: {},
      enabledReplacements: [],
      replacementExtras: {},
      quantityPricing: { extra: defaultExtraPrice, reduce: 0 },
    };
    customizations.push(customization);
  }

  if (!customization.replacementExtras) {
    customization.replacementExtras = {};
  }

  emit("update:customizations", customizations);
  emit("customization-changed");
}

function getReplacementOptions(ingredient) {
  const cacheKey = `${ingredient.type}_${ingredient.id}`;
  if (replacementOptionsCache.has(cacheKey)) {
    return replacementOptionsCache.get(cacheKey);
  }

  const typeIngredients = props.ingredientsByType.get(ingredient.type) || [];
  const options = typeIngredients.filter((item) => item.id !== ingredient.id);

  replacementOptionsCache.set(cacheKey, options);
  return options;
}

function selectAllReplacements(ingredientId, selectAll) {
  const customizations = [...props.customizations];
  let customization = customizations.find(
    (c) => c.ingredientId === ingredientId
  );

  if (!customization) {
    // Get ingredient details to access extra_price
    const ingredientDetail = props.ingredientMap.get(ingredientId);
    const defaultExtraPrice = parseFloat(ingredientDetail?.extra_price) || 0;

    customization = {
      ingredientId: ingredientId,
      mode: "replaceable",
      type: 0, // Default to sync with product
      replacements: {},
      enabledReplacements: [],
      replacementExtras: {},
      quantityPricing: { extra: defaultExtraPrice, reduce: 0 },
    };
    customizations.push(customization);
  }

  if (!customization.enabledReplacements)
    customization.enabledReplacements = [];
  if (!customization.replacements) customization.replacements = {};
  if (!customization.replacementExtras) customization.replacementExtras = {};

  const ingredientDetail = props.ingredientMap.get(ingredientId);
  if (ingredientDetail) {
    const replacementOptions = getReplacementOptions(ingredientDetail);
    const originalPrice = parseFloat(ingredientDetail.price) || 0;

    if (selectAll) {
      replacementOptions.forEach((replacement) => {
        if (!customization.enabledReplacements.includes(replacement.id)) {
          customization.enabledReplacements.push(replacement.id);

          const replacementPrice = parseFloat(replacement.price) || 0;
          const priceDiff = Math.max(0, replacementPrice - originalPrice);
          customization.replacements[replacement.id] = priceDiff;

          if (customization.mode === "replaceable_variable") {
            if (!customization.replacementExtras[replacement.id]) {
              // Use the replacement ingredient's extra_price as default
              const replacementExtraPrice =
                parseFloat(replacement.extra_price) || 0;
              customization.replacementExtras[replacement.id] =
                replacementExtraPrice;
            }
          }
        }
      });
    } else {
      const replacementIds = new Set(replacementOptions.map((r) => r.id));
      customization.enabledReplacements =
        customization.enabledReplacements.filter(
          (id) => !replacementIds.has(id)
        );
    }
  }

  emit("update:customizations", customizations);
  emit("customization-changed");
}

function isReplacementEnabled(ingredientId, replacementId) {
  const customization = customizationsMap.value.get(ingredientId);
  if (!customization || !customization.enabledReplacements) {
    return false;
  }
  return customization.enabledReplacements.includes(replacementId);
}

function toggleReplacement(ingredientId, replacementId, enabled) {
  const customizations = [...props.customizations];
  let customization = customizations.find(
    (c) => c.ingredientId === ingredientId
  );

  if (!customization) {
    // Get ingredient details to access extra_price
    const ingredientDetail = props.ingredientMap.get(ingredientId);
    const defaultExtraPrice = parseFloat(ingredientDetail?.extra_price) || 0;

    customization = {
      ingredientId: ingredientId,
      mode: "replaceable",
      type: 0, // Default to sync with product
      replacements: {},
      enabledReplacements: [],
      replacementExtras: {},
      quantityPricing: { extra: defaultExtraPrice, reduce: 0 },
    };
    customizations.push(customization);
  }

  if (!customization.enabledReplacements)
    customization.enabledReplacements = [];
  if (!customization.replacements) customization.replacements = {};
  if (!customization.replacementExtras) customization.replacementExtras = {};

  const index = customization.enabledReplacements.indexOf(replacementId);
  if (enabled && index === -1) {
    customization.enabledReplacements.push(replacementId);

    const originalIngredient = props.ingredientMap.get(ingredientId);
    const replacementIngredient = props.ingredientMap.get(replacementId);

    if (originalIngredient && replacementIngredient) {
      const originalPrice = parseFloat(originalIngredient.price) || 0;
      const replacementPrice = parseFloat(replacementIngredient.price) || 0;
      const priceDiff = Math.max(0, replacementPrice - originalPrice);
      customization.replacements[replacementId] = priceDiff;

      if (customization.mode === "replaceable_variable") {
        if (!customization.replacementExtras[replacementId]) {
          // Use the replacement ingredient's extra_price as default
          const replacementExtraPrice =
            parseFloat(replacementIngredient.extra_price) || 0;
          customization.replacementExtras[replacementId] =
            replacementExtraPrice;
        }
      }
    }
  } else if (!enabled && index > -1) {
    customization.enabledReplacements.splice(index, 1);
  }

  emit("update:customizations", customizations);
  emit("customization-changed");
}

function getReplacementPriceDiff(ingredientId, replacementId) {
  if (!isReplacementEnabled(ingredientId, replacementId)) {
    return 0;
  }

  const customization = customizationsMap.value.get(ingredientId);
  if (
    customization &&
    customization.replacements &&
    customization.replacements[replacementId] !== undefined
  ) {
    return customization.replacements[replacementId];
  }

  const originalIngredient = props.ingredientMap.get(ingredientId);
  const replacementIngredient = props.ingredientMap.get(replacementId);

  if (originalIngredient && replacementIngredient) {
    const originalPrice = parseFloat(originalIngredient.price) || 0;
    const replacementPrice = parseFloat(replacementIngredient.price) || 0;
    return Math.max(0, replacementPrice - originalPrice);
  }

  return 0;
}

function getReplacementExtraPrice(ingredientId, replacementId) {
  if (!isReplacementEnabled(ingredientId, replacementId)) {
    return 0;
  }

  const customization = customizationsMap.value.get(ingredientId);
  if (customization && customization.replacementExtras) {
    // If there's a specific value set for this replacement, return it
    if (customization.replacementExtras[replacementId] !== undefined) {
      return customization.replacementExtras[replacementId];
    }
  }

  // If no specific value set, return the replacement ingredient's extra_price as default
  const replacementIngredient = props.ingredientMap.get(replacementId);
  return parseFloat(replacementIngredient?.extra_price) || 0;
}

function updateReplacementExtraPrice(ingredientId, replacementId, extraPrice) {
  const customizations = [...props.customizations];
  const customization = customizations.find(
    (c) => c.ingredientId === ingredientId
  );

  if (!customization || !isReplacementEnabled(ingredientId, replacementId)) {
    return;
  }

  if (!customization.replacementExtras) {
    customization.replacementExtras = {};
  }

  customization.replacementExtras[replacementId] = parseFloat(extraPrice) || 0;

  emit("update:customizations", customizations);
  emit("customization-changed");
}

function updateReplacementPriceDiff(ingredientId, replacementId, priceDiff) {
  const customizations = [...props.customizations];
  const customization = customizations.find(
    (c) => c.ingredientId === ingredientId
  );

  if (!customization || !isReplacementEnabled(ingredientId, replacementId)) {
    return;
  }

  if (!customization.replacements) {
    customization.replacements = {};
  }
  if (!customization.replacementExtras) {
    customization.replacementExtras = {};
  }

  customization.replacements[replacementId] = parseFloat(priceDiff) || 0;

  emit("update:customizations", customizations);
  emit("customization-changed");
}

function getQuantityPricing(ingredientId, type) {
  const customization = customizationsMap.value.get(ingredientId);
  return customization && customization.quantityPricing
    ? customization.quantityPricing[type] || 0
    : 0;
}

function updateQuantityPricing(ingredientId, type, price) {
  const customizations = [...props.customizations];
  let customization = customizations.find(
    (c) => c.ingredientId === ingredientId
  );

  if (!customization) {
    // Get ingredient details to access extra_price
    const ingredientDetail = props.ingredientMap.get(ingredientId);
    const defaultExtraPrice = parseFloat(ingredientDetail?.extra_price) || 0;

    customization = {
      ingredientId: ingredientId,
      mode: "variable",
      type: 0, // Default to sync with product
      replacements: {},
      enabledReplacements: [],
      replacementExtras: {},
      quantityPricing: { extra: defaultExtraPrice, reduce: 0 },
    };
    customizations.push(customization);
  }

  if (!customization.quantityPricing) {
    // Get ingredient details to access extra_price for existing customizations
    const ingredientDetail = props.ingredientMap.get(ingredientId);
    const defaultExtraPrice = parseFloat(ingredientDetail?.extra_price) || 0;
    customization.quantityPricing = { extra: defaultExtraPrice, reduce: 0 };
  }
  if (!customization.replacementExtras) {
    customization.replacementExtras = {};
  }

  customization.quantityPricing[type] = parseFloat(price) || 0;

  emit("update:customizations", customizations);
  emit("customization-changed");
}
</script>

<style scoped>
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
