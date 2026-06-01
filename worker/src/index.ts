export interface Env {
  GOOGLE_API_KEY: string
  /** Comma-separated list of allowed origins, e.g. "http://localhost:5173,https://you.github.io" */
  ALLOWED_ORIGINS: string
}

const UPSTREAM = 'https://www.googleapis.com'

function corsHeaders(requestOrigin: string | null, allowed: string[]): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
  if (requestOrigin !== null && (allowed.includes('*') || allowed.includes(requestOrigin))) {
    headers['Access-Control-Allow-Origin'] = requestOrigin
  }
  return headers
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin')
    const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin, allowed) })
    }

    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405 })
    }

    // Only proxy Drive API paths
    if (!url.pathname.startsWith('/drive/v3/')) {
      return new Response('Not Found', { status: 404 })
    }

    // Block fetch()/XHR from unauthorized origins.
    // Requests without an Origin header are img/audio/video loads — let them through
    // since they can't read the response body anyway (no CORS mode).
    if (origin !== null && !allowed.includes('*') && !allowed.includes(origin)) {
      return new Response('Forbidden', { status: 403 })
    }

    // Build upstream URL, inject the secret API key
    const upstream = new URL(`${UPSTREAM}${url.pathname}`)
    url.searchParams.forEach((v, k) => upstream.searchParams.set(k, v))
    upstream.searchParams.set('key', env.GOOGLE_API_KEY)

    const upstreamRes = await fetch(upstream.toString())

    // Clone headers and add CORS
    const headers = new Headers(upstreamRes.headers)
    for (const [k, v] of Object.entries(corsHeaders(origin, allowed))) {
      headers.set(k, v)
    }

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      statusText: upstreamRes.statusText,
      headers,
    })
  },
}
