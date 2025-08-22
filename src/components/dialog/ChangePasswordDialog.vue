<template>
  <q-dialog
    v-model="dialogVisible"
    persistent
    transition-show="scale"
    transition-hide="scale"
    @hide="onClose"
  >
    <q-card style="min-width: 400px">
      <q-card-section horizontal class="q-ma-sm">
        <div class="text-h6">Change Password</div>
        <q-space />
        <q-btn
          size="sm"
          flat
          icon="close"
          color="grey"
          @click="onClose"
        />
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" ref="formRef">
          <q-input
            v-model="form.currentPassword"
            label="Current Password"
            type="text"
            outlined
            dense
            class="q-mb-md"
            :rules="[val => !!val || 'Current password is required']"
            @keyup.enter="onSubmit"
          />

          <q-input
            v-model="form.newPassword"
            label="New Password"
            type="text"
            outlined
            dense
            class="q-mb-md"
            :rules="[
              val => !!val || 'New password is required',
              val => val.length >= 6 || 'Password must be at least 6 characters'
            ]"
            @keyup.enter="onSubmit"
          />

          <q-input
            v-model="form.confirmPassword"
            label="Confirm New Password"
            type="password"
            outlined
            dense
            class="q-mb-md"
            :rules="[
              val => !!val || 'Please confirm your password',
              val => val === form.newPassword || 'Passwords do not match'
            ]"
            @keyup.enter="onSubmit"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          label="Cancel"
          color="grey"
          @click="onClose"
        />
        <q-btn
          unelevated
          label="Change Password"
          color="primary"
          :loading="loading"
          @click="onSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { api } from '../../boot/axios'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const $q = useQuasar()
const dialogVisible = ref(props.modelValue)
const loading = ref(false)
const formRef = ref(null)

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  dialogVisible.value = newValue
})

// Watch for dialog visibility changes
watch(dialogVisible, (newValue) => {
  emit('update:modelValue', newValue)
})

function onClose() {
  dialogVisible.value = false
  resetForm()
}

function resetForm() {
  form.currentPassword = ''
  form.newPassword = ''
  form.confirmPassword = ''
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

async function onSubmit() {
  if (!formRef.value) return

  // Validate form
  const valid = await formRef.value.validate()
  if (!valid) return

  loading.value = true

  try {
    const response = await api.post('/api/user/change-password', {
      current_password: form.currentPassword,
      new_password: form.newPassword,
    })

    $q.notify({
      type: 'positive',
      message: 'Password changed successfully',
      position: 'top'
    })

    emit('success')
    onClose()
  } catch (error) {
    console.error('Change password error:', error)

    let errorMessage = 'Failed to change password'
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}
</script>
