<script setup lang="ts">
defineProps<{ show: boolean; folderName: string }>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 flex flex-col gap-5">
          <div class="flex flex-col items-center gap-3 text-center">
            <div class="w-14 h-14 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <svg class="w-7 h-7 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h2 class="text-white font-semibold text-lg">Open in Viewer</h2>
            <p class="text-slate-400 text-sm leading-relaxed">
              "<span class="text-slate-300">{{ folderName }}</span>" appears to mostly contains images. Open in viewer?
            </p>
          </div>

          <div class="flex gap-3">
            <button
              class="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium transition-colors"
              @click="emit('cancel')"
            >
              Browse folder
            </button>
            <button
              class="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
              @click="emit('confirm')"
            >
              Open in Viewer
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
