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
            :options="filteredTypeOptions"
            label="Type"
            outlined
            clearable
            use-input
            new-value-mode="add-unique"
            @filter="filterTypeOptions"
            @new-value="createNewType"
            @input-value="onTypeInput"
            hint="Type of the product attribute (select from list or type to create new)"
            :loading="typesLoading"
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
import { ref, computed, watch, onMounted } from 'vue'
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
const typesLoading = ref(false)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const form = ref({
  name: '',
  type: '',
  extra_cost: 0
})

const typeOptions = ref([])
const filteredTypeOptions = ref([])

// Fetch attribute types from API
const fetchAttributeTypes = async () => {
  try {
    typesLoading.value = true
    const response = await api.get('/api/get-attribute-type')

    // Handle API response format: {"success":true,"data":["EXTRA","CHILLI","NO","ONLY"],"message":"..."}
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      typeOptions.value = response.data.data
    } else {
      // Fallback if response format is unexpected
      typeOptions.value = []
    }

    filteredTypeOptions.value = [...typeOptions.value]
  } catch (error) {
    console.error('Error fetching attribute types:', error)
    // Fallback to default types if API fails
    typeOptions.value = [
      'material',
      'sweetness',
      'spice_level',
      'texture',
      'temperature',
      'cooking_method'
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

// Handle input value change to convert to uppercase
const onTypeInput = (val) => {
  // This will be called when user types in the select input
  // We don't need to do anything here as the createNewType handles the conversion
}

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

// Watch for dialog visibility to reset form and fetch types when opening
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (!props.isEdit) {
      resetForm()
    }
    // Fetch attribute types when dialog opens
    fetchAttributeTypes()
  }
})

onMounted(() => {
  // Fetch attribute types on component mount
  fetchAttributeTypes()
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
