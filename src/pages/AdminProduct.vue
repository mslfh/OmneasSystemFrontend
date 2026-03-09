<template>
  <div class="q-pa-md">
    <!-- ───────── Filter Panel ───────── -->
    <q-card flat bordered class="q-mb-sm">
      <q-card-section class="q-py-sm">
        <div class="row q-col-gutter-sm items-end">
          <!-- Name search -->
          <div class="col-12 col-sm-3">
            <q-input v-model="filters.name" label="Name" dense outlined clearable debounce="500"
              @update:model-value="applyFilters">
              <template v-slot:prepend><q-icon name="search" size="xs" /></template>
            </q-input>
          </div>

          <!-- Category -->
          <div class="col-12 col-sm-2">
            <q-select v-model="filters.category" :options="allCategories" option-label="title" option-value="id"
              emit-value map-options label="Category" dense outlined clearable @update:model-value="applyFilters" />
          </div>

          <!-- Status -->
          <div class="col-12 col-sm-2">
            <q-select v-model="filters.status" :options="statusOptions" option-label="label" option-value="value"
              emit-value map-options label="Status" dense outlined clearable @update:model-value="applyFilters" />
          </div>

          <!-- Stock -->
          <div class="col-12 col-sm-2">
            <q-select v-model="filters.stock" :options="stockFilterOptions" option-label="label" option-value="value"
              emit-value map-options label="Stock" dense outlined clearable @update:model-value="applyFilters" />
          </div>

          <!-- Price range -->
          <div class="col-12 col-sm-3">
            <div class="row q-col-gutter-xs items-center">
              <div class="col">
                <q-input v-model.number="filters.priceMin" type="number" label="$ Min" dense outlined
                  @update:model-value="applyFilters" debounce="600" />
              </div>
              <div class="col-auto text-grey-5">—</div>
              <div class="col">
                <q-input v-model.number="filters.priceMax" type="number" label="$ Max" dense outlined
                  @update:model-value="applyFilters" debounce="600" />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- ───────── Toolbar ───────── -->
    <div class="row items-center q-mb-sm q-gutter-sm">
      <div class="text-h6">Products</div>
      <q-chip outline color="primary" icon="add" clickable @click="router.push('/admin/product/add')">Add</q-chip>
      <q-space />

      <!-- Batch action bar (shown when rows selected) -->
      <template v-if="selected.length > 0">
        <q-chip color="blue-1" text-color="blue-8" icon="checklist">{{ selected.length }} selected</q-chip>
        <q-btn flat dense color="primary" icon="edit" label="Batch Edit" @click="openBatchEdit" />
        <q-btn flat dense color="orange" icon="trending_up" label="Adjust Price" @click="openPriceAdjust(false)" />
        <q-btn flat dense color="grey" icon="close" @click="selected = []" />
      </template>
      <template v-else>
        <q-btn flat dense color="orange" icon="trending_up" label="Adjust All Prices" @click="openPriceAdjust(true)" />
      </template>

      <!-- Clear filters -->
      <q-btn flat dense round icon="filter_alt_off" color="grey-6" @click="clearFilters">
        <q-tooltip>Clear Filters</q-tooltip>
      </q-btn>
    </div>

    <!-- ───────── Table ───────── -->
    <q-table no-data-label="No products found" :dense="$q.screen.lt.md" :columns="columns" :rows="data" row-key="id"
      v-model:pagination="pagination" :loading="loading" @request="onRequest" binary-state-sort
      :rows-per-page-options="[35, 50, 100]" v-model:selected="selected" selection="multiple">

      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width>
            <q-checkbox v-model="props.selected" indeterminate-value="some" />
          </q-th>
          <q-th v-for="col in props.cols" :key="col.name" :props="props">{{ col.label }}</q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-checkbox v-model="props.selected" />
          </q-td>

          <!-- Image -->
          <q-td key="image" :props="props">
            <q-avatar size="40px" rounded>
              <img :src="props.row.image" :alt="props.row.title" />
            </q-avatar>
          </q-td>

          <!-- Code -->
          <q-td key="code" :props="props">{{ props.row.code }}</q-td>

          <!-- Title -->
          <q-td key="title" :props="props">
            <div>{{ props.row.title }}</div>
            <div v-if="props.row.second_title" class="text-caption text-grey-6">{{ props.row.second_title }}</div>
          </q-td>

          <!-- Categories -->
          <q-td key="categories" :props="props">
            <div class="q-gutter-xs">
              <q-chip v-for="category in props.row.categories" :key="category.id" size="sm" dense color="blue-2"
                text-color="blue-8" :label="category.title" class="q-ma-xs" />
            </div>
          </q-td>

          <!-- Selling Price -->
          <q-td key="selling_price" :props="props">
            <span class="text-weight-medium">${{ props.row.selling_price }}</span>
            <span v-if="props.row.discount > 0" class="text-caption text-grey-5 q-ml-xs">
              (-${{ props.row.discount }})
            </span>
          </q-td>

          <!-- Stock -->
          <q-td key="stock" :props="props">
            <q-chip size="12px" dense :color="props.row.stock === -1 ? 'blue' : props.row.stock > 0 ? 'green' : 'red'"
              :label="props.row.stock === -1 ? 'Unlimited' : props.row.stock === 0 ? 'Sold Out' : props.row.stock"
              text-color="white" />
          </q-td>

          <!-- Status -->
          <q-td key="status" :props="props">
            <q-chip size="12px" dense
              :color="props.row.status === 'active' ? 'green-5' : props.row.status === 'inactive' ? 'red-5' : 'grey'"
              :label="props.row.status" text-color="white" />
          </q-td>

          <!-- Featured -->
          <q-td key="is_featured" :props="props">
            <q-icon :name="props.row.is_featured ? 'star' : 'star_border'"
              :color="props.row.is_featured ? 'amber' : 'grey'" size="sm" />
          </q-td>

          <!-- Actions -->
          <q-td key="actions" :props="props">
            <q-btn flat round icon="edit_note" color="primary" size="10px" @click="openQuickEdit(props.row)">
              <q-tooltip>Quick Edit</q-tooltip>
            </q-btn>
            <q-btn flat round icon="o_visibility" color="grey" size="10px" @click="router.push({
              path: '/admin/product/detail', query: { id: props.row.id }
            })" />
            <q-btn flat round icon="more_vert" color="grey" size="10px">
              <q-menu>
                <q-list>
                  <q-btn flat icon="edit" color="grey" size="10px" label="edit"
                    @click="router.push({ path: '/admin/product/edit', query: { id: props.row.id } })" />
                  <q-btn flat icon="o_delete" label="delete" color="negative" size="10px"
                    @click="deleteRow(props.row.id)" />
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <!-- ═══════════ Quick Edit Dialog ═══════════ -->
    <q-dialog v-model="quickEditDialog" persistent>
      <q-card style="min-width: 440px">
        <q-card-section>
          <div class="text-h6">Quick Edit</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form class="q-gutter-sm">
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input v-model="editForm.code" label="Code" outlined dense />
              </div>
            </div>
            <q-input v-model="editForm.title" label="Title" outlined dense />
            <q-input v-model="editForm.second_title" label="Second Title" outlined dense />
            <q-select v-model="editForm.categories" :options="allCategories" option-label="title" option-value="id"
              label="Categories" multiple outlined dense emit-value map-options use-chips />

            <div class="row q-col-gutter-sm">
              <div class="col-4">
                <q-input v-model.number="editForm.price" type="number" step="0.01" label="Price" outlined dense />
              </div>
              <div class="col-4">
                <q-input v-model.number="editForm.discount" type="number" step="0.01" label="Discount" outlined dense />
              </div>
              <div class="col-4">
                <q-input v-model.number="editForm.selling_price" type="number" step="0.01" label="Selling Price"
                  outlined dense />
              </div>
            </div>

            <div class="row q-col-gutter-sm items-center">
              <!-- Stock inline picker -->
              <div class="col">
                <div class="text-caption text-grey-6 q-mb-xs">Stock</div>
                <div class="row q-gutter-xs items-center">
                  <q-btn-group outline>
                    <q-btn dense outline size="sm" label="Unlimited" :color="editForm.stock === -1 ? 'blue' : 'grey-5'"
                      @click="editForm.stock = -1" />
                    <q-btn dense outline size="sm" label="Sold Out" :color="editForm.stock === 0 ? 'red' : 'grey-5'"
                      @click="editForm.stock = 0" />
                    <q-btn dense outline size="sm" label="Selling" :color="editForm.stock > 0 ? 'green' : 'grey-5'"
                      @click="editForm.stock = editForm.stock > 0 ? editForm.stock : 1" />
                  </q-btn-group>
                  <q-input v-if="editForm.stock > 0" v-model.number="editForm.stock" type="number" min="1" dense
                    outlined label="Qty" style="width:72px" />
                </div>
              </div>
              <div class="col-5">
                <q-select v-model="editForm.status"
                  :options="[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]"
                  option-label="label" option-value="value" emit-value map-options label="Status" outlined dense />
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="saveQuickEdit" :loading="savingQuickEdit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ═══════════ Batch Edit Dialog ═══════════ -->
    <q-dialog v-model="batchEditDialog" persistent>
      <q-card style="min-width: 460px; max-width: 560px">
        <q-card-section class="q-pb-none">
          <div class="row items-center">
            <div class="text-h6">Batch Edit</div>
            <q-chip size="sm" color="blue-1" text-color="blue-8" class="q-ml-sm">{{ selected.length }} products</q-chip>
          </div>
          <!-- Collapsible selected names -->
          <q-expansion-item dense switch-toggle-side
            :label="`Selected: ${selected.slice(0, 3).map(r => r.title).join(', ')}${selected.length > 3 ? ` +${selected.length - 3} more` : ''}`"
            header-class="text-caption text-grey-7 q-px-none" v-if="selected.length > 0">
            <div class="q-mt-xs q-gutter-xs">
              <q-chip v-for="r in selected" :key="r.id" size="sm" dense color="grey-2" text-color="grey-8">
                {{ r.title }}
              </q-chip>
            </div>
          </q-expansion-item>
        </q-card-section>

        <!-- Tab selector -->
        <q-tabs v-model="batchTab" dense align="left" class="q-px-md" indicator-color="primary" active-color="primary"
          narrow-indicator>
          <q-tab name="price" label="Price" />
          <q-tab name="stock" label="Stock" />
          <q-tab name="status" label="Status" />
        </q-tabs>
        <q-separator />

        <q-tab-panels v-model="batchTab" animated>
          <!-- Price panel -->
          <q-tab-panel name="price" class="q-gutter-sm">
            <div class="row q-col-gutter-sm items-end">
              <div class="col-4">
                <q-input :model-value="batchForm.price" type="number" step="0.01" label="Price" outlined dense clearable
                  @update:model-value="onBatchPriceChange" />
              </div>
              <div class="col-4">
                <q-input :model-value="batchForm.discount" type="number" step="0.01" label="Discount" outlined dense
                  clearable @update:model-value="onBatchDiscountChange" />
              </div>
              <div class="col-4">
                <q-input :model-value="batchForm.selling_price" type="number" step="0.01" label="Selling Price" outlined
                  dense clearable @update:model-value="onBatchSellingPriceChange" />
              </div>
            </div>
            <div class="text-caption text-grey-6">Any two fields auto-calculate the third (price − discount = selling
              price).</div>
          </q-tab-panel>

          <!-- Stock panel -->
          <q-tab-panel name="stock">
            <q-btn-group outline class="row q-gutter-sm items-center ">
              <q-btn label="Unlimited" :color="batchForm.stock === -1 ? 'blue' : 'grey-5'"
                @click="batchForm.stock = -1" />
              <q-btn label="Sold Out" :color="batchForm.stock === 0 ? 'red' : 'grey-5'" @click="batchForm.stock = 0" />
              <q-btn label="Selling" :color="batchForm.stock > 0 ? 'green' : 'grey-5'"
                @click="batchForm.stock = batchForm.stock > 0 ? batchForm.stock : 1" />
              <q-input v-if="batchForm.stock > 0" v-model.number="batchForm.stock" type="number" min="1" dense outlined
                label="Qty" style="width:80px" />
            </q-btn-group>
          </q-tab-panel>

          <!-- Status panel -->
          <q-tab-panel name="status">
            <div class="row q-gutter-sm">
              <q-btn unelevated label="Active" icon="check_circle"
                :color="batchForm.status === 'active' ? 'green' : 'grey-3'"
                :text-color="batchForm.status === 'active' ? 'white' : 'grey-7'" @click="batchForm.status = 'active'" />
              <q-btn unelevated label="Inactive" icon="pause_circle"
                :color="batchForm.status === 'inactive' ? 'red' : 'grey-3'"
                :text-color="batchForm.status === 'inactive' ? 'white' : 'grey-7'"
                @click="batchForm.status = 'inactive'" />
            </div>
          </q-tab-panel>
        </q-tab-panels>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat color="primary" label="Apply" @click="saveBatchEdit" :loading="savingBatch" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ═══════════ Price Adjust Dialog ═══════════ -->
    <q-dialog v-model="priceAdjustDialog" persistent>
      <q-card style="min-width: 420px">
        <q-card-section>
          <div class="text-h6">Adjust Prices</div>
          <div class="text-caption text-grey-6">
            {{ adjustAllMode ? 'All products' : `${selected.length} selected products` }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none q-gutter-sm">
          <q-btn-toggle v-model="priceAdjustForm.type" spread no-caps
            :options="[{ label: '$ Amount', value: 'amount' }, { label: '% Percent', value: 'percent' }]"
            toggle-color="primary" outline class="q-mb-sm" />

          <q-input v-model.number="priceAdjustForm.value" type="number" step="0.01"
            :label="priceAdjustForm.type === 'amount' ? 'Amount ($)  — use negative to decrease' : 'Percent (%)  — use negative to decrease'"
            outlined dense />

          <div class="text-caption text-orange q-mt-xs">
            <q-icon name="info" size="xs" />
            Selling price = new price − existing discount. Prices will not go below $0.
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat color="orange" label="Adjust" @click="savePriceAdjust" :loading="savingPriceAdjust" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { api } from "boot/axios";
import { useQuasar } from "quasar";

const router = useRouter();
const $q = useQuasar();
const API_URL = "/api/products";
const data = ref([]);
const selected = ref([]);

// ─── Categories ───
const allCategories = ref([]);
const fetchCategories = async () => {
  try {
    const res = await api.get("/api/categories/active");
    if (res.data?.data) allCategories.value = res.data.data;
  } catch (e) { console.error(e); }
};

// ─── Filter state ───
const filters = ref({ name: '', category: null, status: null, stock: null, priceMin: null, priceMax: null });

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];
const stockFilterOptions = [
  { label: 'Unlimited', value: 'unlimited' },
  { label: 'Sold Out', value: 'sold_out' },
  { label: 'In Stock', value: 'in_stock' },
];

