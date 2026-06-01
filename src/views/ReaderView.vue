<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReaderStore } from '../stores/reader'
import { useDriveStore } from '../stores/drive'
import { useAutoHide } from '../composables/useAutoHide'

import PageSpread from '../components/PageSpread.vue'
import ReaderControls from '../components/ReaderControls.vue'

const route = useRoute()
const router = useRouter()
const reader = useReaderStore()
const drive = useDriveStore()
const { visible: uiVisible } = useAutoHide()

const folderId = route.params.id as string
const queryDir = (route.query.dir as string | undefined) === 'rtl' ? 'rtl' : 'ltr'

onMounted(async () => {
  if (reader.folderId !== folderId) {
    const name = drive.breadcrumbs.find((b) => b.id === folderId)?.name ?? folderId
    await reader.openBook(folderId, name, queryDir)
  }
})

onUnmounted(() => {
  reader.reset()
})

function onNavigate(dir: 'prev' | 'next') {
  if (dir === 'next') reader.nextPage()
  else reader.prevPage()
}

function handleKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') {
    reader.direction === 'rtl' ? reader.prevPage() : reader.nextPage()
  } else if (e.key === 'ArrowLeft') {
    reader.direction === 'rtl' ? reader.nextPage() : reader.prevPage()
  } else if (e.key === 'Escape') {
    router.push({ name: 'drive' })
  }
}

onMounted(() => window.addEventListener('keydown', handleKey))
onUnmounted(() => window.removeEventListener('keydown', handleKey))
</script>

<template>
  <!-- Flat stacking context — image fills the full viewport, bars float over it -->
  <div class="relative h-screen w-screen bg-slate-950 overflow-hidden">

    <!-- loading -->
    <div v-if="reader.loading" class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500">
      <svg class="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 12a8 8 0 018-8V4"/>
      </svg>
      <p class="text-sm">Loading book…</p>
    </div>

    <!-- empty state -->
    <div v-else-if="reader.totalPages === 0" class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500">
      <svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
      <p class="text-sm">No images found in this folder</p>
    </div>

    <!-- page content — absolute inset-0 so it truly fills the viewport -->
    <PageSpread
      v-else
      class="absolute inset-0"
      :pages="reader.pages"
      :page-urls="reader.pageUrls"
      :current-index="reader.currentIndex"
      :zoom="reader.zoom"
      :layout="reader.layout"
      :direction="reader.direction"
      @navigate="onNavigate"
    />

    <!-- header overlay — gradient fades downward so the image bleeds through -->
    <Transition name="ui">
      <header
        v-show="uiVisible || reader.loading || reader.totalPages === 0"
        class="absolute top-0 inset-x-0 z-30 bg-gradient-to-b from-black/80 to-transparent pb-10 pointer-events-none"
      >
        <div class="flex items-center gap-3 px-3 pt-3 pointer-events-auto">
          <button
            class="p-1.5 rounded-lg bg-black/30 hover:bg-black/60 text-slate-200 hover:text-white transition-colors backdrop-blur-sm"
            @click="router.push({ name: 'drive' })"
            aria-label="Back to Drive"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
            </svg>
          </button>
          <h1 class="text-white/90 font-medium text-sm truncate flex-1 drop-shadow">{{ reader.folderName }}</h1>
        </div>
      </header>
    </Transition>

    <!-- bottom controls overlay -->
    <ReaderControls
      v-if="!reader.loading && reader.totalPages > 0"
      :visible="uiVisible"
    />
  </div>
</template>

<style scoped>
.ui-enter-active, .ui-leave-active { transition: opacity 0.3s; }
.ui-enter-from, .ui-leave-to { opacity: 0; }
</style>
