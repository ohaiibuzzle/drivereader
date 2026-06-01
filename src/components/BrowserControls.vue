<script setup lang="ts">
import { usePreferencesStore } from '../stores/preferences'

const prefs = usePreferencesStore()
</script>

<template>
  <div class="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/60 shrink-0">
    <!-- sort group -->
    <span class="text-slate-400 dark:text-slate-500 text-xs mr-1 hidden sm:inline">Sort:</span>
    <div class="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
      <button
        class="flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors"
        :class="prefs.sortBy === 'name'
          ? 'bg-slate-600 text-white'
          : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
        @click="prefs.setSortBy('name')"
      >
        Name
        <svg
          v-if="prefs.sortBy === 'name'"
          class="w-3 h-3 transition-transform"
          :class="prefs.sortDir === 'desc' ? 'rotate-180' : ''"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5"/>
        </svg>
      </button>
      <button
        class="flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors border-l border-slate-200 dark:border-slate-700"
        :class="prefs.sortBy === 'modifiedTime'
          ? 'bg-slate-600 text-white'
          : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
        @click="prefs.setSortBy('modifiedTime')"
      >
        Date
        <svg
          v-if="prefs.sortBy === 'modifiedTime'"
          class="w-3 h-3 transition-transform"
          :class="prefs.sortDir === 'desc' ? 'rotate-180' : ''"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5"/>
        </svg>
      </button>
    </div>

    <div class="flex-1" />

    <!-- view mode toggle -->
    <div class="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
      <button
        class="p-1.5 transition-colors"
        :class="prefs.viewMode === 'grid'
          ? 'bg-slate-600 text-white'
          : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
        title="Grid view"
        @click="prefs.viewMode = 'grid'"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      </button>
      <button
        class="p-1.5 transition-colors border-l border-slate-200 dark:border-slate-700"
        :class="prefs.viewMode === 'list'
          ? 'bg-slate-600 text-white'
          : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
        title="List view"
        @click="prefs.viewMode = 'list'"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
    </div>
  </div>
</template>
