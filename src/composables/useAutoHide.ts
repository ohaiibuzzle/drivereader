import { ref, onMounted, onUnmounted } from 'vue'

export function useAutoHide(delayMs = 3000) {
  const visible = ref(true)
  let timer: ReturnType<typeof setTimeout> | null = null

  function show() {
    visible.value = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { visible.value = false }, delayMs)
  }

  onMounted(() => {
    window.addEventListener('mousemove', show)
    window.addEventListener('touchstart', show, { passive: true })
    show()
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', show)
    window.removeEventListener('touchstart', show)
    if (timer) clearTimeout(timer)
  })

  return { visible, show }
}
