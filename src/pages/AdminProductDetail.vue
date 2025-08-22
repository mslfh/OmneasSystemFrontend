<template>
  <q-page padding>
    <div class="row q-gutter-md">
      <!-- Product Image Section -->
      <div class="col-12 col-md-4">
        <q-card class="q-pa-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Product Images</div>

            <!-- Main Image -->
            <div class="q-mb-md">
              <q-img
                :src="product?.image || 'https://picsum.photos/400/300?random=1'"
                :alt="product?.title"
                style="height: 300px; max-width: 100%"
                class="rounded-borders"
              />
            </div>

            <!-- Image Gallery -->
            <div v-if="product?.image_list && product.image_list.length > 0" class="row q-gutter-sm">
              <div
                v-for="(img, index) in product.image_list"
                :key="index"
                class="col-3"
              >
                <q-img
                  :src="img"
                  style="height: 80px"
                  class="rounded-borders cursor-pointer"
                  @click="product.image = img"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Product Details Section -->
      <div class="col-12 col-md-8">
        <q-card class="q-pa-md">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
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

            <q-form @submit="saveProduct" class="q-gutter-md">
              <div class="row q-gutter-md">
                <!-- Basic Information -->
                <div class="col-12">
                  <div class="text-subtitle1 q-mb-sm">Basic Information</div>
                  <q-separator class="q-mb-md" />
                </div>

                <div class="col-12 col-md-6">
                  <q-input
                    v-model="editableProduct.code"
                    label="Product Code"
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

                <div class="col-12 col-md-6">
                  <q-input
                    v-model="editableProduct.title"
                    label="Title"
                    :readonly="!isEditing"
                    outlined
                    dense
                    :rules="[val => val && val.length > 0 || 'Title is required']"
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

                <!-- Pricing Information -->
                <div class="col-12">
                  <div class="text-subtitle1 q-mb-sm">Pricing Information</div>
                  <q-separator class="q-mb-md" />
                </div>

                <div class="col-12 col-md-4">
                  <q-input
                    v-model.number="editableProduct.price"
                    label="Price"
                    :readonly="!isEditing"
                    outlined
                    dense
                    type="number"
                    step="0.01"
                    prefix="$"
                    :rules="[val => val >= 0 || 'Price must be positive']"
                  />
                </div>

                <div class="col-12 col-md-4">
                  <q-input
                    v-model.number="editableProduct.discount"
                    label="Discount"
                    :readonly="!isEditing"
                    outlined
                    dense
                    type="number"
                    step="0.01"
                    prefix="$"
                    :rules="[val => val >= 0 || 'Discount must be positive']"
                  />
                </div>

                <div class="col-12 col-md-4">
                  <q-input
                    v-model.number="editableProduct.selling_price"
                    label="Selling Price"
                    :readonly="!isEditing"
                    outlined
                    dense
                    type="number"
                    step="0.01"
                    prefix="$"
                    :rules="[val => val >= 0 || 'Selling price must be positive']"
                  />
                </div>

                <!-- Inventory & Status -->
                <div class="col-12">
                  <div class="text-subtitle1 q-mb-sm">Inventory & Status</div>
                  <q-separator class="q-mb-md" />
                </div>

                <div class="col-12 col-md-4">
                  <q-input
                    v-model.number="editableProduct.stock"
                    label="Stock"
                    :readonly="!isEditing"
                    outlined
                    dense
                    type="number"
                    :rules="[val => val >= 0 || 'Stock must be positive']"
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
                      { label: 'Inactive', value: 'inactive' }
                    ]"
                    option-value="value"
                    option-label="label"
                    map-options
                    emit-value
                  />
                </div>

                <div class="col-12 col-md-4">
                  <q-input
                    v-model.number="editableProduct.sort"
                    label="Sort Order"
                    :readonly="!isEditing"
                    outlined
                    dense
                    type="number"
                  />
                </div>

                <!-- Additional Options -->
                <div class="col-12">
                  <div class="text-subtitle1 q-mb-sm">Additional Options</div>
                  <q-separator class="q-mb-md" />
                </div>

                <div class="col-12 col-md-6">
                  <q-checkbox
                    v-model="editableProduct.is_featured"
                    label="Featured Product"
                    :disable="!isEditing"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <q-checkbox
                    v-model="editableProduct.viewable"
                    label="Viewable"
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

                <!-- Images -->
                <div class="col-12">
                  <div class="text-subtitle1 q-mb-sm">Images</div>
                  <q-separator class="q-mb-md" />
                </div>

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

                <!-- Timestamps -->
                <div class="col-12" v-if="product">
                  <div class="text-subtitle1 q-mb-sm">Timestamps</div>
                  <q-separator class="q-mb-md" />
                  <div class="row q-gutter-md">
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
                </div>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>

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

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const product = ref(null);
const editableProduct = ref({});
const originalProduct = ref({});
const isEditing = ref(false);
const loading = ref(true);
const saving = ref(false);

// Computed property for image list string
const imageListString = computed({
  get() {
    if (editableProduct.value.image_list && Array.isArray(editableProduct.value.image_list)) {
      return editableProduct.value.image_list.join('\n');
    }
    return '';
  },
  set(value) {
    if (value) {
      editableProduct.value.image_list = value.split('\n').filter(url => url.trim());
    } else {
      editableProduct.value.image_list = [];
    }
  }
});

const fetchProductDetail = async (id) => {
  try {
    loading.value = true;
    const response = await api.get(`/api/products/${id}`);
    product.value = response.data;
    editableProduct.value = { ...response.data };
    originalProduct.value = { ...response.data };

    // Ensure boolean values are properly set
    editableProduct.value.is_featured = Boolean(editableProduct.value.is_featured);
    editableProduct.value.viewable = Boolean(editableProduct.value.viewable);

    // Ensure numeric values are properly set
    editableProduct.value.price = Number(editableProduct.value.price);
    editableProduct.value.discount = Number(editableProduct.value.discount);
    editableProduct.value.selling_price = Number(editableProduct.value.selling_price);
    editableProduct.value.stock = Number(editableProduct.value.stock);
    editableProduct.value.sort = Number(editableProduct.value.sort || 0);

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
  editableProduct.value.is_featured = Boolean(editableProduct.value.is_featured);
  editableProduct.value.viewable = Boolean(editableProduct.value.viewable);
};

const cancelEdit = () => {
  isEditing.value = false;
  editableProduct.value = { ...originalProduct.value };
};

const saveProduct = async () => {
  try {
    saving.value = true;

    // Prepare data for submission
    const submitData = { ...editableProduct.value };

    // Convert boolean values
    submitData.is_featured = submitData.is_featured ? 1 : 0;
    submitData.viewable = submitData.viewable ? 1 : 0;

    // Ensure image_list is an array
    if (typeof submitData.image_list === 'string') {
      submitData.image_list = submitData.image_list.split('\n').filter(url => url.trim());
    }

    const response = await api.put(`/api/products/${product.value.id}`, submitData);

    // Update the product data
    product.value = response.data;
    originalProduct.value = { ...response.data };
    editableProduct.value = { ...response.data };

    // Ensure boolean values are properly set
    editableProduct.value.is_featured = Boolean(editableProduct.value.is_featured);
    editableProduct.value.viewable = Boolean(editableProduct.value.viewable);

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
  if (!dateString) return '';
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
