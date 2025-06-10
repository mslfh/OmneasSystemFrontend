<template>
  <q-dialog
    v-model="attachmentDialog"
    transition-show="scale"
    transition-hide="scale"
    @hide="emit('close')"
  >
    <q-card class="q-pa-md" style=" width: 100%;">
      <q-table
        title="Profile Attachment"
        :rows="attachment"
        :columns="[
          {
            name: 'file',
            label: 'Attachment',
            field: 'file',
            align: 'center',
          }
        ]"
      >
        <template v-slot:top-right>
          <q-file
            v-model="file"
            dense
            use-chips
            accept=".jpg,.jpeg,.png,image/*"
            label-slot
          >
            <template v-slot:prepend>
              <q-icon size="xs" name="cloud_upload" />
            </template>
            <template v-slot:label>
              <span class="text-caption">Upload</span>
            </template>
          </q-file>
            <q-btn v-show="file" flat label="Upload" color="positive" @click="saveAttachment" />
        </template>
        <template v-slot:body-cell-file="props">
          <q-img
            class="q-ma-md"
            :src="props.row"
            :ratio="1"
            style="width: 350px"
          />
            <AttachmentViewer :attachments="[props.row]" />
        </template>
      </q-table>
      <q-card-actions align="right">
        <q-btn flat label="Back" color="blue" @click="emit('close')" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted, defineEmits } from "vue";
import { useQuasar } from "quasar";
import { api } from "boot/axios";
import AttachmentViewer from "../AttachmentViewer.vue";

const props = defineProps({
  profile: {
    type: Object,
    required: true,
  },
});

const $q = useQuasar();

const attachment = ref([]);
const file = ref(null);
const attachmentDialog = ref(true);

const emit = defineEmits(["close"]);

onMounted(() => {
  attachment.value = props.profile.medical_attachment_path || [];
});

async function saveAttachment() {
  if (!file.value) {
    $q.notify({
      type: "negative",
      message: "Please select a file to upload.",
    });
    return;
  }

  const formData = new FormData();
  formData.append("file", file.value);

  // try {
    const response = await api.post(
      `/api/upload-attachment/${props.profile.id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    attachment.value.push(response.data.file_path);
    file.value = null;
    $q.notify({
      type: "positive",
      message: "File uploaded successfully.",
    });
  // } catch (error) {
  //   $q.notify({
  //     type: "negative",
  //     message: "Failed to upload file.",
  //   });
  // }
}
</script>
