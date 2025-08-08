<template>
  <q-dialog
    v-model="attachmentDialog"
    transition-show="scale"
    transition-hide="scale"
    @hide="emit('close')"
  >
    <q-card class="q-pa-md" style="width: 100%">
      <q-table
        title="Profile Attachment"
        :rows="attachment"
        :columns="[
          {
            name: 'file',
            label: 'Attachment',
            field: 'file',
            align: 'center',
          },
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
          <q-btn
            v-show="file"
            flat
            label="Upload"
            color="positive"
            @click="saveAttachment"
          />
        </template>
        <template v-slot:body-cell-file="props">
          <q-img
            class="q-ma-md"
            :src="props.row"
            :ratio="1"
            style="width: 350px"
          />
          <div class="row">
            <AttachmentViewer :attachments="[props.row]" />
            <q-btn
              v-if="props.row"
              size="10px"
              icon="delete"
              color="red-5"
              flat
              @click="deleteAttachment(props.row)"
            />
          </div>
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
   emit("update");
  // } catch (error) {
  //   $q.notify({
  //     type: "negative",
  //     message: "Failed to upload file.",
  //   });
  // }
}
async function deleteAttachment(attachment) {
  if (!attachment) {
    $q.notify({
      type: "negative",
      message: "No attachment selected.",
    });
    return;
  }
  // attachment is like "http://localhost:8000/storage/profileAttachments/lH3u15ppdCIm9QdaTDKWsFqKKV0x9rzBV0EeQRLR.jpg"
  // 需要从 URL 中提取文件路径
  // 例如：从 "http://localhost:8000/storage/profileAttachments/lH3u15ppdCIm9QdaTDKWsFqKKV0x9rzBV0EeQRLR.jpg" 提取 "profileAttachments/lH3u15ppdCIm9QdaTDKWsFqKKV0x9rzBV0EeQRLR.jpg"
  const filePath = attachment.split("/storage/")[1];
  if (!filePath) {
    $q.notify({
      type: "negative",
      message: "Invalid attachment path.",
    });
    return;
  }
  // 确认删除，可以使用 $q.dialog
  await $q
    .dialog({
      title: "Confirm Delete",
      message: "Are you sure you want to delete this attachment?",
      cancel: true,
      persistent: true,
    })
    .onOk(async () => {
      try {
        await api.delete(`/api/delete-attachment/${props.profile.id}`, {
          data: { file_path: filePath },
        });
        $q.notify({
          type: "positive",
          message: "Attachment deleted successfully.",
        });
        emit("update");
      } catch (error) {
        $q.notify({
          type: "negative",
          message: "Failed to delete attachment.",
        });
      }
    });
}
</script>
