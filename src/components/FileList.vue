<script setup lang="ts">
import type { DriveFile } from '../types/drive'

defineProps<{ items: DriveFile[]; loading: boolean }>()
const emit = defineEmits<{ select: [file: DriveFile] }>()

const FOLDER_MIME = 'application/vnd.google-apps.folder'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

function isFolder(file: DriveFile) { return file.mimeType === FOLDER_MIME }
function isImage(file: DriveFile) { return file.mimeType.startsWith('image/') }
</script>

<template>
  <div class="flex-1 overflow-y-auto">
    <!-- skeleton -->
    <ul v-if="loading" class="divide-y divide-slate-700/50">
      <li v-for="i in 16" :key="i" class="flex items-center gap-3 px-4 py-3 animate-pulse">
        <div class="w-5 h-5 rounded bg-slate-700 shrink-0" />
        <div class="h-3 bg-slate-700 rounded flex-1 max-w-[60%]" />
        <div class="h-3 bg-slate-700/60 rounded w-24 hidden sm:block" />
      </li>
    </ul>

    <!-- empty state -->
    <div v-else-if="items.length === 0" class="flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
      <svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
      </svg>
      <p class="text-sm">This folder is empty</p>
    </div>

    <!-- list -->
    <ul v-else class="divide-y divide-slate-700/40">
      <li
        v-for="file in items"
        :key="file.id"
        class="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700/40 cursor-pointer transition-colors group"
        @click="emit('select', file)"
      >
        <!-- icon -->
        <div class="shrink-0 w-5 h-5 flex items-center justify-center">
          <!-- folder -->
          <svg v-if="isFolder(file)" class="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z"/>
          </svg>
          <!-- image -->
          <svg v-else-if="isImage(file)" class="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
          </svg>
          <!-- generic file -->
          <svg v-else class="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z"/>
            <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z"/>
          </svg>
        </div>

        <!-- name -->
        <span class="flex-1 text-sm text-slate-200 group-hover:text-white truncate">{{ file.name }}</span>

        <!-- date -->
        <span class="text-xs text-slate-500 shrink-0 hidden sm:block tabular-nums">{{ formatDate(file.modifiedTime) }}</span>
      </li>
    </ul>
  </div>
</template>
