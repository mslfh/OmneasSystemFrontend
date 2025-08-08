<template>
  <q-dialog
    v-model="dialogVisible"
    transition-show="scale"
    transition-hide="scale"
    @hide="emit('close')"
    persistent
  >
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">
          {{ isEdit ? 'Edit Attribute' : 'Add New Attribute' }}
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="form.name"
            label="Attribute Name *"
            hint="e.g., only meats, extra source, etc."
            outlined
            :rules="[val => val && val.length > 0 || 'Name is required']"
          />

          <q-select
            v-model="form.type"
            :options="typeOptions"
            label="Type"
            outlined
            clearable
            hint="Type of the product attribute"
          />

          <q-input
            v-model="form.extra_cost"
            label="Extra Cost"
            type="number"
            step="0.01"
            min="0"
            outlined
            prefix="$"
            hint="Additional cost for this attribute"
            :rules="[val => val >= 0 || 'Extra cost cannot be negative']"
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
  attribute: {
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
  extra_cost: 0
})

const typeOptions = [
  'material',
  'sweetness',
  'spice_level',
  'texture',
  'temperature',
  'cooking_method'
]

const resetForm = () => {
  form.value = {
    name: '',
    type: '',
    extra_cost: 0
  }
}

// Watch for attribute changes to populate form
watch(() => props.attribute, (newAttribute) => {
  if (newAttribute && Object.keys(newAttribute).length > 0) {
    form.value = {
      name: newAttribute.name || '',
      type: newAttribute.type || '',
      extra_cost: parseFloat(newAttribute.extra_cost) || 0
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Watch for dialog visibility to reset form when opening for new attribute
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
      message: 'Attribute name is required'
    })
    return
  }

  if (form.value.extra_cost < 0) {
    $q.notify({
      type: 'negative',
      message: 'Extra cost cannot be negative'
    })
    return
  }

  loading.value = true

  try {
    const payload = {
      name: form.value.name.trim(),
      type: form.value.type || null,
      extra_cost: parseFloat(form.value.extra_cost) || 0
    }

    if (props.isEdit) {
      // Update existing attribute
      await api.put(`/api/attributes/${props.attribute.id}`, payload)
      $q.notify({
        type: 'positive',
        message: 'Attribute updated successfully'
      })
    } else {
      // Create new attribute
      await api.post('/api/attributes', payload)
      $q.notify({
        type: 'positive',
        message: 'Attribute created successfully'
      })
    }

    emit('success')
    dialogVisible.value = false
  } catch (error) {
    console.error('Error saving attribute:', error)
    $q.notify({
      type: 'negative',
      message: props.isEdit ? 'Failed to update attribute' : 'Failed to create attribute'
    })
  } finally {
    loading.value = false
  }
}

const onCancel = () => {
  dialogVisible.value = false
}
</script>
