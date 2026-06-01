<script setup lang="ts">
import { ref } from 'vue'
import { extractDriveId } from '../api/drive'

defineProps<{ show: boolean }>()
const emit = defineEmits<{ open: [id: string]; close: [] }>()

const input = ref('')
const errorMsg = ref('')

function onSubmit() {
  errorMsg.value = ''
  const raw = input.value.trim()
  if (!raw) return

  const id = extractDriveId(raw) ?? (raw.match(/^[a-zA-Z0-9_-]{10,}$/) ? raw : null)
  if (!id) {
    errorMsg.value = 'Could not find a Google Drive folder ID in that link.'
    return
  }
  emit('open', id)
  input.value = ''
}

function onClose() {
  input.value = ''
  errorMsg.value = ''
  emit('close')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onSubmit()
  if (e.key === 'Escape') onClose()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="onClose">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 flex flex-col gap-4">
          <div>
            <h2 class="text-slate-900 dark:text-white font-semibold text-lg">Open from link</h2>
            <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Paste a Google Drive folder share link</p>
          </div>

          <textarea
            v-model="input"
            rows="3"
            placeholder="https://drive.google.com/drive/folders/..."
            class="w-full bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-transparent rounded-xl px-4 py-3 text-sm resize-none outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            autofocus
            @keydown="onKeydown"
          />

          <p v-if="errorMsg" class="text-red-600 dark:text-red-400 text-sm">{{ errorMsg }}</p>

          <div class="flex gap-3 justify-end">
            <button
              class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium transition-colors"
              @click="onClose"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-40"
              :disabled="!input.trim()"
              @click="onSubmit"
            >
              Open
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s, transform 0.2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }
</style>