const clearFilters = () => {
  filters.value = { name: '', category: null, status: null, stock: null, priceMin: null, priceMax: null };
  applyFilters();
};

const applyFilters = () => {
  pagination.value.page = 1;
  onRequest({ pagination: pagination.value });
};

// ─── Columns ───
const columns = [
  { name: "image", label: "Image", align: "center", field: "image" },
  { name: "code", label: "Code", align: "left", field: "code", sortable: true },
  { name: "title", label: "Title", align: "left", field: "title", sortable: true },
  { name: "categories", label: "Categories", align: "left", field: "categories" },
  { name: "selling_price", label: "Price", align: "center", field: "selling_price", sortable: true },
  { name: "stock", label: "Stock", align: "center", field: "stock", sortable: true },
  { name: "status", label: "Status", align: "center", field: "status", sortable: true },
  { name: "is_featured", label: "★", align: "center", field: "is_featured" },
  { name: "actions", label: "", align: "center" },
];

// ─── Pagination ───
const loading = ref(false);
const pagination = ref({
  sortBy: "id",
  descending: false,
  page: 1,
  rowsPerPage: 35,
  rowsNumber: 0,
});

onMounted(() => {
  onRequest({ pagination: pagination.value });
  fetchCategories();
});

const buildParams = (page, rowsPerPage, sortBy, descending) => {
  const f = filters.value;
  const params = {
    start: (page - 1) * rowsPerPage,
    count: rowsPerPage === 0 ? pagination.value.rowsNumber : rowsPerPage,
    sortBy,
    descending,
  };

  if (f.name) params.name = f.name;
  if (f.category) params.category = f.category;
  if (f.status) params.status = f.status;
  if (f.stock) params.stock = f.stock;
  if (f.priceMin != null && f.priceMin !== '') params.price_min = f.priceMin;
  if (f.priceMax != null && f.priceMax !== '') params.price_max = f.priceMax;

  return params;
};

