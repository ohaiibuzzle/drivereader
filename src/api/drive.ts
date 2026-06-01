import type { DriveFile } from '../types/drive'

// All Drive API calls go through the Cloudflare Worker proxy.
// The Worker appends the secret API key — it never appears in client code or requests.
const BASE = (import.meta.env.VITE_API_BASE as string).replace(/\/$/, '') + '/drive/v3'

async function driveGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Drive API error ${res.status}: ${await res.text()}`)
  return res.json() as Promise<T>
}

type FilePage = { files: DriveFile[]; nextPageToken?: string }

async function fetchAllPages(baseParams: Record<string, string>): Promise<DriveFile[]> {
  const all: DriveFile[] = []
  let pageToken: string | undefined
  do {
    const params = pageToken ? { ...baseParams, pageToken } : baseParams
    const page = await driveGet<FilePage>('/files', params)
    all.push(...(page.files ?? []))
    pageToken = page.nextPageToken
  } while (pageToken)
  return all
}

export function listFolder(folderId: string, orderBy = 'modifiedTime desc'): Promise<DriveFile[]> {
  return fetchAllPages({
    q: `'${folderId}' in parents and trashed=false`,
    orderBy,
    fields: 'nextPageToken,files(id,name,mimeType,modifiedTime,thumbnailLink)',
    pageSize: '200',
    supportsAllDrives: 'true',
    includeItemsFromAllDrives: 'true',
  })
}

export async function getFileMetadata(fileId: string): Promise<DriveFile> {
  return driveGet<DriveFile>(`/files/${fileId}`, {
    fields: 'id,name,mimeType,modifiedTime,thumbnailLink',
    supportsAllDrives: 'true',
  })
}

/** URL for a Drive file served through the Worker proxy (usable as <img src>). */
export function imageUrl(fileId: string): string {
  return `${BASE}/files/${encodeURIComponent(fileId)}?alt=media&supportsAllDrives=true`
}

/** Extract a file/folder ID from any Google Drive share URL, or return null. */
export function extractDriveId(url: string): string | null {
  const match = url.match(
    /(?:\/folders\/|\/file\/d\/|\/document\/d\/|\/spreadsheets\/d\/|\/presentation\/d\/|[?&]id=)([a-zA-Z0-9_-]{10,})/,
  )
  return match?.[1] ?? null
}
