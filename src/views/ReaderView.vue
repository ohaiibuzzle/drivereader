<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReaderStore } from '../stores/reader'
import { useDriveStore } from '../stores/drive'
import PageSpread from '../components/PageSpread.vue'
import ReaderControls from '../components/ReaderControls.vue'

const route = useRoute()
const router = useRouter()
const reader = useReaderStore()
const drive = useDriveStore()

const uiHidden = ref(false)

const folderId = route.params.id as string
const queryDir = (route.query.dir as string | undefined) === 'rtl' ? 'rtl' : 'ltr'

const copied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | null = null

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    copied.value = true
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => { copied.value = false }, 2000)
  })
}

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

onMounted(() => {
  window.addEventListener('keydown', handleKey)
  document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {})
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKey)
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
})
</script>

<template>
  <!-- Flat stacking context — image fills the full viewport, bars float over it -->
  <div class="relative h-dvh w-screen bg-slate-950 overflow-hidden">

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

    <!-- header overlay -->
    <Transition name="ui">
      <header
        v-show="!uiHidden || reader.loading || reader.totalPages === 0"
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
          <div class="flex-1 min-w-0">
            <h1 class="text-white/90 font-medium text-sm truncate drop-shadow">{{ reader.folderName }}</h1>
            <p v-if="reader.pages[reader.currentIndex]" class="text-white/50 text-xs truncate drop-shadow mt-0.5">{{ reader.pages[reader.currentIndex].name }}</p>
          </div>
          <button
            class="p-1.5 rounded-lg bg-black/30 hover:bg-black/60 transition-colors backdrop-blur-sm shrink-0"
            :class="copied ? 'text-emerald-400' : 'text-slate-200 hover:text-white'"
            :title="copied ? 'Copied!' : 'Copy reader link to this folder'"
            @click="copyLink"
            aria-label="Copy link"
          >
            <svg v-if="copied" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
            </svg>
            <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/>
            </svg>
          </button>
        </div>
      </header>
    </Transition>

    <!-- bottom controls overlay -->
    <ReaderControls
      v-if="!reader.loading && reader.totalPages > 0"
      :visible="!uiHidden"
      @hide="uiHidden = true"
    />

    <!-- floating restore button — shown when UI is hidden -->
    <Transition name="ui">
      <button
        v-if="uiHidden && !reader.loading && reader.totalPages > 0"
        class="absolute bottom-6 right-6 z-40 p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white shadow-xl transition-colors"
        title="Show controls"
        aria-label="Show controls"
        @click="uiHidden = false"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </button>
    </Transition>
  </div>
</template>

<style scoped>
.ui-enter-active, .ui-leave-active { transition: opacity 0.3s; }
.ui-enter-from, .ui-leave-to { opacity: 0; }
</style>