const fetchData = async (page, rowsPerPage, sortBy, descending) => {
  loading.value = true;
  try {
    const params = buildParams(page, rowsPerPage, sortBy, descending);
    const response = await api.get(API_URL, { params });
    data.value = response.data?.rows || [];
    pagination.value.rowsNumber = response.data?.total || 0;
  } catch (error) {
    console.error("Error fetching data:", error);
    data.value = [];
    pagination.value.rowsNumber = 0;
  } finally {
    loading.value = false;
  }
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  pagination.value = { ...pagination.value, page, rowsPerPage, sortBy, descending };
  fetchData(page, rowsPerPage, sortBy, descending);
};

const refreshTable = () => onRequest({ pagination: pagination.value });

// ─── Quick Edit ───
const quickEditDialog = ref(false);
const savingQuickEdit = ref(false);
const editForm = ref({ id: '', code: '', title: '', second_title: '', categories: [], price: 0, discount: 0, selling_price: 0, stock: -1, status: 'active' });

watch(() => [editForm.value.price, editForm.value.discount], ([p, d]) => {
  editForm.value.selling_price = Number((Number(p || 0) - Number(d || 0)).toFixed(2));
});

const openQuickEdit = (row) => {
  editForm.value = {
    id: row.id,
    code: row.code,
    title: row.title,
    second_title: row.second_title || '',
    categories: row.categories ? row.categories.map(c => c.id) : [],
    price: row.price,
    discount: row.discount,
    selling_price: row.selling_price,
    stock: row.stock,
    status: row.status,
  };
  quickEditDialog.value = true;
};

