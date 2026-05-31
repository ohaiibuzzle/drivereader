<script setup lang="ts">
import type { DriveFile } from '../types/drive'
import DriveItem from './DriveItem.vue'

defineProps<{ items: DriveFile[]; loading: boolean }>()
const emit = defineEmits<{ select: [file: DriveFile] }>()
</script>

<template>
  <div class="flex-1 overflow-y-auto p-4">
    <!-- skeleton -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      <div
        v-for="i in 12"
        :key="i"
        class="rounded-xl bg-slate-700/50 animate-pulse"
      >
        <div class="aspect-[4/3] rounded-t-xl bg-slate-700" />
        <div class="p-3 space-y-2">
          <div class="h-3 bg-slate-600 rounded w-3/4" />
          <div class="h-2 bg-slate-700 rounded w-1/2" />
        </div>
      </div>
    </div>

    <!-- empty state -->
    <div v-else-if="items.length === 0" class="flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
      <svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
      </svg>
      <p class="text-sm">This folder is empty</p>
    </div>

    <!-- grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      <DriveItem
        v-for="file in items"
        :key="file.id"
        :file="file"
        @click="emit('select', file)"
      />
    </div>
  </div>
</template>
