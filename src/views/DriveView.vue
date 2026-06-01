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

const pendingFolder = ref<DriveFile | null>(null)
const showBookModal = ref(false)
const showDirectionModal = ref(false)
const showLinkModal = ref(false)
const linkError = ref('')

onMounted(() => {
  if (!drive.loading && drive.items.length === 0 && !drive.currentFolderId) {
    router.replace({ name: 'home' })
    return
  }
  // Items pre-loaded by openById (home page flow) — run book detection now
  // since onFileSelect never fired for this navigation.
  const crumb = drive.breadcrumbs[drive.breadcrumbs.length - 1]
  if (crumb && drive.items.length > 0) {
    checkForBook({
      id: crumb.id,
      name: crumb.name,
      mimeType: FOLDER_MIME,
      modifiedTime: '',
    })
  }
})

watch([() => prefs.sortBy, () => prefs.sortDir], () => { drive.reload() })

function checkForBook(folder: DriveFile) {
  if (isMostlyImages(drive.items)) {
    pendingFolder.value = folder
    showBookModal.value = true
  }
}

function forceOpenReader() {
  const crumb = drive.breadcrumbs[drive.breadcrumbs.length - 1]
  if (!crumb) return
  pendingFolder.value = {
    id: crumb.id,
    name: crumb.name,
    mimeType: 'application/vnd.google-apps.folder',
    modifiedTime: '',
  }
  showDirectionModal.value = true
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
    checkForBook(meta)
  } catch (e) {
    linkError.value = e instanceof Error ? e.message : 'Could not open that link.'
  }
}
</script>

<template>
  <div class="flex flex-col h-screen bg-[#e0e0e0] dark:bg-black text-slate-800 dark:text-slate-200">
    <DriveToolbar
      :breadcrumbs="drive.breadcrumbs"
      @breadcrumb-click="drive.goToBreadcrumb($event)"
      @open-link="showLinkModal = true"
      @open-reader="forceOpenReader"
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
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-100 dark:bg-red-900/90 text-red-700 dark:text-red-200 text-sm px-4 py-3 rounded-xl shadow-lg max-w-sm w-full text-center"
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