const saveQuickEdit = async () => {
  savingQuickEdit.value = true;
  try {
    await api.put(`${API_URL}/${editForm.value.id}`, editForm.value);
    $q.notify({ type: "positive", message: "Product updated." });
    quickEditDialog.value = false;
    refreshTable();
  } catch {
    $q.notify({ type: "negative", message: "Failed to update product." });
  } finally {
    savingQuickEdit.value = false;
  }
};

// ─── Batch Edit ───
const batchEditDialog = ref(false);
const savingBatch = ref(false);
const batchTab = ref('price');
const batchForm = ref({ price: null, discount: 0, selling_price: null, status: 'active', stock: -1 });

// Auto-compute: three-way linkage
const onBatchPriceChange = (v) => {
  const p = v === '' || v === null ? null : Number(v);
  batchForm.value.price = p;
  if (p !== null && batchForm.value.discount !== null) {
    batchForm.value.selling_price = Number((p - (Number(batchForm.value.discount) || 0)).toFixed(2));
  }
};
const onBatchDiscountChange = (v) => {
  const d = v === '' || v === null ? null : Number(v);
  batchForm.value.discount = d;
  if (batchForm.value.price !== null && d !== null) {
    batchForm.value.selling_price = Number((Number(batchForm.value.price) - d).toFixed(2));
  }
};
const onBatchSellingPriceChange = (v) => {
  const sp = v === '' || v === null ? null : Number(v);
  batchForm.value.selling_price = sp;
  if (batchForm.value.price !== null && sp !== null) {
    batchForm.value.discount = Number((Number(batchForm.value.price) - sp).toFixed(2));
  }
};

