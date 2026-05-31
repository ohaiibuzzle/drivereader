import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import router from '../router'

const STORAGE_KEY = 'drivereader-auth'

function readStored() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { return {} }
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string
const SCOPE = 'https://www.googleapis.com/auth/drive.readonly'

export const useAuthStore = defineStore('auth', () => {
  const stored = readStored()

  const token = ref<string | null>(null)
  const tokenExpiry = ref<number | null>(null)
  const userEmail = ref<string | null>(stored.userEmail ?? null)
  const userName = ref<string | null>(stored.userName ?? null)

  const isAuthenticated = computed(
    () => token.value !== null && tokenExpiry.value !== null && Date.now() < tokenExpiry.value,
  )

  // Persist user identity (not the token — that stays in memory only)
  watch([userEmail, userName], () => {
    if (userEmail.value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        userEmail: userEmail.value,
        userName: userName.value,
      }))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  })

  async function fetchUserInfo(accessToken: string) {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const info = await res.json()
      userEmail.value = info.email ?? null
      userName.value = info.name ?? null
    } catch {
      // non-critical
    }
  }

  function signIn() {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      hint: userEmail.value ?? undefined,
      callback: async (response) => {
        if (response.error) {
          console.error('OAuth error:', response.error)
          return
        }
        token.value = response.access_token
        tokenExpiry.value = Date.now() + response.expires_in * 1000
        await fetchUserInfo(response.access_token)
        router.push({ name: 'drive' })
      },
    })
    client.requestAccessToken({ prompt: '' })
  }

  /**
   * Attempt a silent token re-issue using the stored email hint.
   * Returns true if a token was successfully obtained, false otherwise.
   * Uses prompt:'none' so no UI is shown — fails fast if the Google
   * session has expired or the user has revoked access.
   */
  function tryRestoreSession(): Promise<boolean> {
    if (!userEmail.value) return Promise.resolve(false)
    return new Promise((resolve) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPE,
        hint: userEmail.value!,
        callback: (response) => {
          if (response.error) {
            resolve(false)
            return
          }
          token.value = response.access_token
          tokenExpiry.value = Date.now() + response.expires_in * 1000
          resolve(true)
        },
      })
      client.requestAccessToken({ prompt: 'none' })
    })
  }

  function signOut() {
    if (token.value) {
      window.google.accounts.oauth2.revoke(token.value)
    }
    token.value = null
    tokenExpiry.value = null
    userEmail.value = null
    userName.value = null
    router.push({ name: 'login' })
  }

  function ensureToken(): Promise<string> {
    if (isAuthenticated.value && token.value) {
      return Promise.resolve(token.value)
    }
    return new Promise((resolve) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPE,
        hint: userEmail.value ?? undefined,
        callback: (response) => {
          if (!response.error) {
            token.value = response.access_token
            tokenExpiry.value = Date.now() + response.expires_in * 1000
            resolve(response.access_token)
          }
        },
      })
      client.requestAccessToken({ prompt: '' })
    })
  }

  return {
    token,
    tokenExpiry,
    userEmail,
    userName,
    isAuthenticated,
    signIn,
    signOut,
    ensureToken,
    tryRestoreSession,
  }
})
