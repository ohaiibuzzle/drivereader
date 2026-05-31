<script setup lang="ts">
import { useReaderStore } from '../stores/reader'

defineProps<{ visible: boolean }>()

const reader = useReaderStore()

function onProgressInput(e: Event) {
  reader.goToPage(Number((e.target as HTMLInputElement).value))
}

function onZoomInput(e: Event) {
  reader.setZoom(Number((e.target as HTMLInputElement).value))
}
</script>

<template>
  <Transition name="controls">
    <div v-show="visible" class="absolute inset-x-0 bottom-0 z-30 pointer-events-none">
      <div class="pointer-events-auto bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-8 pb-4 px-4">
        <!-- progress bar -->
        <div class="mb-3">
          <input
            type="range"
            :min="0"
            :max="Math.max(reader.totalPages - 1, 0)"
            :value="reader.currentIndex"
            class="w-full accent-indigo-500 h-1"
            @input="onProgressInput"
          />
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <!-- prev -->
          <button
            class="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition-colors"
            :disabled="reader.currentIndex === 0"
            @click="reader.prevPage()"
            aria-label="Previous page"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
            </svg>
          </button>

          <!-- page label -->
          <span class="text-slate-300 text-sm font-mono tabular-nums min-w-[80px] text-center">
            {{ reader.pageLabel }}
          </span>

          <!-- next -->
          <button
            class="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition-colors"
            :disabled="reader.currentIndex >= reader.totalPages - 1"
            @click="reader.nextPage()"
            aria-label="Next page"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
            </svg>
          </button>

          <div class="flex-1" />

          <!-- zoom -->
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"/>
            </svg>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              :value="reader.zoom"
              class="w-20 accent-indigo-500 h-1"
              @input="onZoomInput"
            />
            <span class="text-slate-400 text-xs w-8 text-right">{{ Math.round(reader.zoom * 100) }}%</span>
          </div>

          <!-- layout toggle -->
          <button
            class="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors"
            :title="reader.layout === 'single' ? 'Switch to spread view' : 'Switch to single view'"
            @click="reader.toggleLayout()"
            aria-label="Toggle page layout"
          >
            <svg v-if="reader.layout === 'single'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="4" y="3" width="16" height="18" rx="1" stroke="currentColor"/>
              <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor"/>
            </svg>
            <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="4" y="3" width="16" height="18" rx="1" stroke="currentColor"/>
            </svg>
          </button>

          <!-- direction toggle -->
          <button
            class="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            :title="reader.direction === 'ltr' ? 'Switch to RTL' : 'Switch to LTR'"
            @click="reader.toggleDirection()"
            aria-label="Toggle reading direction"
          >
            {{ reader.direction === 'ltr' ? 'LTR →' : '← RTL' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.controls-enter-active, .controls-leave-active { transition: opacity 0.3s; }
.controls-enter-from, .controls-leave-to { opacity: 0; }
</style>
