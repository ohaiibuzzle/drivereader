<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDriveStore } from '../stores/drive'
import { extractDriveId } from '../api/drive'

const router = useRouter()
const drive = useDriveStore()

const input = ref('')
const error = ref('')
const loading = ref(false)

async function open() {
  error.value = ''
  const raw = input.value.trim()
  if (!raw) return

  const id = extractDriveId(raw) ?? (raw.match(/^[a-zA-Z0-9_-]{10,}$/) ? raw : null)
  if (!id) {
    error.value = 'Could not find a folder ID in that link.'
    return
  }

  loading.value = true
  try {
    await drive.openById(id)
    router.push({ name: 'drive' })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not open that folder.'
  } finally {
    loading.value = false
  }
}

async function openRecent(id: string, name: string) {
  loading.value = true
  error.value = ''
  try {
    await drive.openById(id)
    router.push({ name: 'drive' })
  } catch {
    error.value = `Could not open "${name}". The folder may no longer be public.`
  } finally {
    loading.value = false
  }
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const baseUrl = window.location.href

// --- PWA install ---
const deferredPrompt = ref<any>(null)
const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase())
const isStandalone =
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as any).standalone === true
const showIosHint = ref(false)

async function triggerInstall() {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt()
    await deferredPrompt.value.userChoice
    deferredPrompt.value = null
  } else if (isIos) {
    showIosHint.value = !showIosHint.value
  }
}

// --- Clipboard ---
async function readFromClipboard() {
  error.value = ''
  loading.value = true
  try {
    const text = (await navigator.clipboard.readText()).trim()
    const id = extractDriveId(text) ?? (text.match(/^[a-zA-Z0-9_-]{10,}$/) ? text : null)
    if (!id) {
      error.value = 'No Drive folder link found in clipboard.'
      return
    }
    await drive.openById(id)
    router.push({ name: 'drive' })
  } catch (e) {
    error.value = e instanceof DOMException
      ? 'Clipboard access denied.'
      : e instanceof Error ? e.message : 'Could not open that folder.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault()
    deferredPrompt.value = e
  })
})
</script>

<template>
  <div class="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4 gap-10">
    <!-- branding -->
    <div class="flex flex-col items-center gap-3 text-center">
      <svg class="w-14 h-14 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
      <h1 class="text-3xl font-semibold text-white tracking-tight">DriveReader</h1>
      <p class="text-slate-400 text-sm max-w-xs">
        Paste a public Google Drive folder link to browse its images.
      </p>
    </div>

    <!-- input -->
    <div class="w-full max-w-lg flex flex-col gap-3">
      <div class="flex gap-2">
        <input
          v-model="input"
          type="text"
          placeholder="https://drive.google.com/drive/folders/…"
          class="flex-1 bg-slate-800 text-slate-200 placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
          :disabled="loading"
          @keydown.enter="open"
        />
        <button
          class="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center gap-2"
          :disabled="loading || !input.trim()"
          @click="open"
        >
          <svg v-if="loading" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 12a8 8 0 018-8V4"/>
          </svg>
          <span>{{ loading ? 'Opening…' : 'Open' }}</span>
        </button>
      </div>

      <p v-if="error" class="text-red-400 text-sm px-1">{{ error }}</p>

      <div class="text-slate-600 text-xs px-1">
        <p>The folder must be shared as "Anyone with the link can view" permissions.</p>
        <p class="mt-2">You can also hotlink to this page to open a folder directly:</p>
        <pre class="mt-2 overflow-x-auto rounded-xl bg-slate-800 p-3 text-slate-200 text-xs"><code>{{ baseUrl }}reader/{folder_id}?dir=ltr</code></pre>
      </div>
    </div>

    <!-- recent folders -->
    <div class="w-full max-w-lg flex flex-col gap-2">
      <h2 class="text-slate-500 text-xs font-medium uppercase tracking-wider px-1">Recent</h2>
      <ul class="flex flex-col gap-1">
        <!-- read from clipboard -->
        <li>
          <button
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 transition-colors text-left group"
            :disabled="loading"
            @click="readFromClipboard"
          >
            <svg class="w-4 h-4 text-slate-500 shrink-0 group-hover:text-slate-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
            <span class="flex-1 text-slate-500 text-sm group-hover:text-slate-300 transition-colors">Read from clipboard</span>
          </button>
        </li>
        <!-- saved recents -->
        <li v-for="recent in drive.recents" :key="recent.id">
          <button
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 transition-colors text-left group"
            :disabled="loading"
            @click="openRecent(recent.id, recent.name)"
          >
            <svg class="w-4 h-4 text-indigo-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z"/>
            </svg>
            <span class="flex-1 text-slate-300 text-sm truncate group-hover:text-white">{{ recent.name }}</span>
            <span class="text-slate-600 text-xs shrink-0 hidden sm:block">{{ formatDate(recent.accessedAt) }}</span>
          </button>
        </li>
      </ul>
    </div>

    <!-- PWA install -->
    <div v-if="!isStandalone" class="flex flex-col items-center gap-2">
      <button
        class="flex items-center gap-1.5 text-slate-600 hover:text-slate-400 text-xs transition-colors"
        @click="triggerInstall"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" />
        </svg>
        Install as app
      </button>
      <p v-if="showIosHint" class="text-slate-500 text-xs text-center max-w-xs px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700/50">
        Tap <span class="text-slate-300">Share</span>, then <span class="text-slate-300">"Add to Home Screen"</span>.
      </p>
    </div>
  </div>
</template>