const openBatchEdit = () => {
  batchTab.value = 'price';
  batchForm.value = { price: null, discount: 0, selling_price: null, status: 'active', stock: -1 };
  batchEditDialog.value = true;
};

const saveBatchEdit = async () => {
  const fields = {};
  // Price tab: only include non-null values
  if (batchTab.value === 'price') {
    if (batchForm.value.price !== null && batchForm.value.price !== '') fields.price = batchForm.value.price;
    if (batchForm.value.discount !== null && batchForm.value.discount !== '') fields.discount = batchForm.value.discount;
    if (batchForm.value.selling_price !== null && batchForm.value.selling_price !== '') fields.selling_price = batchForm.value.selling_price;
  } else if (batchTab.value === 'status') {
    fields.status = batchForm.value.status;
  } else if (batchTab.value === 'stock') {
    fields.stock = batchForm.value.stock;
  }

  if (Object.keys(fields).length === 0) {
    $q.notify({ type: "warning", message: "No changes to apply." });
    return;
  }

  savingBatch.value = true;
  try {
    const ids = selected.value.map(r => r.id);
    await api.post('/api/products/bulk-update', { ids, fields });
    $q.notify({ type: "positive", message: `${ids.length} products updated.` });
    batchEditDialog.value = false;
    selected.value = [];
    refreshTable();
  } catch {
    $q.notify({ type: "negative", message: "Batch update failed." });
  } finally {
    savingBatch.value = false;
  }
};

