<script setup lang="ts">
import { computed } from 'vue'
import type { DriveFile } from '../types/drive'

const props = defineProps<{
  pages: DriveFile[]
  pageUrls: (string | null)[]
  currentIndex: number
  zoom: number
  layout: 'single' | 'spread'
  direction: 'ltr' | 'rtl'
}>()

const emit = defineEmits<{ navigate: [dir: 'prev' | 'next'] }>()

const visiblePages = computed<DriveFile[]>(() => {
  const p = props.pages
  if (props.layout === 'single') {
    return p[props.currentIndex] ? [p[props.currentIndex]] : []
  }
  return [p[props.currentIndex], p[props.currentIndex + 1]].filter(Boolean) as DriveFile[]
})

const orderedPages = computed(() =>
  props.direction === 'rtl' ? [...visiblePages.value].reverse() : visiblePages.value,
)

function pageUrl(page: DriveFile): string | null {
  const idx = props.pages.indexOf(page)
  return idx >= 0 ? props.pageUrls[idx] : null
}

function onLeftClick() {
  emit('navigate', props.direction === 'rtl' ? 'next' : 'prev')
}

function onRightClick() {
  emit('navigate', props.direction === 'rtl' ? 'prev' : 'next')
}
</script>

<template>
  <div class="overflow-auto bg-slate-950 flex items-start justify-center select-none">
    <div
      :style="{ transform: `scale(${zoom})`, transformOrigin: 'top center', marginTop: zoom > 1 ? '2rem' : '0' }"
      class="transition-transform duration-150"
    >
      <div class="flex gap-0.5 items-start">
        <div
          v-for="page in orderedPages"
          :key="page.id"
          class="relative bg-slate-900"
          :class="layout === 'spread' ? 'max-w-[50vw]' : 'max-w-[100vw]'"
        >
          <img
            v-if="pageUrl(page)"
            :src="pageUrl(page)!"
            :alt="page.name"
            class="max-h-screen object-contain block"
            :class="layout === 'spread' ? 'max-w-[50vw]' : 'max-w-screen'"
            draggable="false"
          />
          <!-- loading skeleton -->
          <div
            v-else
            class="flex items-center justify-center bg-slate-800 animate-pulse"
            :class="layout === 'spread' ? 'w-[45vw] h-screen' : 'w-[90vw] h-screen'"
          >
            <svg class="w-10 h-10 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- tap zones (invisible overlay) -->
    <div class="absolute inset-0 flex pointer-events-none">
      <div class="flex-1 pointer-events-auto cursor-pointer" @click="onLeftClick" />
      <div class="flex-1 pointer-events-auto cursor-pointer" @click="onRightClick" />
    </div>
  </div>
</template>
