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
          {{ isEdit ? 'Edit Item' : 'Add New Item' }}
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="form.name"
            label="Item Name *"
            hint="Name of the product item"
            outlined
            :rules="[val => val && val.length > 0 || 'Name is required']"
          />

          <q-select
            v-model="form.type"
            :options="filteredTypeOptions"
            label="Type *"
            outlined
            clearable
            use-input
            new-value-mode="add-unique"
            @filter="filterTypeOptions"
            @new-value="createNewType"
            hint="Type of the product item (select from list or type to create new)"
            :loading="typesLoading"
            :rules="[val => val && val.length > 0 || 'Type is required']"
          />

          <q-input
            v-model="form.description"
            label="Description"
            type="textarea"
            rows="3"
            outlined
            hint="Description of the product item (optional)"
          />

          <q-input
            v-model="form.price"
            label="Price *"
            type="number"
            step="0.01"
            min="0"
            outlined
            prefix="$"
            hint="Price of the product item"
            :rules="[
              val => val !== null && val !== '' || 'Price is required',
              val => val >= 0 || 'Price cannot be negative'
            ]"
          />

          <q-input
            v-model="form.extra_price"
            label="Extra Price"
            type="number"
            step="0.01"
            min="0"
            outlined
            prefix="$"
            hint="Extra price if add this product item (optional)"
            :rules="[
              val => val === null || val === '' || val >= 0 || 'Extra price cannot be negative'
            ]"
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
  item: {
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
const typesLoading = ref(false)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const form = ref({
  name: '',
  type: '',
  description: '',
  price: 0,
  extra_price: null
})

const typeOptions = ref([])
const filteredTypeOptions = ref([])

// Fetch item types from API
const fetchItemTypes = async () => {
  try {
    typesLoading.value = true
    const response = await api.get('/api/get-item-type')

    // Handle API response format: {"success":true,"data":["type1","type2"],"message":"..."}
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      typeOptions.value = response.data.data
    } else {
      // Fallback if response format is unexpected
      typeOptions.value = []
    }

    filteredTypeOptions.value = [...typeOptions.value]
  } catch (error) {
    console.error('Error fetching item types:', error)
    // Fallback to default types if API fails
    typeOptions.value = [
      'addon',
      'sauce',
      'material',
      'ingredient',
      'taste',
      'spice',
      'seasoning',
      'topping'
    ]
    filteredTypeOptions.value = [...typeOptions.value]
  } finally {
    typesLoading.value = false
  }
}

// Filter type options based on user input
const filterTypeOptions = (val, update) => {
  update(() => {
    if (val === '') {
      filteredTypeOptions.value = [...typeOptions.value]
    } else {
      const needle = val.toLowerCase()
      filteredTypeOptions.value = typeOptions.value.filter(
        type => type.toLowerCase().indexOf(needle) > -1
      )
    }
  })
}

// Create new type when user types a new value
const createNewType = (val, done) => {
  if (val.length > 0) {
    const newType = val.toUpperCase().replace(/\s+/g, '_')
    if (!typeOptions.value.includes(newType)) {
      typeOptions.value.push(newType)
    }
    done(newType, 'add-unique')
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    type: '',
    description: '',
    price: 0,
    extra_price: null
  }
}

// Watch for item changes to populate form
watch(() => props.item, (newItem) => {
  if (newItem && Object.keys(newItem).length > 0) {
    form.value = {
      name: newItem.name || '',
      type: newItem.type || '',
      description: newItem.description || '',
      price: parseFloat(newItem.price) || 0,
      extra_price: newItem.extra_price ? parseFloat(newItem.extra_price) : null
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Watch for dialog visibility to reset form and fetch types when opening
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (!props.isEdit) {
      resetForm()
    }
    // Fetch item types when dialog opens
    fetchItemTypes()
  }
})

onMounted(() => {
  // Fetch item types on component mount
  fetchItemTypes()
})

const onSubmit = async () => {
  // Validate form
  if (!form.value.name || form.value.name.trim().length === 0) {
    $q.notify({
      type: 'negative',
      message: 'Item name is required'
    })
    return
  }

  if (!form.value.type || form.value.type.trim().length === 0) {
    $q.notify({
      type: 'negative',
      message: 'Item type is required'
    })
    return
  }

  if (form.value.price === null || form.value.price === '' || form.value.price < 0) {
    $q.notify({
      type: 'negative',
      message: 'Valid price is required'
    })
    return
  }

  loading.value = true

  try {
    const payload = {
      name: form.value.name.trim(),
      type: form.value.type.trim(),
      description: form.value.description ? form.value.description.trim() : null,
      price: parseFloat(form.value.price),
      extra_price: form.value.extra_price ? parseFloat(form.value.extra_price) : null
    }

    if (props.isEdit) {
      // Update existing item
      await api.put(`/api/items/${props.item.id}`, payload)
      $q.notify({
        type: 'positive',
        message: 'Item updated successfully'
      })
    } else {
      // Create new item
      await api.post('/api/items', payload)
      $q.notify({
        type: 'positive',
        message: 'Item created successfully'
      })
    }

    emit('success')
    dialogVisible.value = false
  } catch (error) {
    console.error('Error saving item:', error)
    $q.notify({
      type: 'negative',
      message: props.isEdit ? 'Failed to update item' : 'Failed to create item'
    })
  } finally {
    loading.value = false
  }
}

const onCancel = () => {
  dialogVisible.value = false
}
</script>
