import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DriveFile, BreadcrumbEntry } from '../types/drive'
import { listFolder, getFileMetadata } from '../api/drive'
import { usePreferencesStore } from './preferences'

const SHARED_ROOT_ID = '__shared_with_me__'
const FOLDER_MIME = 'application/vnd.google-apps.folder'
const RECENTS_KEY = 'drivereader-recents'
const MAX_RECENTS = 8

export interface RecentFolder {
  id: string
  name: string
  accessedAt: number
}

function readRecents(): RecentFolder[] {
  try { return JSON.parse(localStorage.getItem(RECENTS_KEY) ?? '[]') } catch { return [] }
}

function saveRecent(id: string, name: string) {
  const all = readRecents().filter((r) => r.id !== id)
  all.unshift({ id, name, accessedAt: Date.now() })
  localStorage.setItem(RECENTS_KEY, JSON.stringify(all.slice(0, MAX_RECENTS)))
}

export const useDriveStore = defineStore('drive', () => {
  const items = ref<DriveFile[]>([])
  const breadcrumbs = ref<BreadcrumbEntry[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const recents = ref<RecentFolder[]>(readRecents())

  const currentFolderId = computed(
    () => breadcrumbs.value[breadcrumbs.value.length - 1]?.id ?? '',
  )

  async function loadItems(folderId: string) {
    const prefs = usePreferencesStore()
    loading.value = true
    error.value = null
    try {
      items.value = await listFolder(folderId, prefs.orderBy)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load folder'
      items.value = []
    } finally {
      loading.value = false
    }
  }

  async function enterFolder(id: string, name: string) {
    breadcrumbs.value.push({ id, name })
    await loadItems(id)
  }

  async function goToBreadcrumb(index: number) {
    const crumb = breadcrumbs.value[index]
    if (!crumb) return
    breadcrumbs.value = breadcrumbs.value.slice(0, index + 1)
    await loadItems(crumb.id)
  }

  async function reload() {
    if (currentFolderId.value && currentFolderId.value !== SHARED_ROOT_ID) {
      await loadItems(currentFolderId.value)
    }
  }

  /** Navigate to an arbitrary folder by ID (e.g. from a pasted link). */
  async function openById(fileId: string): Promise<DriveFile> {
    const meta = await getFileMetadata(fileId)
    if (meta.mimeType !== FOLDER_MIME) {
      throw new Error('That link points to a file, not a folder. Please paste a folder link.')
    }
    breadcrumbs.value = [{ id: meta.id, name: meta.name }]
    await loadItems(meta.id)
    saveRecent(meta.id, meta.name)
    recents.value = readRecents()
    return meta
  }

  return {
    items,
    breadcrumbs,
    loading,
    error,
    recents,
    currentFolderId,
    enterFolder,
    goToBreadcrumb,
    reload,
    openById,
  }
})
