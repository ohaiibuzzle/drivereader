<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { BreadcrumbEntry } from '../types/drive'

const props = defineProps<{ breadcrumbs: BreadcrumbEntry[] }>()

const emit = defineEmits<{
  'breadcrumb-click': [index: number]
  'open-link': []
  'open-reader': []
}>()

const router = useRouter()
</script>

<template>
  <header class="flex flex-col bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shrink-0">
    <!-- top bar -->
    <div class="flex items-center justify-between px-4 py-3 gap-3">
      <button class="flex items-center gap-2 hover:opacity-80 transition-opacity" @click="router.push({ name: 'home' })">
        <svg class="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
        <span class="text-slate-900 dark:text-white font-semibold text-sm">DriveReader</span>
      </button>

      <div class="flex items-center gap-3">
        <button
          v-if="breadcrumbs.length > 0"
          class="flex items-center gap-1.5 text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 text-sm font-medium transition-colors"
          title="Open current folder in reader"
          @click="emit('open-reader')"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
          </svg>
          <span class="hidden sm:inline">Open reader</span>
        </button>

        <button
          class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm transition-colors"
          title="Open from Google Drive link"
          @click="emit('open-link')"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/>
          </svg>
          <span class="hidden sm:inline">Open link</span>
        </button>
      </div>
    </div>

    <!-- breadcrumbs -->
    <nav v-if="breadcrumbs.length > 0" class="flex items-center gap-1 px-4 pb-2 text-sm overflow-x-auto">
      <template v-for="(crumb, i) in breadcrumbs" :key="crumb.id">
        <span v-if="i > 0" class="text-slate-300 dark:text-slate-600 shrink-0">/</span>
        <button
          class="shrink-0 transition-colors whitespace-nowrap"
          :class="i === breadcrumbs.length - 1
            ? 'text-slate-800 dark:text-slate-200 font-medium cursor-default'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
          :disabled="i === breadcrumbs.length - 1"
          @click="emit('breadcrumb-click', i)"
        >
          {{ crumb.name }}
        </button>
      </template>
    </nav>
  </header>
</template>
