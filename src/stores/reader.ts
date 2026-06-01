import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DriveFile } from '../types/drive'
import { listFolder, imageUrl } from '../api/drive'

const FOLDER_MIME = 'application/vnd.google-apps.folder'

export const useReaderStore = defineStore('reader', () => {
  const folderId = ref<string | null>(null)
  const folderName = ref<string>('')
  const pages = ref<DriveFile[]>([])
  const pageUrls = ref<string[]>([])
  const currentIndex = ref(0)
  const direction = ref<'ltr' | 'rtl'>('ltr')
  const layout = ref<'single' | 'spread'>('single')
  const zoom = ref(1.0)
  const loading = ref(false)

  const totalPages = computed(() => pages.value.length)

  const visiblePages = computed<DriveFile[]>(() => {
    const p = pages.value
    if (layout.value === 'single') return p[currentIndex.value] ? [p[currentIndex.value]] : []
    return [p[currentIndex.value], p[currentIndex.value + 1]].filter(Boolean) as DriveFile[]
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
    reset()
    loading.value = true
    folderId.value = id
    folderName.value = name
    direction.value = dir

    try {
      const files = await listFolder(id)
      pages.value = files
        .filter((f) => f.mimeType !== FOLDER_MIME && f.mimeType.startsWith('image/'))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
      // Pre-compute all image URLs — no async fetching needed, the browser loads them on demand
      pageUrls.value = pages.value.map((p) => imageUrl(p.id))
      currentIndex.value = 0
    } finally {
      loading.value = false
    }
  }

  function nextPage() {
    const step = layout.value === 'spread' ? 2 : 1
    currentIndex.value = Math.min(currentIndex.value + step, totalPages.value - 1)
  }

  function prevPage() {
    const step = layout.value === 'spread' ? 2 : 1
    currentIndex.value = Math.max(currentIndex.value - step, 0)
  }

  function goToPage(index: number) {
    currentIndex.value = Math.max(0, Math.min(index, totalPages.value - 1))
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

  function reset() {
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
    nextPage,
    prevPage,
    goToPage,
    setZoom,
    toggleLayout,
    toggleDirection,
    reset,
  }
})
