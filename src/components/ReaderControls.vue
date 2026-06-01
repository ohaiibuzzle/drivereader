<script setup lang="ts">
import { useReaderStore } from '../stores/reader'
import { usePreferencesStore } from '../stores/preferences'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{ hide: [] }>()

const reader = useReaderStore()
const prefs = usePreferencesStore()

function onProgressInput(e: Event) {
  const raw = Number((e.target as HTMLInputElement).value)
  reader.goToPage(reader.direction === 'rtl' ? reader.totalPages - 1 - raw : raw)
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
            :value="reader.direction === 'rtl' ? reader.totalPages - 1 - reader.currentIndex : reader.currentIndex"
            class="w-full accent-indigo-500 h-1"
            @input="onProgressInput"
          />
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <!-- prev (LTR) / next (RTL) -->
          <button
            class="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition-colors"
            :disabled="reader.direction === 'rtl' ? reader.currentIndex >= reader.totalPages - 1 : reader.currentIndex === 0"
            @click="reader.direction === 'rtl' ? reader.nextPage() : reader.prevPage()"
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

          <!-- next (LTR) / prev (RTL) -->
          <button
            class="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition-colors"
            :disabled="reader.direction === 'rtl' ? reader.currentIndex === 0 : reader.currentIndex >= reader.totalPages - 1"
            @click="reader.direction === 'rtl' ? reader.prevPage() : reader.nextPage()"
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

          <!-- theme toggle -->
          <button
            class="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors"
            :title="prefs.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="prefs.toggleTheme()"
            aria-label="Toggle theme"
          >
            <!-- sun: shown in dark mode (click to go light) -->
            <svg v-if="prefs.theme === 'dark'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z" />
            </svg>
            <!-- moon: shown in light mode (click to go dark) -->
            <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998z" />
            </svg>
          </button>

          <!-- expand: hide all UI -->
          <button
            class="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Hide controls"
            aria-label="Hide controls"
            @click="emit('hide')"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
            </svg>
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
