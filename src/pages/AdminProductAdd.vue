<template>
  <q-page padding>
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
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
          </div>
        </div>

        <q-form @submit="saveProduct" class="q-gutter-md" ref="formRef">
          <div class="row q-gutter-md">
            <!-- Basic Information -->
            <div class="col-12">
              <div class="text-subtitle1 q-mb-sm">Basic Information</div>
              <q-separator class="q-mb-md" />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="product.code"
                label="Product Code *"
                outlined
                dense
                :rules="[val => val && val.length > 0 || 'Product code is required']"
                hint="Unique product identifier"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="product.acronym"
                label="Acronym"
                outlined
                dense
                hint="Short abbreviation for the product"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="product.title"
                label="Title *"
                outlined
                dense
                :rules="[val => val && val.length > 0 || 'Title is required']"
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

            <!-- Pricing Information -->
            <div class="col-12">
              <div class="text-subtitle1 q-mb-sm">Pricing Information</div>
              <q-separator class="q-mb-md" />
            </div>

            <div class="col-12 col-md-4">
              <q-input
                v-model.number="product.price"
                label="Price *"
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
                v-model.number="product.discount"
                label="Discount"
                outlined
                dense
                type="number"
                step="0.01"
                prefix="$"
                :rules="[val => val >= 0 || 'Discount must be positive']"
                @input="calculateSellingPrice"
              />
            </div>

            <div class="col-12 col-md-4">
              <q-input
                v-model.number="product.selling_price"
                label="Selling Price *"
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
                v-model.number="product.stock"
                label="Stock *"
                outlined
                dense
                type="number"
                :rules="[val => val >= 0 || 'Stock must be positive']"
              />
            </div>

            <div class="col-12 col-md-4">
              <q-select
                v-model="product.status"
                label="Status *"
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
                :rules="[val => val && val.length > 0 || 'Status is required']"
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

            <!-- Additional Options -->
            <div class="col-12">
              <div class="text-subtitle1 q-mb-sm">Additional Options</div>
              <q-separator class="q-mb-md" />
            </div>

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

            <!-- Images -->
            <div class="col-12">
              <div class="text-subtitle1 q-mb-sm">Images</div>
              <q-separator class="q-mb-md" />
            </div>

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
                      <div class="absolute-full flex flex-center bg-grey-3 text-grey-6">
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
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
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
  code: '',
  title: '',
  second_title: '',
  acronym: '',
  description: '',
  tip: '',
  price: 0,
  discount: 0,
  selling_price: 0,
  stock: 0,
  status: 'active',
  viewable: true,
  image: '',
  image_list: [],
  tag: '',
  sort: 1,
  is_featured: false,
});

// Computed property for image list string
const imageListString = computed({
  get() {
    if (product.value.image_list && Array.isArray(product.value.image_list)) {
      return product.value.image_list.join('\n');
    }
    return '';
  },
  set(value) {
    if (value) {
      product.value.image_list = value.split('\n').filter(url => url.trim());
    } else {
      product.value.image_list = [];
    }
  }
});

// Computed property to check if form is valid
const isFormValid = computed(() => {
  return product.value.code &&
         product.value.title &&
         product.value.price >= 0 &&
         product.value.selling_price >= 0 &&
         product.value.stock >= 0 &&
         product.value.status;
});

// Auto-calculate selling price when price or discount changes
const calculateSellingPrice = () => {
  if (product.value.price && product.value.discount >= 0) {
    product.value.selling_price = Math.max(0, product.value.price - product.value.discount);
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
    if (typeof submitData.image_list === 'string') {
      submitData.image_list = submitData.image_list.split('\n').filter(url => url.trim());
    }

    // Remove empty strings and ensure proper data types
    if (!submitData.image) delete submitData.image;
    if (!submitData.second_title) delete submitData.second_title;
    if (!submitData.acronym) delete submitData.acronym;
    if (!submitData.description) delete submitData.description;
    if (!submitData.tip) delete submitData.tip;
    if (!submitData.tag) delete submitData.tag;

    const response = await api.post('/api/products', submitData);

    $q.notify({
      type: "positive",
      message: "Product created successfully",
      position: "top",
      timeout: 3000,
    });

    // Navigate to product detail page
    router.push({
      path: '/admin/product/detail',
      query: { id: response.data.id }
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
