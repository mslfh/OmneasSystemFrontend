<template>
  <q-dialog
    v-model="dialogVisible"
    transition-show="scale"
    transition-hide="scale"
    @hide="emit('close')"
    persistent
  >
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">
          {{ isEdit ? 'Edit Category' : 'Add New Category' }}
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="form.title"
            label="Category Title *"
            hint="The name of the category"
            outlined
            :rules="[val => val && val.length > 0 || 'Title is required']"
          />

          <q-input
            v-model="form.hint"
            label="Hint"
            hint="A brief description of the category"
            outlined
            type="textarea"
            rows="3"
          />

          <q-select
            v-model="form.parent_id"
            :options="parentOptions"
            label="Parent Category"
            outlined
            clearable
            option-value="id"
            option-label="title"
            hint="Select parent category (leave empty for top-level category)"
            :loading="parentLoading"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.title }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.hint || 'No description' }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-select
            v-model="form.status"
            :options="statusOptions"
            label="Status *"
            outlined
            option-value="value"
            option-label="label"
            :rules="[val => val || 'Status is required']"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="grey" @click="onCancel" />
        <q-btn
          unelevated
          :label="isEdit ? 'Update' : 'Create'"
          color="primary"
          @click="onSubmit"
          :loading="loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  category: {
    type: Object,
    default: () => ({})
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'close', 'success'])

const $q = useQuasar()
const loading = ref(false)
const parentLoading = ref(false)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const form = ref({
  title: '',
  hint: '',
  parent_id: null,
  status: 'active'
})

const parentOptions = ref([])
const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
]

// Fetch active categories for parent selection
const fetchActiveCategories = async () => {
  try {
    parentLoading.value = true
    const response = await api.get('/api/categories/active')

    // Filter out current category when editing to prevent circular reference
    let categories = response.data.data || []
    if (props.isEdit && props.category.id) {
      categories = categories.filter(cat => cat.id !== props.category.id)
    }

    parentOptions.value = categories

    // If editing and has parent_id, set the correct parent object in form
    if (props.isEdit && props.category.parent_id) {
      const parentCategory = categories.find(cat => cat.id === props.category.parent_id)
      if (parentCategory) {
        form.value.parent_id = parentCategory
      }
    }

    // If editing, also ensure status is set to correct option object
    if (props.isEdit && props.category.status) {
      const statusOption = statusOptions.find(opt => opt.value === props.category.status)
      if (statusOption) {
        form.value.status = statusOption
      }
    }
  } catch (error) {
    console.error('Error fetching active categories:', error)
    parentOptions.value = []
    $q.notify({
      type: 'negative',
      message: 'Failed to load parent categories'
    })
  } finally {
    parentLoading.value = false
  }
}

const resetForm = () => {
  form.value = {
    title: '',
    hint: '',
    parent_id: null,
    status: statusOptions[0] // Set to Active option object
  }
}

// Watch for category changes to populate form
watch(() => props.category, (newCategory) => {
  if (newCategory && Object.keys(newCategory).length > 0) {
    // Find the status option object
    const statusOption = statusOptions.find(opt => opt.value === (newCategory.status || 'active'))

    form.value = {
      title: newCategory.title || '',
      hint: newCategory.hint || '',
      parent_id: newCategory.parent_id || null,
      status: statusOption || statusOptions[0] // Default to first option (Active)
    }
    // After parent options are loaded, set the correct parent object
    if (newCategory.parent_id && parentOptions.value.length > 0) {
      const parentCategory = parentOptions.value.find(cat => cat.id === newCategory.parent_id)
      if (parentCategory) {
        form.value.parent_id = parentCategory
      }
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Watch for dialog visibility to reset form and fetch parent categories when opening
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (!props.isEdit) {
      resetForm()
    }
    // Fetch active categories when dialog opens
    fetchActiveCategories()
  }
})

onMounted(() => {
  // Fetch active categories on component mount
  fetchActiveCategories()
})

const onSubmit = async () => {
  // Validate form
  if (!form.value.title || form.value.title.trim().length === 0) {
    $q.notify({
      type: 'negative',
      message: 'Category title is required'
    })
    return
  }

  if (!form.value.status) {
    $q.notify({
      type: 'negative',
      message: 'Status is required'
    })
    return
  }

  loading.value = true

  try {
    const payload = {
      title: form.value.title.trim(),
      hint: form.value.hint?.trim() || null,
      parent_id: form.value.parent_id?.id || form.value.parent_id || null,
      status: form.value.status?.value || form.value.status
    }

    if (props.isEdit) {
      // Update existing category
      await api.put(`/api/categories/${props.category.id}`, payload)
      $q.notify({
        type: 'positive',
        message: 'Category updated successfully'
      })
    } else {
      // Create new category
      await api.post('/api/categories', payload)
      $q.notify({
        type: 'positive',
        message: 'Category created successfully'
      })
    }

    emit('success')
    dialogVisible.value = false
  } catch (error) {
    console.error('Error saving category:', error)
    const errorMessage = error.response?.data?.message ||
      (props.isEdit ? 'Failed to update category' : 'Failed to create category')
    $q.notify({
      type: 'negative',
      message: errorMessage
    })
  } finally {
    loading.value = false
  }
}

const onCancel = () => {
  dialogVisible.value = false
}
</script>
