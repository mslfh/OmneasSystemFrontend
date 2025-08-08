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
            :options="typeOptions"
            label="Type *"
            outlined
            hint="Type of the product item"
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
import { ref, computed, watch } from 'vue'
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

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const form = ref({
  name: '',
  type: '',
  description: '',
  price: 0
})

const typeOptions = [
  'addon',
  'sauce',
  'material',
  'ingredient',
  'taste',
  'spice',
  'seasoning',
  'topping'
]

const resetForm = () => {
  form.value = {
    name: '',
    type: '',
    description: '',
    price: 0
  }
}

// Watch for item changes to populate form
watch(() => props.item, (newItem) => {
  if (newItem && Object.keys(newItem).length > 0) {
    form.value = {
      name: newItem.name || '',
      type: newItem.type || '',
      description: newItem.description || '',
      price: parseFloat(newItem.price) || 0
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Watch for dialog visibility to reset form when opening for new item
watch(() => props.modelValue, (newVal) => {
  if (newVal && !props.isEdit) {
    resetForm()
  }
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
      price: parseFloat(form.value.price)
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
