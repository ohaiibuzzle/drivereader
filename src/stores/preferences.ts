import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

type ViewMode = 'grid' | 'list'
type SortBy = 'name' | 'modifiedTime'
type SortDir = 'asc' | 'desc'

const STORAGE_KEY = 'drivereader-prefs'

function readStored(): Record<string, unknown> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { return {} }
}

export const usePreferencesStore = defineStore('preferences', () => {
  const stored = readStored()

  const viewMode = ref<ViewMode>((stored.viewMode as ViewMode) ?? 'grid')
  const sortBy = ref<SortBy>((stored.sortBy as SortBy) ?? 'modifiedTime')
  const sortDir = ref<SortDir>((stored.sortDir as SortDir) ?? 'desc')

  // Drive API orderBy string
  const orderBy = computed(() =>
    sortDir.value === 'desc' ? `${sortBy.value} desc` : sortBy.value,
  )

  watch([viewMode, sortBy, sortDir], () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      viewMode: viewMode.value,
      sortBy: sortBy.value,
      sortDir: sortDir.value,
    }))
  })

  function toggleView() {
    viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
  }

  function setSortBy(by: SortBy) {
    if (sortBy.value === by) {
      sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy.value = by
      // sensible default direction for each sort key
      sortDir.value = by === 'name' ? 'asc' : 'desc'
    }
  }

  return { viewMode, sortBy, sortDir, orderBy, toggleView, setSortBy }
})
