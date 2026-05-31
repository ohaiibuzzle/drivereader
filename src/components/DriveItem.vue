<script setup lang="ts">
import type { DriveFile } from '../types/drive'

const props = defineProps<{ file: DriveFile }>()
const emit = defineEmits<{ click: [] }>()

const FOLDER_MIME = 'application/vnd.google-apps.folder'
const isFolder = props.file.mimeType === FOLDER_MIME

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <button
    class="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-700/60 transition-colors text-left w-full"
    @click="emit('click')"
  >
    <!-- thumbnail or icon -->
    <div class="w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-700 flex items-center justify-center">
      <img
        v-if="!isFolder && file.thumbnailLink"
        :src="file.thumbnailLink"
        :alt="file.name"
        class="w-full h-full object-cover"
        loading="lazy"
      />
      <!-- folder icon -->
      <svg v-else-if="isFolder" class="w-12 h-12 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z"/>
      </svg>
      <!-- generic file icon -->
      <svg v-else class="w-10 h-10 text-slate-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z"/>
        <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z"/>
      </svg>
    </div>

    <div class="w-full">
      <p class="text-slate-200 text-sm font-medium truncate group-hover:text-white">{{ file.name }}</p>
      <p class="text-slate-500 text-xs mt-0.5">{{ formatDate(file.modifiedTime) }}</p>
    </div>
  </button>
</template>
