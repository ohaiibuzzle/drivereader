import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DriveFile } from '../types/drive'
import { listFolder, fetchImageBlob } from '../api/drive'
import { useAuthStore } from './auth'

const FOLDER_MIME = 'application/vnd.google-apps.folder'

export const useReaderStore = defineStore('reader', () => {
  const folderId = ref<string | null>(null)
  const folderName = ref<string>('')
  const pages = ref<DriveFile[]>([])
  const pageUrls = ref<(string | null)[]>([])
  const currentIndex = ref(0)
  const direction = ref<'ltr' | 'rtl'>('ltr')
  const layout = ref<'single' | 'spread'>('single')
  const zoom = ref(1.0)
  const loading = ref(false)

  const totalPages = computed(() => pages.value.length)

  const visiblePages = computed<DriveFile[]>(() => {
    const p = pages.value
    if (layout.value === 'single') return p[currentIndex.value] ? [p[currentIndex.value]] : []
    const pair = [p[currentIndex.value], p[currentIndex.value + 1]].filter(Boolean) as DriveFile[]
    return pair
  })

  const progress = computed(() =>
    totalPages.value <= 1 ? 100 : (currentIndex.value / (totalPages.value - 1)) * 100,
  )

  const pageLabel = computed(() => {
    const n = totalPages.value
    if (n === 0) return ''
    if (layout.value === 'spread' && currentIndex.value + 1 < n) {
      return `${currentIndex.value + 1}–${currentIndex.value + 2} / ${n}`
    }
    return `${currentIndex.value + 1} / ${n}`
  })

  async function openBook(id: string, name: string, dir: 'ltr' | 'rtl') {
    close()
    loading.value = true
    folderId.value = id
    folderName.value = name
    direction.value = dir

    try {
      const auth = useAuthStore()
      const tok = await auth.ensureToken()
      const files = await listFolder(tok, id)
      pages.value = files
        .filter((f) => f.mimeType !== FOLDER_MIME && f.mimeType.startsWith('image/'))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
      pageUrls.value = new Array(pages.value.length).fill(null)
      currentIndex.value = 0

      // eagerly load first 3 pages
      const eager = Math.min(3, pages.value.length)
      await Promise.all(Array.from({ length: eager }, (_, i) => loadPage(i)))
    } finally {
      loading.value = false
    }
  }

  async function loadPage(index: number) {
    if (index < 0 || index >= pages.value.length) return
    if (pageUrls.value[index] !== null) return
    const auth = useAuthStore()
    const tok = await auth.ensureToken()
    const url = await fetchImageBlob(tok, pages.value[index].id)
    pageUrls.value[index] = url
  }

  function prefetchAhead(index: number) {
    const ahead = layout.value === 'spread' ? 4 : 2
    for (let i = index; i < Math.min(index + ahead, pages.value.length); i++) {
      loadPage(i)
    }
  }

  function nextPage() {
    const step = layout.value === 'spread' ? 2 : 1
    currentIndex.value = Math.min(currentIndex.value + step, totalPages.value - 1)
    prefetchAhead(currentIndex.value)
  }

  function prevPage() {
    const step = layout.value === 'spread' ? 2 : 1
    currentIndex.value = Math.max(currentIndex.value - step, 0)
  }

  function goToPage(index: number) {
    currentIndex.value = Math.max(0, Math.min(index, totalPages.value - 1))
    prefetchAhead(currentIndex.value)
  }

  function setZoom(value: number) {
    zoom.value = Math.max(0.5, Math.min(3.0, value))
  }

  function toggleLayout() {
    layout.value = layout.value === 'single' ? 'spread' : 'single'
  }

  function toggleDirection() {
    direction.value = direction.value === 'ltr' ? 'rtl' : 'ltr'
  }

  function close() {
    for (const url of pageUrls.value) {
      if (url) URL.revokeObjectURL(url)
    }
    folderId.value = null
    folderName.value = ''
    pages.value = []
    pageUrls.value = []
    currentIndex.value = 0
    zoom.value = 1.0
    layout.value = 'single'
  }

  return {
    folderId,
    folderName,
    pages,
    pageUrls,
    currentIndex,
    direction,
    layout,
    zoom,
    loading,
    totalPages,
    visiblePages,
    progress,
    pageLabel,
    openBook,
    loadPage,
    nextPage,
    prevPage,
    goToPage,
    setZoom,
    toggleLayout,
    toggleDirection,
    close,
  }
})
