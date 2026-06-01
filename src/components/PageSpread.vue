<script setup lang="ts">
import { computed } from 'vue'
import type { DriveFile } from '../types/drive'

const props = defineProps<{
  pages: DriveFile[]
  pageUrls: string[]
  currentIndex: number
  zoom: number
  layout: 'single' | 'spread'
  direction: 'ltr' | 'rtl'
}>()

const emit = defineEmits<{ navigate: [dir: 'prev' | 'next'] }>()

const visiblePairs = computed<Array<{ page: DriveFile; url: string }>>(() => {
  const p = props.pages
  const u = props.pageUrls
  if (props.layout === 'single') {
    const page = p[props.currentIndex]
    return page ? [{ page, url: u[props.currentIndex] }] : []
  }
  return [
    { page: p[props.currentIndex], url: u[props.currentIndex] },
    { page: p[props.currentIndex + 1], url: u[props.currentIndex + 1] },
  ].filter((x) => x.page) as Array<{ page: DriveFile; url: string }>
})

const orderedPairs = computed(() =>
  props.direction === 'rtl' ? [...visiblePairs.value].reverse() : visiblePairs.value,
)

function onLeftClick() {
  emit('navigate', props.direction === 'rtl' ? 'next' : 'prev')
}

function onRightClick() {
  emit('navigate', props.direction === 'rtl' ? 'prev' : 'next')
}
</script>

<template>
  <div class="overflow-auto flex items-center justify-center select-none min-h-full">
    <div
      :style="{ transform: `scale(${zoom})`, transformOrigin: 'center center' }"
      class="transition-transform duration-150"
    >
      <div class="flex gap-0.5 items-start">
        <img
          v-for="{ page, url } in orderedPairs"
          :key="page.id"
          :src="url"
          :alt="page.name"
          class="max-h-screen object-contain block"
          :class="layout === 'spread' ? 'max-w-[50vw]' : 'max-w-screen'"
          draggable="false"
          loading="eager"
        />
      </div>
    </div>

    <!-- tap zones -->
    <div class="absolute inset-0 flex pointer-events-none">
      <div class="flex-1 pointer-events-auto cursor-pointer" @click="onLeftClick" />
      <div class="flex-1 pointer-events-auto cursor-pointer" @click="onRightClick" />
    </div>
  </div>
</template>
