interface TokenResponse {
  access_token: string
  expires_in: number
  token_type: string
  error?: string
}

interface TokenClient {
  requestAccessToken(overrideConfig?: { prompt?: string; hint?: string }): void
}

interface TokenClientConfig {
  client_id: string
  scope: string
  callback: (response: TokenResponse) => void
  hint?: string
}

declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient(config: TokenClientConfig): TokenClient
          revoke(token: string, done?: () => void): void
        }
      }
    }
  }
}

export {}
