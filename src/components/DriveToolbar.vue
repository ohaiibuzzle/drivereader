<script setup lang="ts">
import type { BreadcrumbEntry } from '../types/drive'
import { useAuthStore } from '../stores/auth'

const props = defineProps<{
  breadcrumbs: BreadcrumbEntry[]
  tab: 'my-drive' | 'shared'
}>()

const emit = defineEmits<{
  'breadcrumb-click': [index: number]
  'tab-change': [tab: 'my-drive' | 'shared']
  'open-link': []
}>()

const auth = useAuthStore()
</script>

<template>
  <header class="flex flex-col gap-0 bg-slate-800 border-b border-slate-700">
    <!-- top bar -->
    <div class="flex items-center justify-between px-4 py-3 gap-3">
      <div class="flex items-center gap-2">
        <svg class="w-6 h-6 text-indigo-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
        <span class="text-white font-semibold">DriveReader</span>
      </div>

      <div class="flex items-center gap-3">
        <span v-if="auth.userEmail" class="hidden sm:block text-slate-400 text-sm truncate max-w-[180px]">{{ auth.userEmail }}</span>
        <button
          class="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
          title="Open from Google Drive link"
          @click="emit('open-link')"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/>
          </svg>
          <span class="hidden sm:inline">Open link</span>
        </button>
        <button
          class="text-slate-400 hover:text-white text-sm transition-colors"
          @click="auth.signOut()"
        >
          Sign out
        </button>
      </div>
    </div>

    <!-- tabs -->
    <div class="flex border-b border-slate-700">
      <button
        class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px"
        :class="tab === 'my-drive' ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'"
        @click="emit('tab-change', 'my-drive')"
      >
        My Drive
      </button>
      <button
        class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px"
        :class="tab === 'shared' ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'"
        @click="emit('tab-change', 'shared')"
      >
        Shared with me
      </button>
    </div>

    <!-- breadcrumbs -->
    <nav v-if="breadcrumbs.length > 0" class="flex items-center gap-1 px-4 py-2 text-sm overflow-x-auto">
      <template v-for="(crumb, i) in breadcrumbs" :key="crumb.id">
        <span v-if="i > 0" class="text-slate-600">/</span>
        <button
          class="shrink-0 transition-colors"
          :class="i === breadcrumbs.length - 1
            ? 'text-slate-200 font-medium cursor-default'
            : 'text-slate-400 hover:text-slate-200'"
          :disabled="i === breadcrumbs.length - 1"
          @click="emit('breadcrumb-click', i)"
        >
          {{ crumb.name }}
        </button>
      </template>
    </nav>
  </header>
</template>
