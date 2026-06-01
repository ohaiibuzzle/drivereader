<script setup lang="ts">
defineProps<{ show: boolean }>()
const emit = defineEmits<{ select: [direction: 'ltr' | 'rtl'] }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 flex flex-col gap-5">
          <div class="text-center">
            <h2 class="text-slate-900 dark:text-white font-semibold text-lg">Reading direction</h2>
            <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">How should pages turn?</p>
          </div>

          <div class="flex gap-3">
            <button
              class="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-indigo-600 text-slate-700 dark:text-slate-300 hover:text-white transition-colors"
              @click="emit('select', 'ltr')"
            >
              <span class="text-2xl">→</span>
              <span class="text-sm font-medium">Left to Right</span>
              <span class="text-xs text-slate-400 group-hover:text-white/80">Western Comics / Image browsing</span>
            </button>
            <button
              class="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-indigo-600 text-slate-700 dark:text-slate-300 hover:text-white transition-colors"
              @click="emit('select', 'rtl')"
            >
              <span class="text-2xl">←</span>
              <span class="text-sm font-medium">Right to Left</span>
              <span class="text-xs text-slate-400">Manga</span>
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
