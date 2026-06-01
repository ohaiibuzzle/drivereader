<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const restoring = ref(!!auth.userEmail) // true if we have a stored email to try

watch(
  () => auth.isAuthenticated,
  (val) => { if (val) router.push({ name: 'drive' }) },
  { immediate: true },
)

onMounted(async () => {
  if (auth.userEmail) {
    const ok = await auth.tryRestoreSession()
    if (!ok) {
      // Silent restore failed — show the sign-in button
      restoring.value = false
    }
    // If ok, the isAuthenticated watcher above handles the redirect
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#e0e0e0] dark:bg-black flex flex-col items-center justify-center gap-6 px-4">
    <div class="flex flex-col items-center gap-3">
      <svg class="w-16 h-16 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
      <h1 class="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">DriveReader</h1>
      <p class="text-slate-500 dark:text-slate-400 text-sm">Browse and view images as books from your Google Drive</p>
    </div>

    <!-- silent restore in progress -->
    <div v-if="restoring" class="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
      <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 12a8 8 0 018-8V4"/>
      </svg>
      Signing you back in…
    </div>

    <!-- sign-in button (shown after restore fails or on first visit) -->
    <button
      v-else
      class="flex items-center gap-3 bg-white hover:bg-slate-50 text-slate-800 font-medium px-6 py-3 rounded-xl shadow-lg transition-colors"
      @click="auth.signIn()"
    >
      <svg class="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Sign in with Google
    </button>

    <p v-if="!restoring && auth.userEmail" class="text-slate-400 text-xs">
      Previously signed in as {{ auth.userEmail }}
    </p>
  </div>
</template>
