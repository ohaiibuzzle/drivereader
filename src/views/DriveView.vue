<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDriveStore } from '../stores/drive'
import { useReaderStore } from '../stores/reader'
import { usePreferencesStore } from '../stores/preferences'
import type { DriveFile } from '../types/drive'
import { isMostlyImages } from '../composables/useImageDetection'
import DriveToolbar from '../components/DriveToolbar.vue'
import BrowserControls from '../components/BrowserControls.vue'
import FileGrid from '../components/FileGrid.vue'
import FileList from '../components/FileList.vue'
import BookDetectModal from '../components/BookDetectModal.vue'
import DirectionModal from '../components/DirectionModal.vue'
import OpenLinkModal from '../components/OpenLinkModal.vue'

const FOLDER_MIME = 'application/vnd.google-apps.folder'

const router = useRouter()
const drive = useDriveStore()
const reader = useReaderStore()
const prefs = usePreferencesStore()

const tab = ref<'my-drive' | 'shared'>('my-drive')
const pendingFolder = ref<DriveFile | null>(null)
const showBookModal = ref(false)
const showDirectionModal = ref(false)
const showLinkModal = ref(false)
const linkError = ref('')

onMounted(() => {
  drive.listRoot()
})

// Re-fetch when sort changes
watch([() => prefs.sortBy, () => prefs.sortDir], () => {
  drive.reload()
})

function onTabChange(t: 'my-drive' | 'shared') {
  tab.value = t
  if (t === 'my-drive') {
    drive.listRoot()
  } else {
    drive.listSharedWithMeRoot()
  }
}

function checkForBook(folder: DriveFile) {
  if (isMostlyImages(drive.items)) {
    pendingFolder.value = folder
    showBookModal.value = true
  }
}

async function onFileSelect(file: DriveFile) {
  if (file.mimeType === FOLDER_MIME) {
    await drive.enterFolder(file.id, file.name)
    checkForBook(file)
  }
}

function onBookCancel() {
  showBookModal.value = false
  pendingFolder.value = null
}

function onBookConfirm() {
  showBookModal.value = false
  showDirectionModal.value = true
}

async function onDirectionSelect(dir: 'ltr' | 'rtl') {
  showDirectionModal.value = false
  if (!pendingFolder.value) return
  const folder = pendingFolder.value
  pendingFolder.value = null
  await reader.openBook(folder.id, folder.name, dir)
  router.push({ name: 'reader', params: { id: folder.id }, query: { dir } })
}

async function onOpenLink(id: string) {
  linkError.value = ''
  try {
    const meta = await drive.openById(id)
    showLinkModal.value = false
    tab.value = 'my-drive'
    checkForBook(meta)
  } catch (e) {
    linkError.value = e instanceof Error ? e.message : 'Could not open that link.'
  }
}
</script>

<template>
  <div class="flex flex-col h-screen bg-slate-900 text-slate-200">
    <DriveToolbar
      :breadcrumbs="drive.breadcrumbs"
      :tab="tab"
      @breadcrumb-click="drive.goToBreadcrumb($event)"
      @tab-change="onTabChange"
      @open-link="showLinkModal = true"
    />

    <BrowserControls />

    <FileGrid
      v-if="prefs.viewMode === 'grid'"
      :items="drive.items"
      :loading="drive.loading"
      @select="onFileSelect"
    />
    <FileList
      v-else
      :items="drive.items"
      :loading="drive.loading"
      @select="onFileSelect"
    />

    <BookDetectModal
      :show="showBookModal"
      :folder-name="pendingFolder?.name ?? ''"
      @confirm="onBookConfirm"
      @cancel="onBookCancel"
    />

    <DirectionModal
      :show="showDirectionModal"
      @select="onDirectionSelect"
    />

    <OpenLinkModal
      :show="showLinkModal"
      @open="onOpenLink"
      @close="showLinkModal = false"
    />

    <Transition name="toast">
      <div
        v-if="linkError"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-900/90 text-red-200 text-sm px-4 py-3 rounded-xl shadow-lg max-w-sm w-full text-center"
        @click="linkError = ''"
      >
        {{ linkError }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: opacity 0.3s, transform 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(8px); }
</style>