// ─── Price Adjust ───
const priceAdjustDialog = ref(false);
const savingPriceAdjust = ref(false);
const adjustAllMode = ref(false);
const priceAdjustForm = ref({ type: 'amount', value: 0 });

const openPriceAdjust = (allMode) => {
  adjustAllMode.value = allMode;
  priceAdjustForm.value = { type: 'amount', value: 0 };
  priceAdjustDialog.value = true;
};

const savePriceAdjust = async () => {
  savingPriceAdjust.value = true;
  try {
    let ids;
    if (adjustAllMode.value) {
      // fetch all IDs via a large count request
      const res = await api.get(API_URL, { params: { start: 0, count: 99999, sortBy: 'id', descending: false } });
      ids = (res.data?.rows || []).map(r => r.id);
    } else {
      ids = selected.value.map(r => r.id);
    }
    await api.post('/api/products/adjust-price', { ids, type: priceAdjustForm.value.type, value: priceAdjustForm.value.value });
    $q.notify({ type: "positive", message: `${ids.length} products' prices adjusted.` });
    priceAdjustDialog.value = false;
    selected.value = [];
    refreshTable();
  } catch {
    $q.notify({ type: "negative", message: "Price adjustment failed." });
  } finally {
    savingPriceAdjust.value = false;
  }
};

// ─── Delete ───
const deleteRow = (id) => {
  $q.dialog({ title: "Confirm Delete", message: "Are you sure?", cancel: true, persistent: true })
    .onOk(() => {
      api.delete(`${API_URL}/${id}`)
        .then(() => {
          $q.notify({ type: "positive", message: "Deleted successfully." });
          refreshTable();
        })
        .catch(() => $q.notify({ type: "negative", message: "Failed to delete." }));
    });
};
</script>
