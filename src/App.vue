<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { usePreferencesStore } from './stores/preferences'

const prefs = usePreferencesStore()

function applyTheme(t: 'dark' | 'light') {
  document.documentElement.classList.toggle('dark', t === 'dark')
}

onMounted(() => applyTheme(prefs.theme))
watch(() => prefs.theme, applyTheme)
</script>

<template>
  <RouterView />
</template>
