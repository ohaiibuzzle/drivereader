import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DriveFile, BreadcrumbEntry } from '../types/drive'
import { listFolder, listSharedWithMe, getFileMetadata } from '../api/drive'
import { useAuthStore } from './auth'
import { usePreferencesStore } from './preferences'

const SHARED_ROOT_ID = '__shared_with_me__'
const FOLDER_MIME = 'application/vnd.google-apps.folder'

export const useDriveStore = defineStore('drive', () => {
  const items = ref<DriveFile[]>([])
  const breadcrumbs = ref<BreadcrumbEntry[]>([])
  const activeRoot = ref<'my-drive' | 'shared-with-me'>('my-drive')
  const loading = ref(false)
  const error = ref<string | null>(null)

  const currentFolderId = computed(
    () => breadcrumbs.value[breadcrumbs.value.length - 1]?.id ?? 'root',
  )

  async function withToken<T>(fn: (token: string) => Promise<T>): Promise<T> {
    const auth = useAuthStore()
    const tok = await auth.ensureToken()
    return fn(tok)
  }

  async function loadItems(folderId: string) {
    const prefs = usePreferencesStore()
    loading.value = true
    error.value = null
    try {
      if (folderId === SHARED_ROOT_ID) {
        items.value = await withToken((tok) => listSharedWithMe(tok, prefs.orderBy))
      } else {
        items.value = await withToken((tok) => listFolder(tok, folderId, prefs.orderBy))
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load folder'
    } finally {
      loading.value = false
    }
  }

  async function listRoot() {
    activeRoot.value = 'my-drive'
    breadcrumbs.value = [{ id: 'root', name: 'My Drive' }]
    await loadItems('root')
  }

  async function listSharedWithMeRoot() {
    activeRoot.value = 'shared-with-me'
    breadcrumbs.value = [{ id: SHARED_ROOT_ID, name: 'Shared with me' }]
    await loadItems(SHARED_ROOT_ID)
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

  /** Re-fetch the current folder (e.g. when sort changes). */
  async function reload() {
    await loadItems(currentFolderId.value)
  }

  /** Navigate to an arbitrary folder by ID (e.g. from a pasted link). */
  async function openById(fileId: string): Promise<DriveFile> {
    const meta = await withToken((tok) => getFileMetadata(tok, fileId))
    if (meta.mimeType !== FOLDER_MIME) {
      throw new Error('The link points to a file, not a folder. Please paste a folder link.')
    }
    activeRoot.value = 'my-drive'
    breadcrumbs.value = [{ id: meta.id, name: meta.name }]
    await loadItems(meta.id)
    return meta
  }

  return {
    items,
    breadcrumbs,
    activeRoot,
    loading,
    error,
    currentFolderId,
    listRoot,
    listSharedWithMeRoot,
    enterFolder,
    goToBreadcrumb,
    reload,
    openById,
  }
})
