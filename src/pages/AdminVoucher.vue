<template>
  <q-page>
    <q-card class="q-pa-sm">
      <q-table
        :rows="vouchers"
        :columns="columns"
        row-key="id"
        title="Vouchers"
        v-model:pagination="pagination"
        :loading="loading"
        :filter="filter"
        @request="onRequest"
        binary-state-sort
      >
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              <template v-if="col.name === 'is_active'">
                <q-chip :color="props.row.is_active ? 'green' : 'red'" outline>
                  {{ props.row.is_active ? "Active" : "Inactive" }}
                </q-chip>
              </template>
              <template
                v-else-if="
                  col.name === 'valid_from' || col.name === 'valid_until'
                "
              >
                {{
                  props.row[col.field]
                    ? new Date(props.row[col.field]).toLocaleDateString(
                        "en-AU",
                        { year: "numeric", month: "2-digit", day: "2-digit" }
                      )
                    : ""
                }}
              </template>
              <template v-else-if="col.format">
                {{ col.format(props.row[col.field]) }}
              </template>
              <template v-else-if="col.name === 'actions'">
                <q-btn
                  flat
                  round
                  icon="edit"
                  color="primary"
                  size="10px"
                  @click="openEditDialog(props.row)"
                />
                <q-btn
                  flat
                  round
                  icon="delete"
                  color="red-6"
                  size="10px"
                  @click="deleteVoucher(props.row.id)"
                />
              </template>
              <template v-else>
                {{ props.row[col.field] }}
              </template>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:top-right>
          <q-input
            outlined
            dense
            debounce="300"
            clearable
            rounded
            v-model="filter"
            placeholder="Search"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-btn
            flat
            icon="add_circle"
            color="accent"
            label="Voucher"
            @click="showAddDialog = true"
            class="q-mr-sm"
          />
        </template>
      </q-table>
      <q-dialog v-model="showAddDialog">
        <q-card style="min-width: 400px">
          <q-card-section>
            <div class="text-h6">Add Voucher</div>
          </q-card-section>
          <q-card-section>
            <q-tabs v-model="addMode" dense class="text-primary q-mb-md">
              <q-tab name="single" label="Single Create" />
              <q-tab name="bulk" label="Bulk Create" />
            </q-tabs>
            <q-tab-panels v-model="addMode" animated>
              <q-tab-panel name="single">
                <q-form @submit.prevent="submitAddVoucher">
                  <q-input
                    v-model="addForm.code"
                    label="Code (Leave blank to auto-generate)"
                    class="q-mb-sm"
                    @blur="verifyVouchers('single')"
                  />
                  <q-input
                    v-model.number="addForm.total_amount"
                    label="Total Amount"
                    type="number"
                    required
                    class="q-mb-sm"
                    @update:model-value="
                      (val) => {
                        if (!addForm.value._remaining_amount_touched)
                          addForm.value.remaining_amount = val;
                      }
                    "
                  />
                  <q-input
                    v-model.number="addForm.remaining_amount"
                    label="Balance"
                    type="number"
                    required
                    class="q-mb-sm"
                    @focus="addForm.value._remaining_amount_touched = true"
                  />
                  <q-input
                    v-model="addForm.notes"
                    label="Notes"
                    class="q-mb-sm"
                  />
                  <q-input
                    v-model="addForm.valid_from"
                    label="Valid From"
                    type="date"
                    class="q-mb-sm"
                  />
                  <div class="q-mb-sm">
                    <div class="q-mb-xs">Valid Until</div>
                    <div class="text-caption text-grey q-mb-xs">
                      * Default to be used indefinitely
                    </div>

                    <q-option-group
                      v-model="addForm.valid_until_option"
                      :options="[
                        { label: '1 month', value: '1m' },
                        { label: '3 months', value: '3m' },
                        { label: '6 months', value: '6m' },
                        { label: '12 months', value: '12m' },
                        { label: 'Custom', value: 'custom' },
                      ]"
                      type="radio"
                      inline
                    />
                    <q-input
                      v-if="addForm.valid_until_option === 'custom'"
                      v-model="addForm.valid_until"
                      label="Valid Until (Custom)"
                      type="date"
                      dense
                      class="q-mt-xs"
                    />
                  </div>
                  <q-toggle
                    v-model="addForm.is_active"
                    label="Active"
                    class="q-mb-sm"
                  />
                  <div class="row justify-end q-gutter-sm">
                    <q-btn flat label="Cancel" v-close-popup />
                    <q-btn
                      color="primary"
                      label="Add"
                      type="submit"
                      :loading="addLoading"
                    />
                  </div>
                </q-form>
              </q-tab-panel>
              <q-tab-panel name="bulk">
                <q-form @submit.prevent="submitBulkVoucher">
                  <q-input
                    dense
                    v-model="bulkForm.codes"
                    label="Codes(Leave blank to auto-generate)"
                    type="textarea"
                    placeholder="Enter multiple codes, separated by commas."
                    class="q-mb-sm"
                    @blur="verifyVouchers('bulk')"
                  />
                  <q-input
                    v-model.number="bulkForm.count"
                    label="Count"
                    type="number"
                    min="1"
                    required
                    class="q-mb-sm"
                  />
                  <q-input
                    v-model.number="bulkForm.total_amount"
                    label="Total Amount"
                    type="number"
                    required
                    class="q-mb-sm"
                    @update:model-value="
                      (val) => {
                        if (!bulkForm.value._remaining_amount_touched)
                          bulkForm.value.remaining_amount = val;
                      }
                    "
                  />
                  <q-input
                    v-model.number="bulkForm.remaining_amount"
                    label="Balance"
                    type="number"
                    required
                    class="q-mb-sm"
                    @focus="bulkForm.value._remaining_amount_touched = true"
                  />
                  <q-input
                    v-model="bulkForm.notes"
                    label="Notes"
                    class="q-mb-sm"
                  />
                  <q-input
                    v-model="bulkForm.valid_from"
                    label="Valid From"
                    type="date"
                    class="q-mb-sm"
                  />
                  <div class="q-mb-sm">
                    <div class="q-mb-xs">Valid Until</div>
                    <div class="text-caption text-grey q-mb-xs">
                      * Default to be used indefinitely
                    </div>
                    <q-option-group
                      v-model="bulkForm.valid_until_option"
                      :options="[
                        { label: '1 month', value: '1m' },
                        { label: '3 months', value: '3m' },
                        { label: '6 months', value: '6m' },
                        { label: '12 months', value: '12m' },
                        { label: 'Custom', value: 'custom' },
                      ]"
                      type="radio"
                      inline
                    />
                    <q-input
                      v-if="bulkForm.valid_until_option === 'custom'"
                      v-model="bulkForm.valid_until"
                      label="Valid Until (Custom)"
                      type="date"
                      dense
                      class="q-mt-xs"
                    />
                  </div>
                  <q-toggle
                    v-model="bulkForm.is_active"
                    label="Active"
                    class="q-mb-sm"
                  />
                  <div class="row justify-end q-gutter-sm">
                    <q-btn flat label="Cancel" v-close-popup />
                    <q-btn
                      color="primary"
                      label="Bulk Add"
                      type="submit"
                      :loading="addLoading"
                    />
                  </div>
                </q-form>
              </q-tab-panel>
            </q-tab-panels>
          </q-card-section>
        </q-card>
      </q-dialog>
      <q-dialog v-model="showEditDialog">
        <q-card style="min-width: 400px">
          <q-card-section>
            <div class="text-h6">Edit Voucher</div>
          </q-card-section>
          <q-card-section>
            <q-form @submit.prevent="submitEditVoucher">
              <q-input
                v-model="editForm.code"
                label="Code"
                class="q-mb-sm"
                readonly
              />
              <q-input
                v-model.number="editForm.total_amount"
                label="Total Amount"
                type="number"
                required
                class="q-mb-sm"
              />
              <q-input
                v-model.number="editForm.remaining_amount"
                label="Balance"
                type="number"
                required
                class="q-mb-sm"
              />
              <q-input v-model="editForm.notes" label="Notes" class="q-mb-sm" />
              <q-input
                v-model="editForm.valid_from"
                label="Valid From"
                type="date"
                class="q-mb-sm"
              />
              <div class="q-mb-sm">
                <div class="q-mb-xs">Valid Until</div>
                <div class="text-caption text-grey q-mb-xs">
                  * Default to be used indefinitely
                </div>
                <q-option-group
                  v-model="editForm.valid_until_option"
                  :options="[
                    { label: '1 month', value: '1m' },
                    { label: '3 months', value: '3m' },
                    { label: '6 months', value: '6m' },
                    { label: '12 months', value: '12m' },
                    { label: 'Custom', value: 'custom' },
                  ]"
                  type="radio"
                  inline
                />
                <q-input
                  v-if="editForm.valid_until_option === 'custom'"
                  v-model="editForm.valid_until"
                  label="Valid Until (Custom)"
                  type="date"
                  dense
                  class="q-mt-xs"
                />
              </div>
              <q-toggle
                v-model="editForm.is_active"
                label="Active"
                class="q-mb-sm"
              />
              <div class="row justify-end q-gutter-sm">
                <q-btn
                  flat
                  label="Cancel"
                  v-close-popup
                  @click="showEditDialog = false"
                />
                <q-btn
                  color="primary"
                  label="Update"
                  type="submit"
                  :loading="editLoading"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";

const router = useRouter();
const $q = useQuasar();
const vouchers = ref([]);
const filter = ref("");
const loading = ref(false);
const pagination = ref({
  sortBy: "id",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

const columns = [
  { name: "id", required: true, label: "ID", align: "left", field: "id" },
  { name: "code", label: "Code", align: "left", field: "code" },
  {
    name: "total_amount",
    label: "Total Amount",
    align: "center",
    field: "total_amount",
    format: (val) => `$${val}`,
  },
  {
    name: "remaining_amount",
    label: "Balance",
    align: "center",
    field: "remaining_amount",
    format: (val) => `$${val}`,
  },
  { name: "notes", label: "Notes", align: "left", field: "notes" },
  {
    name: "valid_from",
    label: "Valid From",
    align: "center",
    field: "valid_from",
  },
  {
    name: "valid_until",
    label: "Valid Until",
    align: "center",
    field: "valid_until",
  },
  { name: "is_active", label: "Active", align: "center", field: "is_active" },
  { name: "actions", label: "Actions", align: "center", field: "actions" },
];

const fetchVouchers = async (startRow, count, filter, sortBy, descending) => {
  try {
    loading.value = true;
    const response = await api.get("/api/vouchers", {
      params: {
        start: startRow,
        count,
        filter,
        sortBy,
        descending,
      },
    });
    if (response.data && Array.isArray(response.data.rows)) {
      vouchers.value = response.data.rows;
      pagination.value.rowsNumber = response.data.total || 0;
    } else {
      vouchers.value = [];
      pagination.value.rowsNumber = 0;
    }
  } catch (error) {
    vouchers.value = [];
    pagination.value.rowsNumber = 0;
  } finally {
    loading.value = false;
  }
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  const filterValue = props.filter;
  const startRow = (page - 1) * rowsPerPage;
  const count = rowsPerPage === 0 ? pagination.value.rowsNumber : rowsPerPage;
  fetchVouchers(startRow, count, filterValue, sortBy, descending);
};

onMounted(() => {
  onRequest({
    pagination: pagination.value,
    filter: undefined,
  });
});

const today = new Date().toISOString().slice(0, 10);
const showAddDialog = ref(false);
const addMode = ref("single");
const addLoading = ref(false);
const addForm = ref({
  code: "",
  total_amount: null,
  remaining_amount: null,
  notes: "",
  valid_from: today,
  valid_until: "",
  is_active: true,
  valid_until_option: "",
  _remaining_amount_touched: false, // 内部标记
});
const bulkForm = ref({
  codes: "",
  count: 10,
  total_amount: null,
  remaining_amount: null,
  notes: "",
  valid_from: today,
  valid_until: "",
  is_active: true,
  valid_until_option: "",
  _remaining_amount_touched: false, // 内部标记
});
const importLoading = ref(false);
const showEditDialog = ref(false);
const editLoading = ref(false);
const editForm = ref({
  id: null,
  code: "",
  total_amount: null,
  remaining_amount: null,
  notes: "",
  valid_from: "",
  valid_until: "",
  is_active: true,
  valid_until_option: "",
});

const submitAddVoucher = async () => {
  addLoading.value = true;
  try {
    const payload = { ...addForm.value };
    delete payload.valid_until_option;
    delete payload._remaining_amount_touched;
    await api.post("/api/vouchers", payload);
    $q.notify({ type: "positive", message: "新增成功" });
    showAddDialog.value = false;
    addForm.value = {
      code: "",
      total_amount: null,
      remaining_amount: null,
      notes: "",
      valid_from: today,
      valid_until: "",
      is_active: true,
      valid_until_option: "",
      _remaining_amount_touched: false,
    };
    onRequest({ pagination: pagination.value, filter: filter.value });
  } catch (e) {
    $q.notify({ type: "negative", message: "新增失敗" });
  } finally {
    addLoading.value = false;
  }
};

const submitBulkVoucher = async () => {
  addLoading.value = true;
  try {
    const payload = { ...bulkForm.value };
    delete payload.valid_until_option;
    delete payload._remaining_amount_touched;
    await api.post("/api/vouchers/bulk", payload);
    $q.notify({ type: "positive", message: "批量新增成功" });
    showAddDialog.value = false;
    bulkForm.value = {
      count: 10,
      prefix: "",
      total_amount: null,
      remaining_amount: null,
      notes: "",
      valid_from: today,
      valid_until: "",
      is_active: true,
      valid_until_option: "",
      _remaining_amount_touched: false,
    };
    onRequest({ pagination: pagination.value, filter: filter.value });
  } catch (e) {
    $q.notify({ type: "negative", message: "批量新增失敗" });
  } finally {
    addLoading.value = false;
  }
};

watch(
  () => bulkForm.value.codes,
  (val) => {
    if (val && val.trim()) {
      const codes = val
        .split(/[\s,]+/)
        .map((code) => code.trim())
        .filter((code) => code.length > 0);
      bulkForm.value.count = codes.length;
    }
  }
);

watch(
  () => addForm.value.valid_until_option,
  (val) => {
    if (val === "1m")
      addForm.value.valid_until = addMonths(addForm.value.valid_from, 1);
    else if (val === "3m")
      addForm.value.valid_until = addMonths(addForm.value.valid_from, 3);
    else if (val === "6m")
      addForm.value.valid_until = addMonths(addForm.value.valid_from, 6);
    else if (val === "12m")
      addForm.value.valid_until = addMonths(addForm.value.valid_from, 12);
    else if (val !== "custom") addForm.value.valid_until = "";
  }
);

watch(
  () => bulkForm.value.valid_until_option,
  (val) => {
    if (val === "1m")
      bulkForm.value.valid_until = addMonths(bulkForm.value.valid_from, 1);
    else if (val === "3m")
      bulkForm.value.valid_until = addMonths(bulkForm.value.valid_from, 3);
    else if (val === "6m")
      bulkForm.value.valid_until = addMonths(bulkForm.value.valid_from, 6);
    else if (val === "12m")
      bulkForm.value.valid_until = addMonths(bulkForm.value.valid_from, 12);
    else if (val !== "custom") bulkForm.value.valid_until = "";
  }
);

watch(
  () => addForm.value.total_amount,
  (val) => {
    if (!addForm.value._remaining_amount_touched)
      addForm.value.remaining_amount = val;
  }
);
watch(
  () => bulkForm.value.total_amount,
  (val) => {
    if (!bulkForm.value._remaining_amount_touched)
      bulkForm.value.remaining_amount = val;
  }
);

const verifyVouchers = async (mode = "bulk") => {
  if (mode === "single") {
    if (!addForm.value.code || !addForm.value.code.trim()) {
      $q.notify({ type: "warning", message: "Please input the code" });
      return false;
    }
    const codes = [addForm.value.code.trim()];
    importLoading.value = true;
    try {
      const response = await api.post("/api/vouchers/verifyValidCode", {
        vouchers: codes,
      });
      if (response.data.status !== "success") {
        $q.notify({ type: "negative", message: response.data.message });
        return false;
      }
      $q.notify({ type: "positive", message: "Valid vourcher code" });
      return true;
    } catch (e) {
      $q.notify({ type: "negative", message: "Fail" });
      return false;
    } finally {
      importLoading.value = false;
    }
  } else {
    if (!bulkForm.value.codes.trim()) {
      $q.notify({ type: "warning", message: "Please input the code" });
      return;
    }
    const codes = bulkForm.value.codes
      .split(/[\s,]+/)
      .map((code) => code.trim())
      .filter((code) => code.length > 0);
    if (codes.length === 0) {
      $q.notify({ type: "warning", message: "No valid codes detected" });
      return;
    }
    importLoading.value = true;
    try {
      const response = await api.post("/api/vouchers/verifyValidCode", {
        vouchers: codes,
      });
      if (response.data.status !== "success") {
        $q.notify({ type: "negative", message: response.data.message });
        return;
      }
      bulkForm.value.codes = codes.join(",");
      console.log("Verified codes:", bulkForm.value.codes);
      $q.notify({ type: "positive", message: "Valid vourcher code" });
    } catch (e) {
      $q.notify({ type: "negative", message: "Fail" });
    } finally {
      importLoading.value = false;
    }
  }
};

function addMonths(dateStr, months) {
  const date = new Date(dateStr);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

function openEditDialog(row) {
  editForm.value = {
    id: row.id,
    code: row.code,
    total_amount: row.total_amount,
    remaining_amount: row.remaining_amount,
    notes: row.notes,
    valid_from: row.valid_from ? row.valid_from.slice(0, 10) : today,
    valid_until: row.valid_until ? row.valid_until.slice(0, 10) : "",
    is_active: Boolean(row.is_active),
    valid_until_option: getValidUntilOption(row),
  };
  showEditDialog.value = true;
}

function getValidUntilOption(row) {
  if (!row.valid_until) return "";
  const from = row.valid_from ? new Date(row.valid_from) : new Date();
  const until = new Date(row.valid_until);
  const diffMonths =
    (until.getFullYear() - from.getFullYear()) * 12 +
    (until.getMonth() - from.getMonth());
  if (diffMonths === 1) return "1m";
  if (diffMonths === 3) return "3m";
  if (diffMonths === 6) return "6m";
  if (diffMonths === 12) return "12m";
  return "custom";
}

watch(
  () => editForm.value.valid_until_option,
  (val) => {
    if (val === "1m")
      editForm.value.valid_until = addMonths(editForm.value.valid_from, 1);
    else if (val === "3m")
      editForm.value.valid_until = addMonths(editForm.value.valid_from, 3);
    else if (val === "6m")
      editForm.value.valid_until = addMonths(editForm.value.valid_from, 6);
    else if (val === "12m")
      editForm.value.valid_until = addMonths(editForm.value.valid_from, 12);
    else if (val !== "custom") editForm.value.valid_until = "";
  }
);

const submitEditVoucher = async () => {
  editLoading.value = true;
  try {
    const payload = { ...editForm.value };
    if (!payload.valid_until) delete payload.valid_until;
    delete payload.valid_until_option;
    await api.put(`/api/vouchers/${payload.id}`, payload);
    $q.notify({ type: "positive", message: "更新成功" });
    showEditDialog.value = false;
    onRequest({ pagination: pagination.value, filter: filter.value });
  } catch (e) {
    $q.notify({ type: "negative", message: "更新失敗" });
  } finally {
    editLoading.value = false;
  }
};

const deleteVoucher = async (id) => {
  $q.dialog({
    title: "Confirm",
    message: "Are you sure you want to delete this voucher?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.delete(`/api/vouchers/${id}`);
      $q.notify({ type: "positive", message: "刪除成功" });
      onRequest({ pagination: pagination.value, filter: filter.value });
    } catch (e) {
      $q.notify({ type: "negative", message: "刪除失敗" });
    }
  });
};
</script>
